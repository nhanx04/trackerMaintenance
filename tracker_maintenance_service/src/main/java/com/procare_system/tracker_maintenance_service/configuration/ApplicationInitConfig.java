package com.procare_system.tracker_maintenance_service.configuration;

import com.procare_system.tracker_maintenance_service.entity.User;
import com.procare_system.tracker_maintenance_service.enums.Role;
import com.procare_system.tracker_maintenance_service.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.math.BigDecimal;

@Configuration
@RequiredArgsConstructor
@Slf4j
public class ApplicationInitConfig {
    private final PasswordEncoder passwordEncoder;

    @Bean
    ApplicationRunner applicationRunner(UserRepository userRepository) {
        return args -> {

            if(userRepository.findByUsername("admin").isEmpty()) {
                User user = User.builder()
                        .username("admin")
                        .password(passwordEncoder.encode("admin"))
                        .active(true)
                        .role(Role.ADMIN)
                        .build();

                userRepository.save(user);

                log.warn("Created ADMIN");
            }
        };
    }
}