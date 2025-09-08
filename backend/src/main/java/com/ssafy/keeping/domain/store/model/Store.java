package com.ssafy.keeping.domain.store.model;

import com.ssafy.keeping.domain.store.dto.StoreEditRequestDto;
import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.CreatedDate;
import org.springframework.data.annotation.LastModifiedDate;
import org.springframework.data.jpa.domain.support.AuditingEntityListener;

import java.time.LocalDateTime;
import java.util.Objects;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@EntityListeners(AuditingEntityListener.class)
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    //TODO: 사업자 owner와 연관관계

    @Column(nullable = false)
    private String taxId;
    @Column(nullable = false)
    private String storeName;
    @Column(nullable = false)
    private String address;
    @Column(nullable = false)
    private String phoneNumber;
    @Column(nullable = false)
    private String businessSector;
    @Column(nullable = false)
    private String businessType;
    @Column(nullable = false)
    private String bankAccount;
    @Column(nullable = false)
    private Long merchantId;
    @Column(nullable = false)
    private String category;

    // TODO file system은 나중에
    private String imgUrl;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;


    public void patchStore(StoreEditRequestDto requestDto, String imgUrl) {
        if (!Objects.equals(this.storeName, requestDto.getStoreName())) {
            this.storeName = requestDto.getStoreName();
        }
        if (!Objects.equals(this.address, requestDto.getAddress())) {
            this.address = requestDto.getAddress();
        }
        if (!Objects.equals(this.phoneNumber, requestDto.getPhoneNumber())) {
            this.phoneNumber = requestDto.getPhoneNumber();
        }
        if (!Objects.equals(this.imgUrl, imgUrl)) {
            this.imgUrl = imgUrl;
        }
    }
}
