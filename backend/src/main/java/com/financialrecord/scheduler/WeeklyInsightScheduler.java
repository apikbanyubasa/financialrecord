package com.financialrecord.scheduler;

import com.financialrecord.entity.User;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.ai.AiAdvisorService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class WeeklyInsightScheduler {

    private final UserRepository userRepository;
    private final AiAdvisorService advisorService;

    // Run every Sunday at 23:00
    @Scheduled(cron = "0 0 23 * * SUN")
    public void generateWeeklyInsights() {
        log.info("Starting automated weekly AI financial insight generator scheduler...");
        List<User> users = userRepository.findAll();

        for (User user : users) {
            if (user.isActive()) {
                try {
                    advisorService.generateFinancialInsight(user.getId());
                    log.info("Weekly insight generated for user: {}", user.getEmail());
                } catch (Exception e) {
                    log.error("Failed to generate weekly insight for user {}", user.getEmail(), e);
                }
            }
        }
        log.info("Completed automated weekly AI financial insight generation.");
    }
}
