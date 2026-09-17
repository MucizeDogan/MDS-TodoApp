using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TodoApp.Application.Interfaces;

namespace TodoApp.Infrastructure.Services {
    public class JwtTokenService : ITokenService {
        private readonly IConfiguration _configuration;

        public JwtTokenService(IConfiguration configuration) {
            _configuration = configuration;
        }


        public string GenerateToken(
            string userId,
            string email,
            string? fullName) {
            var jwtKey = _configuration["Jwt:Key"];

            if (string.IsNullOrWhiteSpace(jwtKey)) {
                throw new InvalidOperationException(
                    "JWT Key yapılandırılmamış.");
            }


            var claims = new List<Claim>
            {
                new Claim(
                    ClaimTypes.NameIdentifier,
                    userId),

                new Claim(
                    ClaimTypes.Email,
                    email),

                new Claim(
                    ClaimTypes.Name,
                    fullName ?? string.Empty)
            };


            var key = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(jwtKey));


            var credentials = new SigningCredentials(
                key,
                SecurityAlgorithms.HmacSha256);


            var token = new JwtSecurityToken(
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);


            return new JwtSecurityTokenHandler()
                .WriteToken(token);
        }
    }
}
