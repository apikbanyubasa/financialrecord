package com.financialrecord.service.impl;

import com.financialrecord.entity.AuditLog;
import com.financialrecord.entity.User;
import com.financialrecord.repository.AuditLogRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class AuditLogServiceImpl implements AuditLogService {

    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

    @Override
    @Transactional
    public void logActivity(UUID userId, String action, String details, String ipAddress) {
        try {
            User user = null;
            if (userId != null) {
                user = userRepository.findById(userId).orElse(null);
            }

            AuditLog logEntry = AuditLog.builder()
                    .user(user)
                    .action(action)
                    .details(details)
                    .ipAddress(ipAddress)
                    .build();

            auditLogRepository.save(logEntry);
        } catch (Exception e) {
            log.error("Failed to persist audit log", e);
        }
    }

    @Override
    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return auditLogRepository.findAllByOrderByCreatedAtDesc(pageable);
    }
}
