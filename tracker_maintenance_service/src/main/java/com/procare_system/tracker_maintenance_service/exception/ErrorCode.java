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
    ;

    ErrorCode( String message, HttpStatus statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }

    String message;
    HttpStatus statusCode;
}
