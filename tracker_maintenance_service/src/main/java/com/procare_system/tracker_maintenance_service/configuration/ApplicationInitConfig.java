package com.procare_system.tracker_maintenance_service.configuration;

import com.procare_system.tracker_maintenance_service.entity.RoleEntity;
import com.procare_system.tracker_maintenance_service.entity.User;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.repository.RoleRepository;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.core.annotation.Order;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Set;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {

    private final PasswordEncoder passwordEncoder;
    private final RoleRepository roleRepository;

    @Bean
    @Order(2)
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {
            if (userRepository.findByUsername("admin").isEmpty()) {

                RoleEntity adminRole = roleRepository.findById(Role.ADMIN)
                        .orElseThrow(() -> new RuntimeException("ADMIN role not seeded yet"));

                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .active(true)
                        .roles(Set.of(adminRole))
                        .build();

                userRepository.save(user);
                log.warn("Created default ADMIN user");
            }
        };
    }
}