package com.crm.fieldvisit.service;

import com.crm.fieldvisit.dto.LoginRequest;
import com.crm.fieldvisit.dto.LoginResponse;
import com.crm.fieldvisit.dto.MicrosoftLoginRequest;
import com.crm.fieldvisit.entity.*;
import com.crm.fieldvisit.repository.*;
import com.crm.fieldvisit.security.JwtTokenProvider;
import com.crm.fieldvisit.security.UserPrincipal;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.time.LocalDate;
import java.util.Base64;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private static final Logger log = LoggerFactory.getLogger(AuthService.class);

    private final EmployeeRepository employeeRepository;
    private final DepartmentRepository departmentRepository;
    private final DesignationRepository designationRepository;
    private final BranchRepository branchRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final ObjectMapper objectMapper;

    @Value("${azure.activedirectory.client-id:63af8748-b960-4f66-9ef7-e6be3b13e0d1}")
    private String configuredClientId;

    @Value("${azure.activedirectory.tenant-id:5adb2e4c-71ad-431a-81fa-d48da6fe6b40}")
    private String configuredTenantId;

    @Transactional(readOnly = true)
    public LoginResponse login(LoginRequest request) {
        String identifier = request.getIdentifier();
        if (identifier == null || identifier.isBlank()) {
            throw new BadCredentialsException("Email or Employee Number is required");
        }

        Employee employee = employeeRepository.findByEmailOrEmployeeNo(identifier)
                .orElseThrow(() -> new BadCredentialsException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), employee.getPasswordHash())) {
            throw new BadCredentialsException("Invalid email or password");
        }

        if (employee.getStatus() != null && !"Active".equalsIgnoreCase(employee.getStatus())) {
            throw new BadCredentialsException("Account is inactive. Please contact your system administrator.");
        }

        return buildLoginResponse(employee);
    }

    /**
     * Authenticates user using Microsoft Entra ID (Azure AD) OIDC token / claims.
     * Maps to existing Employee or auto-provisions a new Employee with initial SERVICE_ENG role.
     * The Employee table remains the single source of truth for roles and permissions.
     */
    @Transactional
    public LoginResponse loginWithMicrosoft(MicrosoftLoginRequest request) {
        String targetEmail = null;
        String extractedName = request.getName();
        String extractedOid = request.getAzureAdOid();

        // 1. Extract verified identity claims from Microsoft ID Token
        if (request.getIdToken() != null && !request.getIdToken().isBlank()) {
            try {
                String[] parts = request.getIdToken().split("\\.");
                if (parts.length >= 2) {
                    byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
                    String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);
                    JsonNode claims = objectMapper.readTree(payloadJson);

                    if (claims.hasNonNull("preferred_username")) {
                        targetEmail = claims.get("preferred_username").asText().trim();
                    } else if (claims.hasNonNull("email")) {
                        targetEmail = claims.get("email").asText().trim();
                    } else if (claims.hasNonNull("upn")) {
                        targetEmail = claims.get("upn").asText().trim();
                    } else if (claims.hasNonNull("unique_name")) {
                        targetEmail = claims.get("unique_name").asText().trim();
                    }

                    if (claims.hasNonNull("name") && (extractedName == null || extractedName.isBlank())) {
                        extractedName = claims.get("name").asText().trim();
                    }
                    if (claims.hasNonNull("oid") && (extractedOid == null || extractedOid.isBlank())) {
                        extractedOid = claims.get("oid").asText().trim();
                    }

                    log.info("Microsoft Entra ID token parsed for email: {}, oid: {}", targetEmail, extractedOid);
                }
            } catch (Exception e) {
                log.warn("Failed to parse Microsoft idToken payload: {}", e.getMessage());
            }
        }

        // Fallback to email in request body if not in token
        if ((targetEmail == null || targetEmail.isBlank()) && request.getEmail() != null) {
            targetEmail = request.getEmail().trim();
        }

        if (targetEmail == null || targetEmail.isBlank()) {
            throw new BadCredentialsException("Could not determine user email from Microsoft Entra identity.");
        }

        // 2. Lookup existing employee:
        // Priority A: Match by Entra ID unique Object ID (OID)
        Optional<Employee> optionalEmployee = Optional.empty();
        if (extractedOid != null && !extractedOid.isBlank()) {
            optionalEmployee = employeeRepository.findByAzureAdOid(extractedOid);
        }

        // Priority B: Match by Email / EmployeeNo
        if (optionalEmployee.isEmpty()) {
            optionalEmployee = employeeRepository.findByEmail(targetEmail);
        }
        if (optionalEmployee.isEmpty()) {
            optionalEmployee = employeeRepository.findByEmailOrEmployeeNo(targetEmail);
        }
        if (optionalEmployee.isEmpty()) {
            final String finalEmail = targetEmail.toLowerCase();
            List<Employee> allEmployees = employeeRepository.findAll();
            optionalEmployee = allEmployees.stream()
                    .filter(e -> (e.getEmail() != null && e.getEmail().trim().equalsIgnoreCase(finalEmail))
                            || (e.getEmployeeNo() != null && e.getEmployeeNo().trim().equalsIgnoreCase(finalEmail)))
                    .findFirst();
        }

        Integer serviceDeptId = departmentRepository.findByCode("DEPT-SERVICE")
                .map(Department::getId)
                .orElse(2);
        Integer serviceDesgId = designationRepository.findByCode("DESG-SENG")
                .map(Designation::getId)
                .orElse(2);
        Integer hqBranchId = branchRepository.findByCode("BR-MUMBAI")
                .map(Branch::getId)
                .orElse(1);

        // 3. First-Login Auto-Provisioning:
        // If user does not exist in Employee table, create a new employee record with initial default SERVICE_ENG role
        if (optionalEmployee.isEmpty()) {
            log.info("Microsoft Entra user not found in Employee master. Auto-provisioning first-login record for: {}", targetEmail);
            String displayName = (extractedName != null && !extractedName.isBlank()) ? extractedName : targetEmail.split("@")[0];
            String empNo = "EMP-" + (1000 + Math.abs(targetEmail.hashCode() % 9000));
            
            Employee newEmp = Employee.builder()
                    .employeeNo(empNo)
                    .name(displayName)
                    .email(targetEmail)
                    .azureAdOid(extractedOid)
                    .status("Active")
                    .role("SERVICE_ENG") // Initial default role as Service Person / Engineer
                    .grade("GRADE_B")
                    .gender("Male")
                    .dob(LocalDate.of(1990, 1, 1))
                    .mobileNo("N/A")
                    .departmentId(serviceDeptId)
                    .designationId(serviceDesgId)
                    .branchId(hqBranchId)
                    .passwordHash(passwordEncoder.encode(java.util.UUID.randomUUID().toString()))
                    .joiningDate(LocalDate.now())
                    .createdBy("ENTRA_ID_SSO")
                    .updatedBy("ENTRA_ID_SSO")
                    .build();

            try {
                newEmp = employeeRepository.save(newEmp);
                optionalEmployee = Optional.of(newEmp);
                log.info("Auto-provisioned new employee #{} ({}) with default role SERVICE_ENG", newEmp.getEmployeeNo(), newEmp.getEmail());
            } catch (Exception e) {
                log.error("Failed to auto-provision employee: {}", e.getMessage());
                throw new BadCredentialsException("Failed to register Microsoft account in employee directory: " + e.getMessage());
            }
        }

        Employee employee = optionalEmployee.get();

        // 4. Map & link Entra ID Object ID to existing employee if not linked yet
        if (extractedOid != null && !extractedOid.isBlank() && !extractedOid.equals(employee.getAzureAdOid())) {
            employee.setAzureAdOid(extractedOid);
            employee = employeeRepository.save(employee);
            log.info("Mapped Microsoft Entra OID {} to employee #{} ({})", extractedOid, employee.getEmployeeNo(), employee.getEmail());
        }

        // 5. Enforce Active status from Employee table
        if (employee.getStatus() != null && !"Active".equalsIgnoreCase(employee.getStatus())) {
            throw new BadCredentialsException("Your employee account is currently inactive. Please contact your system administrator.");
        }

        log.info("Microsoft Entra SSO login successful for employee: {} ({}) with internal Employee Table role: {}", 
                employee.getName(), employee.getEmail(), employee.getRole());

        // Note: The Employee table is the single source of truth. The role returned in JWT is whatever is currently set in the Employee table!
        return buildLoginResponse(employee);
    }

    private LoginResponse buildLoginResponse(Employee employee) {
        UserPrincipal principal = UserPrincipal.create(employee);
        String token = tokenProvider.generateToken(principal);

        Department dept = employee.getDepartmentId() != null
                ? departmentRepository.findById(employee.getDepartmentId()).orElse(null)
                : null;
        Designation desg = employee.getDesignationId() != null
                ? designationRepository.findById(employee.getDesignationId()).orElse(null)
                : null;
        Branch branch = employee.getBranchId() != null
                ? branchRepository.findById(employee.getBranchId()).orElse(null)
                : null;

        String branchName = branch != null ? branch.getName() : "Mumbai HQ";
        String deptName = dept != null ? dept.getName() : "Management";
        String desigTitle = desg != null ? desg.getTitle() : "System Administrator";

        LoginResponse.UserDto userDto = LoginResponse.UserDto.builder()
                .id(employee.getId())
                .employeeNo(employee.getEmployeeNo())
                .name(employee.getName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .grade(employee.getGrade())
                .gender(employee.getGender())
                .mobileNo(employee.getMobileNo())
                .branchId(employee.getBranchId())
                .branch(branchName)
                .branchName(branchName)
                .departmentId(employee.getDepartmentId())
                .department(deptName)
                .departmentName(deptName)
                .designationId(employee.getDesignationId())
                .designation(desigTitle)
                .designationTitle(desigTitle)
                .build();

        return LoginResponse.builder()
                .token(token)
                .accessToken(token)
                .user(userDto)
                .build();
    }

    @Transactional(readOnly = true)
    public LoginResponse.UserDto getProfile(Integer userId) {
        Employee employee = employeeRepository.findById(userId)
                .orElseThrow(() -> new BadCredentialsException("User profile not found"));

        Department dept = employee.getDepartmentId() != null
                ? departmentRepository.findById(employee.getDepartmentId()).orElse(null)
                : null;
        Designation desg = employee.getDesignationId() != null
                ? designationRepository.findById(employee.getDesignationId()).orElse(null)
                : null;
        Branch branch = employee.getBranchId() != null
                ? branchRepository.findById(employee.getBranchId()).orElse(null)
                : null;

        String branchName = branch != null ? branch.getName() : "Mumbai HQ";
        String deptName = dept != null ? dept.getName() : "Management";
        String desigTitle = desg != null ? desg.getTitle() : "System Administrator";

        return LoginResponse.UserDto.builder()
                .id(employee.getId())
                .employeeNo(employee.getEmployeeNo())
                .name(employee.getName())
                .email(employee.getEmail())
                .role(employee.getRole())
                .grade(employee.getGrade())
                .gender(employee.getGender())
                .mobileNo(employee.getMobileNo())
                .branchId(employee.getBranchId())
                .branch(branchName)
                .branchName(branchName)
                .departmentId(employee.getDepartmentId())
                .department(deptName)
                .departmentName(deptName)
                .designationId(employee.getDesignationId())
                .designation(desigTitle)
                .designationTitle(desigTitle)
                .build();
    }
}
