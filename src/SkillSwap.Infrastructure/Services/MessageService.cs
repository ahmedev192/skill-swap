using AutoMapper;
using Microsoft.EntityFrameworkCore;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;
using SkillSwap.Core.Interfaces;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class MessageService : IMessageService
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly IMapper _mapper;

    public MessageService(IUnitOfWork unitOfWork, IMapper mapper)
    {
        _unitOfWork = unitOfWork;
        _mapper = mapper;
    }

    public async Task<IEnumerable<ConversationDto>> GetUserConversationsAsync(string userId)
    {
        var messages = await _unitOfWork.Messages.FindAsync(
            m => m.SenderId == userId || m.ReceiverId == userId,
            m => m.Sender,
            m => m.Receiver
        );

        var conversations = messages
            .GroupBy(m => m.SenderId == userId ? m.ReceiverId : m.SenderId)
            .Select(g => new ConversationDto
            {
                OtherUserId = g.Key,
                OtherUserName = g.First().SenderId == userId ? 
                    $"{g.First().Receiver.FirstName} {g.First().Receiver.LastName}" : 
                    $"{g.First().Sender.FirstName} {g.First().Sender.LastName}",
                OtherUserProfileImage = g.First().SenderId == userId ? 
                    g.First().Receiver.ProfileImageUrl : 
                    g.First().Sender.ProfileImageUrl,
                LastMessage = g.OrderByDescending(m => m.SentAt).First().Content,
                LastMessageTime = g.OrderByDescending(m => m.SentAt).First().SentAt,
                UnreadCount = g.Count(m => m.ReceiverId == userId && !m.IsRead)
            })
            .OrderByDescending(c => c.LastMessageTime)
            .ToList();

        return conversations;
    }

    public async Task<IEnumerable<MessageDto>> GetConversationAsync(string userId, string otherUserId, int page = 1, int pageSize = 50)
    {
        var messages = await _unitOfWork.Messages.FindAsync(m => 
            (m.SenderId == userId && m.ReceiverId == otherUserId) || 
            (m.SenderId == otherUserId && m.ReceiverId == userId),
            m => m.Sender,
            m => m.Receiver,
            m => m.Session);

        var paginatedMessages = messages
            .OrderBy(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize);

        return _mapper.Map<IEnumerable<MessageDto>>(paginatedMessages);
    }

    public async Task<MessageDto> SendMessageAsync(string senderId, CreateMessageDto createMessageDto)
    {
        var message = _mapper.Map<Message>(createMessageDto);
        message.SenderId = senderId;
        message.SentAt = DateTime.UtcNow;
        message.IsRead = false;

        await _unitOfWork.Messages.AddAsync(message);
        await _unitOfWork.SaveChangesAsync();

        // Load the message with navigation properties
        var messageWithNav = await _unitOfWork.Messages.FindAsync(
            m => m.Id == message.Id,
            m => m.Sender,
            m => m.Receiver,
            m => m.Session
        );

        return _mapper.Map<MessageDto>(messageWithNav.First());
    }

    public async Task<IEnumerable<int>> MarkMessagesAsReadAsync(string userId, string senderId)
    {
        var unreadMessages = await _unitOfWork.Messages.FindAsync(m => 
            m.ReceiverId == userId && m.SenderId == senderId && !m.IsRead);

        var messageIds = unreadMessages.Select(m => m.Id).ToList();
        var readAt = DateTime.UtcNow;
        
        foreach (var message in unreadMessages)
        {
            message.IsRead = true;
            message.ReadAt = readAt;
            await _unitOfWork.Messages.UpdateAsync(message);
        }

        await _unitOfWork.SaveChangesAsync();
        return messageIds;
    }

    public async Task<int> GetUnreadMessageCountAsync(string userId)
    {
        return await _unitOfWork.Messages.CountAsync(m => m.ReceiverId == userId && !m.IsRead);
    }

    public async Task<IEnumerable<MessageDto>> GetSessionMessagesAsync(int sessionId)
    {
        var messages = await _unitOfWork.Messages.FindAsync(m => m.SessionId == sessionId);
        return _mapper.Map<IEnumerable<MessageDto>>(messages.OrderBy(m => m.SentAt));
    }

    public async Task<SessionMessageDto> SendSessionMessageAsync(string senderId, CreateSessionMessageDto createSessionMessageDto)
    {
        var sessionMessage = _mapper.Map<SessionMessage>(createSessionMessageDto);
        sessionMessage.SenderId = senderId;
        sessionMessage.SentAt = DateTime.UtcNow;

        await _unitOfWork.SessionMessages.AddAsync(sessionMessage);
        await _unitOfWork.SaveChangesAsync();

        return _mapper.Map<SessionMessageDto>(sessionMessage);
    }
}
