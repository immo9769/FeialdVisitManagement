package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.OpportunityFollowUp;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OpportunityFollowUpRepository extends JpaRepository<OpportunityFollowUp, Integer> {
    List<OpportunityFollowUp> findByOpportunityIdOrderByFollowUpDateDesc(Integer opportunityId);
}
