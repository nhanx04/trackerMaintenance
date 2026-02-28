package com.procare_system.tracker_maintenance_service.service;

import com.procare_system.tracker_maintenance_service.configuration.R2Properties;
import com.procare_system.tracker_maintenance_service.exception.AppException;
import com.procare_system.tracker_maintenance_service.exception.ErrorCode;
import lombok.AccessLevel;
import lombok.RequiredArgsConstructor;
import lombok.experimental.FieldDefaults;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import software.amazon.awssdk.core.sync.RequestBody;
import software.amazon.awssdk.services.s3.S3Client;
import software.amazon.awssdk.services.s3.model.DeleteObjectRequest;
import software.amazon.awssdk.services.s3.model.PutObjectRequest;

import java.io.IOException;
import java.util.List;
import java.util.Set;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public class R2StorageService {

    S3Client r2Client;
    R2Properties props;

    static Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg", "image/png", "image/webp", "image/heic"
    );
    static long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
    static int  MAX_FILES     = 10;

    //  Upload nhiều ảnh, trả về list objectKey đã upload
    public List<String> uploadImages(List<MultipartFile> files, String folder) {
        validateFiles(files);

        return files.stream().map(file -> {
            String ext       = getExtension(file.getOriginalFilename());
            String objectKey = folder + "/" + UUID.randomUUID() + "." + ext;

            try {
                PutObjectRequest putReq = PutObjectRequest.builder()
                        .bucket(props.getBucketName())
                        .key(objectKey)
                        .contentType(file.getContentType())
                        .contentLength(file.getSize())
                        .build();

                r2Client.putObject(putReq,
                        RequestBody.fromInputStream(file.getInputStream(), file.getSize()));

                log.info("Uploaded to R2: {}", objectKey);
                return objectKey;

            } catch (IOException e) {
                log.error("Failed to upload file: {}", file.getOriginalFilename(), e);
                throw new AppException(ErrorCode.FILE_UPLOAD_FAILED);
            }
        }).toList();
    }

    public void deleteImage(String objectKey) {
        try {
            r2Client.deleteObject(DeleteObjectRequest.builder()
                    .bucket(props.getBucketName())
                    .key(objectKey)
                    .build());
            log.info("Deleted from R2: {}", objectKey);
        } catch (Exception e) {
            log.error("Failed to delete R2 object: {}", objectKey, e);
        }
    }


    public String toPublicUrl(String objectKey) {
        return props.getPublicUrl() + "/" + props.getBucketName() + "/" + objectKey;
    }

    //  Validate
    private void validateFiles(List<MultipartFile> files) {
        if (files == null || files.isEmpty())
            throw new AppException(ErrorCode.FILE_EMPTY);
        if (files.size() > MAX_FILES)
            throw new AppException(ErrorCode.FILE_TOO_MANY);

        for (MultipartFile f : files) {
            if (f.isEmpty())
                throw new AppException(ErrorCode.FILE_EMPTY);
            if (f.getSize() > MAX_FILE_SIZE)
                throw new AppException(ErrorCode.FILE_TOO_LARGE);
            if (!ALLOWED_TYPES.contains(f.getContentType()))
                throw new AppException(ErrorCode.FILE_INVALID_TYPE);
        }
    }

    private String getExtension(String filename) {
        if (filename == null || !filename.contains(".")) return "jpg";
        return filename.substring(filename.lastIndexOf('.') + 1).toLowerCase();
    }
}