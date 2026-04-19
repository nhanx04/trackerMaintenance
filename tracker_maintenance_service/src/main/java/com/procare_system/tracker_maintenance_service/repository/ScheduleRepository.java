package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.MaintenanceSchedule;
import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;

public interface ScheduleRepository extends JpaRepository<MaintenanceSchedule, String>,
        JpaSpecificationExecutor<MaintenanceSchedule> {

    List<MaintenanceSchedule> findByDeviceIdAndIsDeletedFalse(String deviceId);

    List<MaintenanceSchedule> findByAssignedTechnicianIdAndIsDeletedFalse(String technicianId);

    @Query("""
        SELECT s FROM MaintenanceSchedule s
        WHERE s.isDeleted = false
        AND s.status IN :statuses
        AND s.scheduledDate BETWEEN :from AND :to
        ORDER BY s.scheduledDate ASC
    """)
    List<MaintenanceSchedule> findUpcoming(
        @Param("statuses") List<ScheduleStatus> statuses,
        @Param("from") LocalDate from,
        @Param("to") LocalDate to
    );

    @Query("""
        SELECT s FROM MaintenanceSchedule s
        WHERE s.isDeleted = false
        AND s.status = :status
        AND s.scheduledDate = :date
    """)
    List<MaintenanceSchedule> findByStatusAndScheduledDate(
        @Param("status") ScheduleStatus status,
        @Param("date") LocalDate date
    );
}