package com.financialrecord.service;

import com.financialrecord.dto.request.WalletRequest;
import com.financialrecord.dto.response.WalletResponse;

import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.WalletType;

import java.util.List;
import java.util.UUID;

public interface WalletService {

    List<WalletResponse> getWalletsByUserId(UUID userId);

    WalletResponse getWalletById(UUID id, UUID userId);

    WalletResponse createWallet(UUID userId, WalletRequest request);

    WalletResponse updateWallet(UUID id, UUID userId, WalletRequest request);

    void deleteWallet(UUID id, UUID userId);

    Wallet getOrCreateWalletForAi(UUID userId, String walletName, PocketType pocketType, WalletType walletType, String aiInsight);
}
