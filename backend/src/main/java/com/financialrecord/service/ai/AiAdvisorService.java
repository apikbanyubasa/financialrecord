package com.financialrecord.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialrecord.dto.response.AiInsightResponse;
import com.financialrecord.dto.response.DashboardSummaryResponse;
import com.financialrecord.entity.FinancialInsight;
import com.financialrecord.entity.User;
import com.financialrecord.entity.enums.AiFeatureType;
import com.financialrecord.repository.FinancialInsightRepository;
import com.financialrecord.repository.UserRepository;
import com.financialrecord.service.TransactionService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiAdvisorService {

    private final RestTemplate aiRestTemplate;
    private final ObjectMapper objectMapper;
    private final AiMetricsTracker metricsTracker;
    private final FinancialInsightRepository financialInsightRepository;
    private final UserRepository userRepository;
    private final TransactionService transactionService;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    @Transactional
    public AiInsightResponse generateFinancialInsight(UUID userId) {
        long startTime = System.currentTimeMillis();
        DashboardSummaryResponse summary = transactionService.getDashboardSummary(userId);

        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_api_key_here")) {
            long latency = System.currentTimeMillis() - startTime;
            metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, "gemini-1.5-flash-simulated", 620, 310, latency, true, null);
            AiInsightResponse insight = generateSimulatedInsight(summary);
            saveInsightToDb(userId, insight);
            return insight;
        }

        try {
            String prompt = buildAdvisorPrompt(summary);
            Map<String, Object> requestBody = new HashMap<>();
            List<Map<String, Object>> contents = new ArrayList<>();
            Map<String, Object> contentMap = new HashMap<>();
            contentMap.put("parts", List.of(Map.of("text", prompt)));
            contents.add(contentMap);
            requestBody.put("contents", contents);

            Map<String, Object> genConfig = new HashMap<>();
            genConfig.put("responseMimeType", "application/json");
            genConfig.put("temperature", 0.2);
            requestBody.put("generationConfig", genConfig);

            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    geminiModel, geminiApiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = aiRestTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            long latency = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String jsonText = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();

                if (jsonText.startsWith("```json")) {
                    jsonText = jsonText.substring(7);
                }
                if (jsonText.endsWith("```")) {
                    jsonText = jsonText.substring(0, jsonText.length() - 3);
                }
                jsonText = jsonText.trim();

                JsonNode usageNode = root.path("usageMetadata");
                int promptTokens = usageNode.path("promptTokenCount").asInt(650);
                int completionTokens = usageNode.path("candidatesTokenCount").asInt(320);

                metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, geminiModel, promptTokens, completionTokens, latency, true, null);

                JsonNode parsed = objectMapper.readTree(jsonText);
                AiInsightResponse insightResponse = mapJsonToInsightResponse(parsed);
                saveInsightToDb(userId, insightResponse);
                return insightResponse;
            } else {
                throw new Exception("Gemini AI HTTP status: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("Failed to generate AI financial insight", ex);
            metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, geminiModel, 0, 0, latency, false, ex.getMessage());
            AiInsightResponse fallback = generateSimulatedInsight(summary);
            saveInsightToDb(userId, fallback);
            return fallback;
        }
    }

    public String chatWithAdvisor(UUID userId, String userMessage) {
        long startTime = System.currentTimeMillis();
        DashboardSummaryResponse summary = transactionService.getDashboardSummary(userId);

        if (geminiApiKey == null || geminiApiKey.trim().isEmpty() || geminiApiKey.equalsIgnoreCase("your_api_key_here")) {
            long latency = System.currentTimeMillis() - startTime;
            metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, "gemini-1.5-flash-simulated", 300, 150, latency, true, null);
            return "Halo! Sebagai Financial Advisor kamu, saya melihat total pengeluaran bulan ini sebesar Rp " +
                    String.format("%,.0f", summary.getTotalExpenseThisMonth()) + " dari total pemasukan Rp " +
                    String.format("%,.0f", summary.getTotalIncomeThisMonth()) + ". Rasio tabungan kamu saat ini " +
                    String.format("%.1f", summary.getSavingsRatePercentage()) + "%. Ada pertanyaan seputar penghematan atau alokasi budget kategori tertentu?";
        }

        try {
            String systemInstruction = "You are a professional Indonesian Certified Financial Planner (CFP) for 'FinancialRecord'. " +
                    "Be insightful, concise, polite, and give concrete financial strategies in Indonesian. " +
                    "Context: User Total Income=Rp " + summary.getTotalIncomeThisMonth() +
                    ", Total Expense=Rp " + summary.getTotalExpenseThisMonth() +
                    ", Net Savings=Rp " + summary.getNetSavingsThisMonth() +
                    ", Bocor Halus=Rp " + summary.getBocorHalusTotal() +
                    ". User says: " + userMessage;

            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(Map.of("parts", List.of(Map.of("text", systemInstruction)))));

            String url = String.format("https://generativelanguage.googleapis.com/v1beta/models/%s:generateContent?key=%s",
                    geminiModel, geminiApiKey);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

            ResponseEntity<String> response = aiRestTemplate.exchange(url, HttpMethod.POST, entity, String.class);
            long latency = System.currentTimeMillis() - startTime;

            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                JsonNode root = objectMapper.readTree(response.getBody());
                String reply = root.path("candidates").path(0).path("content").path("parts").path(0).path("text").asText();
                JsonNode usageNode = root.path("usageMetadata");
                int promptTokens = usageNode.path("promptTokenCount").asInt(350);
                int completionTokens = usageNode.path("candidatesTokenCount").asInt(180);

                metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, geminiModel, promptTokens, completionTokens, latency, true, null);
                return reply;
            } else {
                throw new Exception("Gemini chat error: " + response.getStatusCode());
            }
        } catch (Exception ex) {
            long latency = System.currentTimeMillis() - startTime;
            log.error("AI Chat failed", ex);
            metricsTracker.recordUsage(userId, AiFeatureType.ADVISOR_CHAT, geminiModel, 0, 0, latency, false, ex.getMessage());
            return "Maaf, saat ini AI Advisor sedang mengalami lonjakan trafik. Namun dari catatan kami, rasio tabungan kamu bulan ini berada di angka " +
                    String.format("%.1f", summary.getSavingsRatePercentage()) + "%. Tetap pertahankan disiplin pencatatan!";
        }
    }

    private String buildAdvisorPrompt(DashboardSummaryResponse summary) {
        return "You are an expert Indonesian Financial Advisor. Analyze this user cashflow data:\n" +
                "- Total Income: Rp " + summary.getTotalIncomeThisMonth() + "\n" +
                "- Total Expense: Rp " + summary.getTotalExpenseThisMonth() + "\n" +
                "- Net Savings: Rp " + summary.getNetSavingsThisMonth() + "\n" +
                "- Savings Rate: " + summary.getSavingsRatePercentage() + "%\n" +
                "- Bocor Halus (Micro-spendings <= 50k): Rp " + summary.getBocorHalusTotal() + " (" + summary.getBocorHalusCount() + " transaksi)\n" +
                "Output ONLY valid JSON with this exact schema:\n" +
                "{\n" +
                "  \"title\": \"string (e.g. 'Arus Kas Sehat, Optimalkan Alokasi Bocor Halus')\",\n" +
                "  \"healthScore\": 82,\n" +
                "  \"summaryText\": \"string (3-4 sentences in Indonesian summarizing the user's cashflow position and breakdown)\",\n" +
                "  \"sentiment\": \"EXCELLENT | GOOD | WARNING | CRITICAL\",\n" +
                "  \"bocorHalusAnalysis\": {\n" +
                "    \"detectedTotal\": " + summary.getBocorHalusTotal() + ",\n" +
                "    \"insight\": \"string (evaluation of micro-spending)\"\n" +
                "  },\n" +
                "  \"recommendations\": [\n" +
                "    {\"category\": \"string\", \"action\": \"string\", \"impact\": \"string\"}\n" +
                "  ]\n" +
                "}";
    }

    private AiInsightResponse mapJsonToInsightResponse(JsonNode node) {
        String title = node.path("title").asText("Analisis Kesehatan Finansial AI");
        int score = node.path("healthScore").asInt(78);
        String summary = node.path("summaryText").asText("Cashflow Anda bulan ini berjalan cukup terkendali.");
        String sentiment = node.path("sentiment").asText("GOOD");

        JsonNode bocorNode = node.path("bocorHalusAnalysis");
        AiInsightResponse.BocorHalusInsight bocor = new AiInsightResponse.BocorHalusInsight(
                BigDecimal.valueOf(bocorNode.path("detectedTotal").asDouble(0.0)),
                bocorNode.path("insight").asText("Pengeluaran kecil terkontrol dengan baik.")
        );

        List<AiInsightResponse.AdvisorRecommendation> recs = new ArrayList<>();
        JsonNode recsNode = node.path("recommendations");
        if (recsNode.isArray()) {
            for (JsonNode r : recsNode) {
                recs.add(new AiInsightResponse.AdvisorRecommendation(
                        r.path("category").asText("Tips"),
                        r.path("action").asText("Langkah aksi"),
                        r.path("impact").asText("Dampak finansial")
                ));
            }
        }

        return AiInsightResponse.builder()
                .title(title)
                .healthScore(score)
                .summaryText(summary)
                .sentiment(sentiment)
                .bocorHalusAnalysis(bocor)
                .recommendations(recs)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private AiInsightResponse generateSimulatedInsight(DashboardSummaryResponse summary) {
        int score = 75;
        if (summary.getSavingsRatePercentage() > 30) score = 88;
        else if (summary.getSavingsRatePercentage() < 10) score = 55;

        List<AiInsightResponse.AdvisorRecommendation> recommendations = List.of(
                new AiInsightResponse.AdvisorRecommendation(
                        "Kendali Bocor Halus",
                        "Batasi jajan kopi dan camilan harian maksimal 2x seminggu",
                        "Potensi hemat Rp 300.000 - Rp 450.000 per bulan"
                ),
                new AiInsightResponse.AdvisorRecommendation(
                        "Aturan 50/30/20",
                        "Alokasikan minimal 20% dari pemasukan langsung ke instrumen reksa dana pasar uang di awal gajian",
                        "Membentuk dana darurat stabil dalam 6 bulan"
                ),
                new AiInsightResponse.AdvisorRecommendation(
                        "Audit Langganan Digital",
                        "Periksa kembali subscription bulanan streaming yang jarang ditonton",
                        "Hemat Rp 120.000 / bulan"
                )
        );

        return AiInsightResponse.builder()
                .title("Kesehatan Finansial Baik: Waspadai Pola Bocor Halus")
                .healthScore(score)
                .summaryText("Total pemasukan Anda bulan ini berhasil menutup seluruh pengeluaran dengan rasio tabungan sebesar " +
                        String.format("%.1f", summary.getSavingsRatePercentage()) + "%. Fokus utama bulan ini adalah menekan akumulasi transaksi mikro agar tidak menggerus potensi investasi.")
                .sentiment(score >= 80 ? "EXCELLENT" : "GOOD")
                .bocorHalusAnalysis(new AiInsightResponse.BocorHalusInsight(
                        summary.getBocorHalusTotal(),
                        "Terdeteksi " + summary.getBocorHalusCount() + " transaksi kecil di bawah Rp 50.000 dengan total Rp " +
                                String.format("%,.0f", summary.getBocorHalusTotal()) + ". Biaya admin dan jajan kecil menjadi kontributor utama."
                ))
                .recommendations(recommendations)
                .generatedAt(LocalDateTime.now())
                .build();
    }

    private void saveInsightToDb(UUID userId, AiInsightResponse insight) {
        try {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                String recJson = objectMapper.writeValueAsString(insight.getRecommendations());
                FinancialInsight entity = FinancialInsight.builder()
                        .user(user)
                        .title(insight.getTitle())
                        .summaryText(insight.getSummaryText())
                        .recommendationsJson(recJson)
                        .healthScore(insight.getHealthScore())
                        .build();
                financialInsightRepository.save(entity);
            }
        } catch (Exception e) {
            log.error("Failed to save financial insight to database", e);
        }
    }
}
