package com.ssafy.keeping.domain.wallet.service;

import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.wallet.constant.LotSourceType;
import com.ssafy.keeping.domain.wallet.dto.WalletResponseDto;
import com.ssafy.keeping.domain.wallet.model.Wallet;
import com.ssafy.keeping.domain.wallet.repository.WalletRepository;
import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.global.exception.CustomException;
import com.ssafy.keeping.global.exception.constants.ErrorCode;
import com.ssafy.keeping.domain.payment.transactions.repository.TransactionRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreBalanceRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreLotRepository;
import com.ssafy.keeping.domain.wallet.dto.WalletStoreBalanceResponseDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.wallet.model.WalletStoreBalance;
import com.ssafy.keeping.domain.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import com.ssafy.keeping.domain.payment.transactions.constant.TransactionType;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import static com.ssafy.keeping.domain.wallet.model.Wallet.WalletType.GROUP;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class WalletServiceHS { // 충돌나는 것을 방지해 HS를 붙였으나 추후 합치겠습니다.
    private final StoreRepository storeRepository;
    private final WalletRepository walletRepository;
    private final WalletStoreBalanceRepository balanceRepository;
    private final GroupRepository groupRepository;
    private final CustomerRepository customerRepository;
    private final TransactionRepository transactionRepository;
    private final WalletStoreLotRepository lotRepository;
    private final GroupMemberRepository groupMemberRepository;

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

    @Transactional
    public PointShareResponseDto sharePoints(Long groupId, Long userId, Long storeId, @Valid PointShareRequestDto req) {
        // 1) 입력·기본 엔티티 조회
        final long shareAmount = req.getShareAmount();
        if (shareAmount <= 0) throw new CustomException(ErrorCode.BAD_REQUEST);

        Customer actor = customerRepository.findById(userId)
                .orElseThrow(() -> new CustomException(ErrorCode.USER_NOT_FOUND));
        Wallet individual = validWallet(req.getIndividualWalletId());
        Wallet group = validWallet(req.getGroupWalletId());
        if (individual.getWalletType() != Wallet.WalletType.INDIVIDUAL || group.getWalletType() != Wallet.WalletType.GROUP)
            throw new CustomException(ErrorCode.BAD_REQUEST);
        ensureOwnershipAndMembership(userId, groupId, individual, group);

        Store store = storeRepository.findById(storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.STORE_NOT_FOUND));

        // 2) 잔액 행잠금 조회
        WalletStoreBalance indivBal = balanceRepository.lockByWalletIdAndStoreId(individual.getWalletId(), storeId)
                .orElseThrow(() -> new CustomException(ErrorCode.BEFORE_INDIVIDUAL_CHARGE));
        if (indivBal.getBalance().compareTo(shareAmount) < 0) // 개인 balance보다 많은 양의 포인트를 공유하려고하면 안됨
            throw new CustomException(ErrorCode.OVER_INDIVIDUAL_POINT);

        WalletStoreBalance groupBal = balanceRepository.lockByWalletIdAndStoreId(group.getWalletId(), storeId)
                .orElseGet(() -> balanceRepository.save(
                        WalletStoreBalance.builder().wallet(group).store(store).balance(0L).build()
                ));

        // 3) LOT 차감 및 수신 LOT 적립(FIFO)
        Long shareLeft = shareAmount;
        List<WalletStoreLot> lots = lotRepository.lockAllByWalletIdAndStoreIdOrderByAcquiredAt(individual.getWalletId(), storeId);
        for (WalletStoreLot src : lots) {
            if (shareLeft == 0) break;
            if (src.isExpired() || src.isFullyUsed()) continue;

            Long movable = Math.min(src.getAmountRemaining(), shareLeft); // 기존 코드 -> src.getAmountRemaining().min(shareLeft).setScale(2, RoundingMode.DOWN);
            if (movable == 0) continue;

            src.usePoints(movable);                            // 개인 LOT 차감
            shareLeft -= movable;

            // 수신 LOT: 동일 origin_charge_tx 기준으로 1개에 누적
            WalletStoreLot dst = lotRepository
                    .findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
                            group.getWalletId(),
                            storeId,
                            src.getOriginChargeTransaction().getTransactionId(),
                            LotSourceType.TRANSFER_IN
                    )
                    .orElseGet(() -> lotRepository.save(
                            WalletStoreLot.builder()
                                    .wallet(group)
                                    .store(store)
                                    .amountTotal(0L)
                                    .amountRemaining(0L)
                                    .acquiredAt(src.getAcquiredAt())
                                    .expiredAt(src.getExpiredAt())
                                    .sourceType(LotSourceType.TRANSFER_IN)
                                    .contributorWallet(individual)
                                    .originChargeTransaction(src.getOriginChargeTransaction())
                                    .build()
                    ));
            dst.sharePoints(movable); // 총액·잔량 가산
        }
        if (shareLeft != 0) throw new CustomException(ErrorCode.INCONSISTENT_STATE);

        // 4) 잔액 이동
        indivBal.subtractBalance(shareAmount);
        groupBal.addBalance(shareAmount);

        // 5) 거래기록 2건(반드시 store 세팅)
        Transaction txOut = transactionRepository.save(
                Transaction.builder()
                        .wallet(individual)
                        .relatedWallet(group)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.USE)
                        .amount(shareAmount)
                        .build()
        );
        Transaction txIn = transactionRepository.save(
                Transaction.builder()
                        .wallet(group) // 수신 지갑
                        .relatedWallet(individual)
                        .customer(actor)
                        .store(store)
                        .transactionType(TransactionType.TRANSFER_IN)
                        .amount(shareAmount)
                        .build()
        );

        return new PointShareResponseDto(
                txOut.getTransactionId(), txIn.getTransactionId(),
                individual.getWalletId(), group.getWalletId(), storeId, shareAmount,
                groupBal.getBalance(), indivBal.getBalance(), LocalDateTime.now(), false // 멱등성 관련해서는 추후 적용
        );
    }

    private Wallet validWallet(Long walletId) {
        return walletRepository.findById(walletId)
                .orElseThrow(() -> new CustomException(ErrorCode.WALLET_NOT_FOUND));
    }

    private void ensureOwnershipAndMembership(Long userId, Long groupId, Wallet individual, Wallet group) {
        if (individual.getCustomer() == null || !individual.getCustomer().getCustomerId().equals(userId))
            throw new CustomException(ErrorCode.BAD_REQUEST);
        if (group.getGroup() == null || !group.getGroup().getGroupId().equals(groupId))
            throw new CustomException(ErrorCode.BAD_REQUEST);
        if (!groupMemberRepository.existsMember(groupId, userId))
            throw new CustomException(ErrorCode.ONLY_GROUP_MEMBER);
    }
}
