package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.TicketImage;
import com.procare_system.tracker_maintenance_service.enums.ImageType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface TicketImageRepository extends JpaRepository<TicketImage, String> {
    List<TicketImage> findAllByTicketId(String ticketId);
    List<TicketImage> findAllByTicketIdAndImageType(String ticketId, ImageType imageType);
}