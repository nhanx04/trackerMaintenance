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
import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
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
    TicketImageRepository  ticketImageRepository;

    //  Helper: lấy thông tin user
    private Authentication currentAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String currentUserId() {

        Authentication authentication = SecurityContextHolder
                .getContext()
                .getAuthentication();

        if (authentication instanceof JwtAuthenticationToken jwtAuth) {

            // Lấy username từ JWT (sub)
            String username = jwtAuth.getName();

            // Tìm user trong DB
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
            case IN_PROGRESS -> next == TicketStatus.WAITING_FOR_CONFIRMATION;
            case WAITING_FOR_CONFIRMATION -> next == TicketStatus.DONE;
            case DONE, CANCELLED -> false;
        };

        if (!valid) {
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);
        }
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'REPORTER')")
    public TicketResponse createTicket(CreateTicketRequest request) {
        Ticket ticket = ticketMapper.toTicket(request);
        ticket.setStatus(TicketStatus.PENDING);
        ticket.setCreatedByUserId(currentUserId());
        ticketRepository.save(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }

    public TicketResponse getTicketById(String id) {
        Ticket ticket = findActiveTicket(id);
        checkReadAccess(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }


    public Page<TicketResponse> getTickets(
            String title, TicketStatus status, TicketPriority priority,
            String deviceId, int page, int size) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());

        Specification<Ticket> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("isDeleted"), false));

            if (hasRole("TECHNICIAN")) {
                // Technician chỉ thấy ticket được assign cho mình
                predicates.add(cb.equal(root.get("assignedTechnicianId"), currentUserId()));
            } else if (hasRole("REPORTER")) {
                // Reporter chỉ thấy ticket mình tạo
                predicates.add(cb.equal(root.get("createdByUserId"), currentUserId()));
            }
            // ADMIN/MANAGER thấy tất cả → không thêm predicate

            if (StringUtils.hasText(title)) {
                predicates.add(cb.like(cb.lower(root.get("title")),
                        "%" + title.toLowerCase() + "%"));
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

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return ticketRepository.findAll(spec, pageable)
                .map(ticketMapper::toTicketResponse);
    }


    public TicketStatus checkStatus(String id) {
        Ticket ticket = findActiveTicket(id);
        checkReadAccess(ticket);
        return ticket.getStatus();
    }


    public TicketResponse updateTicket(String id, UpdateTicketRequest request) {
        Ticket ticket = findActiveTicket(id);

        if (!isAdminOrManager()) {
            if (hasRole("TECHNICIAN")) {
                // Technician chỉ được cập nhật status của ticket mình
                if (!currentUserId().equals(ticket.getAssignedTechnicianId()))
                    throw new AppException(ErrorCode.ACCESS_DENIED);
                // Technician chỉ được phép đổi status, không cho sửa field khác
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


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public TicketResponse cancelTicket(String id) {
        Ticket ticket = findActiveTicket(id);

        if (ticket.getStatus() == TicketStatus.CANCELLED)
            throw new AppException(ErrorCode.TICKET_ALREADY_CANCELLED);

        if (ticket.getStatus() == TicketStatus.DONE)
            throw new AppException(ErrorCode.TICKET_CANNOT_CANCEL);

        ticket.setStatus(TicketStatus.CANCELLED);
        ticketRepository.save(ticket);
        return ticketMapper.toTicketResponse(ticket);
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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
        ticketRepository.save(ticket);

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

        //Set ảnh cho progess
        List<TicketImageResponse> imageResponses = new ArrayList<>();

        if (files != null && !files.isEmpty()) {
            imageResponses = ticketImageService.saveProgressImages(ticket, String.valueOf(progress.getId()), files);
        }

        ticketRepository.save(ticket); // update timestamp của ticket

        TicketProgressResponse response = ticketProgressMapper.toTicketProgressResponse(progress);
        response.setImages(imageResponses);

        return response;
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

        return ticketMapper.toTicketResponse(ticket);
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'TECHNICIAN')")
    public List<TicketProgressResponse> getTicketProgressHistory(String ticketId) {
        List<TicketProgress> progresses = ticketProgressRepository.findByTicketIdOrderByCreatedAtDesc(ticketId);
        List<TicketImage> allProgressImages = ticketImageRepository.findAllByTicketIdAndImageType(ticketId, ImageType.PROGRESS);

        // Map các ảnh của ticket progress theo progress ID
        Map<String, List<TicketImage>> imagesByProgressId = allProgressImages.stream()
                .filter(img -> img.getTicketProgressId() != null) // Đảm bảo không bị lỗi null pointer
                .collect(Collectors.groupingBy(TicketImage::getTicketProgressId));

        // 4. Map sang Response theo progressID và gán ảnh tương ứng
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

    //  Private helpers
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