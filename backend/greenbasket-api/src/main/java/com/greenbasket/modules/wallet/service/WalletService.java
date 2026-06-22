package com.greenbasket.modules.wallet.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import com.greenbasket.modules.wallet.dto.response.WalletSummaryResponse;
import com.greenbasket.modules.wallet.dto.response.WalletTransactionResponse;
import com.greenbasket.modules.wallet.entity.WalletTransaction;
import com.greenbasket.modules.wallet.repository.WalletTransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class WalletService {

    private final UserRepository userRepository;
    private final WalletTransactionRepository walletTransactionRepository;

    @Transactional(readOnly = true)
    public WalletSummaryResponse getWalletSummary(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        List<WalletTransaction> transactions = walletTransactionRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        List<WalletTransactionResponse> transactionResponses = transactions.stream()
                .map(this::toResponse)
                .toList();

        return WalletSummaryResponse.builder()
                .balance(user.getWalletBalance())
                .transactions(transactionResponses)
                .build();
    }

    @Transactional(readOnly = true)
    public List<WalletTransactionResponse> getWalletTransactions(Long userId) {
        List<WalletTransaction> transactions = walletTransactionRepository.findByUser_IdOrderByCreatedAtDesc(userId);
        return transactions.stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public void addTransaction(User user, BigDecimal amount, String type, String description) {
        WalletTransaction transaction = WalletTransaction.builder()
                .user(user)
                .amount(amount)
                .transactionType(type)
                .description(description)
                .createdAt(Instant.now())
                .build();
        
        walletTransactionRepository.save(transaction);

        if ("EARNED".equalsIgnoreCase(type)) {
            user.setWalletBalance(user.getWalletBalance().add(amount));
        } else if ("SPENT".equalsIgnoreCase(type)) {
            user.setWalletBalance(user.getWalletBalance().subtract(amount));
        }
        userRepository.save(user);
    }

    private WalletTransactionResponse toResponse(WalletTransaction txn) {
        return WalletTransactionResponse.builder()
                .id(txn.getId())
                .amount(txn.getAmount())
                .transactionType(txn.getTransactionType())
                .description(txn.getDescription())
                .createdAt(txn.getCreatedAt())
                .build();
    }
}
