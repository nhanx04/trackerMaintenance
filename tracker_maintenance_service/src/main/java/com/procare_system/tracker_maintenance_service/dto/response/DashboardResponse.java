package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import lombok.*;
import java.util.Map;
import java.util.List;

@Data
@Builder
public class DashboardResponse {

    private Map<TicketStatus, Long> ticketsByStatus;

    private Map<DeviceStatus, Long> devicesByStatus;

    private List<DeviceDefectStats> topDefectiveDevices;

    private Double averageProcessingTimeHours;
}

