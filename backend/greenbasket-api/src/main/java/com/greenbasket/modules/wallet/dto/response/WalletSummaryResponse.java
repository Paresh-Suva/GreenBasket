package com.greenbasket.modules.wallet.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;

import java.math.BigDecimal;
import java.util.List;

@Getter
@Builder
@AllArgsConstructor
public class WalletSummaryResponse {
    private final BigDecimal balance;
    private final List<WalletTransactionResponse> transactions;
}
