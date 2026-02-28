package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateDeviceRequest {
    @NotBlank(message = ErrorCode.Key.DEVICE_NAME_REQUIRED)
    String name;
    String description;
    String location;
    String imageUrl;
    DeviceStatus status;
}
