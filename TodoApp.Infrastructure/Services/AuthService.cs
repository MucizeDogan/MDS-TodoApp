using Microsoft.AspNetCore.Identity;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoApp.Application.DTOs.Auth;
using TodoApp.Application.Interfaces;
using TodoApp.Application.Settings;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.Infrastructure.Services {
    public class AuthService : IAuthService {
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly SignInManager<ApplicationUser> _signInManager;
        private readonly ITokenService _tokenService;
        private readonly IEmailService _emailService;
        private readonly AppSettings _appSettings;

        public AuthService(
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            ITokenService tokenService,
            IEmailService emailService,
            IOptions<AppSettings> appSettings) 
            {
            _userManager = userManager;
            _signInManager = signInManager;
            _tokenService = tokenService;
            _emailService = emailService;
            _appSettings = appSettings.Value;
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

            //E-mail confirmation token
            var emailConfirmationToken =await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var verificationUrl =
                $"{_appSettings.WebBaseUrl}/verify-email.html" +
                $"?email={Uri.EscapeDataString(user.Email!)}" +
                $"&token={Uri.EscapeDataString(emailConfirmationToken)}";

            var emailBody =
                $"""
                Merhaba {user.FullName},

                TodoApp hesabınızı oluşturduğunuz için teşekkür ederiz.

                Ekleyeceğiniz görevlerde hatırlatma özelliğini kullanmak isterseniz Email doğrulama işlemi gerekli bu yüzden doğrulamanızı tavsiye ediyoruz.

                Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:

                {verificationUrl}

                Bu hesabı siz oluşturmadıysanız bu emaili dikkate almayabilirsiniz.

                İyi çalışmalar,
                MDSTodoApp
                """;

            await _emailService.SendAsync(
                user.Email!,
                "MDSTodoApp - Email Adresinizi Doğrulayın",
                emailBody);


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

        public async Task ResendEmailConfirmationAsync(string email) {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) {
                throw new ArgumentException(
                    "Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.");
            }

            if (user.EmailConfirmed) {
                throw new InvalidOperationException(
                    "Bu email adresi zaten doğrulanmış.");
            }

            var emailConfirmationToken =
                await _userManager.GenerateEmailConfirmationTokenAsync(user);

            var verificationUrl =
                $"{_appSettings.WebBaseUrl}/verify-email.html" +
                $"?email={Uri.EscapeDataString(user.Email!)}" +
                $"&token={Uri.EscapeDataString(emailConfirmationToken)}";

            var emailBody =
                $"""
                Merhaba {user.FullName},

                TodoApp email doğrulama bağlantınızı yeniledik.

                Ekleyeceğiniz görevlerde hatırlatma özelliğini kullanmak isterseniz Email doğrulama işlemi gerekli bu yüzden doğrulamanızı tavsiye ediyoruz.

                Email adresinizi doğrulamak için aşağıdaki bağlantıya tıklayın:

                {verificationUrl}

                Bu hesabı siz oluşturmadıysanız bu emaili dikkate almayabilirsiniz.

                İyi çalışmalar,
                MDSTodoApp
                """;

            await _emailService.SendAsync(
                user.Email!,
                "MDSTodoApp - Email Doğrulama Bağlantınız",
                emailBody);
        }
    }
}