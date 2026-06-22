package com.greenbasket.config;

import com.greenbasket.common.constant.ApiConstants;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.PathMatchConfigurer;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    @Override
    public void configurePathMatch(PathMatchConfigurer configurer) {
        configurer.addPathPrefix(ApiConstants.API_BASE_PATH,
                handlerType -> handlerType.getPackageName().startsWith("com.greenbasket.modules")
                        || handlerType.getPackageName().startsWith("com.greenbasket.infrastructure.controller"));
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        registry.addResourceHandler("/uploads/**")
                .addResourceLocations("file:uploads/");
    }
}
