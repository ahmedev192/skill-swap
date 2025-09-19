using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

/// <summary>
/// Base controller class providing standardized error handling and common functionality
/// </summary>
[ApiController]
public abstract class BaseController : ControllerBase
{
    protected readonly ILogger _logger;

    protected BaseController(ILogger logger)
    {
        _logger = logger;
    }

    /// <summary>
    /// Gets the current user ID from the JWT token
    /// </summary>
    protected string? GetCurrentUserId()
    {
        return User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
    }

    /// <summary>
    /// Checks if the current user is authenticated
    /// </summary>
    protected bool IsAuthenticated()
    {
        return !string.IsNullOrEmpty(GetCurrentUserId());
    }

    /// <summary>
    /// Checks if the current user has the specified role
    /// </summary>
    protected bool HasRole(string role)
    {
        return User.IsInRole(role);
    }

    /// <summary>
    /// Returns a standardized 400 Bad Request response
    /// </summary>
    protected ActionResult BadRequest(string message, string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.BadRequest(message, errorCode, details, GetRequestId());
        return base.BadRequest(errorResponse);
    }

    /// <summary>
    /// Returns a standardized 401 Unauthorized response
    /// </summary>
    protected ActionResult Unauthorized(string message = "Unauthorized access", string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.Unauthorized(message, errorCode, details, GetRequestId());
        return base.Unauthorized(errorResponse);
    }

    /// <summary>
    /// Returns a standardized 403 Forbidden response
    /// </summary>
    protected ActionResult Forbidden(string message = "Access forbidden", string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.Forbidden(message, errorCode, details, GetRequestId());
        return base.Forbid();
    }

    /// <summary>
    /// Returns a standardized 404 Not Found response
    /// </summary>
    protected ActionResult NotFound(string message = "Resource not found", string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.NotFound(message, errorCode, details, GetRequestId());
        return base.NotFound(errorResponse);
    }

    /// <summary>
    /// Returns a standardized 409 Conflict response
    /// </summary>
    protected ActionResult Conflict(string message, string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.Conflict(message, errorCode, details, GetRequestId());
        return base.Conflict(errorResponse);
    }

    /// <summary>
    /// Returns a standardized 500 Internal Server Error response
    /// </summary>
    protected ActionResult InternalServerError(string message = "An unexpected error occurred", string? errorCode = null, object? details = null)
    {
        var errorResponse = ErrorResponseDto.InternalServerError(message, errorCode, details, GetRequestId());
        return StatusCode(500, errorResponse);
    }

    /// <summary>
    /// Returns a standardized 422 Unprocessable Entity response for validation errors
    /// </summary>
    protected ActionResult ValidationError(string message, Dictionary<string, string[]> validationErrors, string? errorCode = null)
    {
        var errorResponse = ErrorResponseDto.ValidationError(message, validationErrors, errorCode, GetRequestId());
        return StatusCode(422, errorResponse);
    }

    /// <summary>
    /// Handles exceptions and returns appropriate error responses
    /// </summary>
    protected ActionResult HandleException(Exception ex, string operation, object? additionalData = null)
    {
        var requestId = GetRequestId();
        
        switch (ex)
        {
            case ArgumentNullException nullEx:
                _logger.LogWarning(nullEx, "Null argument in {Operation}: {Message}", operation, nullEx.Message);
                return BadRequest(nullEx.Message, "NULL_ARGUMENT", additionalData);

            case ArgumentException argEx:
                _logger.LogWarning(argEx, "Invalid argument in {Operation}: {Message}", operation, argEx.Message);
                return BadRequest(argEx.Message, "INVALID_ARGUMENT", additionalData);

            case InvalidOperationException invalidOpEx:
                _logger.LogWarning(invalidOpEx, "Invalid operation in {Operation}: {Message}", operation, invalidOpEx.Message);
                return BadRequest(invalidOpEx.Message, "INVALID_OPERATION", additionalData);

            case UnauthorizedAccessException unauthorizedEx:
                _logger.LogWarning(unauthorizedEx, "Unauthorized access in {Operation}: {Message}", operation, unauthorizedEx.Message);
                return Unauthorized(unauthorizedEx.Message, "UNAUTHORIZED_ACCESS", additionalData);

            case KeyNotFoundException keyNotFoundEx:
                _logger.LogWarning(keyNotFoundEx, "Resource not found in {Operation}: {Message}", operation, keyNotFoundEx.Message);
                return NotFound(keyNotFoundEx.Message, "RESOURCE_NOT_FOUND", additionalData);

            case TimeoutException timeoutEx:
                _logger.LogWarning(timeoutEx, "Timeout in {Operation}: {Message}", operation, timeoutEx.Message);
                return StatusCode(408, ErrorResponseDto.BadRequest("Request timeout", "TIMEOUT", additionalData, requestId));

            case NotImplementedException notImplEx:
                _logger.LogWarning(notImplEx, "Not implemented in {Operation}: {Message}", operation, notImplEx.Message);
                return StatusCode(501, ErrorResponseDto.BadRequest("Feature not implemented", "NOT_IMPLEMENTED", additionalData, requestId));

            default:
                _logger.LogError(ex, "Unexpected error in {Operation}", operation);
                return InternalServerError("An unexpected error occurred", "UNEXPECTED_ERROR", additionalData);
        }
    }

    /// <summary>
    /// Gets the request ID from the current HTTP context
    /// </summary>
    private string? GetRequestId()
    {
        return HttpContext.TraceIdentifier;
    }

    /// <summary>
    /// Validates that the current user is authenticated
    /// </summary>
    protected ActionResult ValidateAuthentication()
    {
        if (!IsAuthenticated())
        {
            return Unauthorized("Authentication required");
        }
        return Ok();
    }

    /// <summary>
    /// Validates that the current user has the specified role
    /// </summary>
    protected ActionResult ValidateRole(string role)
    {
        var authResult = ValidateAuthentication();
        if (authResult is not OkResult)
        {
            return authResult;
        }

        if (!HasRole(role))
        {
            return Forbidden($"Role '{role}' required");
        }
        return Ok();
    }

    /// <summary>
    /// Validates that the current user is the owner of the resource or has admin role
    /// </summary>
    protected ActionResult ValidateOwnershipOrAdmin(string resourceOwnerId)
    {
        var authResult = ValidateAuthentication();
        if (authResult is not OkResult)
        {
            return authResult;
        }

        var currentUserId = GetCurrentUserId();
        if (currentUserId != resourceOwnerId && !HasRole("Admin"))
        {
            return Forbidden("Access denied: You can only access your own resources");
        }
        return Ok();
    }
}
