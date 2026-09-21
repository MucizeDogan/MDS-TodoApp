using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;

using TodoApp.Application.DTOs.Common;
using TodoApp.Application.DTOs.User;
using TodoApp.Application.Interfaces;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class UserController : ControllerBase {
        private readonly IUserService _userService;


        public UserController(
            IUserService userService) {
            _userService = userService;
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
            var token = await _userService.GeneratePasswordResetTokenAsync(
                    request.Email);

            return Ok(
                ApiResponse<string>.Ok(
                    token,
                    "Şifre sıfırlama token'ı oluşturuldu."));
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
    }
}