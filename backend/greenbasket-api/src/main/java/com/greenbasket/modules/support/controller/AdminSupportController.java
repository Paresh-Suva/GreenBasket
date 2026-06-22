package com.greenbasket.modules.support.controller;

import com.greenbasket.common.response.ApiResponse;
import com.greenbasket.modules.support.dto.request.ReplyTicketRequest;
import com.greenbasket.modules.support.dto.request.UpdateTicketStatusRequest;
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
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/admin/support/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasAnyRole('ADMIN', 'SUPER_ADMIN')")
@Tag(name = "Admin - Support", description = "Admin support management APIs")
public class AdminSupportController {

    private final SupportService supportService;

    @GetMapping
    @Operation(summary = "Get all support tickets")
    public ApiResponse<List<SupportTicketSummaryResponse>> getAllTickets() {
        return ApiResponse.success(supportService.getAllTicketsAdmin());
    }

    @GetMapping("/{ticketId}")
    @Operation(summary = "Get support ticket details (admin)")
    public ApiResponse<SupportTicketResponse> getTicketById(@PathVariable UUID ticketId) {
        return ApiResponse.success(supportService.getTicketByIdAdmin(ticketId));
    }

    @PostMapping("/{ticketId}/reply")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(summary = "Reply to a support ticket (admin)")
    public ApiResponse<SupportTicketResponse> replyToTicket(
            @PathVariable UUID ticketId,
            @Valid @RequestBody ReplyTicketRequest request) {
        return ApiResponse.success("Reply added to ticket", supportService.replyToTicketAdmin(ticketId, request));
    }

    @PatchMapping("/{ticketId}/status")
    @Operation(summary = "Update support ticket status")
    public ApiResponse<SupportTicketResponse> updateTicketStatus(
            @PathVariable UUID ticketId,
            @Valid @RequestBody UpdateTicketStatusRequest request) {
        return ApiResponse.success("Ticket status updated", supportService.updateTicketStatusAdmin(ticketId, request));
    }
}
