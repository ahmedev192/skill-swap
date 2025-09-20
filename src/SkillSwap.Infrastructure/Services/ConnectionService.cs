using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class ConnectionService : IConnectionService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public ConnectionService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<UserConnectionDto> SendConnectionRequestAsync(string requesterId, CreateConnectionRequestDto request)
    {
        // Check if users exist
        var requester = await _unitOfWork.Users.GetByIdAsync(requesterId);
        var receiver = await _unitOfWork.Users.GetByIdAsync(request.ReceiverId);
        
        if (requester == null || receiver == null)
        {
            throw new ArgumentException("Invalid user ID");
        }

        // Check if already connected or has pending request
        var existingConnection = await _unitOfWork.UserConnections.FindAsync(uc => 
            (uc.RequesterId == requesterId && uc.ReceiverId == request.ReceiverId) ||
            (uc.RequesterId == request.ReceiverId && uc.ReceiverId == requesterId));

        if (existingConnection.Any())
        {
            var connection = existingConnection.First();
            if (connection.Status == ConnectionStatus.Accepted)
            {
                throw new InvalidOperationException("Users are already connected");
            }
            if (connection.Status == ConnectionStatus.Pending)
            {
                throw new InvalidOperationException("Connection request already exists");
            }
        }

        // Create new connection request
        var userConnection = new UserConnection
        {
            RequesterId = requesterId,
            ReceiverId = request.ReceiverId,
            Status = ConnectionStatus.Pending,
            Message = request.Message,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.UserConnections.AddAsync(userConnection);
        await _unitOfWork.SaveChangesAsync();

        // Load the connection with navigation properties
        var createdConnection = await _unitOfWork.UserConnections.GetByIdAsync(userConnection.Id, 
            uc => uc.Requester, uc => uc.Receiver);

        return _mapper.Map<UserConnectionDto>(createdConnection);
    }

    public async Task<UserConnectionDto> RespondToConnectionRequestAsync(string userId, RespondToConnectionDto response)
    {
        var connection = await _unitOfWork.UserConnections.GetByIdAsync(response.ConnectionId, 
            uc => uc.Requester, uc => uc.Receiver);

        if (connection == null || connection.ReceiverId != userId)
        {
            throw new ArgumentException("Connection request not found or unauthorized");
        }

        if (connection.Status != ConnectionStatus.Pending)
        {
            throw new InvalidOperationException("Connection request has already been responded to");
        }

        connection.Status = (ConnectionStatus)response.Status;
        connection.RespondedAt = DateTime.UtcNow;

        await _unitOfWork.UserConnections.UpdateAsync(connection);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<UserConnectionDto>(connection);
    }

    public async Task<IEnumerable<UserConnectionDto>> GetConnectionRequestsAsync(string userId)
    {
        var requests = await _unitOfWork.UserConnections.FindAsync(uc => 
            uc.ReceiverId == userId && uc.Status == ConnectionStatus.Pending, 
            uc => uc.Requester, uc => uc.Receiver);

        return _mapper.Map<IEnumerable<UserConnectionDto>>(requests);
    }

    public async Task<IEnumerable<UserConnectionDto>> GetSentConnectionRequestsAsync(string userId)
    {
        var requests = await _unitOfWork.UserConnections.FindAsync(uc => 
            uc.RequesterId == userId && uc.Status == ConnectionStatus.Pending, 
            uc => uc.Requester, uc => uc.Receiver);

        return _mapper.Map<IEnumerable<UserConnectionDto>>(requests);
    }

    public async Task<IEnumerable<UserConnectionDto>> GetConnectionsAsync(string userId)
    {
        var connections = await _unitOfWork.UserConnections.FindAsync(uc => 
            (uc.RequesterId == userId || uc.ReceiverId == userId) && uc.Status == ConnectionStatus.Accepted, 
            uc => uc.Requester, uc => uc.Receiver);

        return _mapper.Map<IEnumerable<UserConnectionDto>>(connections);
    }

    public async Task<ConnectionStatsDto> GetConnectionStatsAsync(string userId)
    {
        var allConnections = await _unitOfWork.UserConnections.FindAsync(uc => 
            uc.RequesterId == userId || uc.ReceiverId == userId);

        var stats = new ConnectionStatsDto
        {
            TotalConnections = allConnections.Count(uc => uc.Status == ConnectionStatus.Accepted),
            PendingRequests = allConnections.Count(uc => uc.ReceiverId == userId && uc.Status == ConnectionStatus.Pending),
            PendingSent = allConnections.Count(uc => uc.RequesterId == userId && uc.Status == ConnectionStatus.Pending)
        };

        return stats;
    }

    public async Task<bool> RemoveConnectionAsync(string userId, int connectionId)
    {
        var connection = await _unitOfWork.UserConnections.GetByIdAsync(connectionId);

        if (connection == null || (connection.RequesterId != userId && connection.ReceiverId != userId))
        {
            return false;
        }

        await _unitOfWork.UserConnections.DeleteAsync(connection);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> BlockUserAsync(string userId, string targetUserId)
    {
        // Remove any existing connections
        var existingConnections = await _unitOfWork.UserConnections.FindAsync(uc => 
            (uc.RequesterId == userId && uc.ReceiverId == targetUserId) ||
            (uc.RequesterId == targetUserId && uc.ReceiverId == userId));

        foreach (var connection in existingConnections)
        {
            await _unitOfWork.UserConnections.DeleteAsync(connection);
        }

        // Create block connection
        var blockConnection = new UserConnection
        {
            RequesterId = userId,
            ReceiverId = targetUserId,
            Status = ConnectionStatus.Blocked,
            CreatedAt = DateTime.UtcNow
        };

        await _unitOfWork.UserConnections.AddAsync(blockConnection);
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> UnblockUserAsync(string userId, string targetUserId)
    {
        var blockConnection = await _unitOfWork.UserConnections.FindAsync(uc => 
            uc.RequesterId == userId && uc.ReceiverId == targetUserId && uc.Status == ConnectionStatus.Blocked);

        if (!blockConnection.Any())
        {
            return false;
        }

        await _unitOfWork.UserConnections.DeleteAsync(blockConnection.First());
        await _unitOfWork.SaveChangesAsync();
        return true;
    }

    public async Task<bool> IsConnectedAsync(string userId1, string userId2)
    {
        var connection = await _unitOfWork.UserConnections.FindAsync(uc => 
            ((uc.RequesterId == userId1 && uc.ReceiverId == userId2) ||
             (uc.RequesterId == userId2 && uc.ReceiverId == userId1)) && 
            uc.Status == ConnectionStatus.Accepted);

        return connection.Any();
    }

    public async Task<bool> HasPendingRequestAsync(string requesterId, string receiverId)
    {
        var connection = await _unitOfWork.UserConnections.FindAsync(uc => 
            uc.RequesterId == requesterId && uc.ReceiverId == receiverId && uc.Status == ConnectionStatus.Pending);

        return connection.Any();
    }

    public async Task<IEnumerable<UserConnectionDto>> SearchConnectionsAsync(string userId, string searchTerm)
    {
        if (string.IsNullOrWhiteSpace(searchTerm))
        {
            // If no search term, return all connections
            return await GetConnectionsAsync(userId);
        }

        var connections = await _unitOfWork.UserConnections.FindAsync(uc => 
            (uc.RequesterId == userId || uc.ReceiverId == userId) && uc.Status == ConnectionStatus.Accepted, 
            uc => uc.Requester, uc => uc.Receiver);

        // Filter connections where the other user's name contains the search term
        var filteredConnections = connections.Where(uc =>
        {
            var otherUser = uc.RequesterId == userId ? uc.Receiver : uc.Requester;
            if (otherUser == null) return false;
            
            var fullName = $"{otherUser.FirstName} {otherUser.LastName}".ToLower();
            var email = otherUser.Email?.ToLower() ?? "";
            var searchLower = searchTerm.ToLower();
            
            return fullName.Contains(searchLower) || email.Contains(searchLower);
        });

        return _mapper.Map<IEnumerable<UserConnectionDto>>(filteredConnections);
    }
}
