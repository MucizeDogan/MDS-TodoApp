using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TodoApp.Application.DTOs.Category;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class CategoryService : ICategoryService {
        private readonly ApplicationDbContext _context;

        public CategoryService(
            ApplicationDbContext context) {
            _context = context;
        }

        // GET ALL
        public async Task<List<CategoryResponse>> GetAllAsync(string userId) {
            return await _context.Categories
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.Name)
                .Select(x => new CategoryResponse {
                    Id = x.Id,

                    Name = x.Name,

                    Color = x.Color,

                    Icon = x.Icon,

                    TodoCount = x.TodoItems.Count()
                })
                .ToListAsync();
        }

        // GET BY ID
        public async Task<CategoryResponse?> GetByIdAsync(string userId, int id) {
            return await _context.Categories
                .AsNoTracking()
                .Where(x =>
                    x.Id == id &&
                    x.UserId == userId)
                .Select(x => new CategoryResponse {
                    Id = x.Id,

                    Name = x.Name,

                    Color = x.Color,

                    Icon = x.Icon,

                    TodoCount = x.TodoItems.Count()
                })
                .FirstOrDefaultAsync();
        }


        public async Task<CategoryResponse> CreateAsync(string userId, CreateCategoryRequest request) {
            var name = request.Name.Trim();

            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException(
                    "Kategori adı boş olamaz.");
            }


            var exists = await _context.Categories
                .AnyAsync(x =>
                    x.UserId == userId &&
                    x.Name.ToLower() == name.ToLower());


            if (exists) {
                throw new ArgumentException(
                    "Bu kategori zaten mevcut.");
            }


            var category = new Category {
                Name = name,

                Color = request.Color,

                Icon = request.Icon,

                UserId = userId
            };


            _context.Categories.Add(category);

            await _context.SaveChangesAsync();


            return await GetByIdAsync(
                userId,
                category.Id)
                ?? throw new Exception(
                    "Kategori oluşturuldu ancak getirilemedi.");
        }


        public async Task<CategoryResponse?> UpdateAsync(
            string userId,
            int id,
            UpdateCategoryRequest request) {
            var category = await _context.Categories
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);


            if (category == null) {
                return null;
            }


            var name = request.Name.Trim();


            if (string.IsNullOrWhiteSpace(name)) {
                throw new ArgumentException(
                    "Kategori adı boş olamaz.");
            }


            var exists = await _context.Categories
                .AnyAsync(x =>
                    x.Id != id &&
                    x.UserId == userId &&
                    x.Name.ToLower() == name.ToLower());


            if (exists) {
                throw new ArgumentException(
                    "Bu kategori zaten mevcut.");
            }


            category.Name = name;

            category.Color = request.Color;

            category.Icon = request.Icon;


            await _context.SaveChangesAsync();


            return await GetByIdAsync(
                userId,
                id);
        }


        public async Task<bool> DeleteAsync(string userId, int id) {
            var category = await _context.Categories
                .Include(x => x.TodoItems)
                .FirstOrDefaultAsync(x =>
                    x.Id == id &&
                    x.UserId == userId);


            if (category == null) {
                return false;
            }


            if (category.TodoItems.Any()) {
                throw new InvalidOperationException(
                    "Bu kategoriye bağlı görevler bulunduğu için kategori silinemez.");
            }


            _context.Categories.Remove(category);

            await _context.SaveChangesAsync();

            return true;
        }
    }
}
