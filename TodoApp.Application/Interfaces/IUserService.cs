using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TodoApp.Application.DTOs.User;

namespace TodoApp.Application.Interfaces {
    public interface IUserService {
        Task<UserProfileResponse> GetProfileAsync(string userId);

        Task<UserProfileResponse> UpdateProfileAsync(string userId, UpdateUserProfileRequest request);
    }
}
