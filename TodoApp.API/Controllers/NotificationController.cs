using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Authorization;
using TodoApp.Application.DTOs.Common;
using TodoApp.Application.DTOs.Notification;
using TodoApp.Application.Interfaces;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class NotificationController : ControllerBase {
        private readonly INotificationService _notificationService;


        public NotificationController(
            INotificationService notificationService) {
            _notificationService =
                notificationService;
        }


        /* ===================================================== */
        /* GET ALL */
        /* ===================================================== */

        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var userId =
                User.FindFirst(
                    System.Security.Claims.ClaimTypes.NameIdentifier
                )?.Value;


            if (string.IsNullOrEmpty(userId)) {
                return Unauthorized();
            }


            var result =
                await _notificationService.GetAllAsync(
                    userId);


            return Ok(
                ApiResponse<List<NotificationResponse>>.Ok(
                    result,
                    "Bildirimler getirildi."));
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
