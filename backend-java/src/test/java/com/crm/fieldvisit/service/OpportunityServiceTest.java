package com.crm.fieldvisit.service;

import com.crm.fieldvisit.dto.OpportunityRequest;
import com.crm.fieldvisit.dto.OpportunityRequest.OpportunityFollowUpRequest;
import com.crm.fieldvisit.entity.Customer;
import com.crm.fieldvisit.entity.Employee;
import com.crm.fieldvisit.entity.Opportunity;
import com.crm.fieldvisit.entity.OpportunityFollowUp;
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
class OpportunityServiceTest {

    @Mock
    private OpportunityRepository opportunityRepository;

    @Mock
    private OpportunityFollowUpRepository followUpRepository;

    @Mock
    private CustomerRepository customerRepository;

    @Mock
    private EmployeeRepository employeeRepository;

    @Mock
    private ProductRepository productRepository;

    @InjectMocks
    private OpportunityService opportunityService;

    private Employee mockSalesperson;
    private Customer mockCustomer;

    @BeforeEach
    void setUp() {
        mockSalesperson = Employee.builder()
                .id(1)
                .name("Amit Sharma")
                .email("amit@crm.com")
                .branchId(2)
                .role("SALES_EXEC")
                .build();

        mockCustomer = Customer.builder()
                .id(10)
                .name("Tata Motors Ltd")
                .customerType("Existing Customer")
                .build();
    }

    @Test
    @DisplayName("Create Opportunity - Auto-calculates Estimated Value from Products")
    void testCreateOpportunity_CalculatesEstimatedValueFromProducts() {
        // Arrange
        OpportunityRequest.OpportunityProductRequest p1 = OpportunityRequest.OpportunityProductRequest.builder()
                .productName("Hydraulic Press Brake 100T")
                .productCode("PRD-CNC-PRESS")
                .principal("Trumpf")
                .quantity(2)
                .unitPrice(new BigDecimal("3500000.00"))
                .totalPrice(new BigDecimal("7000000.00"))
                .build();

        OpportunityRequest.OpportunityProductRequest p2 = OpportunityRequest.OpportunityProductRequest.builder()
                .productName("Robotic Welding Cell 6-Axis")
                .productCode("PRD-ROBOT-WELD")
                .principal("Fanuc")
                .quantity(1)
                .unitPrice(new BigDecimal("2800000.00"))
                .totalPrice(new BigDecimal("2800000.00"))
                .build();

        OpportunityRequest request = OpportunityRequest.builder()
                .name("Automotive Stamping Line Upgrade")
                .customerId(10)
                .contactId(101)
                .isNewClient(false)
                .leadSource("Trade Show")
                .requirement("Two 100T press brakes and one welding robot")
                .principal("Trumpf")
                .leadDate(LocalDate.now())
                .expectedClosureDate(LocalDate.now().plusMonths(2))
                .status("QUALIFIED")
                .salespersonId(1)
                .products(List.of(p1, p2))
                .build();

        when(opportunityRepository.count()).thenReturn(5L);
        when(employeeRepository.findById(1)).thenReturn(Optional.of(mockSalesperson));
        when(opportunityRepository.save(any(Opportunity.class))).thenAnswer(invocation -> {
            Opportunity saved = invocation.getArgument(0);
            saved.setId(100);
            return saved;
        });

        // Act
        Opportunity result = opportunityService.create(request, "amit@crm.com");

        // Assert
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(100);
        assertThat(result.getOpportunityNo()).startsWith("OPP-");
        assertThat(result.getName()).isEqualTo("Automotive Stamping Line Upgrade");
        // Sum: 7,000,000 + 2,800,000 = 9,800,000
        assertThat(result.getEstimatedValue()).isEqualByComparingTo(new BigDecimal("9800000.00"));
        assertThat(result.getProducts()).hasSize(2);
        assertThat(result.getStatus()).isEqualTo("QUALIFIED");

        verify(opportunityRepository, times(1)).save(any(Opportunity.class));
    }

    @Test
    @DisplayName("Create Opportunity - Auto-generates Opportunity Number when not provided")
    void testCreateOpportunity_AutoGeneratesOpportunityNo() {
        OpportunityRequest request = OpportunityRequest.builder()
                .name("CNC Fiber Laser Expansion")
                .customerId(10)
                .salespersonId(1)
                .build();

        when(opportunityRepository.count()).thenReturn(12L);
        when(employeeRepository.findById(1)).thenReturn(Optional.of(mockSalesperson));
        when(opportunityRepository.save(any(Opportunity.class))).thenAnswer(inv -> inv.getArgument(0));

        Opportunity result = opportunityService.create(request, "amit@crm.com");

        assertThat(result.getOpportunityNo()).matches("^OPP-\\d{4}-0013$");
    }

    @Test
    @DisplayName("Add Follow-Up - Persists Interaction and links to Opportunity")
    void testAddFollowUp_PersistsInteraction() {
        Opportunity existingOpp = Opportunity.builder()
                .id(50)
                .opportunityNo("OPP-2026-0005")
                .name("Tube Laser Project")
                .followUps(new ArrayList<>())
                .build();

        when(opportunityRepository.findById(50)).thenReturn(Optional.of(existingOpp));
        when(followUpRepository.save(any(OpportunityFollowUp.class))).thenAnswer(inv -> {
            OpportunityFollowUp fu = inv.getArgument(0);
            fu.setId(301);
            return fu;
        });

        OpportunityFollowUpRequest fuRequest = OpportunityFollowUpRequest.builder()
                .followUpDate(LocalDate.now())
                .notes("Discussed technical specifications with Chief Engineer")
                .nextAction("Submit Commercial Proposal")
                .nextFollowUpDate(LocalDate.now().plusDays(5))
                .salespersonId(1)
                .status("COMPLETED")
                .build();

        OpportunityFollowUp followUp = opportunityService.addFollowUp(50, fuRequest, "amit@crm.com");

        assertThat(followUp).isNotNull();
        assertThat(followUp.getId()).isEqualTo(301);
        assertThat(followUp.getNotes()).contains("Chief Engineer");
        assertThat(followUp.getNextAction()).isEqualTo("Submit Commercial Proposal");
        assertThat(followUp.getStatus()).isEqualTo("COMPLETED");
        verify(followUpRepository, times(1)).save(any(OpportunityFollowUp.class));
    }

    @Test
    @DisplayName("Find All with Filters - Passes status, customer, and search parameters")
    void testFindAllWithFilters() {
        Opportunity opp1 = Opportunity.builder().id(1).opportunityNo("OPP-2026-0001").status("WON").build();
        when(opportunityRepository.findAllWithFilters("WON", 10, null, null, "Laser"))
                .thenReturn(List.of(opp1));

        List<Opportunity> results = opportunityService.findAll("WON", 10, null, null, "Laser");

        assertThat(results).hasSize(1);
        assertThat(results.get(0).getStatus()).isEqualTo("WON");
        verify(opportunityRepository).findAllWithFilters("WON", 10, null, null, "Laser");
    }

    @Test
    @DisplayName("Create Opportunity - Persists Competitor Intelligence Fields")
    void testCreateOpportunity_PersistsCompetitorFields() {
        OpportunityRequest request = OpportunityRequest.builder()
                .name("High Speed Machining Center Project")
                .customerId(10)
                .salespersonId(1)
                .competitorName("Haas Automation")
                .competitorModel("VF-2SS Super Speed")
                .competitorPrice(new BigDecimal("3200000.00"))
                .competitorStrengths("Lower upfront cost, fast delivery")
                .competitorWeaknesses("High power consumption, less rigid cast body")
                .threatLevel("HIGH")
                .winLossReason("Client prioritizing 3-year warranty and local Pune service center")
                .build();

        when(opportunityRepository.count()).thenReturn(20L);
        when(employeeRepository.findById(1)).thenReturn(Optional.of(mockSalesperson));
        when(opportunityRepository.save(any(Opportunity.class))).thenAnswer(inv -> inv.getArgument(0));

        Opportunity result = opportunityService.create(request, "amit@crm.com");

        assertThat(result).isNotNull();
        assertThat(result.getCompetitorName()).isEqualTo("Haas Automation");
        assertThat(result.getCompetitorModel()).isEqualTo("VF-2SS Super Speed");
        assertThat(result.getCompetitorPrice()).isEqualByComparingTo(new BigDecimal("3200000.00"));
        assertThat(result.getCompetitorStrengths()).contains("Lower upfront cost");
        assertThat(result.getCompetitorWeaknesses()).contains("power consumption");
        assertThat(result.getThreatLevel()).isEqualTo("HIGH");
        assertThat(result.getWinLossReason()).contains("Pune service center");
    }

    @Test
    @DisplayName("Get Follow-ups - Fetches ordered list for an opportunity")
    void testGetFollowUps_ReturnsOrderedList() {
        OpportunityFollowUp fu1 = OpportunityFollowUp.builder().id(1).opportunityId(50).notes("Demo meeting").build();
        OpportunityFollowUp fu2 = OpportunityFollowUp.builder().id(2).opportunityId(50).notes("Commercial proposal discussion").build();

        when(followUpRepository.findByOpportunityIdOrderByFollowUpDateDesc(50))
                .thenReturn(List.of(fu2, fu1));

        List<OpportunityFollowUp> results = opportunityService.getFollowUps(50);

        assertThat(results).hasSize(2);
        assertThat(results.get(0).getNotes()).contains("Commercial proposal discussion");
        verify(followUpRepository).findByOpportunityIdOrderByFollowUpDateDesc(50);
    }

    @Test
    @DisplayName("Update Competitor - Updates competitor intelligence fields on the go")
    void testUpdateCompetitor_UpdatesFields() {
        Opportunity opp = Opportunity.builder()
                .id(101)
                .opportunityNo("OPP-2026-0001")
                .name("Machining Center")
                .competitorName("Old Brand")
                .threatLevel("LOW")
                .build();

        when(opportunityRepository.findById(101)).thenReturn(Optional.of(opp));
        when(opportunityRepository.save(any(Opportunity.class))).thenAnswer(inv -> inv.getArgument(0));

        OpportunityRequest.OpportunityCompetitorRequest compReq = OpportunityRequest.OpportunityCompetitorRequest.builder()
                .competitorName("Mazak")
                .competitorModel("VTC-800")
                .competitorPrice(new BigDecimal("4500000.00"))
                .competitorStrengths("Japanese spindle accuracy")
                .competitorWeaknesses("Expensive spare parts")
                .threatLevel("HIGH")
                .winLossReason("Client preferred Mazak accuracy")
                .build();

        Opportunity updated = opportunityService.updateCompetitor(101, compReq, "user@crm.com");

        assertThat(updated.getCompetitorName()).isEqualTo("Mazak");
        assertThat(updated.getCompetitorModel()).isEqualTo("VTC-800");
        assertThat(updated.getCompetitorPrice()).isEqualByComparingTo(new BigDecimal("4500000.00"));
        assertThat(updated.getThreatLevel()).isEqualTo("HIGH");
        assertThat(updated.getUpdatedBy()).isEqualTo("user@crm.com");
    }

    @Test
    @DisplayName("Clear Competitor - Resets competitor fields to null/defaults")
    void testClearCompetitor_ResetsFields() {
        Opportunity opp = Opportunity.builder()
                .id(102)
                .competitorName("Mazak")
                .competitorPrice(new BigDecimal("4500000.00"))
                .threatLevel("HIGH")
                .build();

        when(opportunityRepository.findById(102)).thenReturn(Optional.of(opp));
        when(opportunityRepository.save(any(Opportunity.class))).thenAnswer(inv -> inv.getArgument(0));

        Opportunity cleared = opportunityService.clearCompetitor(102, "user@crm.com");

        assertThat(cleared.getCompetitorName()).isNull();
        assertThat(cleared.getCompetitorPrice()).isNull();
        assertThat(cleared.getThreatLevel()).isEqualTo("MEDIUM");
    }
}
