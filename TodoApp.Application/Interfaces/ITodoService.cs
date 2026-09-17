using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using TodoApp.Application.DTOs.Todo;

namespace TodoApp.Application.Interfaces {
    public interface ITodoService {
        Task<TodoResponse> CreateAsync(string userId, CreateTodoRequest request);

        Task<TodoListResponse> GetAllAsync(string userId);

        Task<TodoResponse?> GetByIdAsync(string userId, int id);

        Task<TodoResponse?> UpdateAsync(string userId, int id, UpdateTodoRequest request);

        Task<bool> DeleteAsync(string userId, int id);

        Task<TodoResponse?> SetCompletedAsync(string userId, int id, bool isCompleted);
    }
}
