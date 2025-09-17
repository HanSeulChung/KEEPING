package com.ssafy.keeping.domain.core.wallet.model;

import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name="wallet_store_lot",
        indexes = {
                @Index(name="idx_lot_wallet_store", columnList="wallet_id,store_id"),
                @Index(name="idx_lot_origin_tx", columnList="origin_charge_tx_id")
        }
)

@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalletStoreLot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "lot_id")
    private Long lotId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "amount_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountTotal;

    @Column(name = "amount_remaining", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountRemaining;

    @Column(name = "acquired_at", nullable = false)
    private LocalDateTime acquiredAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private SourceType sourceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contributor_wallet_id")
    private Wallet contributorWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_charge_tx_id", nullable = false)
    private Transaction originChargeTransaction;

    public enum SourceType {
        CHARGE,    // 직접 충전
        TRANSFER_IN,     // 다른 지갑에서 공유받음
        CANCELED   // 취소됨
    }

    // 포인트 사용 메서드
    public void usePoints(BigDecimal amount) {
        if (this.amountRemaining.compareTo(amount) < 0) {
            throw new IllegalArgumentException("사용하려는 금액이 잔액보다 큽니다.");
        }
        this.amountRemaining = this.amountRemaining.subtract(amount);
    }

    public void sharePoints(BigDecimal amount) {
        this.amountRemaining = this.amountRemaining.add(amount);
        this.amountTotal = this.amountTotal.add(amount);
    }

    // 만료 여부 확인
    public boolean isExpired() {
        return LocalDateTime.now().isAfter(this.expiredAt);
    }

    // 사용 완료 여부 확인
    public boolean isFullyUsed() {
        return this.amountRemaining.compareTo(BigDecimal.ZERO) == 0;
    }

    // 취소 처리 (소스 타입을 CANCELED로 변경)
    public void markAsCanceled() {
        this.sourceType = SourceType.CANCELED;
    }
}