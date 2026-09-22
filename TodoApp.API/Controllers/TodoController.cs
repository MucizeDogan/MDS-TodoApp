using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs.Todo;
using TodoApp.Application.Interfaces;
using TodoApp.Application.DTOs.Common;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TodoController : ControllerBase {
        private readonly ITodoService _todoService;
        private readonly ICurrentUserService _currentUser;

        public TodoController(ITodoService todoService, ICurrentUserService currentUser) {
            _todoService = todoService;
            _currentUser = currentUser;
        }


        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var userId = _currentUser.UserId!;

            var result = await _todoService.GetAllAsync(userId);

            return Ok(
                ApiResponse<TodoListResponse>.Ok(
                    result,
                    "Todo listesi başarıyla getirildi."));
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id) {
            var userId = _currentUser.UserId!;

            var result = await _todoService.GetByIdAsync(userId, id);


            if (result == null) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Todo bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<TodoResponse>.Ok(
                    result,
                    "Todo başarıyla getirildi."));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateTodoRequest request) {
            var userId = _currentUser.UserId!;

            var result = await _todoService.CreateAsync(userId, request);

            //return CreatedAtAction(
            //    nameof(GetById),
            //    new { id = result.Id },
            //    result);

            return Ok(
                ApiResponse<TodoResponse>.Ok(
                    result,
                    "Todo başarıyla oluşturuldu."));
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateTodoRequest request) {

            var userId = _currentUser.UserId!;

            var result = await _todoService.UpdateAsync(userId, id, request);

            if (result == null) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Todo bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<TodoResponse>.Ok(
                    result,
                    "Todo başarıyla güncellendi."));
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id) {
            var userId = _currentUser.UserId!;

            var deleted = await _todoService.DeleteAsync(userId, id);


            if (!deleted) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Todo bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Todo başarıyla silindi."));
        }


        [HttpPatch("{id:int}/complete")]
        public async Task<IActionResult> SetCompleted(
            int id,
            [FromQuery] bool completed = true) {
            var userId = _currentUser.UserId!;

            var result = await _todoService.SetCompletedAsync(userId, id, completed);

            if (result == null) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Todo bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<TodoResponse>.Ok(
                    result,
                    result.IsCompleted
                        ? "Todo tamamlandı."
                        : "Todo tekrar bekleyen duruma getirildi."));
        }
    }
}