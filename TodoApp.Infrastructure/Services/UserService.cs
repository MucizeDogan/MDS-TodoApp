using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;
using System;
using System.Linq;
using TodoApp.Application.DTOs.User;
using TodoApp.Application.Interfaces;
using TodoApp.Application.Settings;
using TodoApp.Infrastructure.Data;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.Infrastructure.Services {
    public class UserService : IUserService {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IEmailService _emailService;
        private readonly AppSettings _appSettings;
        private readonly ApplicationDbContext _context;

        public UserService(
            UserManager<ApplicationUser> userManager,
            IEmailService emailService,
            IOptions<AppSettings> appSettings,
            ApplicationDbContext context) {
            _userManager = userManager;
            _emailService = emailService;
            _appSettings = appSettings.Value;
            _context = context;
        }

        public async Task<UserProfileResponse> GetProfileAsync(string userId) {
            var user = await _userManager.FindByIdAsync(userId);
            return user == null
                ? throw new UnauthorizedAccessException("Kullanıcı bulunamadı.")
                : ToProfile(user);
        }

        public async Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateUserProfileRequest request) {
            var user = await GetUserAsync(userId);
            user.FullName = request.FullName.Trim();
            var result = await _userManager.UpdateAsync(user);
            EnsureSucceeded(result);
            return ToProfile(user);
        }

        public async Task ChangePasswordAsync(string userId, ChangePasswordRequest request) {
            var user = await GetUserAsync(userId);
            var result = await _userManager.ChangePasswordAsync(user, request.CurrentPassword, request.NewPassword);
            if (!result.Succeeded) EnsureSucceeded(result, true);
        }

        public async Task<UserProfileResponse> UpdateNotificationPreferencesAsync(string userId, UpdateNotificationPreferencesRequest request) {
            var user = await GetUserAsync(userId);
            user.AppNotificationsEnabled = request.AppNotificationsEnabled;
            user.TaskRemindersEnabled = request.TaskRemindersEnabled;
            user.EmailNotificationsEnabled = user.EmailConfirmed && request.EmailNotificationsEnabled;
            var result = await _userManager.UpdateAsync(user);
            EnsureSucceeded(result);
            return ToProfile(user);
        }

        public async Task RequestEmailChangeAsync(string userId, ChangeEmailRequest request) {
            var user = await GetUserAsync(userId);
            var newEmail = request.NewEmail.Trim();
            if (!newEmail.Contains('@')) throw new ArgumentException("Geçerli bir email adresi girin.");
            if (string.Equals(user.Email, newEmail, StringComparison.OrdinalIgnoreCase))
                throw new ArgumentException("Yeni email adresiniz mevcut email adresinizle aynı.");

            var existing = await _userManager.FindByEmailAsync(newEmail);
            if (existing != null && existing.Id != user.Id)
                throw new ArgumentException("Bu email adresi başka bir hesap tarafından kullanılıyor.");

            var token = await _userManager.GenerateChangeEmailTokenAsync(user, newEmail);
            var url = $"{_appSettings.WebBaseUrl}/confirm-email-change.html" +
                      $"#userId={Uri.EscapeDataString(user.Id)}&email={Uri.EscapeDataString(newEmail)}&token={Uri.EscapeDataString(token)}";

            await _emailService.SendAsync(
                newEmail,
                "MDSTodoApp - Email Değişikliği Onayı",
                $"""
                Merhaba {user.FullName},

                MDSTodoApp hesabınız için yeni bir email adresi tanımlama isteği aldık.

                Yeni email adresinizi onaylamak için aşağıdaki bağlantıya tıklayın:

                {url}

                Bu isteği siz yapmadıysanız bu emaili dikkate alabilirsiniz.

                İyi çalışmalar,
                MDSTodoApp
                """);
        }

        public async Task ConfirmEmailChangeAsync(string userId, ConfirmEmailChangeRequest request) {
            var user = await GetUserAsync(userId);
            var newEmail = request.NewEmail.Trim();
            var existing = await _userManager.FindByEmailAsync(newEmail);
            if (existing != null && existing.Id != user.Id)
                throw new ArgumentException("Bu email adresi başka bir hesap tarafından kullanılıyor.");

            var result = await _userManager.ChangeEmailAsync(user, newEmail, request.Token);
            if (!result.Succeeded) EnsureSucceeded(result, true);

            var usernameResult = await _userManager.SetUserNameAsync(user, newEmail);
            if (!usernameResult.Succeeded) EnsureSucceeded(usernameResult);

            var stampResult = await _userManager.UpdateSecurityStampAsync(user);
            EnsureSucceeded(stampResult);

            // Yeni email adresi doğrulama bağlantısı ile onaylandığı için
            // email görev hatırlatmaları tekrar varsayılan olarak açılır.
            user.EmailNotificationsEnabled = true;
            var updateResult = await _userManager.UpdateAsync(user);
            EnsureSucceeded(updateResult);
        }

        public async Task DeleteAccountAsync(string userId) {
            var user = await GetUserAsync(userId);
            var notifications = await _context.Notifications.Where(x => x.UserId == userId).ToListAsync();
            _context.Notifications.RemoveRange(notifications);
            var result = await _userManager.DeleteAsync(user);
            EnsureSucceeded(result);
        }

        public async Task DeleteAllTodosAsync(string userId) {
            var todos = await _context.TodoItems.Where(x => x.UserId == userId).ToListAsync();
            _context.TodoItems.RemoveRange(todos);
            var notifications = await _context.Notifications.Where(x => x.UserId == userId).ToListAsync();
            _context.Notifications.RemoveRange(notifications);
            await _context.SaveChangesAsync();
        }

        public async Task LogoutAllSessionsAsync(string userId) {
            var user = await GetUserAsync(userId);
            var result = await _userManager.UpdateSecurityStampAsync(user);
            EnsureSucceeded(result);
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string email) {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new ArgumentException("Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.");
            return await _userManager.GeneratePasswordResetTokenAsync(user);
        }

        public async Task ResetPasswordAsync(string email, string token, string newPassword) {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new ArgumentException("Kullanıcı bulunamadı.");
            var result = await _userManager.ResetPasswordAsync(user, token, newPassword);
            if (!result.Succeeded) EnsureSucceeded(result, true);
        }

        public async Task<string> GenerateEmailConfirmationTokenAsync(string email) {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new ArgumentException("Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.");
            return await _userManager.GenerateEmailConfirmationTokenAsync(user);
        }

        public async Task ConfirmEmailAsync(string email, string token) {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new ArgumentException("Kullanıcı bulunamadı.");
            var result = await _userManager.ConfirmEmailAsync(user, token);
            if (!result.Succeeded) EnsureSucceeded(result, true);

            // Email doğrulandığı anda email görev hatırlatmaları
            // varsayılan olarak aktif hale gelir.
            user.EmailNotificationsEnabled = true;
            var updateResult = await _userManager.UpdateAsync(user);
            EnsureSucceeded(updateResult);
        }

        public async Task SendPasswordResetEmailAsync(string email) {
            var user = await _userManager.FindByEmailAsync(email) ?? throw new ArgumentException("Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.");
            var token = await _userManager.GeneratePasswordResetTokenAsync(user);
            var resetUrl = $"{_appSettings.WebBaseUrl}/reset-password.html?email={Uri.EscapeDataString(email)}&token={Uri.EscapeDataString(token)}";
            await _emailService.SendAsync(email, "MDSTodoApp - Şifre Sıfırlama", $"""
                Merhaba {user.FullName},

                TodoApp hesabınız için şifre sıfırlama isteği aldık.

                Şifrenizi yenilemek için aşağıdaki bağlantıya tıklayın:

                {resetUrl}

                Bu isteği siz yapmadıysanız bu emaili dikkate almayabilirsiniz.

                İyi çalışmalar,
                MDS TodoApp
                """);
        }

        private async Task<ApplicationUser> GetUserAsync(string userId) =>
            await _userManager.FindByIdAsync(userId) ?? throw new UnauthorizedAccessException("Kullanıcı bulunamadı.");

        private static UserProfileResponse ToProfile(ApplicationUser user) => new() {
            Id = user.Id,
            FullName = user.FullName ?? string.Empty,
            Email = user.Email ?? string.Empty,
            EmailConfirmed = user.EmailConfirmed,
            CreatedAt = user.CreatedAt,
            AppNotificationsEnabled = user.AppNotificationsEnabled,
            TaskRemindersEnabled = user.TaskRemindersEnabled,
            EmailNotificationsEnabled = user.EmailNotificationsEnabled
        };

        private static void EnsureSucceeded(IdentityResult result, bool argument = false) {
            if (result.Succeeded) return;
            var errors = string.Join(" | ", result.Errors.Select(x => x.Description));
            if (argument) throw new ArgumentException(errors);
            throw new Exception(errors);
        }
    }
}
