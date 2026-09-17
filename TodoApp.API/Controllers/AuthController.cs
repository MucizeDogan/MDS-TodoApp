using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs.Auth;
using TodoApp.Application.Interfaces;

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
            try {
                var result =await _authService.RegisterAsync(request);

                return Ok(result);
            } catch (Exception ex) {
                return BadRequest(new {
                    message = ex.Message
                });
            }
        }


        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginRequest request) {
            try {
                var result =await _authService.LoginAsync(request);

                return Ok(result);
            } catch (UnauthorizedAccessException ex) {
                return Unauthorized(new {
                    message = ex.Message
                });
            } catch (Exception ex) {
                return BadRequest(new {
                    message = ex.Message
                });
            }
        }
    }
}