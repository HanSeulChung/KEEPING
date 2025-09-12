package com.ssafy.keeping.domain.store.model;

import com.ssafy.keeping.domain.core.owner.model.Owner;
import com.ssafy.keeping.domain.core.transaction.model.Transaction;
import com.ssafy.keeping.domain.core.wallet.model.WalletStoreBalance;
import com.ssafy.keeping.domain.core.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.store.constant.StoreStatus;
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
import java.util.List;
import java.util.Objects;

@Entity
@Getter
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Table(name = "stores", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"tax_id", "address"})
})
@EntityListeners(AuditingEntityListener.class)
public class Store {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long storeId;

    // Store N : 1 Owner 연관관계
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private Owner owner;

    @Column(nullable = false)
    private String taxId;
    @Column(nullable = false)
    private String storeName;
    @Column(nullable = false)
    private String address;
    @Column(nullable = true)
    private String phoneNumber;
    @Column(nullable = false)
    private String bankAccount;
    @Column(nullable = false)
    private Long merchantId;
    @Column(nullable = false)
    private String category;

    // TODO file system은 나중에
    private String imgUrl;

    private String description;

    @CreatedDate
    @Column(updatable = false)
    private LocalDateTime createdAt;

    @LastModifiedDate
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(updatable = false)
    private StoreStatus storeStatus;

    private LocalDateTime deletedAt;

    // 연관관계
    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WalletStoreBalance> walletStoreBalances;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<WalletStoreLot> walletStoreLots;

    @OneToMany(mappedBy = "store", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Transaction> transactions;


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

    // TODO: 가게 삭제 뿐만아니라, 점주 탈퇴시에도 사용하여 유령가게가 없어야하는 메서드
    public void deleteStore(StoreStatus storeStatus) {
        if (!Objects.equals(StoreStatus.DELETED, storeStatus)) {
            this.deletedAt = LocalDateTime.now();
        }
        this.storeStatus = storeStatus;
    }
}
