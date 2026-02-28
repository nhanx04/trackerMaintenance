package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.request.CreateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.response.DeviceResponse;
import com.procare_system.tracker_maintenance_service.entity.Device;
import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import org.springframework.stereotype.Service;

@Service
public class DeviceMapper {

    public Device toDevice(CreateDeviceRequest request) {
        return Device.builder()
                .code(request.getCode())
                .name(request.getName())
                .description(request.getDescription())
                .location(request.getLocation())
                .imageUrl(request.getImageUrl())
                .status(request.getStatus() != null ? request.getStatus() : DeviceStatus.AVAILABLE)
                .isDeleted(false)
                .build();
    }

    // Hàm update nhận vào UpdateDeviceRequest
    public void updateDevice(UpdateDeviceRequest request, Device device) {
        // Không hề đụng đến field 'code' của entity -> An toàn tuyệt đối
        if (request.getName() != null) device.setName(request.getName());
        if (request.getDescription() != null) device.setDescription(request.getDescription());
        if (request.getLocation() != null) device.setLocation(request.getLocation());
        if (request.getStatus() != null) device.setStatus(request.getStatus());
        if (request.getImageUrl() != null) device.setImageUrl(request.getImageUrl());
    }

    public DeviceResponse toDeviceResponse(Device device) {
        return DeviceResponse.builder()
                .id(device.getId())
                .code(device.getCode())
                .name(device.getName())
                .description(device.getDescription())
                .location(device.getLocation())
                .status(device.getStatus())
                .imageUrl(device.getImageUrl())
                .build();
    }

}