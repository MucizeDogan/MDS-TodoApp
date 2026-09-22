using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs.Auth;
using TodoApp.Application.Interfaces;
using TodoApp.Application.DTOs.Common;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    public class AuthController : ControllerBase {
        private readonly IAuthService _authService;

        public AuthController(IAuthService authService) {
            _authService = authService;
        }


        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterRequest request) {

            var result = await _authService.RegisterAsync(request);

            return Ok(
                ApiResponse<AuthResponse>.Ok(
                    result,
                    "Kayıt başarılı."));

        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request) {

            var result = await _authService.LoginAsync(request);

            return Ok(
                ApiResponse<AuthResponse>.Ok(
                    result,
                    "Giriş başarılı."));


        }
    }
}