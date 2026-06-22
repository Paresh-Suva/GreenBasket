package com.greenbasket.modules.users.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.users.dto.request.AddressRequest;
import com.greenbasket.modules.users.dto.response.AddressResponse;
import com.greenbasket.modules.users.service.UserAddressService;
import com.greenbasket.security.SecurityUtils;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/addresses")
@RequiredArgsConstructor
@PreAuthorize("isAuthenticated()")
@Tag(name = "User Addresses", description = "Endpoints for managing user delivery addresses")
public class UserAddressController {

    private final UserAddressService userAddressService;

    @GetMapping
    @Operation(summary = "Get current user's addresses")
    public ApiResponse<List<AddressResponse>> getAddresses() {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success(userAddressService.getAddresses(userId));
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a new user address")
    public ApiResponse<AddressResponse> createAddress(@Valid @RequestBody AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Address created successfully", userAddressService.createAddress(userId, request));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update an existing user address")
    public ApiResponse<AddressResponse> updateAddress(
            @PathVariable Long id,
            @Valid @RequestBody AddressRequest request) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Address updated successfully", userAddressService.updateAddress(userId, id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete an existing user address")
    public ApiResponse<Void> deleteAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        userAddressService.deleteAddress(userId, id);
        return ApiResponse.success("Address deleted successfully");
    }

    @PatchMapping("/{id}/default")
    @Operation(summary = "Set an address as the default delivery address")
    public ApiResponse<AddressResponse> setDefaultAddress(@PathVariable Long id) {
        Long userId = SecurityUtils.getCurrentUserId();
        return ApiResponse.success("Default address updated", userAddressService.setDefaultAddress(userId, id));
    }
}
