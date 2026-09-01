package com.financialrecord.service;

import com.financialrecord.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.UUID;

public interface AuditLogService {

    void logActivity(UUID userId, String action, String details, String ipAddress);

    Page<AuditLog> getAuditLogs(Pageable pageable);
}
