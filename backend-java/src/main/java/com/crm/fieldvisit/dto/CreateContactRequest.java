package com.crm.fieldvisit.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CreateContactRequest {

    private Integer customerId;

    @NotBlank(message = "Contact name is required")
    private String contactName;

    private String designation;
    private String mobileNo;
    private String email;

    @Builder.Default
    private Boolean isPrimary = false;
}
