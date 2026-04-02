package com.procare_system.tracker_maintenance_service.enums;

public enum Permission {
    // User
    USER_CREATE,
    USER_READ,
    USER_UPDATE,
    USER_DELETE,

    // Device
    DEVICE_CREATE,
    DEVICE_READ,
    DEVICE_UPDATE,
    DEVICE_DELETE,

    // Ticket
    TICKET_CREATE,
    TICKET_READ,
    TICKET_UPDATE,
    TICKET_DELETE,
    TICKET_ASSIGN,
    TICKET_CONFIRM,

    // Dashboard
    DASHBOARD_READ,

    // Role & Permission management
    ROLE_MANAGE,
    PERMISSION_MANAGE,
}