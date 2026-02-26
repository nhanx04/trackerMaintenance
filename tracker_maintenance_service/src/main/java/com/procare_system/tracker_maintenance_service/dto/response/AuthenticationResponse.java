package com.procare_system.tracker_maintenance_service.dto.response;

import com.procare_system.tracker_maintenance_service.enums.Role;
import lombok.*;
import lombok.experimental.FieldDefaults;

import java.util.Set;

@Data
@AllArgsConstructor
@NoArgsConstructor
@Builder
@FieldDefaults(level = AccessLevel.PRIVATE)
public class AuthenticationResponse {
    String id;
    String username;
    String firstName;
    String lastName;
    Set<Role> roles;

    String token;
    boolean authenticated;
}
