package com.zorvyn.finance.model.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TrendData {
    private String period;       
    private BigDecimal income;
    private BigDecimal expenses;
    private BigDecimal net;
}
