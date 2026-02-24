package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.request.CreateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.response.UserResponse;
import com.procare_system.tracker_maintenance_service.entity.User;
import org.springframework.stereotype.Service;

@Service
public class UserMapper {
    public User toUser(CreateUserRequest request) {
        return User.builder()
                .username(request.getUsername())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getRole())
                .build();
    }

    public UserResponse toUserResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .username(user.getUsername())
                .password(user.getPassword())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .role(user.getRole())
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
        if (request.getRole() != null) {
            user.setRole(request.getRole());
        }
    }
}
