package com.procare_system.tracker_maintenance_service.dto.response;

import lombok.AllArgsConstructor;
import lombok.Data;

@Data
@AllArgsConstructor
public  class DeviceDefectStats {
    private String deviceId;
    private Long failureCount;
}