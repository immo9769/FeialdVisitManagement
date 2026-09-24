package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Quotation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface QuotationRepository extends JpaRepository<Quotation, Integer> {

    List<Quotation> findByQuoteNoOrderByRevisionNoAsc(String quoteNo);

    List<Quotation> findByOpportunityIdOrderByRevisionNoDesc(Integer opportunityId);

    Optional<Quotation> findByQuoteNoAndRevisionNo(String quoteNo, Integer revisionNo);

    @Query("SELECT q FROM Quotation q WHERE " +
           "(:opportunityId IS NULL OR q.opportunityId = :opportunityId) AND " +
           "(:customerId IS NULL OR q.customerId = :customerId) AND " +
           "(:status IS NULL OR q.status = :status) AND " +
           "(:search IS NULL OR LOWER(q.quoteNo) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(q.customer.name) LIKE LOWER(CONCAT('%', :search, '%')) " +
           " OR LOWER(q.versionLabel) LIKE LOWER(CONCAT('%', :search, '%'))) " +
           "ORDER BY q.createdAt DESC")
    List<Quotation> findAllWithFilters(@Param("opportunityId") Integer opportunityId,
                                      @Param("customerId") Integer customerId,
                                      @Param("status") String status,
                                      @Param("search") String search);
}
