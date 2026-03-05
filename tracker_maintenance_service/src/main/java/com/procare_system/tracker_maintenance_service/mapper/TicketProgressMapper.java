package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.response.TicketProgressResponse;
import com.procare_system.tracker_maintenance_service.entity.TicketProgress;
import org.mapstruct.Mapper;

@Mapper(componentModel = "spring")
public interface TicketProgressMapper {

    TicketProgressResponse toTicketProgressResponse(TicketProgress progress);

}