package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import jakarta.validation.constraints.NotBlank;
import lombok.*;
import lombok.experimental.FieldDefaults;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AssignRequest {
    @NotBlank(message = ErrorCode.Key.TECHNICAIN_ID_REQUIRED)
    String technicianId;
}
