package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.Device;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface DeviceRepository extends JpaRepository<Device, Long>, JpaSpecificationExecutor<Device> {
    boolean existsByCode(String code);
    @Query("SELECT d.status, COUNT(d) FROM Device d WHERE d.isDeleted = false GROUP BY d.status")
    List<Object[]> countDevicesByStatus();
}