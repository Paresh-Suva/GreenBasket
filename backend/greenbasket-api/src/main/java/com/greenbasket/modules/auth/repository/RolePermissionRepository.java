package com.greenbasket.modules.auth.repository;

import com.greenbasket.modules.auth.entity.RolePermission;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface RolePermissionRepository extends JpaRepository<RolePermission, Long> {

    List<RolePermission> findByRole_Id(Long roleId);

    List<RolePermission> findByPermission_Id(Long permissionId);
}
