package com.ssafy.keeping.domain.favorite.model;

import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.store.model.Store;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(
        name = "store_favorites",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_customer_store_favorite",
                columnNames = {"customer_id", "store_id"}
        ),
        indexes = {
                @Index(name = "idx_favorite_customer", columnList = "customer_id"),
                @Index(name = "idx_favorite_store", columnList = "store_id"),
                @Index(name = "idx_favorite_canceled", columnList = "canceled_at")
        }
)
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class StoreFavorite {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "favorite_id")
    private Long favoriteId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "customer_id", nullable = false)
    private Customer customer;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "store_id", nullable = false)
    private Store store;

    @Column(name = "favorite_number", nullable = false)
    private String favoriteNumber;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @Column(name = "canceled_at")
    private LocalDateTime canceledAt;

    public boolean isActive() {
        return this.canceledAt == null;
    }

    public void cancel() {
        this.canceledAt = LocalDateTime.now();
    }

    public void reactivate() {
        this.canceledAt = null;
    }
}