package com.crm.fieldvisit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
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
public class QuotationRequest {

    private String quoteNo;

    @NotNull(message = "Quote date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate quoteDate;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private Integer contactId;
    private Integer opportunityId;

    private Integer revisionNo;
    private String versionLabel;
    private Integer parentQuoteId;

    @Builder.Default
    private Integer validityDays = 30;

    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate validityDate;

    private BigDecimal subtotal;
    private BigDecimal discountPercent;
    private BigDecimal taxPercent;
    private BigDecimal totalValue;

    @Builder.Default
    private String status = "DRAFT"; // DRAFT, SENT, ACCEPTED, REJECTED, REVISED

    private String termsAndConditions;
    private String notes;
    private Integer salespersonId;

    private List<QuotationItemRequest> items;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuotationItemRequest {
        private Integer id;
        private Integer productId;
        private String productName;
        private String productCode;
        private String principal;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal discountPercent;
        private BigDecimal totalPrice;
    }
}
