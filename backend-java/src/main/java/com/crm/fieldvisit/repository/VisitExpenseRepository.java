package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.VisitExpense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface VisitExpenseRepository extends JpaRepository<VisitExpense, Integer> {
    List<VisitExpense> findByVisitId(Integer visitId);
    void deleteByVisitId(Integer visitId);
}
