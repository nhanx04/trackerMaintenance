package com.procare_system.tracker_maintenance_service.mapper;

import com.procare_system.tracker_maintenance_service.dto.request.CreateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.request.UpdateScheduleRequest;
import com.procare_system.tracker_maintenance_service.dto.response.ScheduleResponse;
import com.procare_system.tracker_maintenance_service.entity.MaintenanceSchedule;
import org.mapstruct.*;

@Mapper(componentModel = "spring")
public interface ScheduleMapper {

    MaintenanceSchedule toSchedule(CreateScheduleRequest request);

    ScheduleResponse toScheduleResponse(MaintenanceSchedule schedule);

    @BeanMapping(nullValuePropertyMappingStrategy = NullValuePropertyMappingStrategy.IGNORE)
    void updateSchedule(UpdateScheduleRequest request, @MappingTarget MaintenanceSchedule schedule);
}