package com.ssafy.keeping.domain.core.customer.repository;

import com.ssafy.keeping.domain.core.customer.model.Customer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

}