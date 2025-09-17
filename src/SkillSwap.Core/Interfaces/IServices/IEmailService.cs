namespace SkillSwap.Core.Interfaces.Services;

public interface IEmailService
{
    Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true);
    Task<bool> SendWelcomeEmailAsync(string to, string firstName);
    Task<bool> SendEmailVerificationAsync(string to, string firstName, string verificationLink);
    Task<bool> SendPasswordResetEmailAsync(string to, string firstName, string resetLink);
    Task<bool> SendSessionRequestEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime);
    Task<bool> SendSessionConfirmedEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime);
    Task<bool> SendSessionReminderEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime);
    Task<bool> SendSessionCompletedEmailAsync(string to, string firstName, string teacherName, string skillName);
    Task<bool> SendNewMessageEmailAsync(string to, string firstName, string senderName, string messagePreview);
    Task<bool> SendNewReviewEmailAsync(string to, string firstName, string reviewerName, int rating);
}
