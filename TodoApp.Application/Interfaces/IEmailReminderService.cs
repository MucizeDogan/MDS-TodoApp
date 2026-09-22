namespace TodoApp.Application.Interfaces {
    public interface IEmailReminderService {
        Task<EmailReminderProcessResult> ProcessPendingAsync(CancellationToken cancellationToken = default);
    }
}
