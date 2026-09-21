using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;
using TodoApp.Application.DTOs.User;
using TodoApp.Application.Interfaces;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.Infrastructure.Services {
    public class UserService : IUserService {
        private readonly UserManager<ApplicationUser> _userManager;


        public UserService(
            UserManager<ApplicationUser> userManager) {
            _userManager = userManager;
        }


        public async Task<UserProfileResponse> GetProfileAsync(
            string userId) {
            var user =
                await _userManager.FindByIdAsync(userId);


            if (user == null) {
                throw new UnauthorizedAccessException(
                    "Kullanıcı bulunamadı.");
            }


            return new UserProfileResponse {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            };
        }


        public async Task<UserProfileResponse> UpdateProfileAsync(
            string userId,
            UpdateUserProfileRequest request) {
            var user =
                await _userManager.FindByIdAsync(userId);


            if (user == null) {
                throw new UnauthorizedAccessException(
                    "Kullanıcı bulunamadı.");
            }


            user.FullName =
                request.FullName.Trim();


            var result =
                await _userManager.UpdateAsync(user);


            if (!result.Succeeded) {
                var errors =
                    string.Join(
                        " | ",
                        result.Errors.Select(
                            x => x.Description));

                throw new Exception(errors);
            }


            return new UserProfileResponse {
                Id = user.Id,
                FullName = user.FullName ?? string.Empty,
                Email = user.Email ?? string.Empty,
                EmailConfirmed = user.EmailConfirmed,
                CreatedAt = user.CreatedAt
            };
        }


        /* ===================================================== */
        /* CHANGE PASSWORD */
        /* ===================================================== */

        public async Task ChangePasswordAsync(
            string userId,
            ChangePasswordRequest request) {
            var user =
                await _userManager.FindByIdAsync(userId);


            if (user == null) {
                throw new UnauthorizedAccessException(
                    "Kullanıcı bulunamadı.");
            }


            var result =
                await _userManager.ChangePasswordAsync(
                    user,
                    request.CurrentPassword,
                    request.NewPassword);


            if (!result.Succeeded) {
                var errors =
                    string.Join(
                        " | ",
                        result.Errors.Select(
                            x => x.Description));

                throw new ArgumentException(errors);
            }
        }

        public async Task<string> GeneratePasswordResetTokenAsync(string email) {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) {
                throw new ArgumentException(
                    "Bu email adresi ile kayıtlı bir kullanıcı bulunamadı.");
            }

            var token = await _userManager.GeneratePasswordResetTokenAsync(user);

            return token;
        }

        public async Task ResetPasswordAsync(
            string email,
            string token,
            string newPassword) {
            var user = await _userManager.FindByEmailAsync(email);

            if (user == null) {
                throw new ArgumentException("Kullanıcı bulunamadı.");
            }

            var result = await _userManager.ResetPasswordAsync(
                user,
                token,
                newPassword);

            if (!result.Succeeded) {
                var errors = string.Join(
                    " | ",
                    result.Errors.Select(x => x.Description));

                throw new ArgumentException(errors);
            }
        }
    }
}
