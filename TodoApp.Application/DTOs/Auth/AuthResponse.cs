using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Auth {
    public class AuthResponse {
        public string Token { get; set; } = string.Empty;

        public string UserId { get; set; } = string.Empty;

        public string FullName { get; set; } = string.Empty;

        public string Email { get; set; } = string.Empty;
    }
}

//Login sonucunda frontend'e Identity'nin bütün User nesnesini göndermek yerine yalnızca ihtiyacımız olan bilgileri göndereceğiz.

//Örneğin:

//{
//    "token": "eyJhbGciOiJIUzI1NiIs...",
//  "userId": "a8f...",
//  "fullName": "Cristdoan",
//  "email": "cristdoan@example.com"
//}
