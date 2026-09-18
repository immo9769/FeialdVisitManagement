package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.ExpenseHead;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface ExpenseHeadRepository extends JpaRepository<ExpenseHead, Integer> {
    Optional<ExpenseHead> findByCode(String code);
}
