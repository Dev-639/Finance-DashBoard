package com.zorvyn.finance.controller;

import com.zorvyn.finance.model.TransactionType;
import com.zorvyn.finance.model.User;
import com.zorvyn.finance.model.dto.RecordRequest;
import com.zorvyn.finance.model.dto.RecordResponse;
import com.zorvyn.finance.service.FinancialRecordService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;


@RestController
@RequestMapping("/api/records")
@RequiredArgsConstructor
public class FinancialRecordController {

    private final FinancialRecordService recordService;

    @GetMapping
    public ResponseEntity<Page<RecordResponse>> getRecords(
            @RequestParam(value = "type", required = false) TransactionType type,
            @RequestParam(value = "category", required = false) String category,
            @RequestParam(value = "startDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate startDate,
            @RequestParam(value = "endDate", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate endDate,
            @RequestParam(value = "search", required = false) String search,
            @RequestParam(value = "page", defaultValue = "0") int page,
            @RequestParam(value = "size", defaultValue = "10") int size
    ) {
        Page<RecordResponse> records = recordService.getRecords(
                type, category, startDate, endDate, search,
                PageRequest.of(page, size, Sort.by("date").descending())
        );
        return ResponseEntity.ok(records);
    }

    @GetMapping("/{id}")
    public ResponseEntity<RecordResponse> getRecordById(@PathVariable("id") Long id) {
        return ResponseEntity.ok(recordService.getRecordById(id));
    }

    @PostMapping
    public ResponseEntity<RecordResponse> createRecord(
            @Valid @RequestBody RecordRequest request,
            @AuthenticationPrincipal User currentUser
    ) {
        RecordResponse response = recordService.createRecord(request, currentUser);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PutMapping("/{id}")
    public ResponseEntity<RecordResponse> updateRecord(
            @PathVariable("id") Long id,
            @Valid @RequestBody RecordRequest request
    ) {
        return ResponseEntity.ok(recordService.updateRecord(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteRecord(@PathVariable("id") Long id) {
        recordService.deleteRecord(id);
        return ResponseEntity.noContent().build();
    }
}
