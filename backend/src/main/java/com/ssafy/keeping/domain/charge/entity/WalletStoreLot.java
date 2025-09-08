package com.ssafy.keeping.domain.charge.entity;

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

    @Column(name = "wallet_id", nullable = false)
    private Long walletId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "amount_total", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountTotal;

    @Column(name = "amount_remaining", nullable = false, precision = 18, scale = 2)
    private BigDecimal amountRemaining;

    @Column(name = "acquierd_at", nullable = false)
    private LocalDateTime acquiredAt;

    @Column(name = "expired_at", nullable = false)
    private LocalDateTime expiredAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "source_type", nullable = false)
    private SourceType sourceType;

    @Column(name = "contributor_wallet_id")
    private Long contributorWalletId;

    @Column(name = "origin_charge_tx_id", nullable = false)
    private Long originChargeTxId;

    public enum SourceType {
        CHARGE,    // 직접 충전
        TRANSFER_IN     // 다른 지갑에서 공유받음
    }

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
}