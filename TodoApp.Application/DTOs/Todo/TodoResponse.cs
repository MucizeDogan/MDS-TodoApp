using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Todo {
    public class TodoResponse {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CategoryId { get; set; }

        public string CategoryName { get; set; } = string.Empty;

        public int Priority { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime? DueDate { get; set; }

        public bool EmailReminderEnabled { get; set; }
        public int? EmailReminderMinutesBefore { get; set; }
        public DateTime? EmailReminderAt { get; set; }
        public bool EmailReminderSent { get; set; }

        public DateTime CreatedAt { get; set; }

        public DateTime? UpdatedAt { get; set; }

        public DateTime? CompletedAt { get; set; }
    }
}