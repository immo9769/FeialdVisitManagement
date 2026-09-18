package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Integer> {

    Optional<Customer> findByCustomerCode(String customerCode);

    @Query("SELECT c FROM Customer c WHERE " +
           "(:customerType IS NULL OR c.customerType = :customerType) AND " +
           "(:search IS NULL OR LOWER(c.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.customerCode) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(c.city) LIKE LOWER(CONCAT('%', :search, '%')))")
    List<Customer> findAllWithFilters(@Param("customerType") String customerType,
                                      @Param("search") String search);
}
