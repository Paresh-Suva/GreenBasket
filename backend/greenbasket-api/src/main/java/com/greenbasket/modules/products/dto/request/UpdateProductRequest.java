package com.greenbasket.modules.products.dto.request;

import com.greenbasket.modules.products.enums.ProductUnit;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.math.BigDecimal;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UpdateProductRequest {

    private Long categoryId;

    @Size(max = 255, message = "Product name must not exceed 255 characters")
    private String name;

    @Size(max = 300, message = "Slug must not exceed 300 characters")
    @Pattern(regexp = "^[a-z0-9]+(-[a-z0-9]+)*$", message = "Slug must contain only lowercase letters, numbers, and hyphens")
    private String slug;

    @Size(max = 5000, message = "Description must not exceed 5000 characters")
    private String description;

    @DecimalMin(value = "0.01", message = "Price must be greater than 0")
    private BigDecimal price;

    @DecimalMin(value = "0.00", message = "Discount price must be non-negative")
    private BigDecimal discountPrice;

    @DecimalMin(value = "0.001", message = "Weight must be positive")
    private BigDecimal weight;

    private ProductUnit unit;

    @Size(max = 100, message = "Brand must not exceed 100 characters")
    private String brand;

    private Boolean featured;
}
