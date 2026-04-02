package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.AddCommentRequest;
import com.procare_system.tracker_maintenance_service.dto.response.TicketCommentResponse;
import com.procare_system.tracker_maintenance_service.entity.Ticket;
import com.procare_system.tracker_maintenance_service.entity.TicketComment;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.repository.TicketCommentRepository;
import com.procare_system.tracker_maintenance_service.repository.TicketRepository;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketCommentService {

    TicketCommentRepository ticketCommentRepository;
    TicketRepository ticketRepository;

    @PreAuthorize("hasAnyAuthority('TICKET_READ')")
    @Transactional
    public TicketCommentResponse addComment(String ticketId, AddCommentRequest request) {
        Ticket ticket = findActiveTicket(ticketId);

        Jwt jwt = currentJwt();
        String authorId = jwt.getClaimAsString("userId");
        String authorName = jwt.getClaimAsString("firstName");

        TicketComment comment = TicketComment.builder()
                .ticketId(ticket.getId())
                .authorId(authorId)
                .authorName(authorName)
                .content(request.getContent())
                .build();

        ticketCommentRepository.save(comment);
        return toResponse(comment);
    }

    @PreAuthorize("hasAnyAuthority('TICKET_READ')")
    public List<TicketCommentResponse> getComments(String ticketId) {
        findActiveTicket(ticketId);

        return ticketCommentRepository
                .findAllByTicketIdAndIsDeletedFalseOrderByCreatedAtAsc(ticketId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    // --- helpers ---

    private Ticket findActiveTicket(String ticketId) {
        return ticketRepository.findById(ticketId)
                .filter(t -> !t.isDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.TICKET_NOT_FOUND));
    }

    private Jwt currentJwt() {
        return (Jwt) SecurityContextHolder.getContext().getAuthentication().getPrincipal();
    }

    private TicketCommentResponse toResponse(TicketComment comment) {
        return TicketCommentResponse.builder()
                .id(comment.getId())
                .ticketId(comment.getTicketId())
                .authorId(comment.getAuthorId())
                .authorName(comment.getAuthorName())
                .content(comment.getContent())
                .createdAt(comment.getCreatedAt())
                .build();
    }
}