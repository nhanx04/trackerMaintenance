package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.CreateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateUserRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.UserResponse;
import com.procare_system.tracker_maintenance_service.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;
import com.procare_system.tracker_maintenance_service.enums.Role;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @PostMapping
    ApiResponse<UserResponse> createUser(@RequestBody CreateUserRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.createUser(request))
                .build();
    }
    @GetMapping("/{id}")
    public ApiResponse<UserResponse> getUserInfo(@PathVariable String id) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getUserInfo(id))
                .build();
    }

    @GetMapping("/my-info")
    public ApiResponse<UserResponse> getMyInfo() {
        return ApiResponse.<UserResponse>builder()
                .result(userService.getMyInfo())
                .build();
    }

    @GetMapping
    public ApiResponse<Page<UserResponse>> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getAllUsers(page, size))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<UserResponse> updateUser(@PathVariable String id, @RequestBody UpdateUserRequest request) {
        return ApiResponse.<UserResponse>builder()
                .result(userService.updateUser(id, request))
                .build();
    }

    @DeleteMapping("/{id}")
    public ApiResponse<String> deleteUser(@PathVariable String id) {
        userService.deleteUser(id);
        return ApiResponse.<String>builder()
                .result("User has been deleted successfully")
                .build();
    }

    @GetMapping("/by-role")
    public ApiResponse<Page<UserResponse>> getUsersByRole(
            @RequestParam Role role,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ){
        return ApiResponse.<Page<UserResponse>>builder()
                .result(userService.getUsersByRole(role, page, size))
                .build();
    }

}
