package com.ssafy.keeping.wallet;

import com.ssafy.keeping.domain.group.model.Group;
import com.ssafy.keeping.domain.group.repository.GroupMemberRepository;
import com.ssafy.keeping.domain.group.repository.GroupRepository;
import com.ssafy.keeping.domain.payment.transactions.constant.TransactionType;
import com.ssafy.keeping.domain.payment.transactions.model.Transaction;
import com.ssafy.keeping.domain.payment.transactions.repository.TransactionRepository;
import com.ssafy.keeping.domain.store.model.Store;
import com.ssafy.keeping.domain.store.repository.StoreRepository;
import com.ssafy.keeping.domain.user.customer.model.Customer;
import com.ssafy.keeping.domain.user.customer.repository.CustomerRepository;
import com.ssafy.keeping.domain.wallet.constant.LotSourceType;
import com.ssafy.keeping.domain.wallet.constant.WalletType;
import com.ssafy.keeping.domain.wallet.dto.PointShareRequestDto;
import com.ssafy.keeping.domain.wallet.dto.PointShareResponseDto;
import com.ssafy.keeping.domain.wallet.model.Wallet;
import com.ssafy.keeping.domain.wallet.model.WalletStoreBalance;
import com.ssafy.keeping.domain.wallet.model.WalletStoreLot;
import com.ssafy.keeping.domain.wallet.repository.WalletRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreBalanceRepository;
import com.ssafy.keeping.domain.wallet.repository.WalletStoreLotRepository;
import com.ssafy.keeping.domain.wallet.service.WalletServiceHS;
import com.ssafy.keeping.global.exception.CustomException;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.*;
import org.mockito.junit.jupiter.MockitoExtension;
import org.mockito.stubbing.Answer;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class WalletServiceSharePointsUnitTest {

    @InjectMocks WalletServiceHS walletService;

    @Mock StoreRepository storeRepository;
    @Mock WalletRepository walletRepository;
    @Mock WalletStoreBalanceRepository balanceRepository;
    @Mock GroupRepository groupRepository;                  // 사용 안 해도 생성자 요구로 Mock
    @Mock CustomerRepository customerRepository;
    @Mock TransactionRepository transactionRepository;
    @Mock WalletStoreLotRepository lotRepository;
    @Mock GroupMemberRepository groupMemberRepository;

    private Customer customer(long id) {
        return Customer.builder().customerId(id).name("U"+id).build();
    }
    private Group group(long id) {
        return Group.builder().groupId(id).groupName("G"+id).groupCode("GC"+id).build();
    }
    private Wallet indiv(Customer c) {
        return Wallet.builder().walletId(101L).walletType(WalletType.INDIVIDUAL).customer(c).build();
    }
    private Wallet gwallet(Group g) {
        return Wallet.builder().walletId(201L).walletType(WalletType.GROUP).group(g).build();
    }
    private Store store(long id) {
        return Store.builder().storeId(id).storeName("S"+id).build();
    }

    @Test
    @DisplayName("sharePoints: 성공 경로(잔액 충분, 단일 LOT) → LOT 이동, 잔액 이동, 거래 2건")
    void sharePoints_success() {
        long groupId = 1L, userId = 10L, storeId = 1000L;
        var user = customer(userId);
        var g = group(groupId);
        var iw = indiv(user);
        var gw = gwallet(g);
        var s = store(storeId);

        // balances
        var indivBal = WalletStoreBalance.builder().balanceId(1L).wallet(iw).store(s).balance(2_000L).build();
        var groupBal = WalletStoreBalance.builder().balanceId(2L).wallet(gw).store(s).balance(100L).build();

        // source lot on individual wallet
        var originChargeTx = mock(Transaction.class);
        when(originChargeTx.getTransactionId()).thenReturn(999L);

        var srcLot = WalletStoreLot.builder()
                .wallet(iw).store(s)
                .amountTotal(2_000L).amountRemaining(2_000L)
                .acquiredAt(LocalDateTime.now().minusDays(1))
                .expiredAt(LocalDateTime.now().plusDays(30))
                .sourceType(LotSourceType.TRANSFER_IN) // 타입은 로직상 제약 없음
                .contributorWallet(iw)
                .originChargeTransaction(originChargeTx)
                .build();

        // mocks
        when(customerRepository.findById(userId)).thenReturn(Optional.of(user));
        when(walletRepository.findById(iw.getWalletId())).thenReturn(Optional.of(iw));
        when(walletRepository.findById(gw.getWalletId())).thenReturn(Optional.of(gw));
        when(groupMemberRepository.existsMember(groupId, userId)).thenReturn(true);
        when(storeRepository.findById(storeId)).thenReturn(Optional.of(s));

        when(balanceRepository.lockByWalletIdAndStoreId(iw.getWalletId(), storeId))
                .thenReturn(Optional.of(indivBal));
        when(balanceRepository.lockByWalletIdAndStoreId(gw.getWalletId(), storeId))
                .thenReturn(Optional.of(groupBal));

        when(lotRepository.lockAllByWalletIdAndStoreIdOrderByAcquiredAt(iw.getWalletId(), storeId))
                .thenReturn(List.of(srcLot));
        when(lotRepository.findByWalletIdAndStoreIdAndOriginChargeTxIdAndSourceType(
                gw.getWalletId(), storeId, 999L, LotSourceType.TRANSFER_IN))
                .thenReturn(Optional.empty());
        // save dst lot → return same instance
        Answer<WalletStoreLot> saveLotAnswer = inv -> (WalletStoreLot) inv.getArgument(0);
        when(lotRepository.save(any(WalletStoreLot.class))).thenAnswer(saveLotAnswer);

        // transactions
        Transaction txOut = mock(Transaction.class);
        Transaction txIn  = mock(Transaction.class);
        when(txOut.getTransactionId()).thenReturn(5000L);
        when(txIn.getTransactionId()).thenReturn(6000L);
        when(transactionRepository.save(any(Transaction.class))).thenReturn(txOut, txIn);

        // request
        PointShareRequestDto req = new PointShareRequestDto();
        req.setIndividualWalletId(iw.getWalletId());
        req.setGroupWalletId(gw.getWalletId());
        req.setShareAmount(800L);

        // when
        PointShareResponseDto res = walletService.sharePoints(groupId, userId, storeId, req);

        // then: response
        assertThat(res.individualWalletId()).isEqualTo(iw.getWalletId());
        assertThat(res.groupWalletId()).isEqualTo(gw.getWalletId());
        assertThat(res.storeId()).isEqualTo(storeId);
        assertThat(res.amount()).isEqualTo(800L);
        assertThat(res.txOutId()).isEqualTo(5000L);
        assertThat(res.txInId()).isEqualTo(6000L);

        // balances moved
        assertThat(indivBal.getBalance()).isEqualTo(1_200L);
        assertThat(groupBal.getBalance()).isEqualTo(900L);

        // src lot decreased, dst lot created and increased
        assertThat(srcLot.getAmountRemaining()).isEqualTo(1_200L);
        ArgumentCaptor<WalletStoreLot> dstCaptor = ArgumentCaptor.forClass(WalletStoreLot.class);
        verify(lotRepository).save(dstCaptor.capture());
        WalletStoreLot dst = dstCaptor.getValue();
        assertThat(dst.getWallet().getWalletId()).isEqualTo(gw.getWalletId());
        assertThat(dst.getContributorWallet().getWalletId()).isEqualTo(iw.getWalletId());
        assertThat(dst.getAmountRemaining()).isEqualTo(800L);
        assertThat(dst.getSourceType()).isEqualTo(LotSourceType.TRANSFER_IN);

        // transaction two saves with expected types
        ArgumentCaptor<Transaction> txCaptor = ArgumentCaptor.forClass(Transaction.class);
        verify(transactionRepository, times(2)).save(txCaptor.capture());
        var savedTxs = txCaptor.getAllValues();
        assertThat(savedTxs.stream().map(Transaction::getTransactionType).toList())
                .containsExactly(TransactionType.USE, TransactionType.TRANSFER_IN);
        assertThat(savedTxs.get(0).getWallet().getWalletId()).isEqualTo(iw.getWalletId());
        assertThat(savedTxs.get(1).getWallet().getWalletId()).isEqualTo(gw.getWalletId());
    }

    @Test
    @DisplayName("sharePoints: 개인 잔액 부족 → 예외")
    void sharePoints_insufficient() {
        long groupId = 1L, userId = 10L, storeId = 1000L;
        var user = customer(userId);
        var g = group(groupId);
        var iw = indiv(user);
        var gw = gwallet(g);
        var s = store(storeId);

        when(customerRepository.findById(userId)).thenReturn(Optional.of(user));
        when(walletRepository.findById(iw.getWalletId())).thenReturn(Optional.of(iw));
        when(walletRepository.findById(gw.getWalletId())).thenReturn(Optional.of(gw));
        when(groupMemberRepository.existsMember(groupId, userId)).thenReturn(true);
        when(storeRepository.findById(storeId)).thenReturn(Optional.of(s));

        var indivBal = WalletStoreBalance.builder().wallet(iw).store(s).balance(100L).build();
        when(balanceRepository.lockByWalletIdAndStoreId(iw.getWalletId(), storeId))
                .thenReturn(Optional.of(indivBal));

        PointShareRequestDto req = new PointShareRequestDto();
        req.setIndividualWalletId(iw.getWalletId());
        req.setGroupWalletId(gw.getWalletId());
        req.setShareAmount(800L);

        assertThatThrownBy(() -> walletService.sharePoints(groupId, userId, storeId, req))
                .isInstanceOf(CustomException.class);

        verify(transactionRepository, never()).save(any());
        verify(lotRepository, never()).save(any());
    }
}