package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.OpportunityRequest;
import com.crm.fieldvisit.entity.Opportunity;
import com.crm.fieldvisit.entity.OpportunityFollowUp;
import com.crm.fieldvisit.service.OpportunityService;
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

@Tag(name = "CRM Opportunities")
@RestController
@RequestMapping("/api/crm/opportunities")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class OpportunityController {

    private final OpportunityService opportunityService;

    @Operation(summary = "List all opportunities with filters")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Opportunity>>> findAll(
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "customerId", required = false) Integer customerId,
            @RequestParam(name = "salespersonId", required = false) Integer salespersonId,
            @RequestParam(name = "principal", required = false) String principal,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(
                opportunityService.findAll(status, customerId, salespersonId, principal, search)));
    }

    @Operation(summary = "Get opportunity details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Opportunity>> findOne(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.findOne(id)));
    }

    @Operation(summary = "Create a new opportunity / lead")
    @PostMapping
    public ResponseEntity<ApiResponse<Opportunity>> create(
            @Valid @RequestBody OpportunityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(opportunityService.create(request, email)));
    }

    @Operation(summary = "Update opportunity details and products")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Opportunity>> update(
            @PathVariable("id") Integer id,
            @Valid @RequestBody OpportunityRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(opportunityService.update(id, request, email)));
    }

    @Operation(summary = "Get all follow-up interactions for an opportunity")
    @GetMapping("/{id}/follow-ups")
    public ResponseEntity<ApiResponse<List<OpportunityFollowUp>>> getFollowUps(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.getFollowUps(id)));
    }

    @Operation(summary = "Log a follow-up interaction for an opportunity")
    @PostMapping("/{id}/follow-ups")
    public ResponseEntity<ApiResponse<OpportunityFollowUp>> addFollowUp(
            @PathVariable("id") Integer id,
            @Valid @RequestBody OpportunityRequest.OpportunityFollowUpRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(opportunityService.addFollowUp(id, request, email)));
    }

    @Operation(summary = "Update a follow-up interaction")
    @PutMapping("/follow-ups/{followUpId}")
    public ResponseEntity<ApiResponse<OpportunityFollowUp>> updateFollowUp(
            @PathVariable("followUpId") Integer followUpId,
            @RequestBody OpportunityRequest.OpportunityFollowUpRequest request) {
        return ResponseEntity.ok(ApiResponse.success(opportunityService.updateFollowUp(followUpId, request)));
    }

    @Operation(summary = "Delete a follow-up record")
    @DeleteMapping("/follow-ups/{followUpId}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteFollowUp(@PathVariable("followUpId") Integer followUpId) {
        opportunityService.deleteFollowUp(followUpId);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }

    @Operation(summary = "Update competitor intelligence on the go")
    @PutMapping("/{id}/competitor")
    public ResponseEntity<ApiResponse<Opportunity>> updateCompetitor(
            @PathVariable("id") Integer id,
            @RequestBody OpportunityRequest.OpportunityCompetitorRequest request,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(opportunityService.updateCompetitor(id, request, email)));
    }

    @Operation(summary = "Clear competitor intelligence on the go")
    @DeleteMapping("/{id}/competitor")
    public ResponseEntity<ApiResponse<Opportunity>> clearCompetitor(
            @PathVariable("id") Integer id,
            @AuthenticationPrincipal UserDetails userDetails) {
        String email = userDetails != null ? userDetails.getUsername() : "SYSTEM";
        return ResponseEntity.ok(ApiResponse.success(opportunityService.clearCompetitor(id, email)));
    }

    @Operation(summary = "Delete / archive opportunity")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> remove(@PathVariable("id") Integer id) {
        opportunityService.remove(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }
}
