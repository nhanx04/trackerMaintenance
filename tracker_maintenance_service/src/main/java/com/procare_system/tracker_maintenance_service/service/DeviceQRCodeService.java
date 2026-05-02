package com.procare_system.tracker_maintenance_service.service;

import com.google.zxing.WriterException;
import com.procare_system.tracker_maintenance_service.entity.Device;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.repository.DeviceRepository;
import com.procare_system.tracker_maintenance_service.util.QRCodeUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;

@Service
@RequiredArgsConstructor
public class DeviceQRCodeService {

    private final DeviceRepository deviceRepository;

    @Value("${app.base-url:http://localhost:8080}")
    private String baseUrl;

    private static final int QR_WIDTH  = 300;
    private static final int QR_HEIGHT = 300;

    public byte[] generateQRByDeviceId(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .filter(d -> !d.isDeleted())
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        String content = buildDeviceUrl(deviceId);
        return encodeToQR(content);
    }

    public byte[] generateQRByDeviceCode(String code) {
        Device device = deviceRepository.findByCodeAndIsDeletedFalse(code)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_NOT_FOUND));

        String content = buildDeviceUrl(device.getId());
        return encodeToQR(content);
    }


    private String buildDeviceUrl(Long deviceId) {
        return baseUrl + "/api/devices/" + deviceId;
    }

    private byte[] encodeToQR(String content) {
        try {
            return QRCodeUtils.generateQRCodeImage(content, QR_WIDTH, QR_HEIGHT);
        } catch (WriterException | IOException e) {
            throw new AppException(ErrorCode.QR_CODE_GENERATION_FAILED);
        }
    }
}