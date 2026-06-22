package com.greenbasket.modules.wallet.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.wallet.dto.response.WalletSummaryResponse;
import com.greenbasket.modules.wallet.dto.response.WalletTransactionResponse;
import com.greenbasket.modules.wallet.service.WalletService;
import com.greenbasket.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/wallet")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "Wallet", description = "Endpoints for customer wallet balance and transactions")
public class WalletController {

    private final WalletService walletService;

    @GetMapping("/summary")
    @Operation(summary = "Get wallet balance and transactions summary")
    public ApiResponse<WalletSummaryResponse> getWalletSummary() {
        Long userId = SecurityUtils.getCurrentUserId();
        WalletSummaryResponse response = walletService.getWalletSummary(userId);
        return ApiResponse.success("Wallet summary retrieved successfully", response);
    }

    @GetMapping("/transactions")
    @Operation(summary = "Get wallet transactions history")
    public ApiResponse<List<WalletTransactionResponse>> getWalletTransactions() {
        Long userId = SecurityUtils.getCurrentUserId();
        List<WalletTransactionResponse> response = walletService.getWalletTransactions(userId);
        return ApiResponse.success("Wallet transactions retrieved successfully", response);
    }
}
