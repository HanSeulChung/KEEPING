package com.ssafy.keeping.domain.core.wallet.model;

import com.ssafy.keeping.domain.store.model.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(
        name = "wallet_store_balance",
        uniqueConstraints = @UniqueConstraint(name = "uk_wallet_store", columnNames = {"wallet_id","store_id"}),
        indexes = {@Index(name="idx_wsb_wallet", columnList="wallet_id"),
                @Index(name="idx_wsb_store",  columnList="store_id")}
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class WalletStoreBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "balance_id")
    private Long balanceId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "wallet_id", nullable = false)
    private Wallet wallet;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "balance", nullable = false, precision = 18, scale = 2)
    private BigDecimal balance;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // 잔액 업데이트 메서드
    public void addBalance(BigDecimal amount) {
        this.balance = this.balance.add(amount);
    }

    public void subtractBalance(BigDecimal amount) {
        this.balance = this.balance.subtract(amount);
    }
}