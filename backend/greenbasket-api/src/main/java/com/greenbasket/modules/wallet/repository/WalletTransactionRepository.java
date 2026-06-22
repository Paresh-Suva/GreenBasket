package com.greenbasket.modules.wallet.repository;

import com.greenbasket.modules.wallet.entity.WalletTransaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface WalletTransactionRepository extends JpaRepository<WalletTransaction, Long> {
    List<WalletTransaction> findByUser_IdOrderByCreatedAtDesc(Long userId);
}
