package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.CreateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.DeviceResponse;
import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import com.procare_system.tracker_maintenance_service.service.DeviceService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceController {
    private final DeviceService deviceService;

    @PostMapping
    public ApiResponse<DeviceResponse> createDevice(@RequestBody @Valid CreateDeviceRequest request) {
        return ApiResponse.<DeviceResponse>builder()
                .result(deviceService.createDevice(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<DeviceResponse> getDeviceById(@PathVariable String id) {
        return ApiResponse.<DeviceResponse>builder()
                .result(deviceService.getDeviceById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<DeviceResponse>> getDevices(
            @RequestParam(required = false) String name,
            @RequestParam(required = false) DeviceStatus status,
            @RequestParam(required = false) String location,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<DeviceResponse>>builder()
                .result(deviceService.getDevices(name, status, location, page, size))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<DeviceResponse> updateDevice(
            @PathVariable String id,
            @RequestBody @Valid UpdateDeviceRequest request) {
        return ApiResponse.<DeviceResponse>builder()
                .result(deviceService.updateDevice(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteDevice(@PathVariable String id) {
        deviceService.deleteDevice(id);
        return ApiResponse.<String>builder()
                .result("Device has been deleted successfully")
                .build();
    }
}