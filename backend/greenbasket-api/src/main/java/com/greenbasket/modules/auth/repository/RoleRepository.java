package com.greenbasket.modules.auth.repository;

import com.greenbasket.modules.auth.entity.Role;
import com.greenbasket.modules.auth.enums.RoleCode;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;

public interface RoleRepository extends JpaRepository<Role, Long> {

    Optional<Role> findByCode(RoleCode code);

    boolean existsByCode(RoleCode code);
}
