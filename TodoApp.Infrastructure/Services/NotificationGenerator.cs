using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class NotificationGenerator : INotificationGenerator {
        private readonly ApplicationDbContext _context;

        public NotificationGenerator(ApplicationDbContext context) {
            _context = context;
        }

        public async Task GenerateUpcomingTaskNotificationsAsync(string userId) {
            var today = DateTime.Today;
            var tomorrow = today.AddDays(1);
            var dayAfterTomorrow = tomorrow.AddDays(1);

            // ---------------------------------------------------------
            // 1. MEVCUT AKTİF GÖREV BİLDİRİMLERİNİ GETİR
            // ---------------------------------------------------------

            var existingNotifications = await _context.Notifications
                .Where(x =>
                    x.UserId == userId &&
                    x.RelatedEntityType == "TodoItem" &&
                    x.RelatedEntityId.HasValue &&
                    (
                        x.Type == "TaskOverdue" ||
                        x.Type == "TaskDueToday" ||
                        x.Type == "TaskDueTomorrow"
                    ))
                .ToListAsync();

            // ---------------------------------------------------------
            // 2. TAMAMLANMIŞ GÖREVLERİN BİLDİRİMLERİNİ TEMİZLE
            // ---------------------------------------------------------

            var relatedTodoIds = existingNotifications
                .Select(x => x.RelatedEntityId!.Value)
                .Distinct()
                .ToList();

            var completedTodoIds = await _context.TodoItems
                .Where(x =>
                    relatedTodoIds.Contains(x.Id) &&
                    x.UserId == userId &&
                    x.IsCompleted)
                .Select(x => x.Id)
                .ToListAsync();

            var completedNotifications = existingNotifications
                .Where(x =>
                    x.RelatedEntityId.HasValue &&
                    completedTodoIds.Contains(x.RelatedEntityId.Value))
                .ToList();

            if (completedNotifications.Count > 0) {
                _context.Notifications.RemoveRange(
                    completedNotifications);

                await _context.SaveChangesAsync();

                existingNotifications = existingNotifications
                    .Except(completedNotifications)
                    .ToList();
            }

            // ---------------------------------------------------------
            // 3. KULLANICININ AKTİF GÖREVLERİNİ GETİR
            // ---------------------------------------------------------

            var activeTasks = await _context.TodoItems
                .AsNoTracking()
                .Where(x =>
                    x.UserId == userId &&
                    !x.IsCompleted &&
                    x.DueDate.HasValue &&
                    x.DueDate.Value < dayAfterTomorrow)
                .Select(x => new {
                    x.Id,
                    x.Title,
                    x.DueDate
                })
                .ToListAsync();

            // ---------------------------------------------------------
            // 4. HER GÖREVİN GÜNCEL DURUMUNU BELİRLE
            // ---------------------------------------------------------

            foreach (var task in activeTasks) {
                string? notificationType = null;

                if (task.DueDate!.Value < today) {
                    notificationType = "TaskOverdue";
                } else if (task.DueDate.Value >= today &&
                           task.DueDate.Value < tomorrow) {
                    notificationType = "TaskDueToday";
                } else if (task.DueDate.Value >= tomorrow &&
                           task.DueDate.Value < dayAfterTomorrow) {
                    notificationType = "TaskDueTomorrow";
                }

                if (notificationType == null)
                    continue;

                var existingNotification = existingNotifications
                    .FirstOrDefault(x =>
                        x.RelatedEntityId == task.Id);

                // -----------------------------------------------------
                // 5. BİLDİRİM YOKSA OLUŞTUR
                // -----------------------------------------------------

                if (existingNotification == null) {
                    var notification = new Notification {
                        UserId = userId,
                        Title = GetNotificationTitle(
                            notificationType),
                        Message = GetNotificationMessage(
                            notificationType,
                            task.Title),
                        Type = notificationType,
                        IsRead = false,
                        CreatedAt = DateTime.UtcNow,
                        RelatedEntityType = "TodoItem",
                        RelatedEntityId = task.Id
                    };

                    _context.Notifications.Add(notification);

                    continue;
                }

                // -----------------------------------------------------
                // 6. GÖREVİN DURUMU DEĞİŞTİYSE BİLDİRİMİ GÜNCELLE
                // -----------------------------------------------------

                if (existingNotification.Type != notificationType) {
                    existingNotification.Type = notificationType;

                    existingNotification.Title =
                        GetNotificationTitle(notificationType);

                    existingNotification.Message =
                        GetNotificationMessage(
                            notificationType,
                            task.Title);

                    existingNotification.IsRead = false;
                    existingNotification.CreatedAt =
                        DateTime.UtcNow;
                } else if (existingNotification.Message !=
                           GetNotificationMessage(
                               notificationType,
                               task.Title)) {
                    existingNotification.Message =
                        GetNotificationMessage(
                            notificationType,
                            task.Title);
                }
            }

            await _context.SaveChangesAsync();
        }

        private static string GetNotificationTitle(
            string notificationType) {
            return notificationType switch {
                "TaskOverdue" => "Gecikmiş görev",

                "TaskDueToday" => "Bugünkü görev",

                "TaskDueTomorrow" => "Yarının görevi",

                _ => "Görev bildirimi"
            };
        }

        private static string GetNotificationMessage(
            string notificationType,
            string todoTitle) {
            return notificationType switch {
                "TaskOverdue" =>
                    $"\"{todoTitle}\" görevinin son tarihi geçti.",

                "TaskDueToday" =>
                    $"\"{todoTitle}\" görevinin son tarihi bugün.",

                "TaskDueTomorrow" =>
                    $"\"{todoTitle}\" görevinin son tarihi yarın.",

                _ => todoTitle
            };
        }
    }
}