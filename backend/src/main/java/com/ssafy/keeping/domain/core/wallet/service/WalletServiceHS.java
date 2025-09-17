package com.ssafy.keeping.domain.core.wallet.service;

import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.core.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.core.wallet.dto.WalletStoreBalanceResponseDto;
import com.ssafy.keeping.domain.core.wallet.model.Wallet;
import com.ssafy.keeping.domain.core.wallet.repository.WalletRepository;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static com.ssafy.keeping.domain.core.wallet.model.Wallet.WalletType.GROUP;

@Service
@RequiredArgsConstructor
public class WalletServiceHS { // 충돌나는 것을 방지해 HS를 붙였으나 추후 합치겠습니다.
    private final WalletRepository walletRepository;
    private final GroupRepository groupRepository;
    private final CustomerRepository customerRepository;

    public WalletResponseDto createGroupWallet(Group group) {

        Wallet saved = walletRepository.save(
                Wallet.builder()
                        .walletType(GROUP)
                        .group(group)
                        .build()
        );

        return new WalletResponseDto(
                saved.getWalletId(), saved.getWalletType(),
                group.getGroupId(),
                new ArrayList<>(),
                saved.getCreatedAt()
        );
    }

    // Group 엔티티가 이미 있는 호출용
    public WalletResponseDto getGroupWallet(Group group) {

        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        List<WalletStoreBalanceResponseDto> groupStoreBalanceDtoList =
                Optional.ofNullable(groupWallet.getWalletStoreBalances())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(b -> new WalletStoreBalanceResponseDto(
                                b.getBalanceId(),
                                b.getBalance(),
                                b.getUpdatedAt()
                        ))
                        .toList();

        return new WalletResponseDto(
                groupWallet.getWalletId(),
                groupWallet.getWalletType(),
                group.getGroupId(),
                groupStoreBalanceDtoList,
                groupWallet.getCreatedAt()
        );
    }
    // id만 넘어오는 호출용(검증을 여기서 직접 수행)
    public WalletResponseDto getGroupWallet(Long groupId, Long customerId) {
        //TODO: principal으로 변경
        if (!customerRepository.existsById(customerId)) {
            throw new CustomException(ErrorCode.USER_NOT_FOUND);
        }
        Group group = groupRepository.findById(groupId)
                .orElseThrow(() -> new CustomException(ErrorCode.GROUP_NOT_FOUND));


        Wallet groupWallet = walletRepository.findByGroupId(group.getGroupId())
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));

        List<WalletStoreBalanceResponseDto> groupStoreBalanceDtoList =
                Optional.ofNullable(groupWallet.getWalletStoreBalances())
                        .orElseGet(Collections::emptyList)
                        .stream()
                        .map(b -> new WalletStoreBalanceResponseDto(
                                b.getBalanceId(),
                                b.getBalance(),
                                b.getUpdatedAt()
                        ))
                        .toList();

        return new WalletResponseDto(
                groupWallet.getWalletId(),
                groupWallet.getWalletType(),
                group.getGroupId(),
                groupStoreBalanceDtoList,
                groupWallet.getCreatedAt()
        );
    }
}
