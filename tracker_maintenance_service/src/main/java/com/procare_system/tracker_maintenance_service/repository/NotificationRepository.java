package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.Notification;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface NotificationRepository extends JpaRepository<Notification, String> {

    // Lấy danh sách thông báo của 1 người, sắp xếp mới nhất lên đầu
    Page<Notification> findByRecipientIdOrderByCreatedAtDesc(String recipientId, Pageable pageable);

    // Đếm số thông báo chưa đọc (để hiển thị số đỏ trên cái chuông)
    long countByRecipientIdAndIsReadFalse(String recipientId);
}