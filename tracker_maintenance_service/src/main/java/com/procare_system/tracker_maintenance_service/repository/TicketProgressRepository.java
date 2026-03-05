package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.TicketProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TicketProgressRepository extends JpaRepository<TicketProgress, String> {
    List<TicketProgress> findByTicketIdOrderByCreatedAtDesc(String ticketId);
}
