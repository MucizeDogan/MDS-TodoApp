using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoApp.Application.DTOs.Notification;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class NotificationService : INotificationService {
        private readonly ApplicationDbContext _context;


        public NotificationService(
            ApplicationDbContext context) {
            _context = context;
        }


        /* ===================================================== */
        /* GET ALL */
        /* ===================================================== */

        public async Task<List<NotificationResponse>> GetAllAsync(string userId) {
            return await _context.Notifications
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    x.RelatedEntityType == "TodoItem" &&
                    x.RelatedEntityId.HasValue)
                .OrderBy(x => x.IsRead)
                .ThenByDescending(x => x.CreatedAt)
                .Take(50)
                .Select(x => new NotificationResponse {
                    Id = x.Id,

                    Title = x.Title,

                    Message = x.Message,

                    Type = x.Type,

                    IsRead = x.IsRead,

                    CreatedAt = x.CreatedAt,

                    RelatedEntityType = x.RelatedEntityType,

                    RelatedEntityId = x.RelatedEntityId,

                    TodoTitle = x.RelatedEntityId.HasValue
                        ? _context.TodoItems
                            .Where(t =>
                                t.Id == x.RelatedEntityId.Value &&
                                t.UserId == userId)
                            .Select(t => t.Title)
                            .FirstOrDefault()
                        : null,

                    TodoDueDate = x.RelatedEntityId.HasValue
                        ? _context.TodoItems
                            .Where(t =>
                                t.Id == x.RelatedEntityId.Value &&
                                t.UserId == userId)
                            .Select(t => t.DueDate)
                            .FirstOrDefault()
                        : null,

                    TodoPriority = x.RelatedEntityId.HasValue
                        ? _context.TodoItems
                            .Where(t =>
                                t.Id == x.RelatedEntityId.Value &&
                                t.UserId == userId)
                            .Select(t => (int?)t.Priority)
                            .FirstOrDefault()
                        : null,

                    CategoryName = x.RelatedEntityId.HasValue
                        ? _context.TodoItems
                            .Where(t =>
                                t.Id == x.RelatedEntityId.Value &&
                                t.UserId == userId)
                            .Select(t => t.Category.Name)
                            .FirstOrDefault()
                        : null,

                    CategoryColor = x.RelatedEntityId.HasValue
                        ? _context.TodoItems
                            .Where(t =>
                                t.Id == x.RelatedEntityId.Value &&
                                t.UserId == userId)
                            .Select(t => t.Category.Color)
                            .FirstOrDefault()
                        : null
                })
                .ToListAsync();
        }


        /* ===================================================== */
        /* MARK AS READ */
        /* ===================================================== */

        public async Task MarkAsReadAsync(
            string userId,
            int notificationId) {
            var notification =
                await _context.Notifications
                    .FirstOrDefaultAsync(
                        x =>
                            x.Id == notificationId &&
                            x.UserId == userId);


            if (notification == null) {
                throw new KeyNotFoundException(
                    "Bildirim bulunamadı.");
            }


            if (notification.IsRead) {
                return;
            }


            notification.IsRead = true;


            await _context.SaveChangesAsync();
        }


        /* ===================================================== */
        /* MARK ALL AS READ */
        /* ===================================================== */

        public async Task MarkAllAsReadAsync(
            string userId) {
            var notifications =
                await _context.Notifications
                    .Where(
                        x =>
                            x.UserId == userId &&
                            !x.IsRead)
                    .ToListAsync();


            if (notifications.Count == 0) {
                return;
            }


            foreach (var notification in notifications) {
                notification.IsRead = true;
            }


            await _context.SaveChangesAsync();
        }
    }
}