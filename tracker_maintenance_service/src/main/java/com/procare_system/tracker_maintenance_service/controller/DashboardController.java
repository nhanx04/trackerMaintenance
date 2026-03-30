package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.DashboardResponse;
import com.procare_system.tracker_maintenance_service.service.DashboardService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/dashboard")
@RequiredArgsConstructor
public class DashboardController {

    private final DashboardService dashboardService;

    @GetMapping("/summary")
    public ApiResponse<DashboardResponse> getDashboardSummary(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate
    ) {
        return ApiResponse.<DashboardResponse>builder()
                .result(dashboardService.getDashboardSummary(startDate, endDate))
                .build();
    }
}