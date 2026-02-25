package com.procare_system.tracker_maintenance_service.exception;

import lombok.AccessLevel;
import lombok.Getter;
import lombok.experimental.FieldDefaults;
import org.springframework.http.HttpStatus;

@Getter
@FieldDefaults(level = AccessLevel.PRIVATE, makeFinal = true)
public enum ErrorCode {
    UNCATEGORIZED_EXCEPTION("Uncategorize exception", HttpStatus.INTERNAL_SERVER_ERROR),
    UNAUTHENTICATED( "Unauthenticated", HttpStatus.UNAUTHORIZED),
    USERNAME_NOT_EXISTED( "Username not existed", HttpStatus.NOT_FOUND),
    USER_ID_NOT_EXISTED( "User id not existed", HttpStatus.NOT_FOUND),
    USERNAME_EXISTED( "Username existed", HttpStatus.BAD_REQUEST),
    USER_DISABLED( "User is disabled", HttpStatus.FORBIDDEN),
    DEVICE_ID_NOT_EXISTED( "Device id not existed", HttpStatus.NOT_FOUND),
    DEVICE_CODE_EXISTED( "Device code existed", HttpStatus.BAD_REQUEST),
    DEVICE_CODE_REQUIRED( "Device code is required", HttpStatus.BAD_REQUEST),
    DEVICE_NAME_REQUIRED( "Device name is required", HttpStatus.BAD_REQUEST),
    INVALID_KEY( "Invalid key", HttpStatus.BAD_REQUEST)
    ;

    ErrorCode( String message, HttpStatus statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
    public static class Key {
        public static final String DEVICE_CODE_REQUIRED = "DEVICE_CODE_REQUIRED";
        public static final String DEVICE_NAME_REQUIRED = "DEVICE_NAME_REQUIRED";
    }

    final String message;
    final HttpStatus statusCode;
}
