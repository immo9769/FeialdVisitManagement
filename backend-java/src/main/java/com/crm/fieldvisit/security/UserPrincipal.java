package com.crm.fieldvisit.security;

import com.crm.fieldvisit.entity.Employee;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.Collections;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String employeeNo;
    private final String email;
    private final String name;
    private final String password;
    private final String role;
    private final Integer branchId;
    private final Integer departmentId;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(Employee employee) {
        GrantedAuthority authority = new SimpleGrantedAuthority("ROLE_" + employee.getRole());
        return new UserPrincipal(
                employee.getId(),
                employee.getEmployeeNo(),
                employee.getEmail(),
                employee.getName(),
                employee.getPasswordHash(),
                employee.getRole(),
                employee.getBranchId(),
                employee.getDepartmentId(),
                Collections.singletonList(authority)
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return true;
    }
}
