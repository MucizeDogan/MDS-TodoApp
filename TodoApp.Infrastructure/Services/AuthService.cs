using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using TodoApp.Application.DTOs.Auth;
using TodoApp.Application.Interfaces;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.Infrastructure.Services {
    public class AuthService : IAuthService {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService) {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
        }


        public async Task<AuthResponse> RegisterAsync(RegisterRequest request) {
            var existingUser = await _userManager.FindByEmailAsync(request.Email);

            if (existingUser != null) {
                throw new Exception("Bu email adresi zaten kayıtlı.");
            }


            var user = new ApplicationUser {
                UserName = request.Email,
                Email = request.Email,
                FullName = request.FullName,
                CreatedAt = DateTime.UtcNow
            };


            var result = await _userManager.CreateAsync(user, request.Password);


            if (!result.Succeeded) {
                var errors = string.Join(
                    " | ",
                    result.Errors.Select(x => x.Description));

                throw new Exception(errors);
            }


            var token = _tokenService.GenerateToken(
                user.Id,
                user.Email!,
                user.FullName);


            return new AuthResponse {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email!
            };
        }


        public async Task<AuthResponse> LoginAsync(LoginRequest request) {
            var user = await _userManager.FindByEmailAsync(request.Email);


            if (user == null) {
                throw new UnauthorizedAccessException(
                    "Email veya parola hatalı.");
            }


            var result = await _signInManager.CheckPasswordSignInAsync(user, request.Password, lockoutOnFailure: true);


            if (!result.Succeeded) {
                throw new UnauthorizedAccessException(
                    "Email veya parola hatalı.");
            }


            var token = _tokenService.GenerateToken(
                user.Id,
                user.Email!,
                user.FullName);


            return new AuthResponse {
                Token = token,
                UserId = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email!
            };
        }
    }
}