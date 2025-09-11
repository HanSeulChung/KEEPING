package com.ssafy.keeping.domain.charge.repository;

import com.ssafy.keeping.domain.charge.entity.Store;
import com.ssafy.keeping.domain.charge.entity.Wallet;
import com.ssafy.keeping.domain.charge.entity.WalletStoreLot;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface WalletStoreLotRepository extends JpaRepository<WalletStoreLot, Long> {
}