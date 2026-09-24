package com.crm.fieldvisit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OpportunityRequest {

    private String opportunityNo;

    @NotBlank(message = "Opportunity name/title is required")
    private String name;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private Integer contactId;

    @Builder.Default
    private Boolean isNewClient = false;

    private String leadSource;
    private String requirement;
    private String principal;
    private BigDecimal estimatedValue;

    @NotNull(message = "Lead date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate leadDate;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate expectedClosureDate;

    @Builder.Default
    private String status = "NEW_LEAD"; // NEW_LEAD, QUALIFIED, PROPOSAL_SENT, NEGOTIATION, WON, LOST

    private Integer salespersonId;
    private Integer branchId;

    // Competitor Intelligence
    private String competitorName;
    private String competitorModel;
    private BigDecimal competitorPrice;
    private String competitorStrengths;
    private String competitorWeaknesses;
    @Builder.Default
    private String threatLevel = "MEDIUM";
    private String winLossReason;

    private List<OpportunityProductRequest> products;
    private List<OpportunityFollowUpRequest> followUps;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpportunityProductRequest {
        private Integer id;
        private Integer productId;
        private String productName;
        private String productCode;
        private String principal;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal totalPrice;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpportunityFollowUpRequest {
        private Integer id;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate followUpDate;
        private String notes;
        private String nextAction;
        @JsonFormat(pattern = "yyyy-MM-dd")
        private LocalDate nextFollowUpDate;
        private Integer salespersonId;
        private String status;
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class OpportunityCompetitorRequest {
        private String competitorName;
        private String competitorModel;
        private BigDecimal competitorPrice;
        private String competitorStrengths;
        private String competitorWeaknesses;
        private String threatLevel;
        private String winLossReason;
    }
}
