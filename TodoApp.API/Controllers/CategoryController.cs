using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using TodoApp.Application.DTOs.Category;
using TodoApp.Application.DTOs.Common;
using TodoApp.Application.DTOs.Todo;
using TodoApp.Application.Interfaces;

namespace TodoApp.API.Controllers {
    [ApiController]
    [Route("api/[controller]")]
    [Authorize]
    public class CategoryController : ControllerBase {
        private readonly ICategoryService _categoryService;


        public CategoryController(
            ICategoryService categoryService) {
            _categoryService = categoryService;
        }


        private string GetCurrentUserId() {
            return User.FindFirstValue(
                ClaimTypes.NameIdentifier)
                ?? throw new UnauthorizedAccessException(
                    "Kullanıcı kimliği bulunamadı.");
        }


        // -----------------------------------------
        // GET /api/category
        // -----------------------------------------

        [HttpGet]
        public async Task<IActionResult> GetAll() {
            var userId = GetCurrentUserId();

            var result = await _categoryService.GetAllAsync(userId);

            return Ok(
                ApiResponse<List<CategoryResponse>>.Ok(
                    result,
                    "Kategoriler başarıyla getirildi."));
        }


        // -----------------------------------------
        // GET /api/category/{id}
        // -----------------------------------------

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id) {
            var userId = GetCurrentUserId();

            var result = await _categoryService.GetByIdAsync(userId, id);


            if (result == null) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Kategori bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<CategoryResponse>.Ok(
                    result,
                    "Kategori başarıyla getirildi."));
        }


        // -----------------------------------------
        // POST /api/category
        // -----------------------------------------

        [HttpPost]
        public async Task<IActionResult> Create(CreateCategoryRequest request) {

            var userId = GetCurrentUserId();

            var result = await _categoryService.CreateAsync(userId, request);


            //return CreatedAtAction(
            //    nameof(GetById),
            //    new { id = result.Id },
            //    result);

            return Ok(
                ApiResponse<CategoryResponse>.Ok(
                    result,
                    "Kategori başarıyla oluşturuldu."));
        }


        // -----------------------------------------
        // PUT /api/category/{id}
        // -----------------------------------------

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id, UpdateCategoryRequest request) {
            var userId = GetCurrentUserId();

            var result = await _categoryService.UpdateAsync(userId, id, request);


            if (result == null) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Kategori bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<CategoryResponse>.Ok(
                    result,
                    "Kategori başarıyla güncellendi."));
        }


        // -----------------------------------------
        // DELETE /api/category/{id}
        // -----------------------------------------

        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id) {
            var userId = GetCurrentUserId();

            var result = await _categoryService.DeleteAsync(userId, id);


            if (!result) {
                return NotFound(new ApiErrorResponse {
                    Success = false,
                    Message = "Kategori bulunamadı.",
                    Errors = new List<string>()
                });
            }

            return Ok(
                ApiResponse<object>.Ok(
                    null,
                    "Kategori başarıyla silindi."));
        }
    }
}
