package com.crm.fieldvisit.service;

import com.crm.fieldvisit.common.ResourceNotFoundException;
import com.crm.fieldvisit.dto.CreateContactRequest;
import com.crm.fieldvisit.dto.CreateCustomerRequest;
import com.crm.fieldvisit.entity.Contact;
import com.crm.fieldvisit.entity.Customer;
import com.crm.fieldvisit.repository.ContactRepository;
import com.crm.fieldvisit.repository.CustomerRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CustomerService {

    private final CustomerRepository customerRepository;
    private final ContactRepository contactRepository;

    @Transactional(readOnly = true)
    public List<Customer> findAll(String customerType, String search) {
        String cType = (customerType != null && !customerType.isBlank()) ? customerType : null;
        String s = (search != null && !search.isBlank()) ? search.trim() : null;
        return customerRepository.findAllWithFilters(cType, s);
    }

    @Transactional(readOnly = true)
    public Customer findOne(Integer id) {
        return customerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Customer not found with ID: " + id));
    }

    @Transactional
    public Customer create(CreateCustomerRequest request) {
        Customer customer = Customer.builder()
                .customerCode(request.getCustomerCode())
                .name(request.getName())
                .customerType(request.getCustomerType() != null ? request.getCustomerType() : "Prospect")
                .industry(request.getIndustry())
                .contactPersonPrimary(request.getContactPersonPrimary())
                .source(request.getSource())
                .website(request.getWebsite())
                .status(request.getStatus() != null ? request.getStatus() : "Active")
                .remarks(request.getRemarks())
                .address(request.getAddress())
                .city(request.getCity())
                .state(request.getState())
                .build();

        Customer saved = customerRepository.save(customer);

        if (request.getContacts() != null && !request.getContacts().isEmpty()) {
            for (CreateContactRequest cReq : request.getContacts()) {
                Contact c = Contact.builder()
                        .customerId(saved.getId())
                        .contactName(cReq.getContactName())
                        .designation(cReq.getDesignation())
                        .mobileNo(cReq.getMobileNo())
                        .email(cReq.getEmail())
                        .isPrimary(cReq.getIsPrimary() != null && cReq.getIsPrimary())
                        .build();
                contactRepository.save(c);
            }
        }

        return findOne(saved.getId());
    }

    @Transactional
    public Customer update(Integer id, CreateCustomerRequest request) {
        Customer cust = findOne(id);

        if (request.getCustomerCode() != null) cust.setCustomerCode(request.getCustomerCode());
        if (request.getName() != null) cust.setName(request.getName());
        if (request.getCustomerType() != null) cust.setCustomerType(request.getCustomerType());
        if (request.getIndustry() != null) cust.setIndustry(request.getIndustry());
        if (request.getContactPersonPrimary() != null) cust.setContactPersonPrimary(request.getContactPersonPrimary());
        if (request.getSource() != null) cust.setSource(request.getSource());
        if (request.getWebsite() != null) cust.setWebsite(request.getWebsite());
        if (request.getStatus() != null) cust.setStatus(request.getStatus());
        if (request.getRemarks() != null) cust.setRemarks(request.getRemarks());
        if (request.getAddress() != null) cust.setAddress(request.getAddress());
        if (request.getCity() != null) cust.setCity(request.getCity());
        if (request.getState() != null) cust.setState(request.getState());

        return customerRepository.save(cust);
    }

    @Transactional
    public boolean remove(Integer id) {
        Customer cust = findOne(id);
        customerRepository.delete(cust);
        return true;
    }

    // Contacts specific methods
    @Transactional(readOnly = true)
    public List<Contact> findAllContacts(Integer customerId) {
        if (customerId != null) {
            return contactRepository.findByCustomerId(customerId);
        }
        return contactRepository.findAll();
    }

    @Transactional
    public Contact createContact(CreateContactRequest request) {
        if (request.getCustomerId() == null) {
            throw new IllegalArgumentException("Customer ID is required to create a contact");
        }
        Contact c = Contact.builder()
                .customerId(request.getCustomerId())
                .contactName(request.getContactName())
                .designation(request.getDesignation())
                .mobileNo(request.getMobileNo())
                .email(request.getEmail())
                .isPrimary(request.getIsPrimary() != null && request.getIsPrimary())
                .build();
        return contactRepository.save(c);
    }

    @Transactional
    public Contact updateContact(Integer id, CreateContactRequest request) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + id));

        if (request.getContactName() != null) contact.setContactName(request.getContactName());
        if (request.getDesignation() != null) contact.setDesignation(request.getDesignation());
        if (request.getMobileNo() != null) contact.setMobileNo(request.getMobileNo());
        if (request.getEmail() != null) contact.setEmail(request.getEmail());
        if (request.getIsPrimary() != null) contact.setIsPrimary(request.getIsPrimary());

        return contactRepository.save(contact);
    }

    @Transactional
    public boolean removeContact(Integer id) {
        Contact contact = contactRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Contact not found with ID: " + id));
        contactRepository.delete(contact);
        return true;
    }
}
