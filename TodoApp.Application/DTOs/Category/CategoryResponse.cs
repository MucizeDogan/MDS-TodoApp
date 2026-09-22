using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Category {
    public class CategoryResponse {
        public int Id { get; set; }

        public string Name { get; set; } = string.Empty;

        public string? Color { get; set; }

        public string? Icon { get; set; }

        public int TodoCount { get; set; }
    }
}
