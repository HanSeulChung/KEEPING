package com.ssafy.keeping.domain.charge.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "stores")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
@Builder
public class Store {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "store_id")
    private Long storeId;

    @Column(name = "owner_id", nullable = false)
    private Long ownerId;

    @Column(name = "tax_id_number", nullable = false, length = 50)
    private String taxIdNumber;

    @Column(name = "address", nullable = false, length = 100)
    private String address;

    @Column(name = "store_name", nullable = false, length = 100)
    private String storeName;

    @Column(name = "phone_number", length = 100)
    private String phoneNumber;

    @Column(name = "business_sector", nullable = false, length = 100)
    private String businessSector;

    @Column(name = "business_type", nullable = false, length = 100)
    private String businessType;

    @Column(name = "merchant_id", nullable = false)
    private Long merchantId;

    @Column(name = "img_url", length = 200)
    private String imgUrl;

    @Column(name = "category", nullable = false, length = 50)
    private String category;

    @Column(name = "bank_account", nullable = false, length = 100)
    private String bankAccount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}