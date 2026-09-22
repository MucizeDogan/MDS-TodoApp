using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Todo {
    public class TodoListResponse {
        public int TotalCount { get; set; }

        public int CompletedCount { get; set; }

        public int PendingCount { get; set; }

        public List<TodoResponse> Items { get; set; }
            = new List<TodoResponse>();
    }
}
