package com.crm.fieldvisit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateCustomerRequest {

    @NotBlank(message = "Customer code is required")
    private String customerCode;

    @NotBlank(message = "Customer name is required")
    private String name;

    @Builder.Default
    private String customerType = "Prospect";

    @NotBlank(message = "Industry is required")
    private String industry;

    private String contactPersonPrimary;
    private String source;
    private String website;

    @Builder.Default
    private String status = "Active";

    private String remarks;
    private String address;
    private String city;
    private String state;

    private List<CreateContactRequest> contacts;
}
