using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using TodoApp.Application.DTOs.Common;
using TodoApp.Application.DTOs.Notification;
using TodoApp.Application.Interfaces;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase {
        private readonly INotificationService _notificationService;
        private readonly INotificationGenerator _notificationGenerator;
        private readonly UserManager<ApplicationUser> _userManager;


        public NotificationController(
            INotificationService notificationService,
            INotificationGenerator notificationGenerator,
            UserManager<ApplicationUser> userManager) {
            _notificationService = notificationService;
            _notificationGenerator = notificationGenerator;
            _userManager = userManager;
        }


        /* ===================================================== */
        /* GET ALL */
        /* ===================================================== */

        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var userId = User.FindFirst(System.Security.Claims.ClaimTypes.NameIdentifier)?.Value;

            if (string.IsNullOrEmpty(userId))
                return Unauthorized();

            var user = await _userManager.FindByIdAsync(userId);

            if (user == null)
                return Unauthorized();

            // Uygulama bildirimleri kapalıysa bildirim merkezini boş döndürürüz.
            // Kayıtları silmeyiz; tekrar açıldığında geçerli bildirimler görünür.
            if (!user.AppNotificationsEnabled)
            {
                return Ok(
                    ApiResponse<List<NotificationResponse>>
                        .Ok(new List<NotificationResponse>(), "Uygulama bildirimleri kapalı."));
            }

            await _notificationGenerator.GenerateUpcomingTaskNotificationsAsync(userId);

            var result = await _notificationService.GetAllAsync(userId);

            return Ok(
                ApiResponse<List<NotificationResponse>>
                    .Ok(result, "Bildirimler getirildi.")
            );
        }


        /* ===================================================== */
        /* MARK AS READ */
        /* ===================================================== */

        [HttpPatch("{id}/read")]
        public async Task<IActionResult> MarkAsRead(
            int id) {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            await _notificationService.MarkAsReadAsync(
                userId,
                id);


            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Bildirim okundu olarak işaretlendi."));
        }


        /* ===================================================== */
        /* MARK ALL AS READ */
        /* ===================================================== */

        [HttpPatch("read-all")]
        public async Task<IActionResult> MarkAllAsRead() {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            await _notificationService.MarkAllAsReadAsync(
                userId);


            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Tüm bildirimler okundu olarak işaretlendi."));
        }
    }
}
