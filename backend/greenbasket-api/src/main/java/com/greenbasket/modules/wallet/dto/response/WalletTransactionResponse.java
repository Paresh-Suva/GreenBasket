package com.greenbasket.modules.wallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.time.Instant;

@Getter
@Builder
@AllArgsConstructor
public class WalletTransactionResponse {
    private final Long id;
    private final BigDecimal amount;
    private final String transactionType; // 'EARNED', 'SPENT'
    private final String description;
    private final Instant createdAt;
}
