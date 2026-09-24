package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.QuotationItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface QuotationItemRepository extends JpaRepository<QuotationItem, Integer> {
    List<QuotationItem> findByQuotationId(Integer quotationId);
}
