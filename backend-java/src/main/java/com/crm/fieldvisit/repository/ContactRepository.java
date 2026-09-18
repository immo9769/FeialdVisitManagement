package com.crm.fieldvisit.repository;

import com.crm.fieldvisit.entity.Contact;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ContactRepository extends JpaRepository<Contact, Integer> {
    List<Contact> findByCustomerId(Integer customerId);
}
