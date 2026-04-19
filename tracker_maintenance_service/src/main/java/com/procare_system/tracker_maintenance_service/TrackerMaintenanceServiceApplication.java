package com.procare_system.tracker_maintenance_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.data.jpa.repository.config.EnableJpaAuditing;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableJpaAuditing
@EnableScheduling
public class TrackerMaintenanceServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(TrackerMaintenanceServiceApplication.class, args);
	}

}
