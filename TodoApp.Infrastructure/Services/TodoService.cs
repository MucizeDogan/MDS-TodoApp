using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

using Microsoft.EntityFrameworkCore;
using TodoApp.Application.DTOs.Todo;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class TodoService : ITodoService {
        private readonly ApplicationDbContext _context;

        public TodoService(ApplicationDbContext context) {
            _context = context;
        }


        public async Task<TodoResponse> CreateAsync(
            string userId,
            CreateTodoRequest request) {
            // Kullanıcının gerçekten bu kategoriye sahip
            // olup olmadığını kontrol ediyoruz.
            var categoryExists = await _context.Categories
                .AnyAsync(x =>
                    x.Id == request.CategoryId &&
                    x.UserId == userId);

            if (!categoryExists) {
                throw new ArgumentException(
                    "Geçersiz kategori.");
            }


            var todo = new TodoItem {
                Title = request.Title.Trim(),

                Description =
                    string.IsNullOrWhiteSpace(request.Description)
                        ? null
                        : request.Description.Trim(),

                CategoryId = request.CategoryId,

                Priority = (Domain.Enums.TodoPriority)request.Priority,

                IsCompleted = false,

                DueDate = request.DueDate,

                CreatedAt = DateTime.UtcNow,

                UserId = userId
            };


            _context.TodoItems.Add(todo);

            await _context.SaveChangesAsync();


            return await GetByIdAsync(userId, todo.Id)
                   ?? throw new Exception(
                       "Todo oluşturuldu ancak getirilemedi.");
        }


        public async Task<TodoListResponse> GetAllAsync(
            string userId) {
            var query = _context.TodoItems
                .AsNoTracking()
                .Where(x => x.UserId == userId);


            var totalCount = await query.CountAsync();

            var completedCount = await query
                .CountAsync(x => x.IsCompleted);

            var pendingCount = await query
                .CountAsync(x => !x.IsCompleted);


            var items = await query
                .Include(x => x.Category)
                .OrderBy(x => x.IsCompleted)
                .ThenBy(x => x.DueDate)
                .ThenByDescending(x => x.CreatedAt)
                .Select(x => new TodoResponse {
                    Id = x.Id,

                    Title = x.Title,

                    Description = x.Description,

                    CategoryId = x.CategoryId,

                    CategoryName = x.Category.Name,

                    Priority = (int)x.Priority,

                    IsCompleted = x.IsCompleted,

                    DueDate = x.DueDate,

                    CreatedAt = x.CreatedAt,

                    UpdatedAt = x.UpdatedAt,

                    CompletedAt = x.CompletedAt
                })
                .ToListAsync();


            return new TodoListResponse {
                TotalCount = totalCount,

                CompletedCount = completedCount,

                PendingCount = pendingCount,

                Items = items
            };
        }


        public async Task<TodoResponse?> GetByIdAsync(
            string userId,
            int id) {
            return await _context.TodoItems
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.UserId == userId)
                .Include(x => x.Category)
                .Select(x => new TodoResponse {
                    Id = x.Id,

                    Title = x.Title,

                    Description = x.Description,

                    CategoryId = x.CategoryId,

                    CategoryName = x.Category.Name,

                    Priority = (int)x.Priority,

                    IsCompleted = x.IsCompleted,

                    DueDate = x.DueDate,

                    CreatedAt = x.CreatedAt,

                    UpdatedAt = x.UpdatedAt,

                    CompletedAt = x.CompletedAt
                })
                .FirstOrDefaultAsync();
        }


        public async Task<TodoResponse?> UpdateAsync(
            string userId,
            int id,
            UpdateTodoRequest request) {
            var todo = await _context.TodoItems
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);


            if (todo == null) {
                return null;
            }


            var categoryExists = await _context.Categories
                .AnyAsync(x =>
                    x.Id == request.CategoryId &&
                    x.UserId == userId);

            if (!categoryExists) {
                throw new ArgumentException(
                    "Geçersiz kategori.");
            }


            todo.Title = request.Title.Trim();

            todo.Description =
                string.IsNullOrWhiteSpace(request.Description)
                    ? null
                    : request.Description.Trim();

            todo.CategoryId = request.CategoryId;

            todo.Priority =
                (Domain.Enums.TodoPriority)request.Priority;

            todo.DueDate = request.DueDate;

            todo.UpdatedAt = DateTime.UtcNow;


            await _context.SaveChangesAsync();


            return await GetByIdAsync(userId, id);
        }


        public async Task<bool> DeleteAsync(
            string userId,
            int id) {
            var todo = await _context.TodoItems
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);


            if (todo == null) {
                return false;
            }


            _context.TodoItems.Remove(todo);

            await _context.SaveChangesAsync();

            return true;
        }


        public async Task<TodoResponse?> SetCompletedAsync(
            string userId,
            int id,
            bool isCompleted) {
            var todo = await _context.TodoItems
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);


            if (todo == null) {
                return null;
            }


            todo.IsCompleted = isCompleted;

            todo.CompletedAt = isCompleted
                ? DateTime.UtcNow
                : null;

            todo.UpdatedAt = DateTime.UtcNow;


            await _context.SaveChangesAsync();


            return await GetByIdAsync(userId, id);
        }
    }
}