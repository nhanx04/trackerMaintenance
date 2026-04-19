package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.MaintenanceSchedule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.util.List;

public interface ScheduleRepository extends JpaRepository<MaintenanceSchedule, String>,
        JpaSpecificationExecutor<MaintenanceSchedule> {

    List<MaintenanceSchedule> findByDeviceIdAndIsDeletedFalse(String deviceId);

    List<MaintenanceSchedule> findByAssignedTechnicianIdAndIsDeletedFalse(String technicianId);
}