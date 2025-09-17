package com.ssafy.keeping.domain.wallet.model;

import com.ssafy.keeping.domain.store.model.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Entity
@Table(
        name = "wallet_store_balances",
        uniqueConstraints = @UniqueConstraint(
                name = "uq_wallet_store",
                columnNames = {"wallet_id", "store_id"}
        )
)
public class WalletStoreBalance {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "balance_id")
    private Long balanceId;

    @JoinColumn(name = "wallet_id", nullable = false)
    private Long walletId;

    @JoinColumn(name = "store_id", nullable = false)
    private Long storeId;

    @Column(name = "balance", nullable = false)
    private Long balance;

    @Column(name = "updated_at", nullable = false, insertable = false, updatable = false)
    private LocalDateTime updatedAt;

    public void addBalance(long amount) {
        this.balance = this.balance + amount;
    }

    public void subtractBalance(long amount) {
        if (this.balance < amount) {
            throw new IllegalArgumentException("잔액 부족: " + this.balance + " < " + amount);
        }
        this.balance = this.balance - amount;
    }
}