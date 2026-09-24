package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Opportunity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OpportunityRepository extends JpaRepository<Opportunity, Integer> {

    Optional<Opportunity> findByOpportunityNo(String opportunityNo);

    @Query("SELECT o FROM Opportunity o WHERE " +
           "(:status IS NULL OR o.status = :status) AND " +
           "(:customerId IS NULL OR o.customerId = :customerId) AND " +
           "(:salespersonId IS NULL OR o.salespersonId = :salespersonId) AND " +
           "(:principal IS NULL OR LOWER(o.principal) = LOWER(:principal)) AND " +
           "(:search IS NULL OR LOWER(o.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(o.opportunityNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(o.customer.name) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY o.createdAt DESC")
    List<Opportunity> findAllWithFilters(@Param("status") String status,
                                         @Param("customerId") Integer customerId,
                                         @Param("salespersonId") Integer salespersonId,
                                         @Param("principal") String principal,
                                         @Param("search") String search);
}
