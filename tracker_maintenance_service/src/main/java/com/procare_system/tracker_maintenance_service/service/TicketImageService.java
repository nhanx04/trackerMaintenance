package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.response.TicketImageResponse;
import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.entity.TicketImage;
import com.procare_system.tracker_maintenance_service.enums.ImageType;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.repository.TicketImageRepository;
import com.procare_system.tracker_maintenance_service.repository.TicketRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketImageService {

    TicketImageRepository ticketImageRepository;
    TicketRepository ticketRepository;
    R2StorageService r2StorageService;

    // Chỉ upload được khi ticket đang PENDING
    // Quyền: ADMIN, MANAGER, REPORTER (người tạo)
    @Transactional
    @PreAuthorize("hasAuthority('TICKET_UPDATE')")
    public List<TicketImageResponse> uploadBeforeImages(
            String ticketId, List<MultipartFile> files) {

        Ticket ticket = findActiveTicket(ticketId);

        if (ticket.getStatus() != TicketStatus.PENDING)
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);

        checkUploadPermission(ticket, ImageType.BEFORE);

        return doUpload(ticket, files, ImageType.BEFORE);
    }

    // Upload AFTER khi ticket ở IN_PROGRESS, WAITING_FOR_CONFIRMATION hoặc DONE
    // Quyền: ADMIN, MANAGER, TECHNICIAN (được assign)
    @Transactional
    @PreAuthorize("hasAuthority('TICKET_UPDATE')")
    public List<TicketImageResponse> uploadAfterImages(
            String ticketId, List<MultipartFile> files) {

        Ticket ticket = findActiveTicket(ticketId);

        boolean validStatus = ticket.getStatus() == TicketStatus.IN_PROGRESS
                || ticket.getStatus() == TicketStatus.WAITING_FOR_CONFIRMATION
                || ticket.getStatus() == TicketStatus.DONE;
        if (!validStatus)
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);

        checkUploadPermission(ticket, ImageType.AFTER);

        return doUpload(ticket, files, ImageType.AFTER);
    }

    // Lấy tất cả ảnh của ticket
    @PreAuthorize("hasAuthority('TICKET_READ')")
    public List<TicketImageResponse> getImages(String ticketId) {
        findActiveTicket(ticketId); // validate tồn tại
        return ticketImageRepository.findAllByTicketId(ticketId)
                .stream().map(this::toResponse).toList();
    }

    @PreAuthorize("hasAuthority('TICKET_READ')")
    public List<TicketImageResponse> getImagesByType(String ticketId, ImageType type) {
        findActiveTicket(ticketId);
        return ticketImageRepository.findAllByTicketIdAndImageType(ticketId, type)
                .stream().map(this::toResponse).toList();
    }

    @PreAuthorize("hasAuthority('TICKET_DELETE')")
    @Transactional
    public void deleteImage(String ticketId, String imageId) {
        TicketImage image = ticketImageRepository.findById(imageId)
                .orElseThrow(() -> new AppException(ErrorCode.IMAGE_NOT_FOUND));

        if (!image.getTicketId().equals(ticketId))
            throw new AppException(ErrorCode.IMAGE_NOT_BELONG_TO_TICKET);

        r2StorageService.deleteImage(image.getObjectKey());
        ticketImageRepository.delete(image);
    }

    @Transactional
    public List<TicketImageResponse> saveProgressImages(
            Ticket ticket, String ticketProgressId, List<MultipartFile> files) {

        String folder = "tickets/" + ticket.getId() + "/progress/" + ticketProgressId;
        List<String> objectKeys = r2StorageService.uploadImages(files, folder);

        List<TicketImage> images = objectKeys.stream().map(key -> TicketImage.builder()
                .ticketId(ticket.getId())
                .ticketProgressId(ticketProgressId)
                .objectKey(key)
                .imageUrl(r2StorageService.toPublicUrl(key))
                .imageType(ImageType.PROGRESS)
                .uploadedByUserId(currentUserId())
                .build()).toList();

        ticketImageRepository.saveAll(images);
        return images.stream().map(this::toResponse).toList();
    }

    @Transactional
    public void deleteAllImagesByProgressId(String ticketId, String progressId) {
        List<TicketImage> images = ticketImageRepository.findAllByTicketIdAndImageType(ticketId, ImageType.PROGRESS)
                .stream()
                .filter(img -> progressId.equals(img.getTicketProgressId()))
                .toList();
        for (TicketImage img : images) {
            r2StorageService.deleteImage(img.getObjectKey());
        }

        ticketImageRepository.deleteAll(images);
    }

    // Private helpers
    private List<TicketImageResponse> doUpload(
            Ticket ticket, List<MultipartFile> files, ImageType type) {

        // folder: tickets/{ticketId}/before hoặc tickets/{ticketId}/after
        String folder = "tickets/" + ticket.getId() + "/" + type.name().toLowerCase();

        List<String> objectKeys = r2StorageService.uploadImages(files, folder);

        List<TicketImage> images = objectKeys.stream().map(key -> TicketImage.builder()
                .ticketId(ticket.getId())
                .objectKey(key)
                .imageUrl(r2StorageService.toPublicUrl(key))
                .imageType(type)
                .uploadedByUserId(currentUserId())
                .build()).toList();

        ticketImageRepository.saveAll(images);
        return images.stream().map(this::toResponse).toList();
    }

    private void checkUploadPermission(Ticket ticket, ImageType type) {
        Authentication auth = currentAuth();
        String uid = currentUserId();

        // TICKET_ASSIGN = quyền của ADMIN/MANAGER
        if (hasAuthority(auth, "TICKET_ASSIGN")) return;

        if (type == ImageType.BEFORE) {
            // Chỉ người tạo ticket (REPORTER) mới được upload BEFORE
            if (!uid.equals(ticket.getCreatedByUserId()))
                throw new AppException(ErrorCode.ACCESS_DENIED);
            return;
        }

        if (type == ImageType.AFTER) {
            // Chỉ technician được assign mới được upload AFTER
            if (!uid.equals(ticket.getAssignedTechnicianId()))
                throw new AppException(ErrorCode.ACCESS_DENIED);
            return;
        }

        throw new AppException(ErrorCode.ACCESS_DENIED);
    }

    private boolean hasAuthority(Authentication auth, String authority) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals(authority));
    }

    private Ticket findActiveTicket(String id) {
        return ticketRepository.findById(id)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
    }

    private Authentication currentAuth() {
        return SecurityContextHolder.getContext().getAuthentication();
    }

    private String currentUserId() {
        var jwt = (org.springframework.security.oauth2.jwt.Jwt) currentAuth().getPrincipal();
        return jwt.getClaimAsString("userId");
    }


    private TicketImageResponse toResponse(TicketImage img) {
        return TicketImageResponse.builder()
                .id(img.getId())
                .ticketId(img.getTicketId())
                .imageUrl(img.getImageUrl())
                .imageType(img.getImageType())
                .uploadedByUserId(img.getUploadedByUserId())
                .uploadedAt(img.getUploadedAt())
                .build();
    }
}