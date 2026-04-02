package com.zorvyn.finance.controller;

import com.zorvyn.finance.model.TransactionType;
import com.zorvyn.finance.model.dto.CategorySummary;
import com.zorvyn.finance.model.dto.DashboardSummaryResponse;
import com.zorvyn.finance.model.dto.RecordResponse;
import com.zorvyn.finance.model.dto.TrendData;
import com.zorvyn.finance.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;


@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ResponseEntity<DashboardSummaryResponse> getSummary() {
        return ResponseEntity.ok(dashboardService.getSummary());
    }

    @GetMapping("/category-summary")
    public ResponseEntity<List<CategorySummary>> getCategorySummary(
            @RequestParam(value = "type", defaultValue = "EXPENSE") TransactionType type
    ) {
        return ResponseEntity.ok(dashboardService.getCategorySummary(type));
    }

    @GetMapping("/trends")
    public ResponseEntity<List<TrendData>> getMonthlyTrends() {
        return ResponseEntity.ok(dashboardService.getMonthlyTrends());
    }

    @GetMapping("/recent")
    public ResponseEntity<List<RecordResponse>> getRecentActivity(
            @RequestParam(value = "limit", defaultValue = "10") int limit
    ) {
        return ResponseEntity.ok(dashboardService.getRecentActivity(limit));
    }
}
