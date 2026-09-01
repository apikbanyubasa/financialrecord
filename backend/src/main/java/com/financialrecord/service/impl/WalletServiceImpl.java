package com.financialrecord.service.impl;

import com.financialrecord.dto.request.WalletRequest;
import com.financialrecord.dto.response.WalletResponse;
import com.financialrecord.entity.User;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.TransactionRepository;
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
    private final TransactionRepository transactionRepository;

    @Override
    @Transactional(readOnly = true)
    public List<WalletResponse> getWalletsByUserId(UUID userId) {
        List<Object[]> activePockets = transactionRepository.findActivePocketsFromTransactions(userId);
        List<WalletResponse> responses = new ArrayList<>();

        for (Object[] row : activePockets) {
            UUID categoryId = (UUID) row[0];
            String categoryName = (String) row[1];
            String icon = (String) row[2];
            String color = (String) row[3];
            TransactionType txType = (TransactionType) row[4];
            BigDecimal totalAmount = (BigDecimal) row[5];
            long count = ((Number) row[6]).longValue();

            PocketType pocketType = (txType == TransactionType.INCOME) ? PocketType.INCOME : PocketType.EXPENSE;
            String pocketName = "Kantong " + categoryName;
            String aiInsight = (txType == TransactionType.INCOME)
                    ? "Dideteksi AI dari " + count + " transaksi penerimaan dana"
                    : "Dideteksi AI dari " + count + " transaksi pengeluaran pos ini";

            responses.add(WalletResponse.builder()
                    .id(categoryId)
                    .name(pocketName)
                    .categoryName(categoryName)
                    .icon(icon != null ? icon : (pocketType == PocketType.INCOME ? "Briefcase" : "Wallet"))
                    .color(color != null ? color : (pocketType == PocketType.INCOME ? "#10B981" : "#EF4444"))
                    .type(WalletType.BANK)
                    .pocketType(pocketType)
                    .aiGenerated(true)
                    .aiInsight(aiInsight)
                    .balance(totalAmount)
                    .totalIncome(txType == TransactionType.INCOME ? totalAmount : BigDecimal.ZERO)
                    .totalExpense(txType == TransactionType.EXPENSE ? totalAmount : BigDecimal.ZERO)
                    .transactionCount(count)
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
        }

        return responses;
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
                .pocketType(request.getPocketType() != null ? request.getPocketType() : PocketType.EXPENSE)
                .aiGenerated(Boolean.TRUE.equals(request.getAiGenerated()))
                .aiInsight(request.getAiInsight())
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
        if (request.getPocketType() != null) {
            wallet.setPocketType(request.getPocketType());
        }
        if (request.getAiInsight() != null) {
            wallet.setAiInsight(request.getAiInsight());
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

    @Override
    @Transactional
    public Wallet getOrCreateWalletForAi(UUID userId, String walletName, PocketType pocketType, WalletType walletType, String aiInsight) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        String cleanName = (walletName != null && !walletName.trim().isEmpty())
                ? walletName.trim()
                : (pocketType == PocketType.INCOME ? "Kantong Pemasukan Utama" : "Kantong Pengeluaran Harian");

        List<Wallet> existingWallets = walletRepository.findByUserId(userId);
        for (Wallet w : existingWallets) {
            if (w.getName().equalsIgnoreCase(cleanName) ||
                w.getName().toLowerCase().contains(cleanName.toLowerCase()) ||
                cleanName.toLowerCase().contains(w.getName().toLowerCase())) {
                return w;
            }
        }

        Wallet newWallet = Wallet.builder()
                .user(user)
                .name(cleanName)
                .type(walletType != null ? walletType : (cleanName.toLowerCase().contains("cash") ? WalletType.CASH : (cleanName.toLowerCase().contains("gopay") || cleanName.toLowerCase().contains("ovo") || cleanName.toLowerCase().contains("dana") ? WalletType.EWALLET : WalletType.BANK)))
                .pocketType(pocketType != null ? pocketType : PocketType.EXPENSE)
                .aiGenerated(true)
                .aiInsight(aiInsight != null ? aiInsight : "Dideteksi dan dibuat otomatis oleh AI dari transaksi")
                .balance(BigDecimal.ZERO)
                .build();

        return walletRepository.save(newWallet);
    }

    private WalletResponse mapToResponse(Wallet wallet) {
        BigDecimal totalIncome = transactionRepository.sumAmountByWalletIdAndType(wallet.getId(), TransactionType.INCOME);
        BigDecimal totalExpense = transactionRepository.sumAmountByWalletIdAndType(wallet.getId(), TransactionType.EXPENSE);
        long count = transactionRepository.countByWalletId(wallet.getId());

        return WalletResponse.builder()
                .id(wallet.getId())
                .name(wallet.getName())
                .type(wallet.getType())
                .pocketType(wallet.getPocketType() != null ? wallet.getPocketType() : PocketType.EXPENSE)
                .aiGenerated(Boolean.TRUE.equals(wallet.getAiGenerated()))
                .aiInsight(wallet.getAiInsight())
                .balance(wallet.getBalance())
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .transactionCount(count)
                .createdAt(wallet.getCreatedAt())
                .updatedAt(wallet.getUpdatedAt())
                .build();
    }
}
