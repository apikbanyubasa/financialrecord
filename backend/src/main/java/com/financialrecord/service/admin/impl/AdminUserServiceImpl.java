package com.financialrecord.service.admin.impl;

import com.financialrecord.dto.response.UserProfileResponse;
import com.financialrecord.entity.User;
import com.financialrecord.exception.ResourceNotFoundException;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.admin.AdminUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminUserServiceImpl implements AdminUserService {

    private final UserRepository userRepository;

    @Override
    @Transactional(readOnly = true)
    public Page<UserProfileResponse> getAllUsers(Pageable pageable) {
        return userRepository.findAllByOrderByCreatedAtDesc(pageable)
                .map(this::mapToResponse);
    }

    @Override
    @Transactional
    public UserProfileResponse toggleUserStatus(UUID userId, boolean isActive) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User tidak ditemukan"));

        user.setActive(isActive);
        User updated = userRepository.save(user);
        return mapToResponse(updated);
    }

    private UserProfileResponse mapToResponse(User user) {
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
