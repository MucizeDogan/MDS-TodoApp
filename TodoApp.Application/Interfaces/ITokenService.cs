using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.Interfaces {
    public interface ITokenService {
        string GenerateToken(string userId, string email, string? fullName);
    }
}
