package com.greenbasket.modules.warehouse.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.warehouse.dto.response.WarehouseResponse;
import com.greenbasket.modules.warehouse.service.WarehouseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/warehouse")
@RequiredArgsConstructor
@Tag(name = "Warehouse", description = "Public warehouse info APIs")
public class WarehouseController {

    private final WarehouseService warehouseService;

    @GetMapping
    @Operation(summary = "Get configured warehouse details")
    public ApiResponse<WarehouseResponse> getWarehouse() {
        return ApiResponse.success(warehouseService.getWarehouse());
    }
}
