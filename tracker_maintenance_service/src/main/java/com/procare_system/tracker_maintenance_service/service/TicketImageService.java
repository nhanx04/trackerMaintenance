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
    TicketRepository      ticketRepository;
    R2StorageService      r2StorageService;

    //  Chỉ upload được khi ticket đang PENDING
    //  Quyền: ADMIN, MANAGER, REPORTER (người tạo)
    @Transactional
    public List<TicketImageResponse> uploadBeforeImages(
            String ticketId, List<MultipartFile> files) {

        Ticket ticket = findActiveTicket(ticketId);

        if (ticket.getStatus() != TicketStatus.PENDING)
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);

        checkUploadPermission(ticket, ImageType.BEFORE);

        return doUpload(ticket, files, ImageType.BEFORE);
    }

    //  Chỉ upload được khi ticket DONE
    //  Quyền: ADMIN, MANAGER, TECHNICIAN (được assign)
    @Transactional
    public List<TicketImageResponse> uploadAfterImages(
            String ticketId, List<MultipartFile> files) {

        Ticket ticket = findActiveTicket(ticketId);

        if (ticket.getStatus() != TicketStatus.DONE)
            throw new AppException(ErrorCode.TICKET_INVALID_STATUS_TRANSITION);

        checkUploadPermission(ticket, ImageType.AFTER);

        return doUpload(ticket, files, ImageType.AFTER);
    }

    //  Lấy tất cả ảnh của ticket
    public List<TicketImageResponse> getImages(String ticketId) {
        findActiveTicket(ticketId); // validate tồn tại
        return ticketImageRepository.findAllByTicketId(ticketId)
                .stream().map(this::toResponse).toList();
    }


    public List<TicketImageResponse> getImagesByType(String ticketId, ImageType type) {
        findActiveTicket(ticketId);
        return ticketImageRepository.findAllByTicketIdAndImageType(ticketId, type)
                .stream().map(this::toResponse).toList();
    }


    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
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

        // Không cần check quyền ở đây vì TicketService đã check rồi
        String folder = "tickets/" + ticket.getId() + "/progress/" + ticketProgressId;
        List<String> objectKeys = r2StorageService.uploadImages(files, folder);

        List<TicketImage> images = objectKeys.stream().map(key -> TicketImage.builder()
                .ticketId(ticket.getId())
                .ticketProgressId(ticketProgressId) // Đánh dấu ảnh này thuộc về Note tiến độ nào
                .objectKey(key)
                .imageUrl(r2StorageService.toPublicUrl(key))
                .imageType(ImageType.PROGRESS)
                .uploadedByUserId(currentUserId())
                .build()
        ).toList();

        ticketImageRepository.saveAll(images);
        return images.stream().map(this::toResponse).toList();
    }

    //  Private helpers
    private List<TicketImageResponse> doUpload(
            Ticket ticket, List<MultipartFile> files, ImageType type) {

        // folder: tickets/{ticketId}/before  hoặc  tickets/{ticketId}/after
        String folder = "tickets/" + ticket.getId() + "/" + type.name().toLowerCase();

        List<String> objectKeys = r2StorageService.uploadImages(files, folder);

        List<TicketImage> images = objectKeys.stream().map(key -> TicketImage.builder()
                .ticketId(ticket.getId())
                .objectKey(key)
                .imageUrl(r2StorageService.toPublicUrl(key))
                .imageType(type)
                .uploadedByUserId(currentUserId())
                .build()
        ).toList();

        ticketImageRepository.saveAll(images);
        return images.stream().map(this::toResponse).toList();
    }

    private void checkUploadPermission(Ticket ticket, ImageType type) {
        Authentication auth = currentAuth();
        String uid = currentUserId();

        boolean isAdminOrManager = hasRole(auth, "ADMIN") || hasRole(auth, "MANAGER");
        if (isAdminOrManager) return;

        if (type == ImageType.BEFORE && hasRole(auth, "REPORTER")) {
            // Reporter chỉ được upload ảnh BEFORE cho ticket mình tạo
            if (!uid.equals(ticket.getCreatedByUserId()))
                throw new AppException(ErrorCode.ACCESS_DENIED);
            return;
        }

        if (type == ImageType.AFTER && hasRole(auth, "TECHNICIAN")) {
            // Technician chỉ được upload ảnh AFTER cho ticket được assign
            if (!uid.equals(ticket.getAssignedTechnicianId()))
                throw new AppException(ErrorCode.ACCESS_DENIED);
            return;
        }

        throw new AppException(ErrorCode.ACCESS_DENIED);
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

    private boolean hasRole(Authentication auth, String role) {
        return auth.getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_" + role));
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