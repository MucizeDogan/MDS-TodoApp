using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using TodoApp.Application.Interfaces;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class EmailReminderService : IEmailReminderService {
        private static readonly SemaphoreSlim ProcessingLock = new(1, 1);

        private readonly ApplicationDbContext _context;
        private readonly IEmailService _emailService;
        private readonly ILogger<EmailReminderService> _logger;

        public EmailReminderService(
            ApplicationDbContext context,
            IEmailService emailService,
            ILogger<EmailReminderService> logger) {
            _context = context;
            _emailService = emailService;
            _logger = logger;
        }

        public async Task<EmailReminderProcessResult> ProcessPendingAsync(
            CancellationToken cancellationToken = default) {
            // Plesk görevi önceki çalışmayı bitirmeden tekrar tetiklenirse
            // aynı process içinde iki reminder işleminin üst üste binmesini önler.
            await ProcessingLock.WaitAsync(cancellationToken);

            try {
                var nowUtc = DateTime.UtcNow;

                var reminders = await (
                    from todo in _context.TodoItems
                    join user in _context.Users
                        on todo.UserId equals user.Id
                    where todo.EmailReminderEnabled
                        && !todo.EmailReminderSent
                        && !todo.IsCompleted
                        && todo.EmailReminderAt.HasValue
                        && todo.EmailReminderAt.Value <= nowUtc
                        && user.EmailConfirmed
                        && user.Email != null
                    orderby todo.EmailReminderAt
                    select new EmailReminderItem {
                        TodoId = todo.Id,
                        TodoTitle = todo.Title,
                        DueDate = todo.DueDate,
                        Email = user.Email!
                    })
                    .Take(50)
                    .ToListAsync(cancellationToken);

                var sent = 0;
                var failed = 0;

                foreach (var reminder in reminders) {
                    cancellationToken.ThrowIfCancellationRequested();

                    try {
                        var dueText = reminder.DueDate.HasValue
                            ? reminder.DueDate.Value.ToString("dd.MM.yyyy HH:mm")
                            : "belirtilmemiş";

                        var body = $"""
                        Merhaba,

                        "{reminder.TodoTitle}" görevini hatırlatmak için bu email gönderilmiştir.

                        Son tarih: {dueText}

                        İyi çalışmalar,
                        MDSTodoApp
                        """;

                        await _emailService.SendAsync(
                            reminder.Email,
                            "MDSTodoApp - Görev Hatırlatması",
                            body);

                        var todo = await _context.TodoItems
                            .FirstOrDefaultAsync(
                                x => x.Id == reminder.TodoId,
                                cancellationToken);

                        if (todo != null && !todo.EmailReminderSent) {
                            todo.EmailReminderSent = true;
                            todo.UpdatedAt = DateTime.UtcNow;
                            await _context.SaveChangesAsync(cancellationToken);
                            sent++;
                        }
                    }
                    catch (Exception ex) {
                        failed++;
                        _logger.LogError(
                            ex,
                            "Email reminder gönderilemedi. TodoId: {TodoId}",
                            reminder.TodoId);
                    }
                }

                return new EmailReminderProcessResult {
                    Found = reminders.Count,
                    Sent = sent,
                    Failed = failed
                };
            }
            finally {
                ProcessingLock.Release();
            }
        }

        private sealed class EmailReminderItem {
            public int TodoId { get; init; }
            public string TodoTitle { get; init; } = string.Empty;
            public DateTime? DueDate { get; init; }
            public string Email { get; init; } = string.Empty;
        }
    }
}
