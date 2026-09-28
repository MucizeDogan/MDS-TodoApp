namespace TodoApp.Application.Interfaces {
    public interface ITokenService {
        string GenerateToken(string userId, string email, string? fullName, string securityStamp);
    }
}
