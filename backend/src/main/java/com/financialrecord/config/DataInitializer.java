package com.financialrecord.config;

import com.financialrecord.entity.User;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.Role;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.repository.WalletRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;
import java.util.List;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final WalletRepository walletRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) {
        log.info("Initializing and synchronizing default user credentials and allocation pockets...");

        // 1. Synchronize Admin Account
        User admin = userRepository.findByEmail("admin@financialrecord.com").orElse(null);
        if (admin == null) {
            admin = User.builder()
                    .email("admin@financialrecord.com")
                    .fullName("System Administrator")
                    .passwordHash(passwordEncoder.encode("admin123"))
                    .role(Role.ROLE_ADMIN)
                    .isActive(true)
                    .build();
            userRepository.save(admin);
            log.info("Created default admin user: admin@financialrecord.com");
        } else {
            admin.setPasswordHash(passwordEncoder.encode("admin123"));
            admin.setActive(true);
            admin.setRole(Role.ROLE_ADMIN);
            userRepository.save(admin);
        }

        // 2. Synchronize Demo User Account
        User demoUser = userRepository.findByEmail("user@financialrecord.com").orElse(null);
        if (demoUser == null) {
            demoUser = User.builder()
                    .email("user@financialrecord.com")
                    .fullName("Demo User")
                    .passwordHash(passwordEncoder.encode("user123"))
                    .role(Role.ROLE_USER)
                    .isActive(true)
                    .build();
            demoUser = userRepository.save(demoUser);
            log.info("Created default demo user: user@financialrecord.com");
        } else {
            demoUser.setPasswordHash(passwordEncoder.encode("user123"));
            demoUser.setActive(true);
            demoUser = userRepository.save(demoUser);
        }

        // Ensure Demo User has allocation pockets (Konsep Pos Alokasi)
        List<Wallet> wallets = walletRepository.findByUserId(demoUser.getId());
        if (wallets.isEmpty()) {
            List<Wallet> defaultWallets = List.of(
                    Wallet.builder().user(demoUser).name("Kantong Kebutuhan Pokok (Needs)").type(WalletType.BANK).balance(BigDecimal.ZERO).build(),
                    Wallet.builder().user(demoUser).name("Kantong Gaya Hidup & Hiburan (Wants)").type(WalletType.EWALLET).balance(BigDecimal.ZERO).build(),
                    Wallet.builder().user(demoUser).name("Kantong Tabungan & Masa Depan (Savings)").type(WalletType.INVESTMENT).balance(BigDecimal.ZERO).build()
            );
            walletRepository.saveAll(defaultWallets);
            log.info("Created initial allocation pockets for user@financialrecord.com");
        }
    }
}
