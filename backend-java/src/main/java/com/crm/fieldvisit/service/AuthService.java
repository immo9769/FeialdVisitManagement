package com.crm.fieldvisit.service;

import com.crm.fieldvisit.dto.LoginRequest;
import com.crm.fieldvisit.dto.LoginResponse;
import com.crm.fieldvisit.entity.Employee;
import com.crm.fieldvisit.repository.EmployeeRepository;
import com.crm.fieldvisit.security.JwtTokenProvider;
import com.crm.fieldvisit.security.UserPrincipal;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;

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

        UserPrincipal principal = UserPrincipal.create(employee);
        String token = tokenProvider.generateToken(principal);

        String branchName = employee.getBranch() != null ? employee.getBranch().getName() : null;
        String deptName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;
        String desigTitle = employee.getDesignation() != null ? employee.getDesignation().getTitle() : null;

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

        String branchName = employee.getBranch() != null ? employee.getBranch().getName() : null;
        String deptName = employee.getDepartment() != null ? employee.getDepartment().getName() : null;
        String desigTitle = employee.getDesignation() != null ? employee.getDesignation().getTitle() : null;

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
