package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.OpportunityProduct;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityProductRepository extends JpaRepository<OpportunityProduct, Integer> {
    List<OpportunityProduct> findByOpportunityId(Integer opportunityId);
}
