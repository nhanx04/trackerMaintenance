package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.dto.request.CreateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateDeviceRequest;
import com.procare_system.tracker_maintenance_service.dto.response.DeviceResponse;
import com.procare_system.tracker_maintenance_service.entity.Device;
import com.procare_system.tracker_maintenance_service.enums.DeviceStatus;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import com.procare_system.tracker_maintenance_service.mapper.DeviceMapper;
import com.procare_system.tracker_maintenance_service.repository.DeviceRepository;
import jakarta.persistence.criteria.Predicate;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.util.ArrayList;
import java.util.List;


@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class DeviceService {
    DeviceRepository deviceRepository;
    DeviceMapper deviceMapper;
    R2StorageService r2StorageService;

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public DeviceResponse createDevice(CreateDeviceRequest request) {
        if (deviceRepository.existsByCode(request.getCode())) {
            throw new AppException(ErrorCode.DEVICE_CODE_EXISTED);
        }

        Device device = deviceMapper.toDevice(request);
        deviceRepository.save(device);

        return deviceMapper.toDeviceResponse(device);
    }

    public DeviceResponse getDeviceById(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_ID_NOT_EXISTED));
        return deviceMapper.toDeviceResponse(device);
    }

    public Page<DeviceResponse> getDevices(String name, DeviceStatus status, String location, int page, int size) {
        Pageable pageable = PageRequest.of(page, size);


        Specification<Device> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            predicates.add(cb.equal(root.get("isDeleted"), false));

            if (StringUtils.hasText(name)) {
                predicates.add(cb.like(cb.lower(root.get("name")), "%" + name.toLowerCase() + "%"));
            }
            if (status != null) {
                predicates.add(cb.equal(root.get("status"), status));
            }
            if (StringUtils.hasText(location)) {
                predicates.add(cb.like(cb.lower(root.get("location")), "%" + location.toLowerCase() + "%"));
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return deviceRepository.findAll(spec, pageable)
                .map(deviceMapper::toDeviceResponse);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public DeviceResponse updateDevice(Long id, UpdateDeviceRequest request) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_ID_NOT_EXISTED));

        deviceMapper.updateDevice(request, device);
        deviceRepository.save(device);

        return deviceMapper.toDeviceResponse(device);
    }

    @PreAuthorize("hasAnyRole('MANAGER', 'ADMIN')")
    public void deleteDevice(Long id) {
        Device device = deviceRepository.findById(id)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_ID_NOT_EXISTED));

        device.setDeleted(true);
        deviceRepository.save(device);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public DeviceResponse uploadDeviceImage(Long deviceId, MultipartFile file) {

        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_ID_NOT_EXISTED));

        String folder = "devices/" + deviceId;

        String newObjectKey = r2StorageService
                .uploadImages(List.of(file), folder)
                .getFirst();

        String oldObjectKey = device.getImageObjectKey();

        device.setImageObjectKey(newObjectKey);
        device.setImageUrl(r2StorageService.toPublicUrl(newObjectKey));
        deviceRepository.save(device);

        // xoá sau khi DB update thành công
        if (oldObjectKey != null) {
            r2StorageService.deleteImage(oldObjectKey);
        }

        return deviceMapper.toDeviceResponse(device);
    }

    @Transactional
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public DeviceResponse deleteDeviceImage(Long deviceId) {
        Device device = deviceRepository.findById(deviceId)
                .orElseThrow(() -> new AppException(ErrorCode.DEVICE_ID_NOT_EXISTED));

        String oldKey = device.getImageObjectKey();
        if (oldKey != null) {
            r2StorageService.deleteImage(oldKey);
        }

        device.setImageObjectKey(null);
        device.setImageUrl(null);
        deviceRepository.save(device);

        return deviceMapper.toDeviceResponse(device);
    }
}