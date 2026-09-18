package com.crm.fieldvisit.controller;

import com.crm.fieldvisit.common.ApiResponse;
import com.crm.fieldvisit.dto.CreateContactRequest;
import com.crm.fieldvisit.dto.CreateCustomerRequest;
import com.crm.fieldvisit.entity.Contact;
import com.crm.fieldvisit.entity.Customer;
import com.crm.fieldvisit.service.CustomerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@Tag(name = "Customers & Contacts")
@RestController
@RequestMapping("/api/customers")
@SecurityRequirement(name = "bearerAuth")
@RequiredArgsConstructor
public class CustomerController {

    private final CustomerService customerService;

    @Operation(summary = "List all customers (Filtered by Type & Search)")
    @GetMapping
    public ResponseEntity<ApiResponse<List<Customer>>> findAll(
            @RequestParam(name = "customerType", required = false) String customerType,
            @RequestParam(name = "search", required = false) String search) {
        return ResponseEntity.ok(ApiResponse.success(customerService.findAll(customerType, search)));
    }

    // --- Contacts Endpoints ---
    @Operation(summary = "List all customer contacts")
    @GetMapping("/contacts/all")
    public ResponseEntity<ApiResponse<List<Contact>>> findAllContacts(
            @RequestParam(name = "customerId", required = false) Integer customerId) {
        return ResponseEntity.ok(ApiResponse.success(customerService.findAllContacts(customerId)));
    }

    @Operation(summary = "Create new customer contact person")
    @PostMapping("/contacts")
    public ResponseEntity<ApiResponse<Contact>> createContact(@Valid @RequestBody CreateContactRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.createContact(request)));
    }

    @Operation(summary = "Update customer contact person")
    @PutMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<Contact>> updateContact(
            @PathVariable("id") Integer id,
            @RequestBody CreateContactRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.updateContact(id, request)));
    }

    @Operation(summary = "Delete contact person")
    @DeleteMapping("/contacts/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> removeContact(@PathVariable("id") Integer id) {
        customerService.removeContact(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }

    // --- Customer Detail Endpoints ---
    @Operation(summary = "Create new customer / prospect")
    @PostMapping
    public ResponseEntity<ApiResponse<Customer>> create(@Valid @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.create(request)));
    }

    @Operation(summary = "Get customer details by ID")
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> findOne(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.findOne(id)));
    }

    @Operation(summary = "Update customer details")
    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<Customer>> update(
            @PathVariable("id") Integer id,
            @RequestBody CreateCustomerRequest request) {
        return ResponseEntity.ok(ApiResponse.success(customerService.update(id, request)));
    }

    @Operation(summary = "Delete customer record")
    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Map<String, Boolean>>> remove(@PathVariable("id") Integer id) {
        customerService.remove(id);
        return ResponseEntity.ok(ApiResponse.success(Map.of("deleted", true)));
    }

    @Operation(summary = "Get contacts for a specific customer")
    @GetMapping("/{id}/contacts")
    public ResponseEntity<ApiResponse<List<Contact>>> findContactsForCustomer(@PathVariable("id") Integer id) {
        return ResponseEntity.ok(ApiResponse.success(customerService.findAllContacts(id)));
    }
}
