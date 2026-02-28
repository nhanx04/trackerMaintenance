package com.procare_system.tracker_maintenance_service.configuration;

import lombok.Data;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Data
@Component
@ConfigurationProperties(prefix = "cloudflare.r2")
public class R2Properties {
    private String endpoint;      // APP_R2_ENDPOINT
    private String publicUrl;     // APP_R2_PUBLIC_BASE_URL
    private String bucketName;    // APP_R2_BUCKET
    private String accessKey;     // APP_R2_ACCESS_KEY_ID
    private String secretKey;     // APP_R2_SECRET_ACCESS_KEY
}