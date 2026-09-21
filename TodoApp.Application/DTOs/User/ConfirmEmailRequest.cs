using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.User {
    public class ConfirmEmailRequest {
        public string Email { get; set; } = string.Empty;

        public string Token { get; set; } = string.Empty;
    }
}