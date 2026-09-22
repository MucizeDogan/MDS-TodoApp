using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TodoApp.Domain.Enums;

namespace TodoApp.Domain.Entities {
    public class TodoItem {
        public int Id { get; set; }

        public string Title { get; set; } = string.Empty;

        public string? Description { get; set; }

        public TodoPriority Priority { get; set; }

        public bool IsCompleted { get; set; }

        public DateTime? DueDate { get; set; }
        public bool EmailReminderEnabled { get; set; } //Hatırlarıcı olsun mu
        public int? EmailReminderMinutesBefore { get; set; } // Ne kadar süre önce mail gelsin
        public DateTime? EmailReminderAt { get; set; } //Mailin gönderileceği zaman
        public bool EmailReminderSent { get; set; } // Mail gönderildi mi?

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
