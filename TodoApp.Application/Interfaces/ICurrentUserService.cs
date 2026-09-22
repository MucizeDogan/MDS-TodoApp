using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//"Şu anda API'ye istek yapan kullanıcı kim?"
namespace TodoApp.Application.Interfaces {
    public interface ICurrentUserService {
        string? UserId { get; }

        string? Email { get; }

        string? FullName { get; }
    }
}
