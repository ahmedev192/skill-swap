using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using SendGrid;
using SendGrid.Helpers.Mail;
using SkillSwap.Core.Interfaces.Services;

namespace SkillSwap.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly ISendGridClient _sendGridClient;
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;
    private readonly string _fromEmail;
    private readonly string _fromName;

    public EmailService(
        ISendGridClient sendGridClient,
        IConfiguration configuration,
        ILogger<EmailService> logger)
    {
        _sendGridClient = sendGridClient;
        _configuration = configuration;
        _logger = logger;
        _fromEmail = _configuration["Email:FromEmail"] ?? "noreply@skillswap.com";
        _fromName = _configuration["Email:FromName"] ?? "Skill Swap";
    }

    public async Task<bool> SendEmailAsync(string to, string subject, string body, bool isHtml = true)
    {
        try
        {
            var from = new EmailAddress(_fromEmail, _fromName);
            var toEmail = new EmailAddress(to);
            var message = MailHelper.CreateSingleEmail(from, toEmail, subject, isHtml ? null : body, isHtml ? body : null);

            var response = await _sendGridClient.SendEmailAsync(message);
            
            if (response.IsSuccessStatusCode)
            {
                _logger.LogInformation("Email sent successfully to {Email}", to);
                return true;
            }
            else
            {
                _logger.LogError("Failed to send email to {Email}. Status: {Status}", to, response.StatusCode);
                return false;
            }
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email to {Email}", to);
            return false;
        }
    }

    public async Task<bool> SendWelcomeEmailAsync(string to, string firstName)
    {
        var subject = "Welcome to Skill Swap!";
        var body = $@"
            <html>
            <body>
                <h2>Welcome to Skill Swap, {firstName}!</h2>
                <p>Thank you for joining our community of skill exchangers. You've received 5 welcome credits to get started!</p>
                <p>Here's what you can do:</p>
                <ul>
                    <li>List skills you can teach</li>
                    <li>Request skills you want to learn</li>
                    <li>Book sessions with other users</li>
                    <li>Earn credits by teaching</li>
                </ul>
                <p>Happy learning and teaching!</p>
                <p>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendEmailVerificationAsync(string to, string firstName, string verificationLink)
    {
        var subject = "Verify your Skill Swap account";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>Please verify your email address by clicking the link below:</p>
                <p><a href='{verificationLink}' style='background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Verify Email</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{verificationLink}</p>
                <p>This link will expire in 24 hours.</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendPasswordResetEmailAsync(string to, string firstName, string resetLink)
    {
        var subject = "Reset your Skill Swap password";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>You requested to reset your password. Click the link below to create a new password:</p>
                <p><a href='{resetLink}' style='background-color: #f44336; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;'>Reset Password</a></p>
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <p>{resetLink}</p>
                <p>This link will expire in 1 hour.</p>
                <p>If you didn't request this, please ignore this email.</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendSessionRequestEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime)
    {
        var subject = $"New session request for {skillName}";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>You have a new session request from {teacherName} for {skillName}.</p>
                <p><strong>Session Details:</strong></p>
                <ul>
                    <li>Skill: {skillName}</li>
                    <li>Teacher: {teacherName}</li>
                    <li>Time: {sessionTime:MMMM dd, yyyy 'at' h:mm tt}</li>
                </ul>
                <p>Please log in to your account to confirm or decline this session.</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendSessionConfirmedEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime)
    {
        var subject = $"Session confirmed: {skillName}";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>Great news! Your session has been confirmed.</p>
                <p><strong>Session Details:</strong></p>
                <ul>
                    <li>Skill: {skillName}</li>
                    <li>Teacher: {teacherName}</li>
                    <li>Time: {sessionTime:MMMM dd, yyyy 'at' h:mm tt}</li>
                </ul>
                <p>We'll send you a reminder 1 hour before the session starts.</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendSessionReminderEmailAsync(string to, string firstName, string teacherName, string skillName, DateTime sessionTime)
    {
        var subject = $"Session reminder: {skillName} starting soon";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>This is a reminder that your session is starting soon!</p>
                <p><strong>Session Details:</strong></p>
                <ul>
                    <li>Skill: {skillName}</li>
                    <li>Teacher: {teacherName}</li>
                    <li>Time: {sessionTime:MMMM dd, yyyy 'at' h:mm tt}</li>
                </ul>
                <p>Please join the session on time. Enjoy your learning!</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendSessionCompletedEmailAsync(string to, string firstName, string teacherName, string skillName)
    {
        var subject = $"Session completed: {skillName}";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>Your session with {teacherName} for {skillName} has been completed.</p>
                <p>Please take a moment to leave a review for {teacherName} to help other learners.</p>
                <p>Thank you for using Skill Swap!</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendNewMessageEmailAsync(string to, string firstName, string senderName, string messagePreview)
    {
        var subject = $"New message from {senderName}";
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>You have a new message from {senderName}:</p>
                <p style='background-color: #f5f5f5; padding: 10px; border-left: 4px solid #4CAF50;'>{messagePreview}</p>
                <p>Log in to Skill Swap to read the full message and reply.</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }

    public async Task<bool> SendNewReviewEmailAsync(string to, string firstName, string reviewerName, int rating)
    {
        var subject = $"New review from {reviewerName}";
        var stars = new string('★', rating) + new string('☆', 5 - rating);
        var body = $@"
            <html>
            <body>
                <h2>Hi {firstName}!</h2>
                <p>You received a new review from {reviewerName}!</p>
                <p><strong>Rating:</strong> {stars} ({rating}/5)</p>
                <p>Log in to Skill Swap to read the full review.</p>
                <p>Keep up the great work!</p>
                <p>Best regards,<br>The Skill Swap Team</p>
            </body>
            </html>";

        return await SendEmailAsync(to, subject, body);
    }
}
