namespace SkillSwap.Core.DTOs;

public class UserConnectionDto
{
    public int Id { get; set; }
    public string RequesterId { get; set; } = string.Empty;
    public string ReceiverId { get; set; } = string.Empty;
    public int Status { get; set; }
    public string StatusText { get; set; } = string.Empty;
    public DateTime CreatedAt { get; set; }
    public DateTime? RespondedAt { get; set; }
    public string? Message { get; set; }
    public UserDto? Requester { get; set; }
    public UserDto? Receiver { get; set; }
}

public class CreateConnectionRequestDto
{
    public string ReceiverId { get; set; } = string.Empty;
    public string? Message { get; set; }
}

public class RespondToConnectionDto
{
    public int ConnectionId { get; set; }
    public int Status { get; set; } // 2 = Accepted, 3 = Declined
}

public class ConnectionStatsDto
{
    public int TotalConnections { get; set; }
    public int PendingRequests { get; set; }
    public int PendingSent { get; set; }
}
