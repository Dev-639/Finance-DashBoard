package com.zorvyn.finance.repository;

import com.zorvyn.finance.model.FinancialRecord;
import com.zorvyn.finance.model.TransactionType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialRecordRepository extends JpaRepository<FinancialRecord, Long> {

    
    @Query(value = "SELECT * FROM financial_records r WHERE r.deleted = false " +
           "AND (CAST(:type AS text) IS NULL OR r.type = CAST(:type AS text)) " +
           "AND (CAST(:category AS text) IS NULL OR r.category = :category) " +
           "AND (CAST(:startDate AS date) IS NULL OR r.date >= CAST(:startDate AS date)) " +
           "AND (CAST(:endDate AS date) IS NULL OR r.date <= CAST(:endDate AS date)) " +
           "AND (CAST(:search AS text) IS NULL OR LOWER(r.notes) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) " +
           "     OR LOWER(r.category) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%'))) " +
           "ORDER BY r.date DESC",
           countQuery = "SELECT COUNT(*) FROM financial_records r WHERE r.deleted = false " +
           "AND (CAST(:type AS text) IS NULL OR r.type = CAST(:type AS text)) " +
           "AND (CAST(:category AS text) IS NULL OR r.category = :category) " +
           "AND (CAST(:startDate AS date) IS NULL OR r.date >= CAST(:startDate AS date)) " +
           "AND (CAST(:endDate AS date) IS NULL OR r.date <= CAST(:endDate AS date)) " +
           "AND (CAST(:search AS text) IS NULL OR LOWER(r.notes) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')) " +
           "     OR LOWER(r.category) LIKE LOWER(CONCAT('%', CAST(:search AS text), '%')))",
           nativeQuery = true)
    Page<FinancialRecord> findAllWithFilters(
            @Param("type") String type,
            @Param("category") String category,
            @Param("startDate") LocalDate startDate,
            @Param("endDate") LocalDate endDate,
            @Param("search") String search,
            Pageable pageable);

    Optional<FinancialRecord> findByIdAndDeletedFalse(Long id);

    

    @Query("SELECT COALESCE(SUM(r.amount), 0) FROM FinancialRecord r " +
           "WHERE r.deleted = false AND r.type = :type")
    BigDecimal sumByType(@Param("type") TransactionType type);

    @Query("SELECT COUNT(r) FROM FinancialRecord r WHERE r.deleted = false")
    long countActive();

    @Query("SELECT r.category, SUM(r.amount), COUNT(r) FROM FinancialRecord r " +
           "WHERE r.deleted = false AND r.type = :type " +
           "GROUP BY r.category ORDER BY SUM(r.amount) DESC")
    List<Object[]> getCategorySummary(@Param("type") TransactionType type);

    @Query("SELECT FUNCTION('TO_CHAR', r.date, 'YYYY-MM'), r.type, SUM(r.amount) " +
           "FROM FinancialRecord r WHERE r.deleted = false " +
           "AND r.date >= :since " +
           "GROUP BY FUNCTION('TO_CHAR', r.date, 'YYYY-MM'), r.type " +
           "ORDER BY FUNCTION('TO_CHAR', r.date, 'YYYY-MM')")
    List<Object[]> getMonthlyTrends(@Param("since") LocalDate since);

    @Query("SELECT r FROM FinancialRecord r WHERE r.deleted = false ORDER BY r.createdAt DESC")
    List<FinancialRecord> findRecentRecords(Pageable pageable);
}
