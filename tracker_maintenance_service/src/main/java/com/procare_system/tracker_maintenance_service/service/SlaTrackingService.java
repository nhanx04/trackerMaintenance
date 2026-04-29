package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.event.TicketNotificationEvent;
import com.procare_system.tracker_maintenance_service.repository.TicketRepository;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class SlaTrackingService {

    private final TicketRepository ticketRepository;
    private final UserRepository userRepository;
    private final ApplicationEventPublisher eventPublisher;

    @Scheduled(cron = "0 * * * * *") // Chạy mỗi phút
    @Transactional
    public void trackSlaJob() {
        LocalDateTime now = LocalDateTime.now();
        log.info("SLA Job: Bắt đầu quét lúc {}", now);

        // --- 1. LOGIC: ĐÃ QUÁ HẠN (OVERDUE) ---
        List<Ticket> overdueTickets = ticketRepository.findNewlyOverdueTickets(now);
        if (!overdueTickets.isEmpty()) {
            List<String> managerIds = userRepository.findIdsByRole(Role.MANAGER);
            for (Ticket ticket : overdueTickets) {
                ticket.setOverdue(true);
                ticketRepository.save(ticket);

                // Báo cho Technician & Managers
                sendSlaNotification(ticket.getAssignedTechnicianId(), ticket, "🚨 QUÁ HẠN: ", NotificationType.TICKET_OVERDUE);
                managerIds.forEach(mId -> sendSlaNotification(mId, ticket, "🚨 QUÁ HẠN: ", NotificationType.TICKET_OVERDUE));
            }
        }

        // --- 2. LOGIC: SẮP QUÁ HẠN (DUE SOON - Cảnh báo trước 2 tiếng) ---
        LocalDateTime warningWindow = now.plusHours(2);
        List<Ticket> dueSoonTickets = ticketRepository.findTicketsDueSoon(now, warningWindow);
        if (!dueSoonTickets.isEmpty()) {
            for (Ticket ticket : dueSoonTickets) {
                ticket.setDueSoonWarningSent(true); // Cắm cờ đã gửi cảnh báo
                ticketRepository.save(ticket);

                // Chỉ cần báo cho Technician để họ tập trung làm cho kịp
                sendSlaNotification(ticket.getAssignedTechnicianId(), ticket, "⚠️ SẮP HẾT HẠN (còn < 2h): ", NotificationType.TICKET_DUE_SOON);
            }
        }
    }

    // Helper rút gọn code bắn notification
    private void sendSlaNotification(String recipientId, Ticket ticket, String prefix, NotificationType type) {
        if (recipientId != null) {
            eventPublisher.publishEvent(new TicketNotificationEvent(
                    recipientId,
                    prefix + ticket.getTitle(),
                    "Thời hạn xử lý ticket này là: " + ticket.getDueTime(),
                    type,
                    ticket.getId()
            ));
        }
    }
}