package com.financialrecord.config;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.web.client.RestTemplate;

import java.time.Duration;

@Configuration
public class SpringAiConfig {

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Value("${app.ai.openai.api-key:}")
    private String openAiApiKey;

    @Value("${app.ai.openai.model:gpt-4o-mini}")
    private String openAiModel;

    @Value("${app.ai.provider:gemini}")
    private String aiProvider;

    @Bean
    public RestTemplate aiRestTemplate() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(30));
        factory.setReadTimeout(Duration.ofSeconds(60));
        return new RestTemplate(factory);
    }
}
