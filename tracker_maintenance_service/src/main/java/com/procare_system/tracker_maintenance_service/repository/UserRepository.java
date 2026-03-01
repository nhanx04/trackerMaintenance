package com.procare_system.tracker_maintenance_service.repository;

import com.procare_system.tracker_maintenance_service.entity.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import com.procare_system.tracker_maintenance_service.enums.Role;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);

    Page<User> findAllByActiveTrue(Pageable pageable);
    Page<User> findByRolesContainingAndActiveTrue(Role role, Pageable pageable);
}
