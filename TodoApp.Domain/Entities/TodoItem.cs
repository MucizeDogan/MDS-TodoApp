using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TodoApp.Domain.Enums;

//namespace TodoApp.Domain.Entities {
//    public class TodoItem {
//        public int Id { get; set; }

//        public string Title { get; set; } = string.Empty;

//        public string? Description { get; set; }

//        public TodoPriority Priority { get; set; }

//        public bool IsCompleted { get; set; }

//        public DateTime? DueDate { get; set; }

//        public DateTime CreatedAt { get; set; }

//        public DateTime? UpdatedAt { get; set; }

//        public DateTime? CompletedAt { get; set; }


//        // User
//        public string UserId { get; set; } = string.Empty;

//        public ApplicationUser User { get; set; } = null!;


//        // Category
//        public int CategoryId { get; set; }

//        public Category Category { get; set; } = null!;
//    }
//}

using TodoApp.Domain.Enums;

namespace TodoApp.Domain.Entities {
    public class TodoItem {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public TodoPriority Priority { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime? DueDate { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }


        // Kullanıcı
        public string UserId { get; set; } = string.Empty;


        // Kategori
        public int CategoryId { get; set; }

        public Category Category { get; set; } = null!;
    }
}
