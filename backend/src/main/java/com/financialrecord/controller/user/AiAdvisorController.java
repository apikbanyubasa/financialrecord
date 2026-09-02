package com.financialrecord.controller.user;

import com.financialrecord.dto.request.NlpEntryRequest;
import com.financialrecord.dto.request.TransactionRequest;
import com.financialrecord.dto.response.ApiResponse;
import com.financialrecord.security.UserPrincipal;
import com.financialrecord.service.ai.AiNlpEntryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/user/ai")
@RequiredArgsConstructor
@Tag(name = "AI Multi-Item NLP Entry", description = "Endpoints untuk Ekstraksi Cepat Transaksi Multi-Item Berbasis Natural Language Processing")
public class AiAdvisorController {

    private final AiNlpEntryService nlpEntryService;

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
    public ResponseEntity<ApiResponse<List<TransactionRequest>>> parseNlpBatch(
            @AuthenticationPrincipal UserPrincipal principal,
            @Valid @RequestBody NlpEntryRequest request
    ) {
        List<TransactionRequest> response = nlpEntryService.parseNaturalLanguageTransactions(principal.getId(), request.getText());
        return ResponseEntity.ok(ApiResponse.ok("Berhasil menganalisis " + response.size() + " transaksi dengan AI", response));
    }
}
