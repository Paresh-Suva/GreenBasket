package com.greenbasket.modules.warehouse.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.warehouse.dto.request.WarehouseRequest;
import com.greenbasket.modules.warehouse.dto.response.WarehouseResponse;
import com.greenbasket.modules.warehouse.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin/warehouse")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Warehouse", description = "Admin warehouse management APIs")
public class AdminWarehouseController {

    private final WarehouseService warehouseService;

    @PostMapping
    @Operation(summary = "Configure or update warehouse details")
    public ApiResponse<WarehouseResponse> saveOrUpdateWarehouse(@Valid @RequestBody WarehouseRequest request) {
        return ApiResponse.success("Warehouse configuration saved successfully", warehouseService.saveOrUpdateWarehouse(request));
    }
}
