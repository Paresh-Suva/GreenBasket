package com.greenbasket.modules.users.dto.response;

import com.greenbasket.modules.users.enums.AddressType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddressResponse {
    private Long id;
    private AddressType addressType;
    private String label;
    private String addressLine1;
    private String addressLine2;
    private String city;
    private String state;
    private String postalCode;
    private String country;
    private java.math.BigDecimal latitude;
    private java.math.BigDecimal longitude;
    private boolean isDefault;
}
