package com.crm.fieldvisit.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailyVisitRequest {

    @NotNull(message = "Visit date is required")
    @JsonFormat(pattern = "yyyy-MM-dd")
    private LocalDate visitDate;

    private Integer employeeId;
    private Integer departmentId;
    private Integer branchId;

    @NotNull(message = "Customer ID is required")
    private Integer customerId;

    private Integer contactId;

    @NotNull(message = "Activity Type ID is required")
    private Integer activityTypeId;

    private Integer productId;

    @NotBlank(message = "Place from is required")
    private String placeFrom;

    @NotBlank(message = "Place to is required")
    private String placeTo;

    @NotNull(message = "Start time is required")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @Builder.Default
    private Integer personCount = 1;

    @Builder.Default
    private String status = "DRAFT";

    private String rejectionReason;

    private List<VisitExpenseRequest> expenses;
    private List<VisitCustomerRequest> extensibleCustomers;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class VisitCustomerRequest {
        private Integer customerId;
        private Integer contactId;
        private Integer sequenceNo;
    }
}
