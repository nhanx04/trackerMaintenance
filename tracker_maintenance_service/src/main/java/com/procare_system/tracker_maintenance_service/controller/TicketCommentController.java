package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.AddCommentRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketCommentResponse;
import com.procare_system.tracker_maintenance_service.service.TicketCommentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/comments")
@RequiredArgsConstructor
public class TicketCommentController {

    private final TicketCommentService ticketCommentService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TicketCommentResponse> addComment(
            @PathVariable String ticketId,
            @RequestBody @Valid AddCommentRequest request) {

        return ApiResponse.<TicketCommentResponse>builder()
                .result(ticketCommentService.addComment(ticketId, request))
                .build();
    }

    @GetMapping
    public ApiResponse<List<TicketCommentResponse>> getComments(
            @PathVariable String ticketId) {

        return ApiResponse.<List<TicketCommentResponse>>builder()
                .result(ticketCommentService.getComments(ticketId))
                .build();
    }
}