package com.zorvyn.finance.config;

import com.zorvyn.finance.model.FinancialRecord;
import com.zorvyn.finance.model.Role;
import com.zorvyn.finance.model.TransactionType;
import com.zorvyn.finance.model.User;
import com.zorvyn.finance.repository.FinancialRecordRepository;
import com.zorvyn.finance.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;


@Component
@RequiredArgsConstructor
@Slf4j
public class DataSeeder implements CommandLineRunner {

    private final UserRepository userRepository;
    private final FinancialRecordRepository recordRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    @Transactional
    public void run(String... args) {
        if (userRepository.count() > 0) {
            log.info("Database already seeded. Skipping...");
            return;
        }

        log.info("Seeding database with initial data...");

        
        User admin = userRepository.save(User.builder()
                .username("admin")
                .email("admin@zorvyn.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ADMIN)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username("analyst")
                .email("analyst@zorvyn.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.ANALYST)
                .active(true)
                .build());

        userRepository.save(User.builder()
                .username("viewer")
                .email("viewer@zorvyn.com")
                .password(passwordEncoder.encode("password123"))
                .role(Role.VIEWER)
                .active(true)
                .build());

        
        List<FinancialRecord> records = List.of(
                FinancialRecord.builder().amount(new BigDecimal("5000.00")).type(TransactionType.INCOME)
                        .category("Salary").date(LocalDate.of(2026, 1, 1)).notes("January salary").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("5000.00")).type(TransactionType.INCOME)
                        .category("Salary").date(LocalDate.of(2026, 2, 1)).notes("February salary").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("5000.00")).type(TransactionType.INCOME)
                        .category("Salary").date(LocalDate.of(2026, 3, 1)).notes("March salary").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("1200.00")).type(TransactionType.EXPENSE)
                        .category("Rent").date(LocalDate.of(2026, 1, 5)).notes("Office rent January").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("1200.00")).type(TransactionType.EXPENSE)
                        .category("Rent").date(LocalDate.of(2026, 2, 5)).notes("Office rent February").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("1200.00")).type(TransactionType.EXPENSE)
                        .category("Rent").date(LocalDate.of(2026, 3, 5)).notes("Office rent March").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("350.00")).type(TransactionType.EXPENSE)
                        .category("Utilities").date(LocalDate.of(2026, 1, 15)).notes("Electricity and internet").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("200.00")).type(TransactionType.EXPENSE)
                        .category("Marketing").date(LocalDate.of(2026, 1, 20)).notes("Google Ads campaign").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("2500.00")).type(TransactionType.INCOME)
                        .category("Freelance").date(LocalDate.of(2026, 2, 10)).notes("Consulting project").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("150.00")).type(TransactionType.EXPENSE)
                        .category("Office Supplies").date(LocalDate.of(2026, 2, 12)).notes("Stationery and equipment").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("800.00")).type(TransactionType.INCOME)
                        .category("Investment").date(LocalDate.of(2026, 3, 1)).notes("Dividend income").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("450.00")).type(TransactionType.EXPENSE)
                        .category("Travel").date(LocalDate.of(2026, 3, 10)).notes("Client meeting travel").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("600.00")).type(TransactionType.EXPENSE)
                        .category("Software").date(LocalDate.of(2026, 3, 15)).notes("Annual SaaS subscriptions").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("3000.00")).type(TransactionType.INCOME)
                        .category("Freelance").date(LocalDate.of(2026, 3, 20)).notes("Web development project").createdBy(admin).build(),
                FinancialRecord.builder().amount(new BigDecimal("175.00")).type(TransactionType.EXPENSE)
                        .category("Utilities").date(LocalDate.of(2026, 3, 25)).notes("Phone and internet bill").createdBy(admin).build()
        );
        recordRepository.saveAll(records);

        log.info("Seeded {} users and {} financial records.", 3, records.size());
    }
}
