package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.CreateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.response.UserResponse;
import com.procare_system.tracker_maintenance_service.entity.User;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.UserMapper;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.security.access.prepost.PostAuthorize;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.procare_system.tracker_maintenance_service.enums.Role;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class UserService {
    UserRepository userRepository;
    UserMapper userMapper;
    PasswordEncoder passwordEncoder;


    public UserResponse createUser(CreateUserRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new AppException(ErrorCode.USERNAME_EXISTED);
        }

        User user = userMapper.toUser(request);
        user.setPassword(passwordEncoder.encode(request.getPassword()));
        user.setActive(true);
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public UserResponse getUserInfo(String id) {
        User user =userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_EXISTED));
        return userMapper.toUserResponse(user);
    }

    public UserResponse getMyInfo(){
        var context = SecurityContextHolder.getContext();
        String name = context.getAuthentication().getName();

        User user = userRepository.findByUsername(name).orElseThrow(() -> new AppException(ErrorCode.USERNAME_NOT_EXISTED));

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public Page<UserResponse> getAllUsers(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        return userRepository.findAllByActiveTrue(pageable)
                .map(userMapper::toUserResponse);
    }

    @PostAuthorize("hasRole('ADMIN') or returnObject.username == authentication.name")
    public UserResponse updateUser(String id, UpdateUserRequest request) {
        User user =userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_EXISTED));

        userMapper.updateUser(request, user);
        userRepository.save(user);

        return userMapper.toUserResponse(user);
    }

    @PreAuthorize("hasRole('ADMIN')")
    public void deleteUser(String id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.USER_ID_NOT_EXISTED));

        user.setActive(false);
        userRepository.save(user);
    }

    @PreAuthorize("hasRole('ADMIN') or hasRole('MANAGER')")
    public Page<UserResponse> getUsersByRole(Role role, int page, int size){
        Pageable pageable = PageRequest.of(page, size);

        return userRepository
                .findByRolesContainingAndActiveTrue(role, pageable)
                .map(userMapper::toUserResponse);
    }
}

