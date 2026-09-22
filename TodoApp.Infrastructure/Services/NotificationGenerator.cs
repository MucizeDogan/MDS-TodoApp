using Microsoft.EntityFrameworkCore;
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
            // 1. KULLANICININ AKTİF GÖREVLERİNİ GETİR
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
            // 2. MEVCUT GÖREV BİLDİRİMLERİNİ GETİR
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
            // 3. ARTIK AKTİF KAPSAMDA OLMAYAN BİLDİRİMLERİ SİL
            //
            // Örnek:
            //
            // Todo silindi
            // Todo tamamlandı
            // Todo'nun tarihi 25 Eylül'e taşındı
            // Todo'nun DueDate değeri kaldırıldı
            //
            // Bu durumda notification artık geçerli değildir.
            // ---------------------------------------------------------

            var activeTaskIds = activeTasks
                .Select(x => x.Id)
                .ToHashSet();

            var notificationsToRemove = existingNotifications
                .Where(notification =>
                    !activeTaskIds.Contains(
                        notification.RelatedEntityId!.Value))
                .ToList();

            if (notificationsToRemove.Count > 0) {
                _context.Notifications.RemoveRange(
                    notificationsToRemove);
            }

            // Silinecek notification'ları mevcut listeden çıkar.
            existingNotifications = existingNotifications
                .Except(notificationsToRemove)
                .ToList();

            // ---------------------------------------------------------
            // 4. AKTİF GÖREVLERİN GÜNCEL DURUMUNU SENKRONİZE ET
            // ---------------------------------------------------------

            foreach (var task in activeTasks) {
                var notificationType =
                    GetNotificationType(
                        task.DueDate!.Value,
                        today,
                        tomorrow);

                // Bu görev bugün / yarın / gecikmiş değilse
                // notification oluşturmuyoruz.
                if (notificationType == null)
                    continue;

                var existingNotification =
                    existingNotifications.FirstOrDefault(x =>
                        x.RelatedEntityId == task.Id);

                // -----------------------------------------------------
                // 5. NOTIFICATION YOKSA OLUŞTUR
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
                // 6. NOTIFICATION'IN DURUMU DEĞİŞTİYSE GÜNCELLE
                // -----------------------------------------------------

                if (existingNotification.Type != notificationType) {
                    existingNotification.Type =
                        notificationType;

                    existingNotification.Title =
                        GetNotificationTitle(
                            notificationType);

                    existingNotification.Message =
                        GetNotificationMessage(
                            notificationType,
                            task.Title);

                    existingNotification.IsRead = false;

                    existingNotification.CreatedAt =
                        DateTime.UtcNow;
                } else {
                    // Görev adı değiştirilmiş olabilir.
                    var newMessage =
                        GetNotificationMessage(
                            notificationType,
                            task.Title);

                    if (existingNotification.Message !=
                        newMessage) {
                        existingNotification.Message =
                            newMessage;
                    }
                }
            }

            // ---------------------------------------------------------
            // 7. TÜM DEĞİŞİKLİKLERİ TEK SEFERDE KAYDET
            // ---------------------------------------------------------

            await _context.SaveChangesAsync();
        }

        private static string? GetNotificationType(
            DateTime dueDate,
            DateTime today,
            DateTime tomorrow) {
            if (dueDate < today) {
                return "TaskOverdue";
            }

            if (dueDate >= today &&
                dueDate < tomorrow) {
                return "TaskDueToday";
            }

            if (dueDate >= tomorrow &&
                dueDate < tomorrow.AddDays(1)) {
                return "TaskDueTomorrow";
            }

            return null;
        }

        private static string GetNotificationTitle(
            string notificationType) {
            return notificationType switch {
                "TaskOverdue" =>
                    "Gecikmiş görev",

                "TaskDueToday" =>
                    "Bugünkü görev",

                "TaskDueTomorrow" =>
                    "Yarının görevi",

                _ =>
                    "Görev bildirimi"
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

                _ =>
                    todoTitle
            };
        }
    }
}