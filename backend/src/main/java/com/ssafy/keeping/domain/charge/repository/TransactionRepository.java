package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Customer;
import com.ssafy.keeping.domain.charge.entity.Store;
import com.ssafy.keeping.domain.charge.entity.Transaction;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
}