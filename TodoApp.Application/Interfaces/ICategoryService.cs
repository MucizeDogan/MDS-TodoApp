using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using TodoApp.Application.DTOs.Category;

namespace TodoApp.Application.Interfaces {
    public interface ICategoryService {
        Task<List<CategoryResponse>> GetAllAsync(string userId);

        Task<CategoryResponse?> GetByIdAsync(string userId, int id);

        Task<CategoryResponse> CreateAsync(string userId, CreateCategoryRequest request);

        Task<CategoryResponse?> UpdateAsync(
            string userId,
            int id,
            UpdateCategoryRequest request);

        Task<bool> DeleteAsync(string userId, int id);
    }
}
