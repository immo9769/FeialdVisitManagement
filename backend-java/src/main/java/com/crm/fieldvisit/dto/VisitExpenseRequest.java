package com.crm.fieldvisit.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VisitExpenseRequest {

    private Integer id;
    private Integer expenseHeadId;
    private BigDecimal dayStartKm;
    private BigDecimal dayEndKm;
    private BigDecimal totalKm;
    private BigDecimal fuelRate;
    private BigDecimal tollTax;
    private BigDecimal amount;
    private String attachmentUrl;
    private String remarks;
}
