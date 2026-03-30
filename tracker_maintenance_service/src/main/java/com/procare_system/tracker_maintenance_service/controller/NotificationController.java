package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.NotificationResponse;
import com.procare_system.tracker_maintenance_service.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    // Lấy danh sách thông báo của user đang đăng nhập
    @GetMapping
    public ApiResponse<Page<NotificationResponse>> getMyNotifications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ApiResponse.<Page<NotificationResponse>>builder()
                .result(notificationService.getMyNotifications(page, size))
                .build();
    }

    // Lấy số lượng thông báo chưa đọc (hiển thị badge đỏ trên UI)
    @GetMapping("/unread-count")
    public ApiResponse<Long> getUnreadCount() {
        return ApiResponse.<Long>builder()
                .result(notificationService.getUnreadCount())
                .build();
    }

    // Đánh dấu 1 thông báo là đã đọc
    @PutMapping("/{id}/read")
    public ApiResponse<NotificationResponse> markAsRead(@PathVariable String id) {
        return ApiResponse.<NotificationResponse>builder()
                .result(notificationService.markAsRead(id))
                .build();
    }

    // Đánh dấu tất cả thông báo của user là đã đọc
    @PutMapping("/read-all")
    public ApiResponse<String> markAllAsRead() {
        notificationService.markAllAsRead();
        return ApiResponse.<String>builder()
                .result("Tất cả thông báo đã được đánh dấu là đã đọc.")
                .build();
    }
}