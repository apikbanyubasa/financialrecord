package com.financialrecord.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.financialrecord.entity.enums.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CategoryResponse {

    private UUID id;
    private String name;
    private TransactionType type;
    private String icon;
    private String color;

    @JsonProperty("isSystemDefault")
    private boolean isSystemDefault;

    private LocalDateTime createdAt;

    @JsonProperty("isSystemDefault")
    public boolean isSystemDefault() {
        return isSystemDefault;
    }

    @JsonProperty("isSystemDefault")
    public void setSystemDefault(boolean systemDefault) {
        this.isSystemDefault = systemDefault;
    }
}
