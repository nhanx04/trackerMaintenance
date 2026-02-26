package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.request.CreateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.response.UserResponse;
import com.procare_system.tracker_maintenance_service.entity.User;
import com.procare_system.tracker_maintenance_service.enums.Role;
import org.springframework.stereotype.Service;

import java.util.HashSet;

@Service
public class UserMapper {
    public User toUser(CreateUserRequest request) {
        return User.builder()
                .username(request.getUsername())
                .password(request.getPassword())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .roles(
                        request.getRoles() != null
                                ? new HashSet<Role>(request.getRoles())
                                : new HashSet<Role>()
                )
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .password(user.getPassword())
                .roles(user.getRoles())
                .active(user.isActive())
                .build();
    }

    public void updateUser(UpdateUserRequest request, User user) {
        if (request.getFirstName() != null) {
            user.setFirstName(request.getFirstName());
        }

        if (request.getLastName() != null) {
            user.setLastName(request.getLastName());
        }

        if (request.getRoles() != null) {
            user.setRoles(new HashSet<>(request.getRoles()));
        }
    }
}
