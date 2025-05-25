package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.math.BigDecimal;
import java.util.Map;

public class SummaryCountAmountDto {
    private Map<String, Long> counts;
    private Map<String, BigDecimal> amounts;

    public SummaryCountAmountDto(Map<String, Long> counts, Map<String, BigDecimal> amounts) {
        this.counts = counts;
        this.amounts = amounts;
    }

    public Map<String, Long> getCounts() {
        return counts;
    }

    public void setCounts(Map<String, Long> counts) {
        this.counts = counts;
    }

    public Map<String, BigDecimal> getAmounts() {
        return amounts;
    }

    public void setAmounts(Map<String, BigDecimal> amounts) {
        this.amounts = amounts;
    }
} 