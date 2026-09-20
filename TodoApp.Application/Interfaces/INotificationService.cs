using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoApp.Application.DTOs.Notification;

namespace TodoApp.Application.Interfaces {
    public interface INotificationService {
        Task<List<NotificationResponse>> GetAllAsync(
            string userId);

        Task MarkAsReadAsync(string userId, int notificationId);

        Task MarkAllAsReadAsync(string userId);
    }
}
