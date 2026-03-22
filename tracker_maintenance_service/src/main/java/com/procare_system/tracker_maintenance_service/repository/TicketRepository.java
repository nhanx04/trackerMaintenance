package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import java.util.List;

public interface TicketRepository extends JpaRepository<Ticket, String>,
        JpaSpecificationExecutor<Ticket> {

        List<Ticket> findByDeviceIdAndStatusAndIsDeletedFalseOrderByUpdatedAtDesc(
            String deviceId, TicketStatus status);
}
