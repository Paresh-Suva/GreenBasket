package com.greenbasket.modules.auth;

import com.greenbasket.modules.auth.dto.request.LoginRequest;
import com.greenbasket.modules.auth.dto.request.LogoutRequest;
import com.greenbasket.modules.auth.dto.request.RefreshTokenRequest;
import com.greenbasket.modules.auth.dto.request.RegisterRequest;
import com.greenbasket.modules.auth.dto.request.ResetPasswordRequest;
import com.greenbasket.modules.auth.dto.request.VerifyEmailRequest;
import com.greenbasket.modules.auth.service.PasswordResetService;
import com.greenbasket.modules.users.entity.User;
import com.greenbasket.modules.users.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.webmvc.test.autoconfigure.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;
import org.springframework.test.web.servlet.MvcResult;
import org.springframework.transaction.annotation.Transactional;
import tools.jackson.databind.json.JsonMapper;

import static org.assertj.core.api.Assertions.assertThat;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@SpringBootTest
@AutoConfigureMockMvc
@ActiveProfiles("test")
@Transactional
class AuthControllerIntegrationTest {

    private static final String AUTH_BASE = "/v1/auth";
    private static final String STRONG_PASSWORD = "SecurePass1!";

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private JsonMapper jsonMapper;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordResetService passwordResetService;

    private String userEmail;

    @BeforeEach
    void setUp() {
        userEmail = "auth.test." + System.nanoTime() + "@greenbasket.test";
    }

    @Test
    void shouldRegisterAssignCustomerRoleAndVerifyEmail() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .firstName("John")
                .lastName("Doe")
                .email(userEmail)
                .phoneNumber("9876543210")
                .password(STRONG_PASSWORD)
                .confirmPassword(STRONG_PASSWORD)
                .build();

        MvcResult registerResult = mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("success"))
                .andExpect(jsonPath("$.data.email").value(userEmail))
                .andExpect(jsonPath("$.data.verificationToken").isNotEmpty())
                .andReturn();

        String verificationToken = jsonMapper.readTree(registerResult.getResponse().getContentAsString())
                .path("data").path("verificationToken").asText();

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(LoginRequest.builder()
                                .email(userEmail)
                                .password(STRONG_PASSWORD)
                                .build())))
                .andExpect(status().isForbidden())
                .andExpect(jsonPath("$.code").value("GB-403-012"));

        mockMvc.perform(post(AUTH_BASE + "/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(VerifyEmailRequest.builder()
                                .token(verificationToken)
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.status").value("success"));
    }

    @Test
    void shouldLoginRefreshLogoutAndAccessMe() throws Exception {
        AuthTokens tokens = registerVerifyAndLogin();

        mockMvc.perform(get(AUTH_BASE + "/me")
                        .header("Authorization", "Bearer " + tokens.accessToken()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.email").value(userEmail))
                .andExpect(jsonPath("$.data.roles[0]").value("CUSTOMER"));

        MvcResult refreshResult = mockMvc.perform(post(AUTH_BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(RefreshTokenRequest.builder()
                                .refreshToken(tokens.refreshToken())
                                .build())))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.accessToken").isNotEmpty())
                .andExpect(jsonPath("$.data.refreshToken").isNotEmpty())
                .andReturn();

        String newRefreshToken = jsonMapper.readTree(refreshResult.getResponse().getContentAsString())
                .path("data").path("refreshToken").asText();

        mockMvc.perform(post(AUTH_BASE + "/logout")
                        .header("Authorization", "Bearer " + tokens.accessToken())
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(LogoutRequest.builder()
                                .refreshToken(newRefreshToken)
                                .build())))
                .andExpect(status().isOk());

        mockMvc.perform(post(AUTH_BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(RefreshTokenRequest.builder()
                                .refreshToken(newRefreshToken)
                                .build())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldLogoutFromAllDevices() throws Exception {
        AuthTokens tokens = registerVerifyAndLogin();

        mockMvc.perform(post(AUTH_BASE + "/logout-all")
                        .header("Authorization", "Bearer " + tokens.accessToken()))
                .andExpect(status().isOk());

        mockMvc.perform(post(AUTH_BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(RefreshTokenRequest.builder()
                                .refreshToken(tokens.refreshToken())
                                .build())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldResetPasswordAndInvalidateRefreshTokens() throws Exception {
        AuthTokens tokens = registerVerifyAndLogin();
        User user = userRepository.findByEmail(userEmail).orElseThrow();
        String resetToken = passwordResetService.createResetToken(user).orElseThrow();

        String newPassword = "NewSecure1!";
        mockMvc.perform(post(AUTH_BASE + "/reset-password")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(ResetPasswordRequest.builder()
                                .token(resetToken)
                                .password(newPassword)
                                .confirmPassword(newPassword)
                                .build())))
                .andExpect(status().isOk());

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(LoginRequest.builder()
                                .email(userEmail)
                                .password(newPassword)
                                .build())))
                .andExpect(status().isOk());

        mockMvc.perform(post(AUTH_BASE + "/refresh")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(RefreshTokenRequest.builder()
                                .refreshToken(tokens.refreshToken())
                                .build())))
                .andExpect(status().isUnauthorized());
    }

    @Test
    void shouldRejectInvalidCredentials() throws Exception {
        registerVerifyAndLogin();

        mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(LoginRequest.builder()
                                .email(userEmail)
                                .password("WrongPass1!")
                                .build())))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("GB-401-001"));
    }

    @Test
    void shouldRejectUnauthenticatedMeRequest() throws Exception {
        mockMvc.perform(get(AUTH_BASE + "/me"))
                .andExpect(status().isUnauthorized())
                .andExpect(jsonPath("$.code").value("GB-401-002"));
    }

    private AuthTokens registerVerifyAndLogin() throws Exception {
        RegisterRequest registerRequest = RegisterRequest.builder()
                .firstName("Jane")
                .lastName("Smith")
                .email(userEmail)
                .password(STRONG_PASSWORD)
                .confirmPassword(STRONG_PASSWORD)
                .build();

        MvcResult registerResult = mockMvc.perform(post(AUTH_BASE + "/register")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(registerRequest)))
                .andExpect(status().isCreated())
                .andReturn();

        String verificationToken = jsonMapper.readTree(registerResult.getResponse().getContentAsString())
                .path("data").path("verificationToken").asText();

        mockMvc.perform(post(AUTH_BASE + "/verify-email")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(VerifyEmailRequest.builder()
                                .token(verificationToken)
                                .build())))
                .andExpect(status().isOk());

        MvcResult loginResult = mockMvc.perform(post(AUTH_BASE + "/login")
                        .contentType(MediaType.APPLICATION_JSON)
                        .content(jsonMapper.writeValueAsString(LoginRequest.builder()
                                .email(userEmail)
                                .password(STRONG_PASSWORD)
                                .build())))
                .andExpect(status().isOk())
                .andReturn();

        var data = jsonMapper.readTree(loginResult.getResponse().getContentAsString()).path("data");
        assertThat(data.path("accessToken").asText()).isNotBlank();
        assertThat(data.path("refreshToken").asText()).isNotBlank();

        return new AuthTokens(data.path("accessToken").asText(), data.path("refreshToken").asText());
    }

    private record AuthTokens(String accessToken, String refreshToken) {
    }
}
