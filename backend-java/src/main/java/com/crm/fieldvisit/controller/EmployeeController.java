package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.CreateEmployeeRequest;
import com.crm.fieldvisit.entity.Employee;
import com.crm.fieldvisit.service.EmployeeService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Employees")
@RestController
@RequestMapping("/api/employees")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @Operation(summary = "List all employees with optional branch/dept filters")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Employee>>> findAll(
            @RequestParam(name = "branchId", required = false) Integer branchId,
            @RequestParam(name = "departmentId", required = false) Integer departmentId,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.findAll(branchId, departmentId, search)));
    }

    @Operation(summary = "Get employee details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> findOne(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.findOne(id)));
    }

    @Operation(summary = "Create new employee profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PostMapping
    public ResponseEntity<ApiResponse<Employee>> create(@Valid @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.create(request)));
    }

    @Operation(summary = "Update employee profile")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Employee>> update(
            @PathVariable("id") Integer id,
            @RequestBody CreateEmployeeRequest request) {
        return ResponseEntity.ok(ApiResponse.success(employeeService.update(id, request)));
    }

    @Operation(summary = "Delete employee (Admin)")
    @PreAuthorize("hasRole('ADMIN')")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> remove(@PathVariable("id") Integer id) {
        employeeService.remove(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }
}
