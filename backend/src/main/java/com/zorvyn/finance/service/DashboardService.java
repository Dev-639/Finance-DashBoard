package com.zorvyn.finance.service;

import com.zorvyn.finance.model.TransactionType;
import com.zorvyn.finance.model.dto.CategorySummary;
import com.zorvyn.finance.model.dto.DashboardSummaryResponse;
import com.zorvyn.finance.model.dto.RecordResponse;
import com.zorvyn.finance.model.dto.TrendData;
import com.zorvyn.finance.repository.FinancialRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.*;
import java.util.stream.Collectors;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class DashboardService {

    private final FinancialRecordRepository recordRepository;

    
    public DashboardSummaryResponse getSummary() {
        BigDecimal totalIncome = recordRepository.sumByType(TransactionType.INCOME);
        BigDecimal totalExpenses = recordRepository.sumByType(TransactionType.EXPENSE);
        BigDecimal netBalance = totalIncome.subtract(totalExpenses);
        long totalRecords = recordRepository.countActive();

        return DashboardSummaryResponse.builder()
                .totalIncome(totalIncome)
                .totalExpenses(totalExpenses)
                .netBalance(netBalance)
                .totalRecords(totalRecords)
                .build();
    }

    
    public List<CategorySummary> getCategorySummary(TransactionType type) {
        return recordRepository.getCategorySummary(type).stream()
                .map(row -> CategorySummary.builder()
                        .category((String) row[0])
                        .totalAmount((BigDecimal) row[1])
                        .count((Long) row[2])
                        .build())
                .collect(Collectors.toList());
    }

    
    public List<TrendData> getMonthlyTrends() {
        LocalDate since = LocalDate.now().minusMonths(12);
        List<Object[]> rawData = recordRepository.getMonthlyTrends(since);

        
        Map<String, TrendData> trendMap = new LinkedHashMap<>();
        for (Object[] row : rawData) {
            String period = (String) row[0];
            TransactionType type = (TransactionType) row[1];
            BigDecimal amount = (BigDecimal) row[2];

            trendMap.computeIfAbsent(period, p -> TrendData.builder()
                    .period(p)
                    .income(BigDecimal.ZERO)
                    .expenses(BigDecimal.ZERO)
                    .net(BigDecimal.ZERO)
                    .build());

            TrendData trend = trendMap.get(period);
            if (type == TransactionType.INCOME) {
                trend.setIncome(amount);
            } else {
                trend.setExpenses(amount);
            }
            trend.setNet(trend.getIncome().subtract(trend.getExpenses()));
        }

        return new ArrayList<>(trendMap.values());
    }

    
    public List<RecordResponse> getRecentActivity(int limit) {
        return recordRepository.findRecentRecords(PageRequest.of(0, limit)).stream()
                .map(record -> RecordResponse.builder()
                        .id(record.getId())
                        .amount(record.getAmount())
                        .type(record.getType())
                        .category(record.getCategory())
                        .date(record.getDate())
                        .notes(record.getNotes())
                        .createdByUsername(record.getCreatedBy().getUsername())
                        .createdAt(record.getCreatedAt())
                        .build())
                .collect(Collectors.toList());
    }
}
