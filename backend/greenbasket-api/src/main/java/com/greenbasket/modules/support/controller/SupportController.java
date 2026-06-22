package com.greenbasket.modules.support.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.support.dto.request.CreateTicketRequest;
import com.greenbasket.modules.support.dto.request.ReplyTicketRequest;
import com.greenbasket.modules.support.dto.response.SupportTicketResponse;
import com.greenbasket.modules.support.dto.response.SupportTicketSummaryResponse;
import com.greenbasket.modules.support.service.SupportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/support/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('CUSTOMER')")
@Tag(name = "Support", description = "Customer support APIs")
public class SupportController {

    private final SupportService supportService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Create a support ticket")
    public ApiResponse<SupportTicketResponse> createTicket(@Valid @RequestBody CreateTicketRequest request) {
        return ApiResponse.success("Support ticket created", supportService.createTicket(request));
    }

    @GetMapping
    @Operation(summary = "Get my support tickets")
    public ApiResponse<List<SupportTicketSummaryResponse>> getMyTickets() {
        return ApiResponse.success(supportService.getMyTickets());
    }

    @GetMapping("/{ticketId}")
    @Operation(summary = "Get support ticket details")
    public ApiResponse<SupportTicketResponse> getTicketById(@PathVariable UUID ticketId) {
        return ApiResponse.success(supportService.getTicketById(ticketId));
    }

    @PostMapping("/{ticketId}/reply")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Reply to a support ticket")
    public ApiResponse<SupportTicketResponse> replyToTicket(
            @PathVariable UUID ticketId,
            @Valid @RequestBody ReplyTicketRequest request) {
        return ApiResponse.success("Reply added to ticket", supportService.replyToTicket(ticketId, request));
    }
}
