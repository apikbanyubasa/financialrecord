package com.financialrecord.service.admin;

import com.financialrecord.dto.response.UserProfileResponse;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AdminUserService {

    Page<UserProfileResponse> getAllUsers(Pageable pageable);

    UserProfileResponse toggleUserStatus(UUID userId, boolean isActive);
}
