package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.CreateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ScheduleResponse;
import com.procare_system.tracker_maintenance_service.entity.MaintenanceSchedule;
import com.procare_system.tracker_maintenance_service.enums.ScheduleStatus;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.ScheduleMapper;
import com.procare_system.tracker_maintenance_service.repository.ScheduleRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import com.procare_system.tracker_maintenance_service.repository.UserRepository;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class ScheduleService {

    ScheduleRepository scheduleRepository;
    ScheduleMapper scheduleMapper;
    UserRepository userRepository;

    // ── helpers ────────────────────────────────────────────────────────────────

    private Authentication currentAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            // JWT đã có claim "userId" — lấy thẳng, không cần query DB
            Object userId = jwtAuth.getToken().getClaim("userId");
            if (userId == null) throw new RuntimeException("userId claim missing in token");
            return userId.toString();
        }
        throw new AppException(ErrorCode.UNAUTHENTICATED);
    }

    private boolean hasRole(String role) {
        return currentAuth().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }



    private MaintenanceSchedule findActive(String id) {
        return scheduleRepository.findById(id)
                .filter(s -> !s.isDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.SCHEDULE_NOT_FOUND));
    }

    // ── CRUD ───────────────────────────────────────────────────────────────────

    @PreAuthorize("hasAuthority('SCHEDULE_CREATE')")
    public ScheduleResponse createSchedule(CreateScheduleRequest request) {
        MaintenanceSchedule schedule = scheduleMapper.toSchedule(request);
        schedule.setCreatedByUserId(currentUserId());
        schedule.setStatus(ScheduleStatus.PENDING);
        scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponse(schedule);
    }

    public ScheduleResponse getScheduleById(String id) {
        MaintenanceSchedule schedule = findActive(id);

        // Technician chỉ xem được lịch được giao cho mình
        if (hasRole("TECHNICIAN") && !currentUserId().equals(schedule.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }

        return scheduleMapper.toScheduleResponse(schedule);
    }

    public Page<ScheduleResponse> getSchedules(
            String deviceId,
            ScheduleStatus status,
            LocalDate from,
            LocalDate to,
            int page,
            int size
    ) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("scheduledDate").ascending());

        Specification<MaintenanceSchedule> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDeleted"), false));

            // Technician chỉ thấy lịch của mình
            if (hasRole("TECHNICIAN")) {
                predicates.add(cb.equal(root.get("assignedTechnicianId"), currentUserId()));
            }

            if (StringUtils.hasText(deviceId)) {
                predicates.add(cb.equal(root.get("deviceId"), deviceId));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (from != null) {
                predicates.add(cb.greaterThanOrEqualTo(root.get("scheduledDate"), from));
            }
            if (to != null) {
                predicates.add(cb.lessThanOrEqualTo(root.get("scheduledDate"), to));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return scheduleRepository.findAll(spec, pageable)
                .map(scheduleMapper::toScheduleResponse);
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_UPDATE')")
    public ScheduleResponse updateSchedule(String id, UpdateScheduleRequest request) {
        MaintenanceSchedule schedule = findActive(id);

        // Không cho cập nhật lịch đã hoàn thành / huỷ
        if (schedule.getStatus() == ScheduleStatus.DONE
                || schedule.getStatus() == ScheduleStatus.CANCELLED) {
            throw new AppException(ErrorCode.SCHEDULE_CANNOT_MODIFY);
        }

        scheduleMapper.updateSchedule(request, schedule);
        scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponse(schedule);
    }

    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_DELETE')")
    public void deleteSchedule(String id) {
        MaintenanceSchedule schedule = findActive(id);
        schedule.setDeleted(true);
        scheduleRepository.save(schedule);
    }

    // ── Thao tác trạng thái ────────────────────────────────────────────────────

    @Transactional
    @PreAuthorize("hasAuthority('SCHEDULE_UPDATE')")
    public ScheduleResponse cancelSchedule(String id) {
        MaintenanceSchedule schedule = findActive(id);
        if (schedule.getStatus() == ScheduleStatus.DONE) {
            throw new AppException(ErrorCode.SCHEDULE_CANNOT_MODIFY);
        }
        schedule.setStatus(ScheduleStatus.CANCELLED);
        scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponse(schedule);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_TECHNICIAN')")
    public ScheduleResponse startSchedule(String id) {
        MaintenanceSchedule schedule = findActive(id);

        if (!currentUserId().equals(schedule.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (schedule.getStatus() != ScheduleStatus.PENDING) {
            throw new AppException(ErrorCode.SCHEDULE_CANNOT_MODIFY);
        }

        schedule.setStatus(ScheduleStatus.IN_PROGRESS);
        scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponse(schedule);
    }

    @Transactional
    @PreAuthorize("hasAuthority('ROLE_TECHNICIAN')")
    public ScheduleResponse completeSchedule(String id) {
        MaintenanceSchedule schedule = findActive(id);

        if (!currentUserId().equals(schedule.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (schedule.getStatus() != ScheduleStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.SCHEDULE_CANNOT_MODIFY);
        }

        schedule.setStatus(ScheduleStatus.DONE);
        scheduleRepository.save(schedule);
        return scheduleMapper.toScheduleResponse(schedule);
    }
}