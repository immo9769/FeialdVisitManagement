package com.crm.fieldvisit.service;

import com.crm.fieldvisit.common.ResourceNotFoundException;
import com.crm.fieldvisit.dto.OpportunityRequest;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.Year;
import java.util.List;

@Service
@RequiredArgsConstructor
public class OpportunityService {

    private final OpportunityRepository opportunityRepository;
    private final OpportunityFollowUpRepository followUpRepository;
    private final CustomerRepository customerRepository;
    private final EmployeeRepository employeeRepository;
    private final ProductRepository productRepository;

    @Transactional(readOnly = true)
    public List<Opportunity> findAll(String status, Integer customerId, Integer salespersonId, String principal, String search) {
        String s = (search != null && !search.isBlank()) ? search.trim() : null;
        String p = (principal != null && !principal.isBlank()) ? principal.trim() : null;
        String st = (status != null && !status.isBlank()) ? status.trim() : null;

        List<Opportunity> list = opportunityRepository.findAllWithFilters(st, customerId, salespersonId, p, s);
        list.forEach(opp -> {
            if (opp.getProducts() != null) opp.getProducts().size();
            if (opp.getFollowUps() != null) opp.getFollowUps().size();
        });
        return list;
    }

    @Transactional(readOnly = true)
    public Opportunity findOne(Integer id) {
        Opportunity opp = opportunityRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Opportunity not found with ID: " + id));
        if (opp.getProducts() != null) opp.getProducts().size();
        if (opp.getFollowUps() != null) opp.getFollowUps().size();
        return opp;
    }

    @Transactional
    public Opportunity create(OpportunityRequest request, String userEmail) {
        String oppNo = request.getOpportunityNo();
        if (oppNo == null || oppNo.isBlank()) {
            long count = opportunityRepository.count();
            oppNo = String.format("OPP-%d-%04d", Year.now().getValue(), count + 1);
        }

        Employee salesperson = null;
        if (request.getSalespersonId() != null) {
            salesperson = employeeRepository.findById(request.getSalespersonId()).orElse(null);
        } else if (userEmail != null) {
            salesperson = employeeRepository.findByEmail(userEmail).orElse(null);
        }

        Integer spId = salesperson != null ? salesperson.getId() : null;
        Integer branchId = request.getBranchId() != null 
                ? request.getBranchId() 
                : (salesperson != null ? salesperson.getBranchId() : 1);

        Opportunity opp = Opportunity.builder()
                .opportunityNo(oppNo)
                .name(request.getName())
                .customerId(request.getCustomerId())
                .contactId(request.getContactId())
                .isNewClient(request.getIsNewClient() != null ? request.getIsNewClient() : false)
                .leadSource(request.getLeadSource() != null ? request.getLeadSource() : "Direct Visit")
                .requirement(request.getRequirement())
                .principal(request.getPrincipal())
                .leadDate(request.getLeadDate() != null ? request.getLeadDate() : LocalDate.now())
                .expectedClosureDate(request.getExpectedClosureDate())
                .status(request.getStatus() != null ? request.getStatus() : "NEW_LEAD")
                .salespersonId(spId)
                .branchId(branchId)
                .competitorName(request.getCompetitorName())
                .competitorModel(request.getCompetitorModel())
                .competitorPrice(request.getCompetitorPrice())
                .competitorStrengths(request.getCompetitorStrengths())
                .competitorWeaknesses(request.getCompetitorWeaknesses())
                .threatLevel(request.getThreatLevel() != null ? request.getThreatLevel() : "MEDIUM")
                .winLossReason(request.getWinLossReason())
                .createdBy(userEmail != null ? userEmail : "SYSTEM")
                .updatedBy(userEmail != null ? userEmail : "SYSTEM")
                .build();

        // Calculate and add products
        BigDecimal totalEstValue = BigDecimal.ZERO;
        if (request.getProducts() != null && !request.getProducts().isEmpty()) {
            for (OpportunityRequest.OpportunityProductRequest pReq : request.getProducts()) {
                Product prod = pReq.getProductId() != null 
                        ? productRepository.findById(pReq.getProductId()).orElse(null) 
                        : null;
                int qty = pReq.getQuantity() != null && pReq.getQuantity() > 0 ? pReq.getQuantity() : 1;
                BigDecimal unitPrice = pReq.getUnitPrice() != null ? pReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal lineTotal = pReq.getTotalPrice() != null 
                        ? pReq.getTotalPrice() 
                        : unitPrice.multiply(BigDecimal.valueOf(qty));

                totalEstValue = totalEstValue.add(lineTotal);

                OpportunityProduct oppProd = OpportunityProduct.builder()
                        .opportunity(opp)
                        .productId(pReq.getProductId())
                        .product(prod)
                        .productName(pReq.getProductName() != null ? pReq.getProductName() : (prod != null ? prod.getName() : "Product"))
                        .productCode(pReq.getProductCode() != null ? pReq.getProductCode() : (prod != null ? prod.getCode() : ""))
                        .principal(pReq.getPrincipal() != null ? pReq.getPrincipal() : (prod != null ? prod.getPrincipal() : opp.getPrincipal()))
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .totalPrice(lineTotal)
                        .build();

                opp.getProducts().add(oppProd);
            }
        }

        if (totalEstValue.compareTo(BigDecimal.ZERO) > 0) {
            opp.setEstimatedValue(totalEstValue);
        } else if (request.getEstimatedValue() != null) {
            opp.setEstimatedValue(request.getEstimatedValue());
        }

        // Add Follow-ups if supplied
        if (request.getFollowUps() != null && !request.getFollowUps().isEmpty()) {
            for (OpportunityRequest.OpportunityFollowUpRequest fReq : request.getFollowUps()) {
                OpportunityFollowUp followUp = OpportunityFollowUp.builder()
                        .opportunity(opp)
                        .followUpDate(fReq.getFollowUpDate() != null ? fReq.getFollowUpDate() : LocalDate.now())
                        .notes(fReq.getNotes())
                        .nextAction(fReq.getNextAction())
                        .nextFollowUpDate(fReq.getNextFollowUpDate())
                        .salespersonId(fReq.getSalespersonId() != null ? fReq.getSalespersonId() : spId)
                        .status(fReq.getStatus() != null ? fReq.getStatus() : "SCHEDULED")
                        .createdBy(userEmail != null ? userEmail : "SYSTEM")
                        .build();

                opp.getFollowUps().add(followUp);
            }
        }

        return opportunityRepository.save(opp);
    }

    @Transactional
    public Opportunity update(Integer id, OpportunityRequest request, String userEmail) {
        Opportunity opp = findOne(id);

        if (request.getName() != null) opp.setName(request.getName());
        if (request.getCustomerId() != null) opp.setCustomerId(request.getCustomerId());
        if (request.getContactId() != null) opp.setContactId(request.getContactId());
        if (request.getIsNewClient() != null) opp.setIsNewClient(request.getIsNewClient());
        if (request.getLeadSource() != null) opp.setLeadSource(request.getLeadSource());
        if (request.getRequirement() != null) opp.setRequirement(request.getRequirement());
        if (request.getPrincipal() != null) opp.setPrincipal(request.getPrincipal());
        if (request.getLeadDate() != null) opp.setLeadDate(request.getLeadDate());
        if (request.getExpectedClosureDate() != null) opp.setExpectedClosureDate(request.getExpectedClosureDate());
        if (request.getStatus() != null) opp.setStatus(request.getStatus());
        if (request.getSalespersonId() != null) opp.setSalespersonId(request.getSalespersonId());
        if (request.getBranchId() != null) opp.setBranchId(request.getBranchId());
        opp.setCompetitorName(request.getCompetitorName());
        opp.setCompetitorModel(request.getCompetitorModel());
        opp.setCompetitorPrice(request.getCompetitorPrice());
        opp.setCompetitorStrengths(request.getCompetitorStrengths());
        opp.setCompetitorWeaknesses(request.getCompetitorWeaknesses());
        if (request.getThreatLevel() != null) opp.setThreatLevel(request.getThreatLevel());
        opp.setWinLossReason(request.getWinLossReason());
        if (userEmail != null) opp.setUpdatedBy(userEmail);

        if (request.getProducts() != null) {
            opp.getProducts().clear();
            BigDecimal totalEstValue = BigDecimal.ZERO;
            for (OpportunityRequest.OpportunityProductRequest pReq : request.getProducts()) {
                Product prod = pReq.getProductId() != null 
                        ? productRepository.findById(pReq.getProductId()).orElse(null) 
                        : null;
                int qty = pReq.getQuantity() != null && pReq.getQuantity() > 0 ? pReq.getQuantity() : 1;
                BigDecimal unitPrice = pReq.getUnitPrice() != null ? pReq.getUnitPrice() : BigDecimal.ZERO;
                BigDecimal lineTotal = pReq.getTotalPrice() != null 
                        ? pReq.getTotalPrice() 
                        : unitPrice.multiply(BigDecimal.valueOf(qty));

                totalEstValue = totalEstValue.add(lineTotal);

                OpportunityProduct oppProd = OpportunityProduct.builder()
                        .opportunity(opp)
                        .productId(pReq.getProductId())
                        .product(prod)
                        .productName(pReq.getProductName() != null ? pReq.getProductName() : (prod != null ? prod.getName() : "Product"))
                        .productCode(pReq.getProductCode() != null ? pReq.getProductCode() : (prod != null ? prod.getCode() : ""))
                        .principal(pReq.getPrincipal() != null ? pReq.getPrincipal() : (prod != null ? prod.getPrincipal() : opp.getPrincipal()))
                        .quantity(qty)
                        .unitPrice(unitPrice)
                        .totalPrice(lineTotal)
                        .build();

                opp.getProducts().add(oppProd);
            }
            if (totalEstValue.compareTo(BigDecimal.ZERO) > 0) {
                opp.setEstimatedValue(totalEstValue);
            }
        }

        if (request.getEstimatedValue() != null && (request.getProducts() == null || request.getProducts().isEmpty())) {
            opp.setEstimatedValue(request.getEstimatedValue());
        }

        return opportunityRepository.save(opp);
    }

    @Transactional
    public OpportunityFollowUp addFollowUp(Integer opportunityId, OpportunityRequest.OpportunityFollowUpRequest request, String userEmail) {
        Opportunity opp = findOne(opportunityId);
        OpportunityFollowUp fu = OpportunityFollowUp.builder()
                .opportunity(opp)
                .followUpDate(request.getFollowUpDate() != null ? request.getFollowUpDate() : LocalDate.now())
                .notes(request.getNotes())
                .nextAction(request.getNextAction())
                .nextFollowUpDate(request.getNextFollowUpDate())
                .salespersonId(request.getSalespersonId() != null ? request.getSalespersonId() : opp.getSalespersonId())
                .status(request.getStatus() != null ? request.getStatus() : "SCHEDULED")
                .createdBy(userEmail != null ? userEmail : "SYSTEM")
                .build();
        return followUpRepository.save(fu);
    }

    @Transactional
    public OpportunityFollowUp updateFollowUp(Integer followUpId, OpportunityRequest.OpportunityFollowUpRequest request) {
        OpportunityFollowUp fu = followUpRepository.findById(followUpId)
                .orElseThrow(() -> new ResourceNotFoundException("Follow-up record not found with ID: " + followUpId));

        if (request.getFollowUpDate() != null) fu.setFollowUpDate(request.getFollowUpDate());
        if (request.getNotes() != null) fu.setNotes(request.getNotes());
        if (request.getNextAction() != null) fu.setNextAction(request.getNextAction());
        if (request.getNextFollowUpDate() != null) fu.setNextFollowUpDate(request.getNextFollowUpDate());
        if (request.getStatus() != null) fu.setStatus(request.getStatus());
        if (request.getSalespersonId() != null) fu.setSalespersonId(request.getSalespersonId());

        return followUpRepository.save(fu);
    }

    @Transactional(readOnly = true)
    public List<OpportunityFollowUp> getFollowUps(Integer opportunityId) {
        return followUpRepository.findByOpportunityIdOrderByFollowUpDateDesc(opportunityId);
    }

    @Transactional
    public boolean deleteFollowUp(Integer followUpId) {
        followUpRepository.deleteById(followUpId);
        return true;
    }

    @Transactional
    public Opportunity updateCompetitor(Integer id, OpportunityRequest.OpportunityCompetitorRequest request, String userEmail) {
        Opportunity opp = findOne(id);
        opp.setCompetitorName(request.getCompetitorName());
        opp.setCompetitorModel(request.getCompetitorModel());
        opp.setCompetitorPrice(request.getCompetitorPrice());
        opp.setCompetitorStrengths(request.getCompetitorStrengths());
        opp.setCompetitorWeaknesses(request.getCompetitorWeaknesses());
        if (request.getThreatLevel() != null && !request.getThreatLevel().trim().isEmpty()) {
            opp.setThreatLevel(request.getThreatLevel());
        }
        opp.setWinLossReason(request.getWinLossReason());
        if (userEmail != null) opp.setUpdatedBy(userEmail);
        return opportunityRepository.save(opp);
    }

    @Transactional
    public Opportunity clearCompetitor(Integer id, String userEmail) {
        Opportunity opp = findOne(id);
        opp.setCompetitorName(null);
        opp.setCompetitorModel(null);
        opp.setCompetitorPrice(null);
        opp.setCompetitorStrengths(null);
        opp.setCompetitorWeaknesses(null);
        opp.setThreatLevel("MEDIUM");
        opp.setWinLossReason(null);
        if (userEmail != null) opp.setUpdatedBy(userEmail);
        return opportunityRepository.save(opp);
    }

    @Transactional
    public boolean remove(Integer id) {
        Opportunity opp = findOne(id);
        opp.setStatus("LOST");
        opportunityRepository.save(opp);
        return true;
    }
}
