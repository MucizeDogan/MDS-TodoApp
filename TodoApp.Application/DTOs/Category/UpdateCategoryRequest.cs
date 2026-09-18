using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Category {
    public class UpdateCategoryRequest {
        public string Name { get; set; } = string.Empty;

        public string? Color { get; set; }

        public string? Icon { get; set; }
    }
}
