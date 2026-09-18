package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.ApprovalActionRequest;
import com.crm.fieldvisit.dto.DailyVisitRequest;
import com.crm.fieldvisit.entity.DailyVisit;
import com.crm.fieldvisit.security.UserPrincipal;
import com.crm.fieldvisit.service.DailyVisitService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Daily Visits & Expenses")
@RestController
@RequestMapping("/api/daily-visits")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class DailyVisitController {

    private final DailyVisitService dailyVisitService;

    @Operation(summary = "List daily visits scoped by RBAC user role")
    @GetMapping
    public ResponseEntity<ApiResponse<List<DailyVisit>>> findAll(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestParam(name = "employeeId", required = false) Integer employeeId,
            @RequestParam(name = "branchId", required = false) Integer branchId,
            @RequestParam(name = "status", required = false) String status,
            @RequestParam(name = "startDate", required = false) String startDate,
            @RequestParam(name = "endDate", required = false) String endDate) {

        String userRole = currentUser != null ? currentUser.getRole() : "SERVICE_ENG";
        Integer targetEmployeeId = employeeId;
        Integer targetBranchId = branchId;

        if ("SERVICE_ENG".equalsIgnoreCase(userRole) || "SALES_EXEC".equalsIgnoreCase(userRole)) {
            targetEmployeeId = currentUser.getId();
        } else if ("MANAGER".equalsIgnoreCase(userRole) && currentUser.getBranchId() != null) {
            if (targetBranchId == null) {
                targetBranchId = currentUser.getBranchId();
            }
        }

        List<DailyVisit> list = dailyVisitService.findAll(targetEmployeeId, targetBranchId, status, startDate, endDate);
        return ResponseEntity.ok(ApiResponse.success(list));
    }

    @Operation(summary = "Get daily visit details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyVisit>> findOne(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.findOne(id)));
    }

    @Operation(summary = "Log new daily visit with 1-to-N expense items")
    @PostMapping
    public ResponseEntity<ApiResponse<DailyVisit>> create(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @Valid @RequestBody DailyVisitRequest request) {
        String email = currentUser != null ? currentUser.getEmail() : null;
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.create(request, email)));
    }

    @Operation(summary = "Update existing daily visit record & expenses")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<DailyVisit>> update(
            @PathVariable("id") Integer id,
            @RequestBody DailyVisitRequest request) {
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.update(id, request)));
    }

    @Operation(summary = "Delete daily visit record")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> delete(@PathVariable("id") Integer id) {
        dailyVisitService.delete(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }

    @Operation(summary = "Batch / Mass approve multiple expense claims at once")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/mass-approve")
    public ResponseEntity<ApiResponse<List<DailyVisit>>> massApprove(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @RequestBody Map<String, List<Integer>> body) {
        List<Integer> ids = body.get("ids");
        Integer approverId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.massApprove(ids, approverId)));
    }

    @Operation(summary = "Submit draft visit for Branch Manager approval")
    @PostMapping("/{id}/submit")
    public ResponseEntity<ApiResponse<DailyVisit>> submit(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.submit(id)));
    }

    @Operation(summary = "Approve daily visit claim (Branch Manager)")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/approve")
    public ResponseEntity<ApiResponse<DailyVisit>> approve(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") Integer id) {
        Integer approverId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.approve(id, approverId)));
    }

    @Operation(summary = "Reject daily visit claim with remarks (Branch Manager)")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping("/{id}/reject")
    public ResponseEntity<ApiResponse<DailyVisit>> reject(
            @AuthenticationPrincipal UserPrincipal currentUser,
            @PathVariable("id") Integer id,
            @RequestBody ApprovalActionRequest request) {
        Integer approverId = currentUser != null ? currentUser.getId() : null;
        return ResponseEntity.ok(ApiResponse.success(dailyVisitService.reject(id, approverId, request)));
    }
}
