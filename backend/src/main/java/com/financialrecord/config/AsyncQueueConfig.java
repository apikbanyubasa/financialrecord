package com.financialrecord.config;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.scheduling.annotation.EnableAsync;
import org.springframework.scheduling.concurrent.ThreadPoolTaskExecutor;

import java.util.concurrent.Executor;
import java.util.concurrent.ThreadPoolExecutor;

/**
 * Enterprise Asynchronous Task Queue & Worker Configuration.
 * Isolates background processing (such as heavy audit trails, telemetry logging,
 * and periodic calculations) from the synchronous HTTP request threads.
 */
@Configuration
@EnableAsync
@Slf4j
public class AsyncQueueConfig {

    @Bean(name = "taskExecutor")
    public Executor taskExecutor() {
        ThreadPoolTaskExecutor executor = new ThreadPoolTaskExecutor();
        executor.setCorePoolSize(5);
        executor.setMaxPoolSize(20);
        executor.setQueueCapacity(500);
        executor.setThreadNamePrefix("FinancialRecord-Worker-");
        executor.setRejectedExecutionHandler(new ThreadPoolExecutor.CallerRunsPolicy());
        executor.setWaitForTasksToCompleteOnShutdown(true);
        executor.setAwaitTerminationSeconds(60);
        executor.initialize();
        log.info("✅ [WorkerPool] Initialized Asynchronous Task Queue Worker (Core: 5, Max: 20, QueueCapacity: 500)");
        return executor;
    }
}
