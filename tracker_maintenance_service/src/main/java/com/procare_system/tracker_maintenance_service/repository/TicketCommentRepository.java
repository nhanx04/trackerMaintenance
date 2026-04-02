package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.TicketComment;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketCommentRepository extends JpaRepository<TicketComment, String> {

    List<TicketComment> findAllByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(String ticketId);
}