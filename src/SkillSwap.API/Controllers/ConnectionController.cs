using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConnectionController : BaseController
{
    private readonly IConnectionService _connectionService;

    public ConnectionController(IConnectionService connectionService, ILogger<ConnectionController> logger) : base(logger)
    {
        _connectionService = connectionService;
    }

    /// <summary>
    /// Send a connection request to another user
    /// </summary>
    [HttpPost("send-request")]
    public async Task<ActionResult<UserConnectionDto>> SendConnectionRequest([FromBody] CreateConnectionRequestDto request)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var connection = await _connectionService.SendConnectionRequestAsync(userId, request);
            return Ok(connection);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "send connection request", new { receiverId = request.ReceiverId });
        }
    }

    /// <summary>
    /// Respond to a connection request (accept or decline)
    /// </summary>
    [HttpPost("respond")]
    public async Task<ActionResult<UserConnectionDto>> RespondToConnectionRequest([FromBody] RespondToConnectionDto response)
    {
        try
        {
            var userId = GetCurrentUserId();
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var connection = await _connectionService.RespondToConnectionRequestAsync(userId, response);
            return Ok(connection);
        }
        catch (Exception ex)
        {
            return HandleException(ex, "respond to connection request", new { connectionId = response.ConnectionId });
        }
    }

    /// <summary>
    /// Get pending connection requests received by current user
    /// </summary>
    [HttpGet("requests")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")] // Cache for 30 seconds
    public async Task<ActionResult<IEnumerable<UserConnectionDto>>> GetConnectionRequests()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var requests = await _connectionService.GetConnectionRequestsAsync(userId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting connection requests");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get connection requests sent by current user
    /// </summary>
    [HttpGet("sent-requests")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")] // Cache for 30 seconds
    public async Task<ActionResult<IEnumerable<UserConnectionDto>>> GetSentConnectionRequests()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var requests = await _connectionService.GetSentConnectionRequestsAsync(userId);
            return Ok(requests);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting sent connection requests");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get all connections (accepted) for current user
    /// </summary>
    [HttpGet("connections")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")] // Cache for 30 seconds
    public async Task<ActionResult<IEnumerable<UserConnectionDto>>> GetConnections()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var connections = await _connectionService.GetConnectionsAsync(userId);
            return Ok(connections);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting connections");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get connection statistics for current user
    /// </summary>
    [HttpGet("stats")]
    [ResponseCache(Duration = 30, VaryByHeader = "Authorization")] // Cache for 30 seconds
    public async Task<ActionResult<ConnectionStatsDto>> GetConnectionStats()
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var stats = await _connectionService.GetConnectionStatsAsync(userId);
            return Ok(stats);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error getting connection stats");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Remove a connection
    /// </summary>
    [HttpDelete("{connectionId}")]
    public async Task<ActionResult> RemoveConnection(int connectionId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var success = await _connectionService.RemoveConnectionAsync(userId, connectionId);
            if (!success)
            {
                return NotFound(new { message = "Connection not found" });
            }

            return NoContent();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error removing connection");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Block a user
    /// </summary>
    [HttpPost("block/{targetUserId}")]
    public async Task<ActionResult> BlockUser(string targetUserId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var success = await _connectionService.BlockUserAsync(userId, targetUserId);
            if (!success)
            {
                return BadRequest(new { message = "Unable to block user" });
            }

            return Ok(new { message = "User blocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error blocking user");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Unblock a user
    /// </summary>
    [HttpPost("unblock/{targetUserId}")]
    public async Task<ActionResult> UnblockUser(string targetUserId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var success = await _connectionService.UnblockUserAsync(userId, targetUserId);
            if (!success)
            {
                return BadRequest(new { message = "User is not blocked" });
            }

            return Ok(new { message = "User unblocked successfully" });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error unblocking user");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Check if two users are connected
    /// </summary>
    [HttpGet("check/{targetUserId}")]
    public async Task<ActionResult<object>> CheckConnection(string targetUserId)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var isConnected = await _connectionService.IsConnectedAsync(userId, targetUserId);
            var hasPendingRequest = await _connectionService.HasPendingRequestAsync(userId, targetUserId);

            return Ok(new { isConnected, hasPendingRequest });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking connection status");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }
}
