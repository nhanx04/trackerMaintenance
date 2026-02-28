package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.CreateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketResponse;
import com.procare_system.tracker_maintenance_service.enums.TicketPriority;
import com.procare_system.tracker_maintenance_service.enums.TicketStatus;
import com.procare_system.tracker_maintenance_service.service.TicketService;
import jakarta.validation.Valid;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/tickets")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketController {

    TicketService ticketService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<TicketResponse> createTicket(
            @Valid @RequestBody CreateTicketRequest request) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.createTicket(request))
                .build();
    }

    @GetMapping("/{id}")
    public ApiResponse<TicketResponse> getTicketById(@PathVariable String id) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.getTicketById(id))
                .build();
    }

    @GetMapping
    public ApiResponse<Page<TicketResponse>> getTickets(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) TicketStatus status,
            @RequestParam(required = false) TicketPriority priority,
            @RequestParam(required = false) String deviceId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<Page<TicketResponse>>builder()
                .result(ticketService.getTickets(title, status, priority, deviceId, page, size))
                .build();
    }

    @GetMapping("/{id}/status")
    public ApiResponse<TicketStatus> checkStatus(@PathVariable String id) {
        return ApiResponse.<TicketStatus>builder()
                .result(ticketService.checkStatus(id))
                .build();
    }

    @PutMapping("/{id}")
    public ApiResponse<TicketResponse> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody UpdateTicketRequest request) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.updateTicket(id, request))
                .build();
    }

    @PatchMapping("/{id}/cancel")
    public ApiResponse<TicketResponse> cancelTicket(@PathVariable String id) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.cancelTicket(id))
                .build();
    }

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteTicket(@PathVariable String id) {
        ticketService.deleteTicket(id);
    }
}