namespace TodoApp.Application.DTOs.User {
    public class UpdateNotificationPreferencesRequest {
        public bool AppNotificationsEnabled { get; set; }
        public bool TaskRemindersEnabled { get; set; }
        public bool EmailNotificationsEnabled { get; set; }
    }
}
