using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Todo {
    public class CreateTodoRequest {
        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public int CategoryId { get; set; }

        public int Priority { get; set; }

        public DateTime? DueDate { get; set; }

        public bool EmailReminderEnabled { get; set; }
        public int? EmailReminderMinutesBefore { get; set; }

        // Browser tarafındaki local saat ile UTC arasındaki fark (Date.getTimezoneOffset()).
        public int? TimeZoneOffsetMinutes { get; set; }
    }
}
