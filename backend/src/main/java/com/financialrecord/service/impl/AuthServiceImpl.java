package com.financialrecord.service.impl;

import com.financialrecord.dto.request.LoginRequest;
import com.financialrecord.dto.request.RegisterRequest;
import com.financialrecord.dto.response.AuthResponse;
import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.entity.User;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.Role;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.exception.BadRequestException;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.exception.UnauthorizedException;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.repository.WalletRepository;
import com.financialrecord.security.JwtTokenProvider;
import com.financialrecord.service.AuthService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtTokenProvider tokenProvider;
    private final AuthenticationManager authenticationManager;

    @Override
    @Transactional(readOnly = true)
    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail().toLowerCase().trim())
                .orElseThrow(() -> new BadRequestException("Email atau password tidak valid"));

        if (!user.isActive()) {
            throw new UnauthorizedException("Akun Anda telah dinonaktifkan oleh administrator.");
        }

        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail().toLowerCase().trim(), request.getPassword())
        );

        String token = tokenProvider.generateToken(authentication);

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .build();
    }

    @Override
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        String email = request.getEmail().toLowerCase().trim();

        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email '" + email + "' sudah terdaftar");
        }

        User user = User.builder()
                .email(email)
                .fullName(request.getFullName().trim())
                .passwordHash(passwordEncoder.encode(request.getPassword()))
                .role(Role.ROLE_USER)
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Seed initial default wallets for new user
        List<Wallet> defaultWallets = List.of(
                Wallet.builder().user(savedUser).name("Cash Dompet").type(WalletType.CASH).balance(BigDecimal.ZERO).build(),
                Wallet.builder().user(savedUser).name("Rekening Bank").type(WalletType.BANK).balance(BigDecimal.ZERO).build(),
                Wallet.builder().user(savedUser).name("E-Wallet (GoPay/OVO)").type(WalletType.EWALLET).balance(BigDecimal.ZERO).build()
        );
        walletRepository.saveAll(defaultWallets);

        String token = tokenProvider.generateTokenFromUser(
                savedUser.getId(),
                savedUser.getEmail(),
                savedUser.getFullName(),
                savedUser.getRole().name()
        );

        return AuthResponse.builder()
                .token(token)
                .tokenType("Bearer")
                .id(savedUser.getId())
                .email(savedUser.getEmail())
                .fullName(savedUser.getFullName())
                .role(savedUser.getRole().name())
                .build();
    }

    @Override
    @Transactional(readOnly = true)
    public UserProfileResponse getCurrentUser(UUID userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        return UserProfileResponse.builder()
                .id(user.getId())
                .email(user.getEmail())
                .fullName(user.getFullName())
                .role(user.getRole().name())
                .isActive(user.isActive())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
