package com.procare_system.tracker_maintenance_service.scheduler;

import com.procare_system.tracker_maintenance_service.entity.MaintenanceSchedule;
import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import com.procare_system.tracker_maintenance_service.event.TicketNotificationEvent;
import com.procare_system.tracker_maintenance_service.repository.ScheduleRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class MaintenanceReminderScheduler {

    ScheduleRepository scheduleRepository;
    ApplicationEventPublisher eventPublisher;

    /**
     * Chạy mỗi ngày lúc 8:00 sáng.
     * Nhắc lịch bảo trì vào 3 mốc: hôm nay, 1 ngày nữa, 3 ngày nữa.
     */
    @Scheduled(cron = "0 0 8 * * *", zone = "Asia/Ho_Chi_Minh")
    // @Scheduled(cron = "*/10 * * * * *") // mỗi 10 giây chạy 1 lần
    public void sendMaintenanceReminders() {
        log.info("[Scheduler] Bắt đầu gửi nhắc lịch bảo trì - {}", LocalDate.now());

        sendRemindersForDate(LocalDate.now(),          0);
        sendRemindersForDate(LocalDate.now().plusDays(1), 1);
        sendRemindersForDate(LocalDate.now().plusDays(3), 3);

        log.info("[Scheduler] Hoàn tất gửi nhắc lịch bảo trì");
    }

    private void sendRemindersForDate(LocalDate targetDate, int daysAhead) {
        List<MaintenanceSchedule> schedules = scheduleRepository
                .findByStatusAndScheduledDate(ScheduleStatus.PENDING, targetDate);

        if (schedules.isEmpty()) return;

        log.info("[Scheduler] Tìm thấy {} lịch cho ngày {} ({} ngày nữa)",
                schedules.size(), targetDate, daysAhead);

        for (MaintenanceSchedule schedule : schedules) {
            String title;
            String message;

            if (daysAhead == 0) {
                title   = "⚠️ Lịch bảo trì hôm nay!";
                message = "Lịch bảo trì \"" + schedule.getTitle() + "\" diễn ra HÔM NAY. Vui lòng chuẩn bị.";
            } else {
                title   = "🔔 Nhắc lịch bảo trì sắp tới";
                message = "Còn " + daysAhead + " ngày nữa đến lịch bảo trì: \""
                        + schedule.getTitle() + "\" (ngày " + targetDate + ").";
            }

            // Nhắc Technician được giao
            if (schedule.getAssignedTechnicianId() != null) {
                publish(schedule.getAssignedTechnicianId(), title, message, schedule.getId());
            }

            // Nhắc người tạo lịch (thường là Manager)
            if (schedule.getCreatedByUserId() != null
                    && !schedule.getCreatedByUserId().equals(schedule.getAssignedTechnicianId())) {
                publish(schedule.getCreatedByUserId(), title, message, schedule.getId());
            }
        }
    }

    private void publish(String recipientId, String title, String message, String scheduleId) {
        try {
            eventPublisher.publishEvent(
                    new TicketNotificationEvent(recipientId, title, message,
                            NotificationType.SCHEDULE_REMINDER, scheduleId)
            );
        } catch (Exception e) {
            log.error("[Scheduler] Lỗi gửi notification cho userId={}: {}", recipientId, e.getMessage());
        }
    }
}