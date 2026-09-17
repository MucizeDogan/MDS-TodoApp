using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

//namespace TodoApp.Domain.Entities {
//    public class Category {
//        public int Id { get; set; }

//        public string Name { get; set; } = string.Empty;

//        public string? Color { get; set; }

//        public string? Icon { get; set; }

//        public string UserId { get; set; } = string.Empty;

//        public ApplicationUser User { get; set; } = null!;

//        public ICollection<TodoItem> TodoItems { get; set; }
//            = new List<TodoItem>();
//    }
//}

namespace TodoApp.Domain.Entities {
    public class Category {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Color { get; set; }

        public string? Icon { get; set; }

        public string UserId { get; set; } = string.Empty;

        public ICollection<TodoItem> TodoItems { get; set; }
            = new List<TodoItem>();
    }
}
