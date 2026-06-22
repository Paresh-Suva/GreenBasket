package com.greenbasket.modules.auth.repository;

import com.greenbasket.modules.auth.entity.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface UserRoleRepository extends JpaRepository<UserRole, Long> {

    List<UserRole> findByUser_Id(Long userId);

    List<UserRole> findByRole_Id(Long roleId);

    long countByRole_Code(com.greenbasket.modules.auth.enums.RoleCode code);
}
