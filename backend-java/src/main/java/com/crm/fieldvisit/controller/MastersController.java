package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.MastersSummaryResponse;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.service.MastersService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Master Data")
@RestController
@RequestMapping("/api/masters")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class MastersController {

    private final MastersService mastersService;

    @Operation(summary = "Get all master data lookup lists")
    @GetMapping("/summary")
    public ResponseEntity<ApiResponse<MastersSummaryResponse>> getSummary() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllMastersSummary()));
    }

    @Operation(summary = "List all branches")
    @GetMapping("/branches")
    public ResponseEntity<ApiResponse<List<Branch>>> getBranches() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllBranches()));
    }

    @Operation(summary = "Create new branch (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/branches")
    public ResponseEntity<ApiResponse<Branch>> createBranch(@RequestBody Branch branch) {
        return ResponseEntity.ok(ApiResponse.success(mastersService.createBranch(branch)));
    }

    @Operation(summary = "List all departments")
    @GetMapping("/departments")
    public ResponseEntity<ApiResponse<List<Department>>> getDepartments() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllDepartments()));
    }

    @Operation(summary = "List all designations")
    @GetMapping("/designations")
    public ResponseEntity<ApiResponse<List<Designation>>> getDesignations() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllDesignations()));
    }

    @Operation(summary = "List all machinery/products")
    @GetMapping("/products")
    public ResponseEntity<ApiResponse<List<Product>>> getProducts() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllProducts()));
    }

    @Operation(summary = "Create new product (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/products")
    public ResponseEntity<ApiResponse<Product>> createProduct(@RequestBody Product product) {
        return ResponseEntity.ok(ApiResponse.success(mastersService.createProduct(product)));
    }

    @Operation(summary = "List all visit activity types")
    @GetMapping("/activity-types")
    public ResponseEntity<ApiResponse<List<ActivityType>>> getActivityTypes() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllActivityTypes()));
    }

    @Operation(summary = "List all expense heads and default rates")
    @GetMapping("/expense-heads")
    public ResponseEntity<ApiResponse<List<ExpenseHead>>> getExpenseHeads() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllExpenseHeads()));
    }

    @Operation(summary = "Create new expense head (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/expense-heads")
    public ResponseEntity<ApiResponse<ExpenseHead>> createExpenseHead(@RequestBody ExpenseHead expenseHead) {
        return ResponseEntity.ok(ApiResponse.success(mastersService.createExpenseHead(expenseHead)));
    }

    @Operation(summary = "List all grade fuel rates")
    @GetMapping("/grade-fuel-rates")
    public ResponseEntity<ApiResponse<List<GradeFuelRate>>> getGradeFuelRates() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllGradeFuelRates()));
    }

    @Operation(summary = "List all industry segments")
    @GetMapping("/industries")
    public ResponseEntity<ApiResponse<List<Industry>>> getIndustries() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllIndustries()));
    }

    @Operation(summary = "List all OEM principals")
    @GetMapping("/principals")
    public ResponseEntity<ApiResponse<List<Principal>>> getPrincipals() {
        return ResponseEntity.ok(ApiResponse.success(mastersService.getAllPrincipals()));
    }

    @Operation(summary = "Create new master item by entity type")
    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/{type}")
    public ResponseEntity<ApiResponse<Object>> createMasterItem(@PathVariable("type") String type, @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.success(mastersService.createMasterItem(type, body)));
    }

    @Operation(summary = "Update master item by entity type and ID")
    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/{type}/{id}")
    public ResponseEntity<ApiResponse<Object>> updateMasterItem(
            @PathVariable("type") String type,
            @PathVariable("id") Integer id,
            @RequestBody Map<String, Object> body) {
        return ResponseEntity.ok(ApiResponse.success(mastersService.updateMasterItem(type, id, body)));
    }

    @Operation(summary = "Delete master item by entity type and ID")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{type}/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> deleteMasterItem(
            @PathVariable("type") String type,
            @PathVariable("id") Integer id) {
        mastersService.deleteMasterItem(type, id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }
}
