package com.ssafy.keeping.domain.customer.model;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.SQLDelete;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "customers")
@SQLDelete(sql = "UPDATE customers SET deleted_at = NOW() WHERE customer_id = ?")   // soft-delete
@EntityListeners(AuditingEntityListener.class)
public class Customer {

    @Id
    @GeneratedValue(strategy =  GenerationType.IDENTITY)
    private Long customerId;

    @Column(name = "provider_id", nullable = false, length = 100)
    private String providerId;

    @Enumerated(EnumType.STRING)
    @Column(name = "provider_type", nullable = false, length = 20)
    private ProviderType providerType;

    @Column(nullable = false, length = 250)
    private String email;

    @Column(name = "phone_number", nullable = false, length = 50)
    private String phoneNumber;

    @Column
    private LocalDate birth;

    @Column(nullable = false, length = 50)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Gender gender;

    @Column(name = "img_url", nullable = false, length = 200)
    private String imgUrl;

    @CreatedDate
    @Column(name = "created_at", nullable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Column(name = "deleted_at")
    private LocalDateTime deletedAt;

    @Column(name = "phone_verified_at")
    private LocalDateTime phoneVerifiedAt;

    public void verifyPhone() {
        this.phoneVerifiedAt = LocalDateTime.now();
    }

    public static Customer of(String providerId, ProviderType providerType, String email, String phoneNumber,
                              LocalDate birth, String name, Gender gender, String imgUrl) {
        return Customer.builder()
                .providerId(providerId)
                .providerType(providerType)
                .email(email)
                .phoneNumber(phoneNumber)
                .birth(birth)
                .name(name)
                .gender(gender)
                .imgUrl(imgUrl)
                .build();
    }

}
