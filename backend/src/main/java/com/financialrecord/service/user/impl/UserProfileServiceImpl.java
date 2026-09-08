package com.financialrecord.service.user.impl;

import com.financialrecord.dto.request.ChangePasswordRequest;
import com.financialrecord.dto.request.DeleteAccountRequest;
import com.financialrecord.dto.request.ResetDataRequest;
import com.financialrecord.dto.request.UpdateProfileRequest;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.entity.User;
import com.financialrecord.exception.BadRequestException;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.TransactionRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.repository.WalletRepository;
import com.financialrecord.service.user.UserProfileService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class UserProfileServiceImpl implements UserProfileService {

    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getProfile(UUID userId) {
        User user = findUserById(userId);
        return mapToResponse(user);
    }

    @Override
    @Transactional
    public UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request) {
        User user = findUserById(userId);
        String newEmail = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmailAndIdNot(newEmail, userId)) {
            throw new BadRequestException("Email '" + newEmail + "' sudah digunakan oleh pengguna lain");
        }

        user.setFullName(request.getFullName().trim());
        user.setEmail(newEmail);
        User updated = userRepository.save(user);

        log.info("User {} updated profile: name='{}', email='{}'", userId, updated.getFullName(), updated.getEmail());
        return mapToResponse(updated);
    }

    @Override
    @Transactional
    public void changePassword(UUID userId, ChangePasswordRequest request) {
        if (!request.getNewPassword().equals(request.getConfirmPassword())) {
            throw new BadRequestException("Konfirmasi password baru tidak cocok");
        }

        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getCurrentPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password saat ini yang Anda masukkan salah");
        }

        if (passwordEncoder.matches(request.getNewPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password baru tidak boleh sama dengan password saat ini");
        }

        user.setPasswordHash(passwordEncoder.encode(request.getNewPassword()));
        userRepository.save(user);
        log.info("User {} successfully updated their password", userId);
    }

    @Override
    @Transactional
    public void resetUserData(UUID userId, ResetDataRequest request) {
        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password konfirmasi salah");
        }

        // Soft delete all transactions and reset all wallet balances to 0
        transactionRepository.softDeleteAllByUserId(userId);
        walletRepository.resetAllBalancesByUserId(userId);

        log.warn("User {} reset all transaction records and wallet balances to 0", userId);
    }

    @Override
    @Transactional
    public void deleteAccount(UUID userId, DeleteAccountRequest request) {
        if (!"HAPUS AKUN SAYA".equalsIgnoreCase(request.getConfirmationPhrase().trim())) {
            throw new BadRequestException("Frase konfirmasi salah. Harap ketik persis 'HAPUS AKUN SAYA'");
        }

        User user = findUserById(userId);

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new BadRequestException("Password konfirmasi salah");
        }

        // Soft delete / deactivate account
        user.setActive(false);
        userRepository.save(user);

        log.warn("User {} has deactivated their account (soft-delete)", userId);
    }

    private User findUserById(UUID userId) {
        return userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Pengguna tidak ditemukan"));
    }

    private UserProfileResponse mapToResponse(User user) {
        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt() != null ? user.getCreatedAt() : LocalDateTime.now())
                .build();
    }
}
