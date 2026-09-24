package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.QuotationRequest;
import com.crm.fieldvisit.entity.Quotation;
import com.crm.fieldvisit.service.QuotationService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "CRM Quotations")
@RestController
@RequestMapping("/api/crm/quotations")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class QuotationController {

    private final QuotationService quotationService;

    @Operation(summary = "List all quotations with filters")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Quotation>>> findAll(
            @RequestParam(name = "opportunityId", required = false) Integer opportunityId,
            @RequestParam(name = "customerId", required = false) Integer customerId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(
                quotationService.findAll(opportunityId, customerId, status, search)));
    }

    @Operation(summary = "Get quotation details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Quotation>> findOne(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.findOne(id)));
    }

    @Operation(summary = "Get revision history for a quotation number")
    @GetMapping("/history/{quoteNo}")
    public ResponseEntity<ApiResponse<List<Quotation>>> findHistory(@PathVariable("quoteNo") String quoteNo) {
        return ResponseEntity.ok(ApiResponse.success(quotationService.findHistoryByQuoteNo(quoteNo)));
    }

    @Operation(summary = "Create initial quotation (Rev 0)")
    @PostMapping
    public ResponseEntity<ApiResponse<Quotation>> create(
            @Valid @RequestBody QuotationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(quotationService.create(request, email)));
    }

    @Operation(summary = "Create a new revision from an existing quotation")
    @PostMapping("/{id}/revise")
    public ResponseEntity<ApiResponse<Quotation>> createRevision(
            @PathVariable("id") Integer id,
            @RequestBody QuotationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(quotationService.createRevision(id, request, email)));
    }

    @Operation(summary = "Update quotation in Draft state")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Quotation>> update(
            @PathVariable("id") Integer id,
            @Valid @RequestBody QuotationRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(quotationService.update(id, request, email)));
    }

    @Operation(summary = "Update quotation status (SENT, ACCEPTED, REJECTED)")
    @PatchMapping("/{id}/status")
    public ResponseEntity<ApiResponse<Quotation>> updateStatus(
            @PathVariable("id") Integer id,
            @RequestBody Map<String, String> statusBody) {
        String status = statusBody.get("status");
        return ResponseEntity.ok(ApiResponse.success(quotationService.updateStatus(id, status)));
    }

    @Operation(summary = "Delete quotation record")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> remove(@PathVariable("id") Integer id) {
        quotationService.remove(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }
}
