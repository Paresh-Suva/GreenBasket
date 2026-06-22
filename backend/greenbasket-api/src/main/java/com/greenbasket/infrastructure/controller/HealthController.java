package com.greenbasket.infrastructure.controller;

import com.greenbasket.common.response.ApiResponse;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/health")
public class HealthController {

    @GetMapping
    public ApiResponse<Map<String, String>> health() {
        return ApiResponse.success("GreenBasket API is running",
                Map.of("status", "UP", "service", "greenbasket-api"));
    }
}
