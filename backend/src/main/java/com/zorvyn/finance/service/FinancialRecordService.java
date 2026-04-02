package com.zorvyn.finance.service;

import com.zorvyn.finance.model.FinancialRecord;
import com.zorvyn.finance.model.TransactionType;
import com.zorvyn.finance.model.User;
import com.zorvyn.finance.model.dto.RecordRequest;
import com.zorvyn.finance.model.dto.RecordResponse;
import com.zorvyn.finance.repository.FinancialRecordRepository;
import jakarta.persistence.EntityNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;


@Service
@RequiredArgsConstructor
@Transactional(readOnly = true)
public class FinancialRecordService {

    private final FinancialRecordRepository recordRepository;

    public Page<RecordResponse> getRecords(
            TransactionType type,
            String category,
            LocalDate startDate,
            LocalDate endDate,
            String search,
            Pageable pageable
    ) {
        String typeStr = type != null ? type.name() : null;
        return recordRepository.findAllWithFilters(typeStr, category, startDate, endDate, search, pageable)
                .map(this::toResponse);
    }

    public RecordResponse getRecordById(Long id) {
        FinancialRecord record = findRecordOrThrow(id);
        return toResponse(record);
    }

    @Transactional
    public RecordResponse createRecord(RecordRequest request, User createdBy) {
        FinancialRecord record = FinancialRecord.builder()
                .amount(request.getAmount())
                .type(request.getType())
                .category(request.getCategory())
                .date(request.getDate())
                .notes(request.getNotes())
                .createdBy(createdBy)
                .build();

        record = recordRepository.save(record);
        return toResponse(record);
    }

    @Transactional
    public RecordResponse updateRecord(Long id, RecordRequest request) {
        FinancialRecord record = findRecordOrThrow(id);
        record.setAmount(request.getAmount());
        record.setType(request.getType());
        record.setCategory(request.getCategory());
        record.setDate(request.getDate());
        record.setNotes(request.getNotes());

        record = recordRepository.save(record);
        return toResponse(record);
    }

    @Transactional
    public void deleteRecord(Long id) {
        FinancialRecord record = findRecordOrThrow(id);
        record.setDeleted(true);
        recordRepository.save(record);
    }

    

    private FinancialRecord findRecordOrThrow(Long id) {
        return recordRepository.findByIdAndDeletedFalse(id)
                .orElseThrow(() -> new EntityNotFoundException("Financial record not found with id: " + id));
    }

    private RecordResponse toResponse(FinancialRecord record) {
        return RecordResponse.builder()
                .id(record.getId())
                .amount(record.getAmount())
                .type(record.getType())
                .category(record.getCategory())
                .date(record.getDate())
                .notes(record.getNotes())
                .createdByUsername(record.getCreatedBy().getUsername())
                .createdAt(record.getCreatedAt())
                .updatedAt(record.getUpdatedAt())
                .build();
    }
}
