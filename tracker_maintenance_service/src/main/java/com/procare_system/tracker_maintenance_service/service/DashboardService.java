package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.response.DashboardResponse;
import com.procare_system.tracker_maintenance_service.dto.response.DeviceDefectStats;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import com.procare_system.tracker_maintenance_service.repository.TicketRepository;
import com.procare_system.tracker_maintenance_service.repository.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DashboardService {

    private final TicketRepository ticketRepository;
    private final DeviceRepository deviceRepository; // Bơm thêm thằng này vào

    @PreAuthorize("hasAuthority('DASHBOARD_READ')")
    public DashboardResponse getDashboardSummary(LocalDateTime startDate, LocalDateTime endDate) {

        // 1. Thống kê Ticket
        List<Object[]> statusCounts = ticketRepository.countTicketsByStatus(startDate, endDate);
        Map<TicketStatus, Long> ticketsByStatus = statusCounts.stream()
                .collect(Collectors.toMap(
                        obj -> (TicketStatus) obj[0],
                        obj -> (Long) obj[1]
                ));
        for (TicketStatus status : TicketStatus.values()) {
            ticketsByStatus.putIfAbsent(status, 0L);
        }

        // 2. Thống kê Thiết bị theo trạng thái (AVAILABLE, IN_MAINTENANCE...) [MỚI]
        List<Object[]> deviceCounts = deviceRepository.countDevicesByStatus();
        Map<DeviceStatus, Long> devicesByStatus = deviceCounts.stream()
                .collect(Collectors.toMap(
                        obj -> (DeviceStatus) obj[0],
                        obj -> (Long) obj[1]
                ));
        for (DeviceStatus status : DeviceStatus.values()) {
            devicesByStatus.putIfAbsent(status, 0L);
        }

        // 3. Thống kê Thiết bị hỏng nhiều nhất (Top 5)
        List<Object[]> topDevices = ticketRepository.findTopDefectiveDevices(PageRequest.of(0, 5));
        List<DeviceDefectStats> defectiveDevices = topDevices.stream()
                .map(obj -> new DeviceDefectStats((String) obj[0], (Long) obj[1]))
                .toList();

        // 4. Thời gian xử lý trung bình
        Double avgProcessingTime = ticketRepository.getAverageProcessingTimeInHours(startDate, endDate);
        if (avgProcessingTime == null) {
            avgProcessingTime = 0.0;
        }

        // 👇 5. Đếm số lượng ticket vi phạm SLA (Quá hạn)
        long overdueCount = ticketRepository.countByIsOverdueTrueAndIsDeletedFalse();


        return DashboardResponse.builder()
                .ticketsByStatus(ticketsByStatus)
                .devicesByStatus(devicesByStatus)
                .topDefectiveDevices(defectiveDevices)
                .averageProcessingTimeHours(Math.round(avgProcessingTime * 100.0) / 100.0)
                .overdueTicketsCount(overdueCount)
                .build();
    }
}