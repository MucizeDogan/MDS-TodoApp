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

        [HttpGet("Profile")]
        public async Task<IActionResult> GetProfile() {
            var userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }

            var result = await _userService.GetProfileAsync(userId);

            return Ok(
                ApiResponse<UserProfileResponse>.Ok(
                    result,
                    "Profil bilgileri getirildi."));
        }

        [HttpPut("Profile")]
        public async Task<IActionResult> UpdateProfile(
            UpdateUserProfileRequest request) {
            var userId = User.FindFirst(
                System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }

            var result = await _userService.UpdateProfileAsync(
                userId,
                request);

            return Ok(
                ApiResponse<UserProfileResponse>.Ok(
                    result,
                    "Profil bilgileri güncellendi."));
        }
    }
}
