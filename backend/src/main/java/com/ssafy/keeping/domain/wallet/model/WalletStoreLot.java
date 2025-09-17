package com.ssafy.keeping.domain.wallet.model;

import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import com.ssafy.keeping.domain.wallet.constant.LotSourceType;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "wallet_store_lot")
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

    @Column(name = "amount_total", nullable = false)
    private long amountTotal;

    @Column(name = "amount_remaining", nullable = false)
    private long amountRemaining;

    @Column(name = "acquired_at", nullable = false)
    private LocalDateTime acquiredAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false, length = 20)
    private LotSourceType sourceType;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "contributor_wallet_id")
    private Wallet contributorWallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "origin_charge_tx_id", nullable = false)
    private Transaction originChargeTransaction;


    // 포인트 사용 메서드
    public void usePoints(BigDecimal amount) {
        if (this.amountRemaining.compareTo(amount) < 0) {
            throw new IllegalArgumentException("사용하려는 금액이 잔액보다 큽니다.");
        }
        this.amountRemaining = this.amountRemaining.subtract(amount);
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