using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs.Common;
using TodoApp.Application.DTOs.User;
using TodoApp.Application.Interfaces;
using TodoApp.Infrastructure.Services;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase {
        private readonly IUserService _userService;
        private readonly IAuthService _authService;

        public UserController(
            IUserService userService, IAuthService authService) {
            _userService = userService;
            _authService = authService;
        }


        /* ===================================================== */
        /* GET PROFILE */
        /* ===================================================== */

        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile() {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            var result =
                await _userService.GetProfileAsync(
                    userId);


            return Ok(
                ApiResponse<UserProfileResponse>.Ok(
                    result,
                    "Profil bilgileri getirildi."));
        }


        /* ===================================================== */
        /* UPDATE PROFILE */
        /* ===================================================== */

        [HttpPut("Profile")]
        public async Task<IActionResult> UpdateProfile(
            UpdateUserProfileRequest request) {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            var result =
                await _userService.UpdateProfileAsync(
                    userId,
                    request);


            return Ok(
                ApiResponse<UserProfileResponse>.Ok(
                    result,
                    "Profil bilgileri güncellendi."));
        }


        /* ===================================================== */
        /* CHANGE PASSWORD */
        /* ===================================================== */

        [HttpPost("ChangePassword")]
        public async Task<IActionResult> ChangePassword(
            ChangePasswordRequest request) {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            await _userService.ChangePasswordAsync(
                userId,
                request);


            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Şifreniz başarıyla değiştirildi."));
        }

        [AllowAnonymous]
        [HttpPost("ForgotPassword")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordRequest request) {
            await _userService.SendPasswordResetEmailAsync(request.Email);

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Şifre sıfırlama bağlantısı email adresinize gönderildi."));
        }

        [AllowAnonymous]
        [HttpPost("ResetPassword")]
        public async Task<IActionResult> ResetPassword(ResetPasswordRequest request) {
            await _userService.ResetPasswordAsync(
                request.Email,
                request.Token,
                request.NewPassword);

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Şifreniz başarıyla sıfırlandı."));
        }


        [AllowAnonymous]
        [HttpPost("GenerateEmailConfirmation")]
        public async Task<IActionResult> GenerateEmailConfirmation(ForgotPasswordRequest request) {
            var token =await _userService.GenerateEmailConfirmationTokenAsync(
                    request.Email);

            return Ok(
                ApiResponse<string>.Ok(
                    token,
                    "Email doğrulama token'ı oluşturuldu."));
        }

        [AllowAnonymous]
        [HttpPost("ConfirmEmail")]
        public async Task<IActionResult> ConfirmEmail(ConfirmEmailRequest request) {
            await _userService.ConfirmEmailAsync(
                request.Email,
                request.Token);

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Email adresiniz başarıyla doğrulandı."));
        }

        [AllowAnonymous]
        [HttpPost("ResendEmailConfirmation")]
        public async Task<IActionResult> ResendEmailConfirmation(ForgotPasswordRequest request) {
            await _authService.ResendEmailConfirmationAsync(
                request.Email);

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Email doğrulama bağlantısı gönderildi."));
        }
        [HttpPut("NotificationPreferences")]
        public async Task<IActionResult> UpdateNotificationPreferences(UpdateNotificationPreferencesRequest request) {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            var result = await _userService.UpdateNotificationPreferencesAsync(userId, request);
            return Ok(ApiResponse<UserProfileResponse>.Ok(result, "Bildirim tercihleri güncellendi."));
        }

        [HttpPost("RequestEmailChange")]
        public async Task<IActionResult> RequestEmailChange(ChangeEmailRequest request) {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            await _userService.RequestEmailChangeAsync(userId, request);
            return Ok(ApiResponse<object>.Ok(null, "Yeni email adresinize onay bağlantısı gönderildi."));
        }

        [AllowAnonymous]
        [HttpPost("ConfirmEmailChange")]
        public async Task<IActionResult> ConfirmEmailChange(ConfirmEmailChangeRequest request) {
            if (string.IsNullOrWhiteSpace(request.UserId)) return Unauthorized();
            await _userService.ConfirmEmailChangeAsync(request.UserId, request);
            return Ok(ApiResponse<object>.Ok(null, "Email adresiniz başarıyla değiştirildi."));
        }

        [HttpDelete("AllTodos")]
        public async Task<IActionResult> DeleteAllTodos() {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            await _userService.DeleteAllTodosAsync(userId);
            return Ok(ApiResponse<object>.Ok(null, "Tüm görevleriniz silindi."));
        }

        [HttpDelete("Account")]
        public async Task<IActionResult> DeleteAccount() {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            await _userService.DeleteAccountAsync(userId);
            return Ok(ApiResponse<object>.Ok(null, "Hesabınız silindi."));
        }

        [HttpPost("LogoutAllSessions")]
        public async Task<IActionResult> LogoutAllSessions() {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;
            if (string.IsNullOrEmpty(userId)) return Unauthorized();
            await _userService.LogoutAllSessionsAsync(userId);
            return Ok(ApiResponse<object>.Ok(null, "Tüm oturumlarınız sonlandırıldı."));
        }

    }
}