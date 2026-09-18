package com.crm.fieldvisit.security;

import com.crm.fieldvisit.entity.Employee;
import com.crm.fieldvisit.repository.EmployeeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class CustomUserDetailsService implements UserDetailsService {

    private final EmployeeRepository employeeRepository;

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        Employee employee = employeeRepository.findByEmailOrEmployeeNo(username)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email or employee number: " + username));
        return UserPrincipal.create(employee);
    }

    @Transactional(readOnly = true)
    public UserDetails loadUserById(Integer id) {
        Employee employee = employeeRepository.findById(id)
                .orElseThrow(() -> new UsernameNotFoundException("User not found with ID: " + id));
        return UserPrincipal.create(employee);
    }
}
