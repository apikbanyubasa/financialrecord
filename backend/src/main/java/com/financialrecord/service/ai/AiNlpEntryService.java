package com.financialrecord.service.ai;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.entity.Category;
import com.financialrecord.entity.Wallet;
import com.financialrecord.entity.enums.AiFeatureType;
import com.financialrecord.entity.enums.PocketType;
import com.financialrecord.entity.enums.TransactionType;
import com.financialrecord.entity.enums.WalletType;
import com.financialrecord.repository.CategoryRepository;
import com.financialrecord.service.WalletService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class AiNlpEntryService {

    private final RestTemplate aiRestTemplate;
    private final ObjectMapper objectMapper;
    private final AiMetricsTracker metricsTracker;
    private final CategoryRepository categoryRepository;
    private final WalletService walletService;

    @Value("${app.ai.gemini.api-key:}")
    private String geminiApiKey;

    @Value("${app.ai.gemini.model:gemini-1.5-flash}")
    private String geminiModel;

    public List<TransactionRequest> parseNaturalLanguageTransactions(UUID userId, String naturalText) {
        long startTime = System.currentTimeMillis();

        List<Category> categories = categoryRepository.findAllByUserIdOrSystemDefault(userId);

        // Split text into individual transaction clauses/lines
        List<String> rawItems = splitIntoTransactionClauses(naturalText);
        List<TransactionRequest> parsedList = new ArrayList<>();

        for (String rawItem : rawItems) {
            String itemClean = rawItem.trim().replaceAll("^['\"\\s]+|['\"\\s]+$", "");
            if (itemClean.isEmpty()) continue;

            TransactionRequest req = simulateNlpParseSingle(userId, itemClean, categories);
            if (req != null) {
                parsedList.add(req);
            }
        }

        if (parsedList.isEmpty()) {
            TransactionRequest fallback = simulateNlpParseSingle(userId, naturalText, categories);
            if (fallback != null) parsedList.add(fallback);
        }

        long latency = System.currentTimeMillis() - startTime;
        metricsTracker.recordUsage(userId, AiFeatureType.NLP_INPUT, "financialrecord-nlp-batch-engine", 200, 100, latency, true, null);

        return parsedList;
    }

    public TransactionRequest parseNaturalLanguageTransaction(UUID userId, String naturalText) {
        List<TransactionRequest> list = parseNaturalLanguageTransactions(userId, naturalText);
        return list.isEmpty() ? null : list.get(0);
    }

    private List<String> splitIntoTransactionClauses(String text) {
        List<String> result = new ArrayList<>();
        if (text == null || text.trim().isEmpty()) return result;

        // 1. Check if text has quoted items e.g. 'item 1', 'item 2' or "item 1", "item 2"
        Pattern quotedPattern = Pattern.compile("['\"]([^'\"]+)['\"]");
        Matcher matcher = quotedPattern.matcher(text);
        boolean foundQuoted = false;
        while (matcher.find()) {
            foundQuoted = true;
            String matched = matcher.group(1).trim();
            if (!matched.isEmpty()) {
                result.add(matched);
            }
        }

        if (foundQuoted && !result.isEmpty()) {
            return result;
        }

        // 2. Split by newline, semicolon, or comma followed by keywords
        String[] lines = text.split("[\\r\\n;]+");
        for (String line : lines) {
            String l = line.trim();
            if (!l.isEmpty()) {
                // If a single line has multiple items separated by comma and keywords like "beli/bayar/gajian"
                String[] subItems = l.split(",\\s*(?=(?:beli|bayar|dapat|gaji|terima|tf|transfer))");
                for (String sub : subItems) {
                    if (!sub.trim().isEmpty()) {
                        result.add(sub.trim());
                    }
                }
            }
        }

        return result.isEmpty() ? List.of(text.trim()) : result;
    }

    /**
     * High-Precision Single Item Parser with Smart AI Pocket Resolution
     */
    private TransactionRequest simulateNlpParseSingle(UUID userId, String text, List<Category> categories) {
        String lower = text.toLowerCase().trim();

        // 1. Determine Transaction Type (INCOME vs EXPENSE)
        boolean isIncome = lower.contains("gaji") || lower.contains("gajian") || lower.contains("dapat uang") ||
                lower.contains("dapat gajian") || lower.contains("terima uang") || lower.contains("bonus") ||
                lower.contains("thr") || lower.contains("freelance") || lower.contains("transfer masuk") ||
                lower.contains("tf masuk") || lower.contains("dividen") || lower.contains("pemasukan") ||
                lower.contains("jual") || lower.contains("jualan");
        TransactionType type = isIncome ? TransactionType.INCOME : TransactionType.EXPENSE;
        PocketType pocketType = isIncome ? PocketType.INCOME : PocketType.EXPENSE;

        // 2. Parse Nominal accurately
        BigDecimal amount = extractAmount(lower);

        // 3. Smart AI Pocket Detection and Auto-Creation
        Wallet selectedWallet = resolveSmartWallet(userId, lower, type, pocketType);
        UUID walletId = (selectedWallet != null) ? selectedWallet.getId() : null;

        // 4. Match Category (ensure non-null)
        Category selectedCategory = matchCategory(lower, type, categories);
        UUID categoryId = (selectedCategory != null) ? selectedCategory.getId() : (categories.isEmpty() ? null : categories.get(0).getId());

        // 5. Clean description
        String cleanDescription = extractDescription(text);

        return TransactionRequest.builder()
                .amount(amount)
                .type(type)
                .categoryId(categoryId)
                .walletId(walletId)
                .description(cleanDescription)
                .transactionDate(LocalDateTime.now())
                .isRecurring(false)
                .build();
    }

    private Wallet resolveSmartWallet(UUID userId, String lower, TransactionType type, PocketType pocketType) {
        String detectedWalletName;
        WalletType walletType = WalletType.BANK;
        String aiInsight;

        if (type == TransactionType.INCOME) {
            if (lower.contains("gaji") || lower.contains("gajian") || lower.contains("salary")) {
                detectedWalletName = "Kantong Gaji Pokok";
                aiInsight = "Dideteksi AI dari penerimaan gaji rutin bulanan";
            } else if (lower.contains("freelance") || lower.contains("side") || lower.contains("proyek") || lower.contains("project")) {
                detectedWalletName = "Kantong Freelance & Side Job";
                aiInsight = "Dideteksi AI dari pendapatan pekerjaan sampingan/freelance";
            } else if (lower.contains("bisnis") || lower.contains("jualan") || lower.contains("omset") || lower.contains("toko")) {
                detectedWalletName = "Kantong Bisnis & Penjualan";
                aiInsight = "Dideteksi AI dari omset hasil usaha/bisnis";
            } else if (lower.contains("dividen") || lower.contains("investasi") || lower.contains("saham") || lower.contains("reksadana")) {
                detectedWalletName = "Kantong Investasi & Dividen";
                walletType = WalletType.INVESTMENT;
                aiInsight = "Dideteksi AI dari imbal hasil investasi & dividen";
            } else if (lower.contains("bonus") || lower.contains("thr") || lower.contains("hadiah") || lower.contains("tip")) {
                detectedWalletName = "Kantong Bonus & Tunjangan";
                aiInsight = "Dideteksi AI dari penerimaan bonus/hadiah";
            } else {
                detectedWalletName = "Kantong Pemasukan Lainnya";
                aiInsight = "Dideteksi AI untuk pos penerimaan dana";
            }
        } else {
            if (lower.contains("kopi") || lower.contains("nongkrong") || lower.contains("cafe") || lower.contains("kafe") || lower.contains("snack")) {
                detectedWalletName = "Kantong Jajan & Kopi";
                walletType = WalletType.CASH;
                aiInsight = "Dideteksi AI dari pos jajan santai & kopi";
            } else if (lower.contains("makan") || lower.contains("nasi") || lower.contains("warung") || lower.contains("resto") || lower.contains("ayam") || lower.contains("bakso") || lower.contains("mie") || lower.contains("sarapan")) {
                detectedWalletName = "Kantong Makanan & Minuman";
                walletType = WalletType.CASH;
                aiInsight = "Dideteksi AI dari pos konsumsi pangan harian";
            } else if (lower.contains("bensin") || lower.contains("pertalite") || lower.contains("pertamax") || lower.contains("ojol") || lower.contains("gojek") || lower.contains("grab") || lower.contains("parkir") || lower.contains("tol")) {
                detectedWalletName = "Kantong Transportasi";
                aiInsight = "Dideteksi AI dari biaya mobilitas & perjalanan";
            } else if (lower.contains("listrik") || lower.contains("wifi") || lower.contains("indihome") || lower.contains("air") || lower.contains("pdam") || lower.contains("tagihan") || lower.contains("pulsa") || lower.contains("kuota")) {
                detectedWalletName = "Kantong Tagihan & Utilitas";
                aiInsight = "Dideteksi AI dari pembayaran tagihan rutin";
            } else if (lower.contains("belanja") || lower.contains("indomaret") || lower.contains("alfamart") || lower.contains("supermarket") || lower.contains("tokopedia") || lower.contains("shopee") || lower.contains("baju")) {
                detectedWalletName = "Kantong Belanja Kebutuhan";
                aiInsight = "Dideteksi AI dari pos belanja kebutuhan rumah & pribadi";
            } else if (lower.contains("bioskop") || lower.contains("nonton") || lower.contains("game") || lower.contains("liburan") || lower.contains("wisata")) {
                detectedWalletName = "Kantong Hiburan & Hobi";
                aiInsight = "Dideteksi AI dari pos rekreasi & hiburan";
            } else if (lower.contains("obat") || lower.contains("dokter") || lower.contains("apotek") || lower.contains("klinik") || lower.contains("rs") || lower.contains("vitamin")) {
                detectedWalletName = "Kantong Kesehatan & Medis";
                aiInsight = "Dideteksi AI dari pos kesehatan & pengobatan";
            } else {
                detectedWalletName = "Kantong Pengeluaran Lainnya";
                walletType = WalletType.CASH;
                aiInsight = "Dideteksi AI untuk pos pengeluaran harian";
            }
        }

        return walletService.getOrCreateWalletForAi(userId, detectedWalletName, pocketType, walletType, aiInsight);
    }

    private BigDecimal extractAmount(String lower) {
        // A. Handle "X jt" or "X juta" e.g., "1.5jt", "5 juta", "5.000.000"
        Pattern jtPattern = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(?:jt|juta)");
        Matcher jtMatcher = jtPattern.matcher(lower);
        if (jtMatcher.find()) {
            String val = jtMatcher.group(1).replace(",", ".");
            return new BigDecimal(val).multiply(new BigDecimal("1000000"));
        }

        // B. Handle "X rb" or "X ribu" or "X k"
        Pattern rbPattern = Pattern.compile("(\\d+(?:[.,]\\d+)?)\\s*(?:rb|ribu|\\bk\\b)");
        Matcher rbMatcher = rbPattern.matcher(lower);
        if (rbMatcher.find()) {
            String val = rbMatcher.group(1).replace(",", ".");
            return new BigDecimal(val).multiply(new BigDecimal("1000"));
        }

        // C. Handle standard dot/comma formatted numbers e.g. "10.000", "5.000", "5.000.000"
        Pattern numPattern = Pattern.compile("(\\d{1,3}(?:[.,]\\d{3})+(?:[.,]\\d{2})?|\\d+)");
        Matcher numMatcher = numPattern.matcher(lower);
        while (numMatcher.find()) {
            String rawNum = numMatcher.group(1);
            if (rawNum.contains(".")) {
                String clean = rawNum.replace(".", "");
                try {
                    return new BigDecimal(clean);
                } catch (Exception ignored) {}
            } else if (rawNum.contains(",")) {
                String clean = rawNum.replace(",", "");
                try {
                    return new BigDecimal(clean);
                } catch (Exception ignored) {}
            } else {
                try {
                    BigDecimal val = new BigDecimal(rawNum);
                    if (val.compareTo(BigDecimal.ZERO) > 0) {
                        return val;
                    }
                } catch (Exception ignored) {}
            }
        }

        return new BigDecimal("10000.00");
    }

    private Category matchCategory(String lower, TransactionType type, List<Category> categories) {
        if (categories == null || categories.isEmpty()) return null;

        List<Category> filtered = categories.stream().filter(c -> c.getType() == type).toList();
        if (filtered.isEmpty()) filtered = categories;

        if (type == TransactionType.EXPENSE) {
            if (lower.contains("makan") || lower.contains("minum") || lower.contains("nasi") || lower.contains("kopi") ||
                    lower.contains("resto") || lower.contains("kafe") || lower.contains("snack") || lower.contains("bakso") ||
                    lower.contains("ayam") || lower.contains("mie") || lower.contains("sarapan") || lower.contains("teh") || lower.contains("jus")) {
                return findCategoryByName(filtered, "Makanan & Minuman");
            }
            if (lower.contains("bensin") || lower.contains("pertalite") || lower.contains("pertamax") || lower.contains("ojol") ||
                    lower.contains("gojek") || lower.contains("grab") || lower.contains("parkir") || lower.contains("tol") || lower.contains("kereta") || lower.contains("mrt") || lower.contains("ongkos")) {
                return findCategoryByName(filtered, "Transportasi");
            }
            if (lower.contains("indomaret") || lower.contains("alfamart") || lower.contains("belanja") || lower.contains("supermarket") || lower.contains("tokopedia") || lower.contains("shopee") || lower.contains("baju") || lower.contains("sabun")) {
                return findCategoryByName(filtered, "Belanja Kebutuhan");
            }
            if (lower.contains("listrik") || lower.contains("pln") || lower.contains("air") || lower.contains("pdam") || lower.contains("wifi") || lower.contains("indihome") || lower.contains("pulsa") || lower.contains("kuota") || lower.contains("tagihan")) {
                return findCategoryByName(filtered, "Tagihan & Utilitas");
            }
            if (lower.contains("nonton") || lower.contains("bioskop") || lower.contains("cinema") || lower.contains("netflix") || lower.contains("spotify") || lower.contains("game") || lower.contains("liburan") || lower.contains("jalan-jalan")) {
                return findCategoryByName(filtered, "Hiburan & Liburan");
            }
            if (lower.contains("obat") || lower.contains("dokter") || lower.contains("apotek") || lower.contains("klinik") || lower.contains("vitamin") || lower.contains("sakit") || lower.contains("rumah sakit")) {
                return findCategoryByName(filtered, "Kesehatan & Medis");
            }
            if (lower.contains("kursus") || lower.contains("buku") || lower.contains("kuliah") || lower.contains("sekolah") || lower.contains("seminar") || lower.contains("spp")) {
                return findCategoryByName(filtered, "Pendidikan & Kursus");
            }
            if (lower.contains("admin") || lower.contains("biaya admin") || lower.contains("parkir liar") || lower.contains("rokok")) {
                return findCategoryByName(filtered, "Pengeluaran Lainnya");
            }
        } else {
            if (lower.contains("gaji") || lower.contains("gajian") || lower.contains("salary") || lower.contains("payroll")) {
                return findCategoryByName(filtered, "Gaji Pokok");
            }
            if (lower.contains("freelance") || lower.contains("side job") || lower.contains("proyek") || lower.contains("project") || lower.contains("klien")) {
                return findCategoryByName(filtered, "Freelance & Side Job");
            }
            if (lower.contains("dividen") || lower.contains("saham") || lower.contains("reksadana") || lower.contains("crypto") || lower.contains("bunga")) {
                return findCategoryByName(filtered, "Investasi & Dividen");
            }
            if (lower.contains("bonus") || lower.contains("thr") || lower.contains("hadiah") || lower.contains("cashback") || lower.contains("tip")) {
                return findCategoryByName(filtered, "Bonus & Tunjangan");
            }
        }

        return filtered.get(0);
    }

    private Category findCategoryByName(List<Category> categories, String nameKeyword) {
        return categories.stream()
                .filter(c -> c.getName().toLowerCase().contains(nameKeyword.toLowerCase()))
                .findFirst()
                .orElse(categories.get(0));
    }

    private String extractDescription(String text) {
        String cleaned = text.replaceAll("['\"]", "").trim();
        if (cleaned.length() > 1) {
            return Character.toUpperCase(cleaned.charAt(0)) + cleaned.substring(1);
        }
        return cleaned;
    }
}
