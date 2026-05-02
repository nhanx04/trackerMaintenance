package com.procare_system.tracker_maintenance_service.controller;

import com.procare_system.tracker_maintenance_service.service.DeviceQRCodeService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/devices")
@RequiredArgsConstructor
public class DeviceQRCodeController {

    private final DeviceQRCodeService deviceQRCodeService;

    @GetMapping(value = "/{id}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQRCodeById(@PathVariable Long id) {
        byte[] qrImage = deviceQRCodeService.generateQRByDeviceId(id);
        return buildImageResponse(qrImage, "device-qr-" + id);
    }

    @GetMapping(value = "/code/{code}/qr", produces = MediaType.IMAGE_PNG_VALUE)
    public ResponseEntity<byte[]> getQRCodeByCode(@PathVariable String code) {
        byte[] qrImage = deviceQRCodeService.generateQRByDeviceCode(code);
        return buildImageResponse(qrImage, "device-qr-" + code);
    }

    private ResponseEntity<byte[]> buildImageResponse(byte[] image, String filename) {
        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        "inline; filename=\"" + filename + ".png\"")
                .contentType(MediaType.IMAGE_PNG)
                .contentLength(image.length)
                .body(image);
    }
}