package com.financialrecord.service.impl;

import com.financialrecord.dto.request.WalletRequest;
import com.financialrecord.dto.response.WalletResponse;
import com.financialrecord.entity.User;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.repository.WalletRepository;
import com.financialrecord.service.WalletService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class WalletServiceImpl implements WalletService {

    private final WalletRepository walletRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public List<WalletResponse> getWalletsByUserId(UUID userId) {
        List<Wallet> wallets = walletRepository.findByUserIdOrderByCreatedAtAsc(userId);
        if (wallets.isEmpty()) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                List<Wallet> defaults = List.of(
                        Wallet.builder().user(user).name("Kantong Kebutuhan Pokok (Needs)").type(WalletType.BANK).balance(BigDecimal.ZERO).build(),
                        Wallet.builder().user(user).name("Kantong Gaya Hidup & Hiburan (Wants)").type(WalletType.EWALLET).balance(BigDecimal.ZERO).build(),
                        Wallet.builder().user(user).name("Kantong Tabungan & Masa Depan (Savings)").type(WalletType.INVESTMENT).balance(BigDecimal.ZERO).build()
                );
                wallets = walletRepository.saveAll(defaults);
            }
        }

        return wallets.stream()
                .map(this::mapToResponse)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public WalletResponse getWalletById(UUID id, UUID userId) {
        Wallet wallet = walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kantong pos tidak ditemukan"));
        return mapToResponse(wallet);
    }

    @Override
    @Transactional
    public WalletResponse createWallet(UUID userId, WalletRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        Wallet wallet = Wallet.builder()
                .user(user)
                .name(request.getName().trim())
                .type(request.getType() != null ? request.getType() : WalletType.BANK)
                .balance(request.getInitialBalance() != null ? request.getInitialBalance() : BigDecimal.ZERO)
                .build();

        Wallet saved = walletRepository.save(wallet);
        return mapToResponse(saved);
    }

    @Override
    @Transactional
    public WalletResponse updateWallet(UUID id, UUID userId, WalletRequest request) {
        Wallet wallet = walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kantong pos tidak ditemukan"));

        wallet.setName(request.getName().trim());
        if (request.getType() != null) {
            wallet.setType(request.getType());
        }
        if (request.getInitialBalance() != null) {
            wallet.setBalance(request.getInitialBalance());
        }

        Wallet updated = walletRepository.save(wallet);
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void deleteWallet(UUID id, UUID userId) {
        Wallet wallet = walletRepository.findByIdAndUserId(id, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Kantong pos tidak ditemukan"));
        walletRepository.delete(wallet);
    }

    private WalletResponse mapToResponse(Wallet wallet) {
        return WalletResponse.builder()
                .id(wallet.getId())
                .name(wallet.getName())
                .type(wallet.getType())
                .balance(wallet.getBalance())
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
