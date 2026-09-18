package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.VisitCustomer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitCustomerRepository extends JpaRepository<VisitCustomer, Integer> {
    List<VisitCustomer> findByVisitId(Integer visitId);
    void deleteByVisitId(Integer visitId);
}
