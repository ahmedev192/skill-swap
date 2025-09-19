using System.Text.Json.Serialization;

namespace SkillSwap.Core.DTOs;

/// <summary>
/// Standard error response format for all API endpoints
/// </summary>
public class ErrorResponseDto
{
    /// <summary>
    /// Indicates if the request was successful
    /// </summary>
    [JsonPropertyName("success")]
    public bool Success { get; set; } = false;

    /// <summary>
    /// Error message describing what went wrong
    /// </summary>
    [JsonPropertyName("message")]
    public string Message { get; set; } = string.Empty;

    /// <summary>
    /// Error code for programmatic handling
    /// </summary>
    [JsonPropertyName("errorCode")]
    public string? ErrorCode { get; set; }

    /// <summary>
    /// Additional details about the error
    /// </summary>
    [JsonPropertyName("details")]
    public object? Details { get; set; }

    /// <summary>
    /// Timestamp when the error occurred
    /// </summary>
    [JsonPropertyName("timestamp")]
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;

    /// <summary>
    /// Request ID for tracking purposes
    /// </summary>
    [JsonPropertyName("requestId")]
    public string? RequestId { get; set; }

    /// <summary>
    /// Validation errors (for 400 Bad Request with validation failures)
    /// </summary>
    [JsonPropertyName("validationErrors")]
    public Dictionary<string, string[]>? ValidationErrors { get; set; }

    public ErrorResponseDto()
    {
    }

    public ErrorResponseDto(string message, string? errorCode = null, object? details = null, string? requestId = null)
    {
        Message = message;
        ErrorCode = errorCode;
        Details = details;
        RequestId = requestId;
    }

    public static ErrorResponseDto BadRequest(string message, string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "BAD_REQUEST", details, requestId);
    }

    public static ErrorResponseDto Unauthorized(string message = "Unauthorized access", string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "UNAUTHORIZED", details, requestId);
    }

    public static ErrorResponseDto Forbidden(string message = "Access forbidden", string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "FORBIDDEN", details, requestId);
    }

    public static ErrorResponseDto NotFound(string message = "Resource not found", string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "NOT_FOUND", details, requestId);
    }

    public static ErrorResponseDto Conflict(string message, string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "CONFLICT", details, requestId);
    }

    public static ErrorResponseDto InternalServerError(string message = "An unexpected error occurred", string? errorCode = null, object? details = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "INTERNAL_SERVER_ERROR", details, requestId);
    }

    public static ErrorResponseDto ValidationError(string message, Dictionary<string, string[]> validationErrors, string? errorCode = null, string? requestId = null)
    {
        return new ErrorResponseDto(message, errorCode ?? "VALIDATION_ERROR", null, requestId)
        {
            ValidationErrors = validationErrors
        };
    }
}
