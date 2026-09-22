using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.User {
    public class UpdateUserProfileRequest {
        public string FullName { get; set; } = string.Empty;
    }
}
