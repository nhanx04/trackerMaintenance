package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.request.AssignRequest;
import com.procare_system.tracker_maintenance_service.dto.request.CreateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateTicketRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketProgressResponse;
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
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

import static org.springframework.http.MediaType.MULTIPART_FORM_DATA_VALUE;

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
            @RequestParam(required = false) Boolean isOverdue, // 👇 THÊM DÒNG NÀY
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ApiResponse.<Page<TicketResponse>>builder()
                // Truyền thêm isOverdue vào service
                .result(ticketService.getTickets(title, status, priority, deviceId, isOverdue, page, size))
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


    @PostMapping("/{id}/assign")
    public ApiResponse<TicketResponse> assignTechnician(
            @PathVariable String id,
            @RequestBody AssignRequest request) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.assignTechnician(id, request))
                .build();
    }

    @PostMapping("/{id}/accept")
    public ApiResponse<TicketResponse> acceptTicket(@PathVariable String id) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.acceptTicket(id))
                .build();
    }

    @PostMapping(value = "/{id}/progress", consumes = MULTIPART_FORM_DATA_VALUE)
    public ApiResponse<TicketProgressResponse> updateProgress(
            @PathVariable String id,
            @RequestParam String note,
            @RequestParam(value = "files", required = false) List<MultipartFile> files) {
        return ApiResponse.<TicketProgressResponse>builder()
                .result(ticketService.updateProgress(id, note, files))
                .build();
    }

    @GetMapping("/{id}/progress")
    public ApiResponse<List<TicketProgressResponse>> getTicketProgressHistory(
            @PathVariable String id) {
        return ApiResponse.<List<TicketProgressResponse>>builder()
                .result(ticketService.getTicketProgressHistory(id))
                .build();
    }

    @PostMapping("/{id}/complete")
    public ApiResponse<TicketResponse> markAsCompleted(@PathVariable String id) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.markAsCompleted(id))
                .build();
    }

    @PutMapping("/{id}/progress/{progressId}")
    public ApiResponse<TicketProgressResponse> updateProgressNote(
            @PathVariable String id,
            @PathVariable String progressId,
            @RequestParam("note") String newNote) {
        return ApiResponse.<TicketProgressResponse>builder()
                .result(ticketService.updateProgressNote(id, progressId, newNote))
                .build();
    }

    @DeleteMapping("/{id}/progress/{progressId}")
    public ApiResponse<String> deleteProgress(
            @PathVariable String id,
            @PathVariable String progressId) {
        ticketService.deleteProgress(id, progressId);
        return ApiResponse.<String>builder()
                .result("Ticket progress has been deleted successfully")
                .build();
    }

        @PostMapping("/{id}/unresolvable")
        @PreAuthorize("hasRole('TECHNICIAN')")
        public ApiResponse<TicketResponse> markAsUnresolvable(
                @PathVariable String id,
                @RequestParam String reason) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.markAsUnresolvable(id, reason))
                .build();
        }

        @PostMapping("/{id}/confirm")
        @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
        public ApiResponse<TicketResponse> confirmCompletion(@PathVariable String id) {
        return ApiResponse.<TicketResponse>builder()
                .result(ticketService.confirmCompletion(id))
                .build();
        }

        @GetMapping("/devices/{deviceId}/history")
        public ApiResponse<List<TicketResponse>> getMaintenanceHistory(
                @PathVariable String deviceId) {
        return ApiResponse.<List<TicketResponse>>builder()
                .result(ticketService.getMaintenanceHistoryByDevice(deviceId))
                .build();
        }

}