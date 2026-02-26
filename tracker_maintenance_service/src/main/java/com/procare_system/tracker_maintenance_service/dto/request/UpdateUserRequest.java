package com.procare_system.tracker_maintenance_service.dto.request;

import com.procare_system.tracker_maintenance_service.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UpdateUserRequest {
    String firstName;
    String lastName;
    Set<Role> roles;
}
