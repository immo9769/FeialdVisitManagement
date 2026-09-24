package com.crm.fieldvisit.service;

import com.crm.fieldvisit.dto.QuotationRequest;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class QuotationServiceTest {

    @Mock
    private QuotationRepository quotationRepository;

    @Mock
    private OpportunityRepository opportunityRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private ProductRepository productRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @InjectMocks
    private QuotationService quotationService;

    private Employee mockSalesperson;
    private Opportunity mockOpportunity;

    @BeforeEach
    void setUp() {
        mockSalesperson = Employee.builder()
                .id(1)
                .name("Amit Sharma")
                .email("amit@crm.com")
                .role("SALES_EXEC")
                .build();

        mockOpportunity = Opportunity.builder()
                .id(20)
                .opportunityNo("OPP-2026-0002")
                .name("CNC Machine Tender")
                .status("NEW_LEAD")
                .build();
    }

    @Test
    @DisplayName("Create Quotation - Generates Rev 0, calculates Subtotal, 18% Tax and Total")
    void testCreateQuotation_InitialRev0() {
        // Arrange
        QuotationRequest.QuotationItemRequest item1 = QuotationRequest.QuotationItemRequest.builder()
                .productName("Hydraulic Press Brake 100T")
                .productCode("PRD-CNC-PRESS")
                .principal("Trumpf")
                .quantity(1)
                .unitPrice(new BigDecimal("100000.00"))
                .discountPercent(BigDecimal.ZERO)
                .totalPrice(new BigDecimal("100000.00"))
                .build();

        QuotationRequest.QuotationItemRequest item2 = QuotationRequest.QuotationItemRequest.builder()
                .productName("Laser Protective Window")
                .productCode("PRD-OPTICS-KIT")
                .principal("Mazak")
                .quantity(2)
                .unitPrice(new BigDecimal("25000.00"))
                .discountPercent(BigDecimal.ZERO)
                .totalPrice(new BigDecimal("50000.00"))
                .build();

        QuotationRequest request = QuotationRequest.builder()
                .quoteDate(LocalDate.now())
                .customerId(10)
                .contactId(101)
                .opportunityId(20)
                .validityDays(30)
                .discountPercent(BigDecimal.ZERO)
                .taxPercent(new BigDecimal("18.00"))
                .items(List.of(item1, item2))
                .build();

        when(quotationRepository.count()).thenReturn(3L);
        when(employeeRepository.findByEmail("amit@crm.com")).thenReturn(Optional.of(mockSalesperson));
        when(opportunityRepository.findById(20)).thenReturn(Optional.of(mockOpportunity));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(inv -> {
            Quotation q = inv.getArgument(0);
            q.setId(500);
            return q;
        });

        // Act
        Quotation result = quotationService.create(request, "amit@crm.com");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(500);
        assertThat(result.getQuoteNo()).matches("^QT-\\d{4}-0004$");
        assertThat(result.getRevisionNo()).isEqualTo(0);
        assertThat(result.getVersionLabel()).isEqualTo("Rev 0");
        assertThat(result.getStatus()).isEqualTo("DRAFT");
        // Subtotal = 100,000 + 50,000 = 150,000
        assertThat(result.getSubtotal()).isEqualByComparingTo(new BigDecimal("150000.00"));
        // Tax 18% of 150,000 = 27,000; Total = 177,000
        assertThat(result.getTotalValue()).isEqualByComparingTo(new BigDecimal("177000.00"));

        // Opportunity should have transitioned to PROPOSAL_SENT
        assertThat(mockOpportunity.getStatus()).isEqualTo("PROPOSAL_SENT");
        verify(opportunityRepository, times(1)).save(mockOpportunity);
        verify(quotationRepository, times(1)).save(any(Quotation.class));
    }

    @Test
    @DisplayName("Create Revision - Increments revision from Rev 0 to Rev 1 and links parent")
    void testCreateRevision_IncrementsToRev1() {
        Quotation rev0 = Quotation.builder()
                .id(10)
                .quoteNo("QT-2026-0001")
                .revisionNo(0)
                .versionLabel("Rev 0")
                .status("SENT")
                .customerId(10)
                .contactId(101)
                .opportunityId(20)
                .termsAndConditions("Standard Payment Terms")
                .items(new ArrayList<>())
                .subtotal(new BigDecimal("100000.00"))
                .taxPercent(new BigDecimal("18.00"))
                .totalValue(new BigDecimal("118000.00"))
                .build();

        when(quotationRepository.findById(10)).thenReturn(Optional.of(rev0));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(inv -> {
            Quotation q = inv.getArgument(0);
            if (q.getId() == null) q.setId(11);
            return q;
        });

        QuotationRequest revRequest = QuotationRequest.builder()
                .notes("Added 5% special festive discount")
                .discountPercent(new BigDecimal("5.00"))
                .build();

        // Act
        Quotation rev1 = quotationService.createRevision(10, revRequest, "amit@crm.com");

        // Assert
        assertThat(rev1).isNotNull();
        assertThat(rev1.getQuoteNo()).isEqualTo("QT-2026-0001");
        assertThat(rev1.getRevisionNo()).isEqualTo(1);
        assertThat(rev1.getVersionLabel()).isEqualTo("Rev 1");
        assertThat(rev1.getParentQuoteId()).isEqualTo(10);
        assertThat(rev1.getStatus()).isEqualTo("DRAFT");
        // Base quote should now be marked as REVISED
        assertThat(rev0.getStatus()).isEqualTo("REVISED");

        verify(quotationRepository, atLeast(2)).save(any(Quotation.class));
    }

    @Test
    @DisplayName("Update Status - Marking quote as ACCEPTED automatically sets linked Opportunity to WON")
    void testUpdateStatus_AcceptedUpdatesOpportunityToWon() {
        Quotation quote = Quotation.builder()
                .id(15)
                .quoteNo("QT-2026-0005")
                .opportunityId(20)
                .status("SENT")
                .build();

        when(quotationRepository.findById(15)).thenReturn(Optional.of(quote));
        when(opportunityRepository.findById(20)).thenReturn(Optional.of(mockOpportunity));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Quotation updated = quotationService.updateStatus(15, "ACCEPTED");

        // Assert
        assertThat(updated.getStatus()).isEqualTo("ACCEPTED");
        assertThat(mockOpportunity.getStatus()).isEqualTo("WON");
        verify(opportunityRepository, times(1)).save(mockOpportunity);
    }

    @Test
    @DisplayName("Update Status - Marking quote as REJECTED automatically sets linked Opportunity to LOST")
    void testUpdateStatus_RejectedUpdatesOpportunityToLost() {
        Quotation quote = Quotation.builder()
                .id(16)
                .quoteNo("QT-2026-0006")
                .opportunityId(20)
                .status("SENT")
                .build();

        when(quotationRepository.findById(16)).thenReturn(Optional.of(quote));
        when(opportunityRepository.findById(20)).thenReturn(Optional.of(mockOpportunity));
        when(quotationRepository.save(any(Quotation.class))).thenAnswer(inv -> inv.getArgument(0));

        // Act
        Quotation updated = quotationService.updateStatus(16, "REJECTED");

        // Assert
        assertThat(updated.getStatus()).isEqualTo("REJECTED");
        assertThat(mockOpportunity.getStatus()).isEqualTo("LOST");
        verify(opportunityRepository, times(1)).save(mockOpportunity);
    }

    @Test
    @DisplayName("Find History - Returns chronological audit list of quote revisions")
    void testFindHistory_ReturnsChronologicalRevisions() {
        Quotation q0 = Quotation.builder().id(1).quoteNo("QT-2026-0001").revisionNo(0).versionLabel("Rev 0").build();
        Quotation q1 = Quotation.builder().id(2).quoteNo("QT-2026-0001").revisionNo(1).versionLabel("Rev 1").build();
        Quotation q2 = Quotation.builder().id(3).quoteNo("QT-2026-0001").revisionNo(2).versionLabel("Rev 2").build();

        when(quotationRepository.findByQuoteNoOrderByRevisionNoAsc("QT-2026-0001"))
                .thenReturn(List.of(q0, q1, q2));

        List<Quotation> history = quotationService.findHistoryByQuoteNo("QT-2026-0001");

        assertThat(history).hasSize(3);
        assertThat(history.get(0).getVersionLabel()).isEqualTo("Rev 0");
        assertThat(history.get(1).getVersionLabel()).isEqualTo("Rev 1");
        assertThat(history.get(2).getVersionLabel()).isEqualTo("Rev 2");
        verify(quotationRepository).findByQuoteNoOrderByRevisionNoAsc("QT-2026-0001");
    }
}
