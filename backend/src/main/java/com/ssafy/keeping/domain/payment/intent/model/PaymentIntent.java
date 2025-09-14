package com.ssafy.keeping.domain.payment.intent.model;

import com.ssafy.keeping.domain.payment.intent.constant.PaymentStatus;
import com.ssafy.keeping.domain.payment.qr.model.QrToken;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(
    name = "payment_intent",
    uniqueConstraints = {
            @UniqueConstraint(name = "uk_intent_qr_token", columnNames = {"qr_token_id"}),
            @UniqueConstraint(name = "uk_intent_public_id", columnNames = {"public_id"})
    },
    indexes = {
            @Index(name = "idx_status_expires", columnList = "status,expires_at"),
            @Index(name = "idx_store_status", columnList = "store_id,status")
    }
)
public class PaymentIntent {
    // 낙관적 락 : 동시성 안전성(concurrency control)
    // 동시에 두 명이 다른 처리를 시도할 때, 오직 한 명만 성공하게 보장하는 것.
    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long intentId;

    @Column(name = "public_id", nullable = false, unique = true, columnDefinition = "BINARY(16)")
    private UUID publicId;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(
            name = "qr_token_id", nullable = false,
            foreignKey = @ForeignKey(name = "fk_intent_qr"),
            columnDefinition = "BINARY(16)"
    )
    private QrToken qrToken;

    @Column(name = "customer_id", nullable = false)
    private Long customerId;

    @Column(name = "store_id", nullable = false)
    private Long storeId;

    @Column(nullable = false)
    private long amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 16)
    private PaymentStatus status;

    @Column(name = "created_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime updatedAt;

    @Column(name = "expires_at", nullable = false, columnDefinition = "DATETIME(3)")
    private LocalDateTime expiresAt;

    @Column(name = "approved_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime approvedAt;

    @Column(name = "declined_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime declinedAt;

    @Column(name = "canceled_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime canceledAt;

    @Column(name = "completed_at", columnDefinition = "DATETIME(3)")
    private LocalDateTime completedAt;

    @Column(name = "idempotency_key", length = 64, unique = true)
    private String idempotencyKey;

    @PrePersist
    public void onCreate() {
        if (publicId == null) publicId = UUID.randomUUID();
        if (status == null) status = PaymentStatus.PENDING;
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = createdAt;
    }

    @PreUpdate
    public void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}