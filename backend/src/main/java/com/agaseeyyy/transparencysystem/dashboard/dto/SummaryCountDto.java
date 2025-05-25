package com.agaseeyyy.transparencysystem.dashboard.dto;

import java.util.Map;

public class SummaryCountDto {
    private Map<String, Long> counts;

    public SummaryCountDto(Map<String, Long> counts) {
        this.counts = counts;
    }

    public Map<String, Long> getCounts() {
        return counts;
    }

    public void setCounts(Map<String, Long> counts) {
        this.counts = counts;
    }
} 