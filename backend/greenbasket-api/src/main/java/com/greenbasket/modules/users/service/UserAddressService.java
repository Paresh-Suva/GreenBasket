package com.greenbasket.modules.users.service;

import com.greenbasket.exception.BusinessException;
import com.greenbasket.exception.ErrorCode;
import com.greenbasket.modules.users.dto.request.AddressRequest;
import com.greenbasket.modules.users.dto.response.AddressResponse;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.entity.UserAddress;
import com.greenbasket.modules.users.repository.UserAddressRepository;
import com.greenbasket.modules.users.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserAddressService {

    private final UserAddressRepository userAddressRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<AddressResponse> getAddresses(Long userId) {
        return userAddressRepository.findByUser_Id(userId).stream()
                .map(this::mapToResponse)
                .toList();
    }

    @Transactional
    public AddressResponse createAddress(Long userId, AddressRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "User not found"));

        List<UserAddress> existing = userAddressRepository.findByUser_Id(userId);
        boolean isFirst = existing.isEmpty();

        UserAddress address = UserAddress.builder()
                .user(user)
                .addressType(request.getAddressType())
                .label(request.getLabel())
                .addressLine1(request.getAddressLine1())
                .addressLine2(request.getAddressLine2())
                .city(request.getCity())
                .state(request.getState())
                .postalCode(request.getPostalCode())
                .country(request.getCountry())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .isDefault(isFirst || request.isDefault())
                .build();

        if (address.isDefault() && !isFirst) {
            clearDefaults(userId);
        }

        address = userAddressRepository.save(address);
        return mapToResponse(address);
    }

    @Transactional
    public AddressResponse updateAddress(Long userId, Long addressId, AddressRequest request) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        address.setAddressType(request.getAddressType());
        address.setLabel(request.getLabel());
        address.setAddressLine1(request.getAddressLine1());
        address.setAddressLine2(request.getAddressLine2());
        address.setCity(request.getCity());
        address.setState(request.getState());
        address.setPostalCode(request.getPostalCode());
        address.setCountry(request.getCountry());
        address.setLatitude(request.getLatitude());
        address.setLongitude(request.getLongitude());

        if (request.isDefault() && !address.isDefault()) {
            clearDefaults(userId);
            address.setDefault(true);
        }

        address = userAddressRepository.save(address);
        return mapToResponse(address);
    }

    @Transactional
    public void deleteAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        userAddressRepository.delete(address);

        // If we deleted the default, set another one as default if any remain
        if (address.isDefault()) {
            List<UserAddress> remaining = userAddressRepository.findByUser_Id(userId);
            if (!remaining.isEmpty()) {
                UserAddress first = remaining.get(0);
                first.setDefault(true);
                userAddressRepository.save(first);
            }
        }
    }

    @Transactional
    public AddressResponse setDefaultAddress(Long userId, Long addressId) {
        UserAddress address = userAddressRepository.findById(addressId)
                .orElseThrow(() -> new BusinessException(ErrorCode.RESOURCE_NOT_FOUND, "Address not found"));

        if (!address.getUser().getId().equals(userId)) {
            throw new BusinessException(ErrorCode.UNAUTHORIZED_ACCESS);
        }

        clearDefaults(userId);
        address.setDefault(true);
        address = userAddressRepository.save(address);
        return mapToResponse(address);
    }

    private void clearDefaults(Long userId) {
        List<UserAddress> addresses = userAddressRepository.findByUser_Id(userId);
        for (UserAddress addr : addresses) {
            if (addr.isDefault()) {
                addr.setDefault(false);
                userAddressRepository.save(addr);
            }
        }
    }

    private AddressResponse mapToResponse(UserAddress address) {
        return AddressResponse.builder()
                .id(address.getId())
                .addressType(address.getAddressType())
                .label(address.getLabel())
                .addressLine1(address.getAddressLine1())
                .addressLine2(address.getAddressLine2())
                .city(address.getCity())
                .state(address.getState())
                .postalCode(address.getPostalCode())
                .country(address.getCountry())
                .latitude(address.getLatitude())
                .longitude(address.getLongitude())
                .isDefault(address.isDefault())
                .build();
    }
}
