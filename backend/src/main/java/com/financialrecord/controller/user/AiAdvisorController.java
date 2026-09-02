package com.financialrecord.controller.user;

import com.financialrecord.dto.request.AiPromptRequest;
import com.financialrecord.dto.request.NlpEntryRequest;
import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.dto.response.AiInsightResponse;
import com.financialrecord.dto.response.AiScanReceiptResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.ai.AiAdvisorService;
import com.financialrecord.service.ai.AiNlpEntryService;
import com.financialrecord.service.ai.AiReceiptScannerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/user/ai")
@RequiredArgsConstructor
@Tag(name = "AI Financial Intelligence", description = "Endpoints untuk OCR Struk Belanja, NLP Entry, & AI Advisor Chat")
public class AiAdvisorController {

    private final AiReceiptScannerService receiptScannerService;
    private final AiAdvisorService advisorService;
    private final AiNlpEntryService nlpEntryService;

    @PostMapping(value = "/scan-receipt", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @Operation(summary = "Scan Struk Belanja / Bukti Transfer (Vision OCR)", description = "Upload file gambar struk -> AI mengekstrak nominal, toko, tanggal, dan item belanja secara otomatis")
    public ResponseEntity<ApiResponse<AiScanReceiptResponse>> scanReceipt(
            @AuthenticationPrincipal UserPrincipal principal,
            @RequestParam("file") MultipartFile file
    ) {
        AiScanReceiptResponse response = receiptScannerService.scanReceipt(principal.getId(), file);
        return ResponseEntity.ok(ApiResponse.ok("Struk berhasil dipindai oleh AI", response));
    }

    @PostMapping("/nlp-entry")
    @Operation(summary = "Natural Language Transaction Entry", description = "Ketik transaksi santai -> AI mengubahnya menjadi format transaksi terstruktur")
    public ResponseEntity<ApiResponse<TransactionRequest>> parseNlpEntry(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NlpEntryRequest request
    ) {
        TransactionRequest response = nlpEntryService.parseNaturalLanguageTransaction(principal.getId(), request.getText());
        return ResponseEntity.ok(ApiResponse.ok("Teks transaksi berhasil diproses oleh AI", response));
    }

    @PostMapping("/nlp-batch")
    @Operation(summary = "Multi-Transaction Natural Language Entry", description = "Ketik beberapa transaksi sekaligus -> AI membedah dan mengelompokkan semuanya menjadi daftar transaksi")
    public ResponseEntity<ApiResponse<java.util.List<TransactionRequest>>> parseNlpBatch(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NlpEntryRequest request
    ) {
        java.util.List<TransactionRequest> response = nlpEntryService.parseNaturalLanguageTransactions(principal.getId(), request.getText());
        return ResponseEntity.ok(ApiResponse.ok("Berhasil menganalisis " + response.size() + " transaksi dengan AI", response));
    }

    @GetMapping("/insights")
    @Operation(summary = "Laporan Analisis Kesehatan Finansial AI", description = "Menghasilkan evaluasi kesehatan finansial (skor 1-100) dan rekomendasi aksi")
    public ResponseEntity<ApiResponse<AiInsightResponse>> getFinancialInsights(@AuthenticationPrincipal UserPrincipal principal) {
        AiInsightResponse response = advisorService.generateFinancialInsight(principal.getId());
        return ResponseEntity.ok(ApiResponse.ok(response));
    }

    @PostMapping("/chat")
    @Operation(summary = "Chat Interaktif dengan AI Financial Advisor", description = "Tanya jawab langsung dengan asisten keuangan AI seputar cashflow dan tips berhemat")
    public ResponseEntity<ApiResponse<Map<String, String>>> chatWithAdvisor(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody AiPromptRequest request
    ) {
        String reply = advisorService.chatWithAdvisor(principal.getId(), request.getPrompt());
        return ResponseEntity.ok(ApiResponse.ok(Map.of("reply", reply)));
    }
}
