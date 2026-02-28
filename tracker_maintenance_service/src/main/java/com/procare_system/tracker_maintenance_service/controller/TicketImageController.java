package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.dto.response.ApiResponse;
import com.procare_system.tracker_maintenance_service.dto.response.TicketImageResponse;
import com.procare_system.tracker_maintenance_service.enums.ImageType;
import com.procare_system.tracker_maintenance_service.service.TicketImageService;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/tickets/{ticketId}/images")
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class TicketImageController {

    TicketImageService ticketImageService;

    @PostMapping(value = "/before", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<TicketImageResponse>> uploadBeforeImages(
            @PathVariable String ticketId,
            @RequestPart("files") List<MultipartFile> files) {
        return ApiResponse.<List<TicketImageResponse>>builder()
                .result(ticketImageService.uploadBeforeImages(ticketId, files))
                .build();
    }

    @PostMapping(value = "/after", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    @ResponseStatus(HttpStatus.CREATED)
    public ApiResponse<List<TicketImageResponse>> uploadAfterImages(
            @PathVariable String ticketId,
            @RequestPart("files") List<MultipartFile> files) {
        return ApiResponse.<List<TicketImageResponse>>builder()
                .result(ticketImageService.uploadAfterImages(ticketId, files))
                .build();
    }

    @GetMapping
    public ApiResponse<List<TicketImageResponse>> getImages(
            @PathVariable String ticketId,
            @RequestParam(required = false) ImageType type) {
        List<TicketImageResponse> result = (type != null)
                ? ticketImageService.getImagesByType(ticketId, type)
                : ticketImageService.getImages(ticketId);
        return ApiResponse.<List<TicketImageResponse>>builder()
                .result(result)
                .build();
    }

    @DeleteMapping("/{imageId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteImage(
            @PathVariable String ticketId,
            @PathVariable String imageId) {
        ticketImageService.deleteImage(ticketId, imageId);
    }
}