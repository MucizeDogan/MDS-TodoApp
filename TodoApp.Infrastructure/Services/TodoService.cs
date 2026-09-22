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

            if (request.EmailReminderEnabled) {
                var emailConfirmed = await _context.Users
                    .Where(x => x.Id == userId)
                    .Select(x => x.EmailConfirmed)
                    .FirstOrDefaultAsync();

                if (!emailConfirmed) {
                    throw new InvalidOperationException(
                        "Email hatırlatması kullanabilmek için email adresiniz doğrulanmalıdır.");
                }
            }


            var todo = new TodoItem {
                Title = request.Title.Trim(),

                Description = string.IsNullOrWhiteSpace(request.Description)
                        ? null
                        : request.Description.Trim(),

                CategoryId = request.CategoryId,

                Priority = (Domain.Enums.TodoPriority)request.Priority,

                IsCompleted = false,

                DueDate = request.DueDate,


                EmailReminderEnabled = request.EmailReminderEnabled,
                EmailReminderMinutesBefore = request.EmailReminderEnabled
                    ? request.EmailReminderMinutesBefore
                    : null,
                EmailReminderAt = CalculateEmailReminderAt(
                    request.DueDate,
                    request.EmailReminderEnabled,
                    request.EmailReminderMinutesBefore,
                    request.TimeZoneOffsetMinutes),
                EmailReminderSent = false,


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

                    EmailReminderEnabled = x.EmailReminderEnabled,
                    EmailReminderMinutesBefore = x.EmailReminderMinutesBefore,
                    EmailReminderAt = x.EmailReminderAt,
                    EmailReminderSent = x.EmailReminderSent,

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

                    EmailReminderEnabled = x.EmailReminderEnabled,
                    EmailReminderMinutesBefore = x.EmailReminderMinutesBefore,
                    EmailReminderAt = x.EmailReminderAt,
                    EmailReminderSent = x.EmailReminderSent,

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

            if (request.EmailReminderEnabled) {
                var emailConfirmed = await _context.Users
                    .Where(x => x.Id == userId)
                    .Select(x => x.EmailConfirmed)
                    .FirstOrDefaultAsync();

                if (!emailConfirmed) {
                    throw new InvalidOperationException(
                        "Email hatırlatması kullanabilmek için email adresiniz doğrulanmalıdır.");
                }
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


            todo.EmailReminderEnabled = request.EmailReminderEnabled;

            todo.EmailReminderMinutesBefore =
                request.EmailReminderEnabled
                    ? request.EmailReminderMinutesBefore
                    : null;

            todo.EmailReminderAt = CalculateEmailReminderAt(
                request.DueDate,
                request.EmailReminderEnabled,
                request.EmailReminderMinutesBefore,
                request.TimeZoneOffsetMinutes);

            todo.EmailReminderSent = false;


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

        private static DateTime? CalculateEmailReminderAt(
        DateTime? dueDate,
        bool reminderEnabled,
        int? minutesBefore,
        int? timeZoneOffsetMinutes) {
            if (!reminderEnabled)
                return null;

            if (!dueDate.HasValue)
                return null;

            if (!minutesBefore.HasValue || minutesBefore.Value <= 0)
                return null;

            if (!timeZoneOffsetMinutes.HasValue)
                return null;

            // DueDate, frontend'den kullanıcının yerel saati olarak gelir.
            // JavaScript Date.getTimezoneOffset() = UTC - local farkıdır.
            // Local -> UTC dönüşümü için bu farkı ekliyoruz.
            var reminderLocal = DateTime.SpecifyKind(
                dueDate.Value.AddMinutes(-minutesBefore.Value),
                DateTimeKind.Unspecified);

            var reminderUtc = reminderLocal.AddMinutes(
                timeZoneOffsetMinutes.Value);

            return DateTime.SpecifyKind(
                reminderUtc,
                DateTimeKind.Utc);
        }
    }
}