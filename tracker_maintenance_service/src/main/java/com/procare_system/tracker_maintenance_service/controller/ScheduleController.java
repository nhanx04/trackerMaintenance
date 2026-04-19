package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.CreateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.ScheduleResponse;
import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import com.procare_system.tracker_maintenance_service.service.ScheduleService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/api/schedules")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleController {

    ScheduleService scheduleService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<ScheduleResponse> create(@Valid @RequestBody CreateScheduleRequest request) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.createSchedule(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<ScheduleResponse> getById(@PathVariable String id) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.getScheduleById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<ScheduleResponse>> getAll(
            @RequestParam(required = false) String deviceId,
            @RequestParam(required = false) ScheduleStatus status,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<ScheduleResponse>>builder()
                .result(scheduleService.getSchedules(deviceId, status, from, to, page, size))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<ScheduleResponse> update(
            @PathVariable String id,
            @RequestBody UpdateScheduleRequest request
    ) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.updateSchedule(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<Void> delete(@PathVariable String id) {
        scheduleService.deleteSchedule(id);
        return ApiResponse.<Void>builder().build();
    }


    @PatchMapping("/{id}/cancel")
    public ApiResponse<ScheduleResponse> cancel(@PathVariable String id) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.cancelSchedule(id))
                .build();
    }

    @PatchMapping("/{id}/start")
    public ApiResponse<ScheduleResponse> start(@PathVariable String id) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.startSchedule(id))
                .build();
    }

    @PatchMapping("/{id}/complete")
    public ApiResponse<ScheduleResponse> complete(@PathVariable String id) {
        return ApiResponse.<ScheduleResponse>builder()
                .result(scheduleService.completeSchedule(id))
                .build();
    }
}