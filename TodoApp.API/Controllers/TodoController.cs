using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TodoApp.Application.DTOs.Todo;
using TodoApp.Application.Interfaces;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class TodoController : ControllerBase {
        private readonly ITodoService _todoService;

        public TodoController(ITodoService todoService) {
            _todoService = todoService;
        }


        private string GetCurrentUserId() {
            return User.FindFirstValue(ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException(
                    "Kullanıcı kimliği bulunamadı.");
        }


        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var userId = GetCurrentUserId();

            var result = await _todoService.GetAllAsync(userId);

            return Ok(result);
        }


        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id) {
            var userId = GetCurrentUserId();

            var result =await _todoService.GetByIdAsync(userId, id);


            if (result == null) {
                return NotFound(new {
                    message = "Todo bulunamadı."
                });
            }


            return Ok(result);
        }


        [HttpPost]
        public async Task<IActionResult> Create(CreateTodoRequest request) {
            try {
                var userId = GetCurrentUserId();

                var result =await _todoService.CreateAsync(userId, request);


                return CreatedAtAction(
                    nameof(GetById),
                    new { id = result.Id },
                    result);
            } catch (ArgumentException ex) {
                return BadRequest(new {
                    message = ex.Message
                });
            }
        }


        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id,UpdateTodoRequest request) {
            try {
                var userId = GetCurrentUserId();

                var result =await _todoService.UpdateAsync(userId, id, request);

                if (result == null) {
                    return NotFound(new {
                        message = "Todo bulunamadı."
                    });
                }

                return Ok(result);
            } catch (ArgumentException ex) {
                return BadRequest(new {
                    message = ex.Message
                });
            }
        }


        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id) {
            var userId = GetCurrentUserId();

            var deleted = await _todoService.DeleteAsync(userId, id);


            if (!deleted) {
                return NotFound(new {
                    message = "Todo bulunamadı."
                });
            }

            return NoContent();
        }


        [HttpPatch("{id:int}/complete")]
        public async Task<IActionResult> SetCompleted(
            int id,
            [FromQuery] bool completed = true) {
            var userId = GetCurrentUserId();

            var result = await _todoService.SetCompletedAsync(userId, id, completed);

            if (result == null) {
                return NotFound(new {
                    message = "Todo bulunamadı."
                });
            }


            return Ok(result);
        }
    }
}