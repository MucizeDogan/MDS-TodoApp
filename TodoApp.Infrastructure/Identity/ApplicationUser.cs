using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity;

namespace TodoApp.Infrastructure.Identity {
    public class ApplicationUser : IdentityUser {
        public string? FullName { get; set; }

        public DateTime CreatedAt { get; set; }
    }
}
