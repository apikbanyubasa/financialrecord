package com.financialrecord.service.admin;

import com.financialrecord.dto.response.AdminMetricsResponse;
import com.financialrecord.dto.response.AiUsageStatsResponse;
import com.financialrecord.entity.AiUsageLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface AdminDashboardService {

    AdminMetricsResponse getPlatformMetrics();

    AiUsageStatsResponse getAiUsageStats();

    Page<AiUsageLog> getAiUsageLogs(Pageable pageable);
}
