package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.service.ReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@Tag(name = "Reports")
@RestController
@RequestMapping("/api/reports")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @Operation(summary = "Get Expense Matrix & Financial Status Summary (Weekly or Monthly)")
    @GetMapping("/monthly-expense")
    public ResponseEntity<ApiResponse<Map<String, Object>>> getExpenseMatrix(
            @RequestParam(name = "employeeId", required = false) Integer employeeId,
            @RequestParam(name = "customerId", required = false) Integer customerId,
            @RequestParam(name = "month", required = false) Integer month,
            @RequestParam(name = "year", required = false) Integer year,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate) {

        Map<String, Object> report = reportService.getExpenseMatrixReport(
                employeeId, customerId, month, year, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(report));
    }
}
