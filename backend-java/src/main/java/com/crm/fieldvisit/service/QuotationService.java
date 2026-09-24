package com.crm.fieldvisit.service;

import com.crm.fieldvisit.common.ResourceNotFoundException;
import com.crm.fieldvisit.dto.QuotationRequest;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class QuotationService {

    private final QuotationRepository quotationRepository;
    private final OpportunityRepository opportunityRepository;
    private final CustomerRepository customerRepository;
    private final ProductRepository productRepository;
    private final EmployeeRepository employeeRepository;

    @Transactional(readOnly = true)
    public List<Quotation> findAll(Integer opportunityId, Integer customerId, String status, String search) {
        String s = (search != null && !search.isBlank()) ? search.trim() : null;
        String st = (status != null && !status.isBlank()) ? status.trim() : null;

        List<Quotation> list = quotationRepository.findAllWithFilters(opportunityId, customerId, st, s);
        list.forEach(q -> {
            if (q.getItems() != null) q.getItems().size();
        });
        return list;
    }

    @Transactional(readOnly = true)
    public Quotation findOne(Integer id) {
        Quotation q = quotationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Quotation not found with ID: " + id));
        if (q.getItems() != null) q.getItems().size();
        return q;
    }

    @Transactional(readOnly = true)
    public List<Quotation> findHistoryByQuoteNo(String quoteNo) {
        List<Quotation> history = quotationRepository.findByQuoteNoOrderByRevisionNoAsc(quoteNo);
        history.forEach(q -> {
            if (q.getItems() != null) q.getItems().size();
        });
        return history;
    }

    @Transactional
    public Quotation create(QuotationRequest request, String userEmail) {
        String quoteNo = request.getQuoteNo();
        if (quoteNo == null || quoteNo.isBlank()) {
            long count = quotationRepository.count();
            quoteNo = String.format("QT-%d-%04d", Year.now().getValue(), count + 1);
        }

        LocalDate qDate = request.getQuoteDate() != null ? request.getQuoteDate() : LocalDate.now();
        int valDays = request.getValidityDays() != null ? request.getValidityDays() : 30;
        LocalDate valDate = request.getValidityDate() != null ? request.getValidityDate() : qDate.plusDays(valDays);

        Employee sp = null;
        if (request.getSalespersonId() != null) {
            sp = employeeRepository.findById(request.getSalespersonId()).orElse(null);
        } else if (userEmail != null) {
            sp = employeeRepository.findByEmail(userEmail).orElse(null);
        }

        Quotation quotation = Quotation.builder()
                .quoteNo(quoteNo)
                .quoteDate(qDate)
                .customerId(request.getCustomerId())
                .contactId(request.getContactId())
                .opportunityId(request.getOpportunityId())
                .revisionNo(0)
                .versionLabel("Rev 0")
                .validityDays(valDays)
                .validityDate(valDate)
                .status(request.getStatus() != null ? request.getStatus() : "DRAFT")
                .termsAndConditions(request.getTermsAndConditions() != null ? request.getTermsAndConditions() : defaultTerms())
                .notes(request.getNotes())
                .salespersonId(sp != null ? sp.getId() : null)
                .discountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : BigDecimal.ZERO)
                .taxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : BigDecimal.valueOf(18.00))
                .createdBy(userEmail != null ? userEmail : "SYSTEM")
                .updatedBy(userEmail != null ? userEmail : "SYSTEM")
                .build();

        populateItemsAndCalculate(quotation, request.getItems());

        // Update linked opportunity status if appropriate
        if (request.getOpportunityId() != null) {
            opportunityRepository.findById(request.getOpportunityId()).ifPresent(opp -> {
                if ("NEW_LEAD".equals(opp.getStatus()) || "QUALIFIED".equals(opp.getStatus())) {
                    opp.setStatus("PROPOSAL_SENT");
                    opportunityRepository.save(opp);
                }
            });
        }

        return quotationRepository.save(quotation);
    }

    @Transactional
    public Quotation createRevision(Integer baseQuoteId, QuotationRequest request, String userEmail) {
        Quotation baseQuote = findOne(baseQuoteId);

        // Mark previous quote as revised if it was Draft or Sent
        if ("DRAFT".equals(baseQuote.getStatus()) || "SENT".equals(baseQuote.getStatus())) {
            baseQuote.setStatus("REVISED");
            quotationRepository.save(baseQuote);
        }

        int nextRev = baseQuote.getRevisionNo() + 1;
        String revLabel = "Rev " + nextRev;
        Integer rootId = baseQuote.getParentQuoteId() != null ? baseQuote.getParentQuoteId() : baseQuote.getId();

        LocalDate qDate = request.getQuoteDate() != null ? request.getQuoteDate() : LocalDate.now();
        int valDays = request.getValidityDays() != null ? request.getValidityDays() : 30;
        LocalDate valDate = request.getValidityDate() != null ? request.getValidityDate() : qDate.plusDays(valDays);

        Quotation newRev = Quotation.builder()
                .quoteNo(baseQuote.getQuoteNo())
                .quoteDate(qDate)
                .customerId(request.getCustomerId() != null ? request.getCustomerId() : baseQuote.getCustomerId())
                .contactId(request.getContactId() != null ? request.getContactId() : baseQuote.getContactId())
                .opportunityId(baseQuote.getOpportunityId())
                .revisionNo(nextRev)
                .versionLabel(revLabel)
                .parentQuoteId(rootId)
                .validityDays(valDays)
                .validityDate(valDate)
                .status("DRAFT")
                .termsAndConditions(request.getTermsAndConditions() != null ? request.getTermsAndConditions() : baseQuote.getTermsAndConditions())
                .notes(request.getNotes() != null ? request.getNotes() : "Revision created from " + baseQuote.getVersionLabel())
                .salespersonId(request.getSalespersonId() != null ? request.getSalespersonId() : baseQuote.getSalespersonId())
                .discountPercent(request.getDiscountPercent() != null ? request.getDiscountPercent() : baseQuote.getDiscountPercent())
                .taxPercent(request.getTaxPercent() != null ? request.getTaxPercent() : baseQuote.getTaxPercent())
                .createdBy(userEmail != null ? userEmail : "SYSTEM")
                .updatedBy(userEmail != null ? userEmail : "SYSTEM")
                .build();

        List<QuotationRequest.QuotationItemRequest> itemsToUse = request.getItems();
        if (itemsToUse == null || itemsToUse.isEmpty()) {
            // Copy from baseQuote if not provided
            populateItemsFromExisting(newRev, baseQuote.getItems());
        } else {
            populateItemsAndCalculate(newRev, itemsToUse);
        }

        return quotationRepository.save(newRev);
    }

    @Transactional
    public Quotation update(Integer id, QuotationRequest request, String userEmail) {
        Quotation q = findOne(id);

        if (request.getQuoteDate() != null) q.setQuoteDate(request.getQuoteDate());
        if (request.getCustomerId() != null) q.setCustomerId(request.getCustomerId());
        if (request.getContactId() != null) q.setContactId(request.getContactId());
        if (request.getValidityDays() != null) {
            q.setValidityDays(request.getValidityDays());
            q.setValidityDate(q.getQuoteDate().plusDays(request.getValidityDays()));
        }
        if (request.getValidityDate() != null) q.setValidityDate(request.getValidityDate());
        if (request.getStatus() != null) q.setStatus(request.getStatus());
        if (request.getTermsAndConditions() != null) q.setTermsAndConditions(request.getTermsAndConditions());
        if (request.getNotes() != null) q.setNotes(request.getNotes());
        if (request.getSalespersonId() != null) q.setSalespersonId(request.getSalespersonId());
        if (request.getDiscountPercent() != null) q.setDiscountPercent(request.getDiscountPercent());
        if (request.getTaxPercent() != null) q.setTaxPercent(request.getTaxPercent());
        if (userEmail != null) q.setUpdatedBy(userEmail);

        if (request.getItems() != null) {
            q.getItems().clear();
            populateItemsAndCalculate(q, request.getItems());
        }

        return quotationRepository.save(q);
    }

    @Transactional
    public Quotation updateStatus(Integer id, String status) {
        Quotation q = findOne(id);
        q.setStatus(status);

        // If quotation is Accepted or Won, update linked opportunity
        if ("ACCEPTED".equalsIgnoreCase(status) && q.getOpportunityId() != null) {
            opportunityRepository.findById(q.getOpportunityId()).ifPresent(opp -> {
                opp.setStatus("WON");
                opportunityRepository.save(opp);
            });
        } else if ("REJECTED".equalsIgnoreCase(status) && q.getOpportunityId() != null) {
            opportunityRepository.findById(q.getOpportunityId()).ifPresent(opp -> {
                opp.setStatus("LOST");
                opportunityRepository.save(opp);
            });
        }

        return quotationRepository.save(q);
    }

    @Transactional
    public boolean remove(Integer id) {
        Quotation q = findOne(id);
        quotationRepository.delete(q);
        return true;
    }

    private void populateItemsAndCalculate(Quotation q, List<QuotationRequest.QuotationItemRequest> itemRequests) {
        BigDecimal subtotal = BigDecimal.ZERO;

        if (itemRequests != null) {
            for (QuotationRequest.QuotationItemRequest iReq : itemRequests) {
                Product prod = iReq.getProductId() != null ? productRepository.findById(iReq.getProductId()).orElse(null) : null;
                int qty = iReq.getQuantity() != null && iReq.getQuantity() > 0 ? iReq.getQuantity() : 1;
                BigDecimal unitPrice = iReq.getUnitPrice() != null ? iReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal discPct = iReq.getDiscountPercent() != null ? iReq.getDiscountPercent() : BigDecimal.ZERO;

                BigDecimal gross = unitPrice.multiply(BigDecimal.valueOf(qty));
                BigDecimal discountAmt = gross.multiply(discPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
                BigDecimal lineTotal = gross.subtract(discountAmt);

                subtotal = subtotal.add(lineTotal);

                QuotationItem item = QuotationItem.builder()
                        .quotation(q)
                        .productId(iReq.getProductId())
                        .product(prod)
                        .productName(iReq.getProductName() != null ? iReq.getProductName() : (prod != null ? prod.getName() : "Item"))
                        .productCode(iReq.getProductCode() != null ? iReq.getProductCode() : (prod != null ? prod.getCode() : ""))
                        .principal(iReq.getPrincipal() != null ? iReq.getPrincipal() : (prod != null ? prod.getPrincipal() : null))
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .discountPercent(discPct)
                        .totalPrice(lineTotal)
                        .build();

                q.getItems().add(item);
            }
        }

        BigDecimal overallDiscPct = q.getDiscountPercent() != null ? q.getDiscountPercent() : BigDecimal.ZERO;
        BigDecimal overallDiscAmt = subtotal.multiply(overallDiscPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netAfterDisc = subtotal.subtract(overallDiscAmt);

        BigDecimal taxPct = q.getTaxPercent() != null ? q.getTaxPercent() : BigDecimal.valueOf(18.00);
        BigDecimal taxAmt = netAfterDisc.multiply(taxPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = netAfterDisc.add(taxAmt);

        q.setSubtotal(subtotal);
        q.setTotalValue(grandTotal);
    }

    private void populateItemsFromExisting(Quotation target, List<QuotationItem> existingItems) {
        BigDecimal subtotal = BigDecimal.ZERO;
        for (QuotationItem src : existingItems) {
            subtotal = subtotal.add(src.getTotalPrice());
            QuotationItem clone = QuotationItem.builder()
                    .quotation(target)
                    .productId(src.getProductId())
                    .product(src.getProduct())
                    .productName(src.getProductName())
                    .productCode(src.getProductCode())
                    .principal(src.getPrincipal())
                    .quantity(src.getQuantity())
                    .unitPrice(src.getUnitPrice())
                    .discountPercent(src.getDiscountPercent())
                    .totalPrice(src.getTotalPrice())
                    .build();
            target.getItems().add(clone);
        }

        BigDecimal overallDiscPct = target.getDiscountPercent() != null ? target.getDiscountPercent() : BigDecimal.ZERO;
        BigDecimal overallDiscAmt = subtotal.multiply(overallDiscPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal netAfterDisc = subtotal.subtract(overallDiscAmt);

        BigDecimal taxPct = target.getTaxPercent() != null ? target.getTaxPercent() : BigDecimal.valueOf(18.00);
        BigDecimal taxAmt = netAfterDisc.multiply(taxPct).divide(BigDecimal.valueOf(100), 2, RoundingMode.HALF_UP);
        BigDecimal grandTotal = netAfterDisc.add(taxAmt);

        target.setSubtotal(subtotal);
        target.setTotalValue(grandTotal);
    }

    private String defaultTerms() {
        return "1. Price Basis: Ex-works warehouse, packaging & forwarding extra as applicable.\n" +
               "2. Payment Terms: 30% advance with order, balance 70% against dispatch proforma.\n" +
               "3. Delivery Period: 4 to 6 weeks from receipt of technically and commercially clear order.\n" +
               "4. Warranty: 12 months from the date of commissioning or 18 months from supply.\n" +
               "5. Taxes: GST @ 18% extra as applicable at the time of invoicing.";
    }
}
