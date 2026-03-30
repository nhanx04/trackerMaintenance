package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDateTime;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String>,
    JpaSpecificationExecutor<Ticket> {

    List<Ticket> findByDeviceIdAndStatusAndIsDeletedFalseOrderByUpdatedAtDesc(
        String deviceId, TicketStatus status);

    // [BE1] Thống kê số lượng ticket theo trạng thái (Có lọc theo thời gian)
    @Query("SELECT t.status, COUNT(t) FROM Ticket t WHERE t.isDeleted = false " +
            "AND (cast(:startDate as timestamp) IS NULL OR t.createdAt >= :startDate) " +
            "AND (cast(:endDate as timestamp) IS NULL OR t.createdAt <= :endDate) " +
            "GROUP BY t.status")
    List<Object[]> countTicketsByStatus(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);

    // [BE2] Thống kê top thiết bị hỏng nhiều nhất (Dùng Pageable để LIMIT kết quả)
    @Query("SELECT t.deviceId, COUNT(t) as failCount FROM Ticket t WHERE t.isDeleted = false " +
            "GROUP BY t.deviceId ORDER BY failCount DESC")
    List<Object[]> findTopDefectiveDevices(Pageable pageable);

    // [BE3] Tính thời gian xử lý trung bình (Dùng Native Query của PostgreSQL để tính ra số Giờ)
    // EXTRACT(EPOCH) đổi thời gian ra giây, chia 3600 ra giờ.
    @Query(value = "SELECT AVG(EXTRACT(EPOCH FROM (updated_at - created_at)) / 3600) " +
            "FROM tickets WHERE status = 'DONE' AND is_deleted = false " +
            "AND (cast(:startDate as timestamp) IS NULL OR created_at >= :startDate) " +
            "AND (cast(:endDate as timestamp) IS NULL OR created_at <= :endDate)",
            nativeQuery = true)
    Double getAverageProcessingTimeInHours(@Param("startDate") LocalDateTime startDate, @Param("endDate") LocalDateTime endDate);
}
