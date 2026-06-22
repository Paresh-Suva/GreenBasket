package com.greenbasket.modules.orders.entity;

import jakarta.persistence.Column;
import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

@Embeddable
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DeliveryAddressSnapshot {

    @Column(name = "delivery_address_type", length = 20)
    private String addressType;

    @Column(name = "delivery_label", length = 100)
    private String label;

    @Column(name = "delivery_address_line1", length = 255)
    private String addressLine1;

    @Column(name = "delivery_address_line2", length = 255)
    private String addressLine2;

    @Column(name = "delivery_city", length = 100)
    private String city;

    @Column(name = "delivery_state", length = 100)
    private String state;

    @Column(name = "delivery_postal_code", length = 20)
    private String postalCode;

    @Column(name = "delivery_country", length = 100)
    private String country;

    @Column(name = "delivery_latitude", precision = 10, scale = 7)
    private java.math.BigDecimal latitude;

    @Column(name = "delivery_longitude", precision = 10, scale = 7)
    private java.math.BigDecimal longitude;
}
