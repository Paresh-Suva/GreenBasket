package com.greenbasket.modules.warehouse.service;

import com.greenbasket.modules.warehouse.dto.request.WarehouseRequest;
import com.greenbasket.modules.warehouse.dto.response.WarehouseResponse;
import com.greenbasket.modules.warehouse.entity.Warehouse;
import com.greenbasket.modules.warehouse.repository.WarehouseRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class WarehouseService {

    private final WarehouseRepository warehouseRepository;

    @Transactional(readOnly = true)
    public WarehouseResponse getWarehouse() {
        return warehouseRepository.findAll().stream()
                .findFirst()
                .map(this::mapToResponse)
                .orElse(null);
    }

    @Transactional
    public WarehouseResponse saveOrUpdateWarehouse(WarehouseRequest request) {
        Warehouse warehouse = warehouseRepository.findAll().stream()
                .findFirst()
                .orElse(new Warehouse());

        warehouse.setName(request.getName());
        warehouse.setAddress(request.getAddress());
        warehouse.setCity(request.getCity());
        warehouse.setState(request.getState());
        warehouse.setPincode(request.getPincode());
        warehouse.setContactNumber(request.getContactNumber());
        warehouse.setLatitude(request.getLatitude());
        warehouse.setLongitude(request.getLongitude());

        warehouse = warehouseRepository.save(warehouse);
        return mapToResponse(warehouse);
    }

    private WarehouseResponse mapToResponse(Warehouse warehouse) {
        return WarehouseResponse.builder()
                .id(warehouse.getId())
                .name(warehouse.getName())
                .address(warehouse.getAddress())
                .city(warehouse.getCity())
                .state(warehouse.getState())
                .pincode(warehouse.getPincode())
                .contactNumber(warehouse.getContactNumber())
                .latitude(warehouse.getLatitude())
                .longitude(warehouse.getLongitude())
                .build();
    }
}
