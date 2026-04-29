package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.AssignRequest;
import com.procare_system.tracker_maintenance_service.dto.request.CreateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.response.TicketImageResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketProgressResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketResponse;
import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.entity.TicketImage;
import com.procare_system.tracker_maintenance_service.entity.TicketProgress;
import com.procare_system.tracker_maintenance_service.enums.ImageType;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import com.procare_system.tracker_maintenance_service.event.TicketNotificationEvent;
import com.procare_system.tracker_maintenance_service.enums.NotificationType;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.TicketMapper;
import com.procare_system.tracker_maintenance_service.mapper.TicketProgressMapper;
import com.procare_system.tracker_maintenance_service.repository.TicketImageRepository;
import com.procare_system.tracker_maintenance_service.repository.TicketProgressRepository;
import com.procare_system.tracker_maintenance_service.repository.TicketRepository;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;

import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.data.domain.*;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketService {

    TicketRepository ticketRepository;
    TicketMapper ticketMapper;
    UserRepository userRepository;

    TicketProgressRepository ticketProgressRepository;
    TicketProgressMapper ticketProgressMapper;
    TicketImageService ticketImageService;
    TicketImageRepository ticketImageRepository;

    ApplicationEventPublisher eventPublisher;

    // --- HELPER METHODS CHO NOTIFICATION --- //

    // Gửi cho 1 người cụ thể
    private void notifyUser(String recipientId, String title, String message, NotificationType type, String ticketId) {
        if (StringUtils.hasText(recipientId) && !recipientId.equals(currentUserId())) {
            eventPublisher.publishEvent(new TicketNotificationEvent(recipientId, title, message, type, ticketId));
        }
    }

    // Gửi cho tất cả Manager
    private void notifyManagers(String title, String message, NotificationType type, String ticketId) {
        // Cần thêm hàm findIdsByRoles trong UserRepository
        List<String> managerIds = userRepository.findIdsByRole(Role.MANAGER);
        for (String managerId : managerIds) {
            notifyUser(managerId, title, message, type, ticketId);
        }
    }


    //  Helper: lấy thông tin user
    private Authentication currentAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String currentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication instanceof JwtAuthenticationToken jwtAuth) {
            String username = jwtAuth.getName();
            return userRepository.findByUsername(username)
                    .orElseThrow(() -> new RuntimeException("User not found: " + username))
                    .getId();
        }
        throw new RuntimeException("Unauthenticated");
    }

    private boolean hasRole(String role) {
        return currentAuth().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
    }

    private boolean isAdminOrManager() {
        return hasRole("ADMIN") || hasRole("MANAGER");
    }

    private void validateStatusTransition(TicketStatus current, TicketStatus next) {
        boolean valid = switch (current) {
            case PENDING -> next == TicketStatus.ASSIGNED || next == TicketStatus.CANCELLED;
            case ASSIGNED -> next == TicketStatus.IN_PROGRESS;
            case IN_PROGRESS -> next == TicketStatus.WAITING_FOR_CONFIRMATION || next == TicketStatus.UNRESOLVABLE;
            case WAITING_FOR_CONFIRMATION -> next == TicketStatus.DONE;
            case UNRESOLVABLE, DONE, CANCELLED -> false;
        };

        if (!valid) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }
    }

    @Transactional
    @PreAuthorize("hasAuthority('TICKET_CREATE')")
    public TicketResponse createTicket(CreateTicketRequest request) {
        Ticket ticket = ticketMapper.toTicket(request);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreatedByUserId(currentUserId());
        ticket = ticketRepository.save(ticket); // Gán lại để lấy ID

        // 👇 TRIGGER: Reporter tạo ticket -> Báo cho Manager
        notifyManagers(
                "Ticket mới yêu cầu xử lý",
                "Một ticket mới (" + ticket.getTitle() + ") vừa được tạo.",
                NotificationType.CREATE_TICKET,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    public TicketResponse getTicketById(String id) {
        Ticket ticket = findActiveTicket(id);
        checkReadAccess(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }

    public Page<TicketResponse> getTickets(String title, TicketStatus status, TicketPriority priority, String deviceId, Boolean isOverdue, int page, int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Ticket> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            predicates.add(cb.equal(root.get("isDeleted"), false));

            if (hasRole("TECHNICIAN")) {
                predicates.add(cb.equal(root.get("assignedTechnicianId"), currentUserId()));
            } else if (hasRole("REPORTER")) {
                predicates.add(cb.equal(root.get("createdByUserId"), currentUserId()));
            }

            if (StringUtils.hasText(title)) {
                predicates.add(cb.like(cb.lower(root.get("title")), "%" + title.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (priority != null) {
                predicates.add(cb.equal(root.get("priority"), priority));
            }
            if (StringUtils.hasText(deviceId)) {
                predicates.add(cb.equal(root.get("deviceId"), deviceId));
            }

            if (isOverdue != null) {
                predicates.add(cb.equal(root.get("isOverdue"), isOverdue));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ticketRepository.findAll(spec, pageable).map(ticketMapper::toTicketResponse);
    }

    public TicketStatus checkStatus(String id) {
        Ticket ticket = findActiveTicket(id);
        checkReadAccess(ticket);
        return ticket.getStatus();
    }

    @Transactional
    public TicketResponse updateTicket(String id, UpdateTicketRequest request) {
        Ticket ticket = findActiveTicket(id);

        if (!isAdminOrManager()) {
            if (hasRole("TECHNICIAN")) {
                if (!currentUserId().equals(ticket.getAssignedTechnicianId()))
                    throw new AppException(ErrorCode.ACCESS_DENIED);
                request.setTitle(null);
                request.setDescription(null);
                request.setPriority(null);
                request.setAssignedTechnicianId(null);
                request.setScheduledDate(null);
            } else {
                throw new AppException(ErrorCode.ACCESS_DENIED);
            }
        }

        if (request.getStatus() != null && !request.getStatus().equals(ticket.getStatus())) {
            validateStatusTransition(ticket.getStatus(), request.getStatus());
        }

        ticketMapper.updateTicket(request, ticket);
        ticketRepository.save(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasAuthority('TICKET_UPDATE')")
    public TicketResponse cancelTicket(String id) {
        Ticket ticket = findActiveTicket(id);
        if (ticket.getStatus() == TicketStatus.CANCELLED) throw new AppException(ErrorCode.TICKET_ALREADY_CANCELLED);
        if (ticket.getStatus() == TicketStatus.DONE) throw new AppException(ErrorCode.TICKET_CANNOT_CANCEL);

        ticket.setStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasAuthority('TICKET_DELETE')")
    public void deleteTicket(String id) {
        Ticket ticket = findActiveTicket(id);
        ticket.setDeleted(true);
        ticketRepository.save(ticket);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public TicketResponse assignTechnician(String id, AssignRequest request) {
        Ticket ticket = findActiveTicket(id);
        validateStatusTransition(ticket.getStatus(), TicketStatus.ASSIGNED);

        ticket.setAssignedTechnicianId(request.getTechnicianId());
        ticket.setStatus(TicketStatus.ASSIGNED);

        // Cấu hình: HIGH = 24h, MEDIUM = 48h, LOW = 72h
        long slaHours = switch (ticket.getPriority()) {
            case HIGH -> 24;
            case MEDIUM -> 48;
            case LOW -> 72;
        };
        ticket.setDueTime(LocalDateTime.now().plusHours(slaHours));
        ticket.setOverdue(false); // Reset cờ overdue nếu assign lại

        ticketRepository.save(ticket);

        notifyUser(
                request.getTechnicianId(),
                "Bạn được phân công Ticket mới",
                "Bạn vừa được giao xử lý ticket: " + ticket.getTitle() + ". Deadline: " + slaHours + "h",
                NotificationType.ASSIGN_TECHNICIAN,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketResponse acceptTicket(String id) {
        Ticket ticket = findActiveTicket(id);

        if (!currentUserId().equals(ticket.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        validateStatusTransition(ticket.getStatus(), TicketStatus.IN_PROGRESS);

        ticket.setStatus(TicketStatus.IN_PROGRESS);
        ticketRepository.save(ticket);

        // 👇 TRIGGER: Technician nhận ticket -> Báo cho Manager
        notifyManagers(
                "Technician đã tiếp nhận Ticket",
                "Technician đã bắt đầu xử lý ticket: " + ticket.getTitle(),
                NotificationType.ACCEPT_TICKET,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketProgressResponse updateProgress(String id, String note, List<MultipartFile> files) {
        Ticket ticket = findActiveTicket(id);

        if (!currentUserId().equals(ticket.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }

        TicketProgress progress = TicketProgress.builder()
                .ticketId(ticket.getId())
                .technicianId(currentUserId())
                .note(note)
                .build();
        progress = ticketProgressRepository.save(progress);

        List<TicketImageResponse> imageResponses = new ArrayList<>();
        if (files != null && !files.isEmpty()) {
            imageResponses = ticketImageService.saveProgressImages(ticket, String.valueOf(progress.getId()), files);
        }

        ticketRepository.save(ticket);

        TicketProgressResponse response = ticketProgressMapper.toTicketProgressResponse(progress);
        response.setImages(imageResponses);
        return response;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public List<TicketProgressResponse> getTicketProgressHistory(String ticketId) {
        List<TicketProgress> progresses = ticketProgressRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
        List<TicketImage> allProgressImages = ticketImageRepository.findAllByTicketIdAndImageType(ticketId, ImageType.PROGRESS);

        Map<String, List<TicketImage>> imagesByProgressId = allProgressImages.stream()
                .filter(img -> img.getTicketProgressId() != null)
                .collect(Collectors.groupingBy(TicketImage::getTicketProgressId));

        return progresses.stream().map(progress -> {
            TicketProgressResponse response = ticketProgressMapper.toTicketProgressResponse(progress);
            List<TicketImage> matchedImages = imagesByProgressId.getOrDefault(progress.getId(), new ArrayList<>());

            List<TicketImageResponse> imageResponses = matchedImages.stream()
                    .map(img -> TicketImageResponse.builder()
                            .id(img.getId())
                            .ticketId(img.getTicketId())
                            .imageUrl(img.getImageUrl())
                            .imageType(img.getImageType())
                            .uploadedByUserId(img.getUploadedByUserId())
                            .uploadedAt(img.getUploadedAt())
                            .build())
                    .toList();

            response.setImages(imageResponses);
            return response;
        }).toList();
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketProgressResponse updateProgressNote(String ticketId, String progressId, String newNote) {
        Ticket ticket = findActiveTicket(ticketId);
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }
        TicketProgress progress = ticketProgressRepository.findById(progressId)
                .orElseThrow(() -> new AppException(ErrorCode.PROGRESS_NOT_FOUND));

        if (!progress.getTechnicianId().equals(currentUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        progress.setNote(newNote);
        ticketProgressRepository.save(progress);
        return ticketProgressMapper.toTicketProgressResponse(progress);
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public void deleteProgress(String ticketId, String progressId) {
        Ticket ticket = findActiveTicket(ticketId);
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }
        TicketProgress progress = ticketProgressRepository.findById(progressId)
                .orElseThrow(() -> new AppException(ErrorCode.PROGRESS_NOT_FOUND));

        if (!progress.getTechnicianId().equals(currentUserId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        ticketImageService.deleteAllImagesByProgressId(ticketId, progressId);
        ticketProgressRepository.delete(progress);
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketResponse markAsCompleted(String id) {
        Ticket ticket = findActiveTicket(id);

        if (!currentUserId().equals(ticket.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        validateStatusTransition(ticket.getStatus(), TicketStatus.WAITING_FOR_CONFIRMATION);

        ticket.setStatus(TicketStatus.WAITING_FOR_CONFIRMATION);
        ticketRepository.save(ticket);

        // 👇 TRIGGER: Technician hoàn tất -> Báo cho Manager
        notifyManagers(
                "Ticket đã hoàn tất, chờ xác nhận",
                "Technician đã hoàn thành ticket: " + ticket.getTitle() + ". Vui lòng kiểm tra và xác nhận.",
                NotificationType.COMPLETE_TICKET,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasRole('TECHNICIAN')")
    public TicketResponse markAsUnresolvable(String id, String reason) {
        Ticket ticket = findActiveTicket(id);

        if (!currentUserId().equals(ticket.getAssignedTechnicianId())) {
            throw new AppException(ErrorCode.ACCESS_DENIED);
        }
        if (ticket.getStatus() != TicketStatus.IN_PROGRESS) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }

        ticket.setStatus(TicketStatus.UNRESOLVABLE);
        ticket.setUnresolvableReason(reason);
        ticketRepository.save(ticket);

        // 👇 TRIGGER: Technician báo lỗi -> Báo cho Manager
        notifyManagers(
                "Sự cố không thể xử lý",
                "Technician báo cáo không thể xử lý ticket: " + ticket.getTitle() + ". Lý do: " + reason,
                NotificationType.CANNOT_FIX,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    @Transactional
    @PreAuthorize("hasAuthority('TICKET_CONFIRM')")
    public TicketResponse confirmCompletion(String id) {
        Ticket ticket = findActiveTicket(id);

        if (ticket.getStatus() != TicketStatus.WAITING_FOR_CONFIRMATION) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }

        ticket.setStatus(TicketStatus.DONE);
        ticket.setConfirmedByUserId(currentUserId());
        ticketRepository.saveAndFlush(ticket);

        // 👇 TRIGGER: Manager xác nhận -> Báo cho Reporter
        notifyUser(
                ticket.getCreatedByUserId(),
                "Ticket đã hoàn tất",
                "Yêu cầu hỗ trợ của bạn (" + ticket.getTitle() + ") đã được giải quyết xong.",
                NotificationType.CONFIRM_COMPLETION,
                ticket.getId()
        );

        return ticketMapper.toTicketResponse(ticket);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN', 'REPORTER')")
    public List<TicketResponse> getMaintenanceHistoryByDevice(String deviceId) {
        List<Ticket> tickets = ticketRepository
                .findByDeviceIdAndStatusAndIsDeletedFalseOrderByUpdatedAtDesc(
                        deviceId, TicketStatus.DONE);
        return tickets.stream()
                .map(ticketMapper::toTicketResponse)
                .toList();
    }

    private Ticket findActiveTicket(String id) {
        return ticketRepository.findById(id)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
    }

    private void checkReadAccess(Ticket ticket) {
        if (isAdminOrManager()) return;
        String uid = currentUserId();
        if (hasRole("TECHNICIAN") && uid.equals(ticket.getAssignedTechnicianId())) return;
        if (hasRole("REPORTER")   && uid.equals(ticket.getCreatedByUserId()))    return;
        throw new AppException(ErrorCode.ACCESS_DENIED);
    }
}