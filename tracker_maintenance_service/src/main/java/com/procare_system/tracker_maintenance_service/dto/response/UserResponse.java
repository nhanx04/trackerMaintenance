package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@AllArgsConstructor
@NoArgsConstructor
@Builder
@Data
@FieldDefaults(level = AccessLevel.PRIVATE)
public class UserResponse {
    String id;
    String username;
    String password;
    String firstName;
    String lastName;
    Set<Role> roles;
    boolean active;
}
