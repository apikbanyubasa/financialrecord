package com.financialrecord.service.user;

import com.financialrecord.dto.request.ChangePasswordRequest;
import com.financialrecord.dto.request.DeleteAccountRequest;
import com.financialrecord.dto.request.ResetDataRequest;
import com.financialrecord.dto.request.UpdateProfileRequest;
import com.financialrecord.dto.response.UserProfileResponse;

import java.util.UUID;

public interface UserProfileService {

    UserProfileResponse getProfile(UUID userId);

    UserProfileResponse updateProfile(UUID userId, UpdateProfileRequest request);

    void changePassword(UUID userId, ChangePasswordRequest request);

    void resetUserData(UUID userId, ResetDataRequest request);

    void deleteAccount(UUID userId, DeleteAccountRequest request);
}
