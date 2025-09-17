using AutoMapper;
using SkillSwap.Core.DTOs;
using SkillSwap.Core.Entities;

namespace SkillSwap.Infrastructure.Mapping;

public class MappingProfile : Profile
{
    public MappingProfile()
    {
        // User mappings
        CreateMap<User, UserDto>();
        CreateMap<CreateUserDto, User>();
        CreateMap<UpdateUserDto, User>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Skill mappings
        CreateMap<Skill, SkillDto>();
        CreateMap<UserSkill, UserSkillDto>();
        CreateMap<CreateUserSkillDto, UserSkill>();
        CreateMap<UpdateUserSkillDto, UserSkill>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Session mappings
        CreateMap<Session, SessionDto>();
        CreateMap<CreateSessionDto, Session>();
        CreateMap<UpdateSessionDto, Session>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Credit Transaction mappings
        CreateMap<CreditTransaction, CreditTransactionDto>();

        // Review mappings
        CreateMap<Review, ReviewDto>();
        CreateMap<CreateReviewDto, Review>();

        // Message mappings
        CreateMap<Message, MessageDto>();
        CreateMap<CreateMessageDto, Message>();

        // Notification mappings
        CreateMap<Notification, NotificationDto>();

        // User Availability mappings
        CreateMap<UserAvailability, UserAvailabilityDto>();
        CreateMap<CreateUserAvailabilityDto, UserAvailability>();
        CreateMap<UpdateUserAvailabilityDto, UserAvailability>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        // Endorsement mappings
        CreateMap<Endorsement, EndorsementDto>();
        CreateMap<CreateEndorsementDto, Endorsement>();

        // Badge mappings
        CreateMap<Badge, BadgeDto>();
        CreateMap<UserBadge, UserBadgeDto>();

        // Group Event mappings
        CreateMap<GroupEvent, GroupEventDto>();
        CreateMap<CreateGroupEventDto, GroupEvent>();
        CreateMap<UpdateGroupEventDto, GroupEvent>()
            .ForAllMembers(opts => opts.Condition((src, dest, srcMember) => srcMember != null));

        CreateMap<GroupEventParticipant, GroupEventParticipantDto>();

        // Session Message mappings
        CreateMap<SessionMessage, SessionMessageDto>();
        CreateMap<CreateSessionMessageDto, SessionMessage>();

        // Audit Log mappings
        CreateMap<AuditLog, AuditLogDto>();
    }
}
