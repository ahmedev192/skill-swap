using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Interfaces.Services;
using System.Security.Claims;

namespace SkillSwap.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ConnectionController : ControllerBase
{
    private readonly IConnectionService _connectionService;
    private readonly ILogger<ConnectionController> _logger;

    public ConnectionController(IConnectionService connectionService, ILogger<ConnectionController> logger)
    {
        _connectionService = connectionService;
        _logger = logger;
    }

    /// <summary>
    /// Send a connection request to another user
    /// </summary>
    [HttpPost("send-request")]
    public async Task<ActionResult<UserConnectionDto>> SendConnectionRequest([FromBody] CreateConnectionRequestDto request)
    {
        try
        {
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var connection = await _connectionService.SendConnectionRequestAsync(userId, request);
            return Ok(connection);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid connection request");
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Connection request conflict");
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending connection request");
            return StatusCode(500, new { message = "An unexpected error occurred" });
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
            var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId))
            {
                return Unauthorized();
            }

            var connection = await _connectionService.RespondToConnectionRequestAsync(userId, response);
            return Ok(connection);
        }
        catch (ArgumentException ex)
        {
            _logger.LogWarning(ex, "Invalid connection response");
            return BadRequest(new { message = ex.Message });
        }
        catch (InvalidOperationException ex)
        {
            _logger.LogWarning(ex, "Connection response conflict");
            return Conflict(new { message = ex.Message });
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error responding to connection request");
            return StatusCode(500, new { message = "An unexpected error occurred" });
        }
    }

    /// <summary>
    /// Get pending connection requests received by current user
    /// </summary>
    [HttpGet("requests")]
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
