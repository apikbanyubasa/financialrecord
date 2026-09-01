package com.financialrecord.service;

import com.financialrecord.dto.request.LoginRequest;
import com.financialrecord.dto.request.RegisterRequest;
import com.financialrecord.dto.response.AuthResponse;
import com.financialrecord.dto.response.UserProfileResponse;

import java.util.UUID;

public interface AuthService {

    AuthResponse login(LoginRequest request);

    AuthResponse register(RegisterRequest request);

    UserProfileResponse getCurrentUser(UUID userId);
}
