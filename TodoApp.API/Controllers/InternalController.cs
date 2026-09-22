using System.Security.Cryptography;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using TodoApp.Application.DTOs.Common;
using TodoApp.Application.Interfaces;
using TodoApp.Application.Settings;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/internal")]
    [AllowAnonymous]
    public class InternalController : ControllerBase {
        private const string SchedulerKeyHeader = "X-Scheduler-Key";

        private readonly IEmailReminderService _emailReminderService;
        private readonly AppSettings _appSettings;
        private readonly ILogger<InternalController> _logger;

        public InternalController(
            IEmailReminderService emailReminderService,
            IOptions<AppSettings> appSettings,
            ILogger<InternalController> logger) {
            _emailReminderService = emailReminderService;
            _appSettings = appSettings.Value;
            _logger = logger;
        }

        [HttpGet("email-reminders/process")]
        [HttpPost("email-reminders/process")]
        public async Task<IActionResult> ProcessEmailReminders(
            [FromQuery] string? key,
            CancellationToken cancellationToken) {
            if (!IsValidSchedulerKey(key)) {
                _logger.LogWarning(
                    "Geçersiz veya eksik scheduler anahtarı ile email reminder endpoint'i çağrıldı. IP: {Ip}",
                    HttpContext.Connection.RemoteIpAddress);

                return Unauthorized();
            }

            var result = await _emailReminderService
                .ProcessPendingAsync(cancellationToken);

            return Ok(
                ApiResponse<EmailReminderProcessResult>.Ok(
                    result,
                    "Email reminder işlemi tamamlandı."));
        }

        private bool IsValidSchedulerKey(string? queryKey) {
            if (string.IsNullOrWhiteSpace(_appSettings.SchedulerKey))
                return false;

            var providedKey = queryKey;

            if (string.IsNullOrWhiteSpace(providedKey) &&
                Request.Headers.TryGetValue(
                    SchedulerKeyHeader,
                    out var headerKey)) {
                providedKey = headerKey.ToString();
            }

            if (string.IsNullOrWhiteSpace(providedKey))
                return false;

            var expectedBytes = Encoding.UTF8.GetBytes(
                _appSettings.SchedulerKey);
            var providedBytes = Encoding.UTF8.GetBytes(
                providedKey);

            return CryptographicOperations.FixedTimeEquals(
                expectedBytes,
                providedBytes);
        }
    }
}
