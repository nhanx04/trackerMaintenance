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
    UNAUTHORIZED( "Unauthorized", HttpStatus.FORBIDDEN),
    USERNAME_NOT_EXISTED( "Username not existed", HttpStatus.NOT_FOUND),
    USER_ID_NOT_EXISTED( "User id not existed", HttpStatus.NOT_FOUND),
    USERNAME_EXISTED( "Username existed", HttpStatus.BAD_REQUEST),
    USER_DISABLED( "User is disabled", HttpStatus.FORBIDDEN),
    DEVICE_ID_NOT_EXISTED( "Device id not existed", HttpStatus.NOT_FOUND),
    DEVICE_CODE_EXISTED( "Device code existed", HttpStatus.BAD_REQUEST),
    DEVICE_CODE_REQUIRED( "Device code is required", HttpStatus.BAD_REQUEST),
    DEVICE_NAME_REQUIRED( "Device name is required", HttpStatus.BAD_REQUEST),
    INVALID_KEY( "Invalid key", HttpStatus.BAD_REQUEST),
    INVALID_ENUM_VALUE( "Invalid enum value", HttpStatus.BAD_REQUEST),
    TICKET_NOT_FOUND( "Ticket not found", HttpStatus.NOT_FOUND),
    TICKET_TITLE_BLANK( "Ticket title must not be blank", HttpStatus.BAD_REQUEST),
    TICKET_PRIORITY_NULL( "Ticket priority must not be null", HttpStatus.BAD_REQUEST),
    TICKET_DEVICE_NULL( "Device ID must not be blank", HttpStatus.BAD_REQUEST),
    TICKET_DATE_PAST( "Scheduled date must be today or in the future", HttpStatus.BAD_REQUEST),
    TICKET_INVALID_STATUS_TRANSITION( "Invalid ticket status transition", HttpStatus.BAD_REQUEST),
    TICKET_ALREADY_CANCELLED( "Ticket is already cancelled", HttpStatus.BAD_REQUEST),
    TICKET_CANNOT_CANCEL( "Only PENDING or IN_PROGRESS tickets can be cancelled", HttpStatus.BAD_REQUEST),
    ACCESS_DENIED( "Access denied", HttpStatus.FORBIDDEN),
    FILE_EMPTY( "File must not be empty", HttpStatus.BAD_REQUEST),
    FILE_TOO_LARGE( "File size exceeds 10MB limit", HttpStatus.BAD_REQUEST),
    FILE_INVALID_TYPE( "Only JPEG, PNG, WEBP, HEIC are allowed", HttpStatus.BAD_REQUEST),
    FILE_TOO_MANY( "Maximum 10 images per upload", HttpStatus.BAD_REQUEST),
    FILE_UPLOAD_FAILED( "Failed to upload file to storage", HttpStatus.INTERNAL_SERVER_ERROR),
    IMAGE_NOT_FOUND( "Image not found", HttpStatus.NOT_FOUND),
    IMAGE_NOT_BELONG_TO_TICKET( "Image does not belong to this ticket", HttpStatus.BAD_REQUEST),
    TECHNICIAN_ID_REQUIRED( "Technician ID is required", HttpStatus.BAD_REQUEST),
    NOTE_REQUIRED( "Note is required", HttpStatus.BAD_REQUEST),
    PROGRESS_NOT_FOUND( "Ticket progress not found", HttpStatus.NOT_FOUND)
    ;

    ErrorCode( String message, HttpStatus statusCode) {
        this.message = message;
        this.statusCode = statusCode;
    }
    public static class Key {
        public static final String DEVICE_CODE_REQUIRED = "DEVICE_CODE_REQUIRED";
        public static final String DEVICE_NAME_REQUIRED = "DEVICE_NAME_REQUIRED";
        public static final String  TECHNICAIN_ID_REQUIRED = "TECHNICIAN_ID_REQUIRED";
        public static final String NOTE_REQUIRED = "NOTE_REQUIRED";
    }

    final String message;
    final HttpStatus statusCode;
}
