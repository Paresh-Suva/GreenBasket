package com.greenbasket.security;

import jakarta.servlet.*;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.core.annotation.Order;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;

import java.io.IOException;
import java.time.Instant;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
@Order(1)
public class RateLimitingFilter implements Filter {

    private static final int MAX_TOKENS = 100;
    private static final int REFILL_RATE_PER_SECOND = 2;
    
    private final Map<String, TokenBucket> buckets = new ConcurrentHashMap<>();

    @Override
    public void doFilter(ServletRequest request, ServletResponse response, FilterChain chain)
            throws IOException, ServletException {
        
        if (request instanceof HttpServletRequest httpRequest && response instanceof HttpServletResponse httpResponse) {
            String ip = getClientIp(httpRequest);
            TokenBucket bucket = buckets.computeIfAbsent(ip, k -> new TokenBucket(MAX_TOKENS, REFILL_RATE_PER_SECOND));

            if (!bucket.tryConsume()) {
                httpResponse.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
                httpResponse.setContentType(MediaType.APPLICATION_JSON_VALUE);
                
                String json = String.format(
                        "{\"status\":\"ERROR\",\"code\":\"GB-429-001\",\"message\":\"Too many requests. Please try again later.\",\"path\":\"%s\",\"timestamp\":\"%s\"}",
                        httpRequest.getRequestURI().replace("\"", "\\\""),
                        Instant.now().toString()
                );
                
                httpResponse.getWriter().write(json);
                return;
            }
        }
        
        chain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xfHeader = request.getHeader("X-Forwarded-For");
        if (xfHeader == null) {
            return request.getRemoteAddr();
        }
        return xfHeader.split(",")[0].trim();
    }

    private static class TokenBucket {
        private final long capacity;
        private final double refillRate;
        private double tokens;
        private Instant lastRefillTime;

        public TokenBucket(long capacity, double refillRate) {
            this.capacity = capacity;
            this.refillRate = refillRate;
            this.tokens = capacity;
            this.lastRefillTime = Instant.now();
        }

        public synchronized boolean tryConsume() {
            refill();
            if (tokens >= 1.0) {
                tokens -= 1.0;
                return true;
            }
            return false;
        }

        private void refill() {
            Instant now = Instant.now();
            double elapsedSeconds = java.time.Duration.between(lastRefillTime, now).toNanos() / 1_000_000_000.0;
            if (elapsedSeconds > 0.0) {
                tokens = Math.min(capacity, tokens + elapsedSeconds * refillRate);
                lastRefillTime = now;
            }
        }
    }
}
