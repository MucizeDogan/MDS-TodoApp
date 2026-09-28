using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;
using TodoApp.Application.DTOs.Category;
using TodoApp.Application.Interfaces;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Data;

namespace TodoApp.Infrastructure.Services {
    public class CategoryService : ICategoryService {
        private readonly ApplicationDbContext _context;

        public CategoryService(ApplicationDbContext context) {
            _context = context;
        }

        public async Task<List<CategoryResponse>> GetAllAsync(string userId) {
            return await _context.Categories
                .AsNoTracking()
                .Where(x => x.UserId == userId)
                .OrderBy(x => x.ParentCategoryId.HasValue)
                .ThenBy(x => x.ParentCategoryId)
                .ThenBy(x => x.Name)
                .Select(x => new CategoryResponse {
                    Id = x.Id,
                    Name = x.Name,
                    Color = x.Color,
                    Icon = x.Icon,
                    TodoCount = x.TodoItems.Count(),
                    ParentCategoryId = x.ParentCategoryId,
                    ParentCategoryName = x.ParentCategory != null ? x.ParentCategory.Name : null,
                    DisplayName = x.ParentCategory != null
                        ? x.ParentCategory.Name + " › " + x.Name
                        : x.Name
                })
                .ToListAsync();
        }

        public async Task<CategoryResponse?> GetByIdAsync(string userId, int id) {
            return await _context.Categories
                .AsNoTracking()
                .Where(x => x.Id == id && x.UserId == userId)
                .Select(x => new CategoryResponse {
                    Id = x.Id,
                    Name = x.Name,
                    Color = x.Color,
                    Icon = x.Icon,
                    TodoCount = x.TodoItems.Count(),
                    ParentCategoryId = x.ParentCategoryId,
                    ParentCategoryName = x.ParentCategory != null ? x.ParentCategory.Name : null,
                    DisplayName = x.ParentCategory != null
                        ? x.ParentCategory.Name + " › " + x.Name
                        : x.Name
                })
                .FirstOrDefaultAsync();
        }

        public async Task<CategoryResponse> CreateAsync(string userId, CreateCategoryRequest request) {
            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Kategori adı boş olamaz.");

            await ValidateParentAsync(userId, request.ParentCategoryId, null);

            var exists = await _context.Categories.AnyAsync(x =>
                x.UserId == userId && x.Name.ToLower() == name.ToLower() && x.ParentCategoryId == request.ParentCategoryId);

            if (exists)
                throw new ArgumentException("Bu seviyede aynı isimde bir kategori zaten mevcut.");

            var category = new Category {
                Name = name,
                Color = request.Color,
                Icon = request.Icon,
                UserId = userId,
                ParentCategoryId = request.ParentCategoryId
            };

            _context.Categories.Add(category);
            await _context.SaveChangesAsync();

            return await GetByIdAsync(userId, category.Id)
                ?? throw new Exception("Kategori oluşturuldu ancak getirilemedi.");
        }

        public async Task<CategoryResponse?> UpdateAsync(string userId, int id, UpdateCategoryRequest request) {
            var category = await _context.Categories.FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);
            if (category == null) return null;

            var name = request.Name.Trim();
            if (string.IsNullOrWhiteSpace(name))
                throw new ArgumentException("Kategori adı boş olamaz.");

            await ValidateParentAsync(userId, request.ParentCategoryId, id);

            var exists = await _context.Categories.AnyAsync(x =>
                x.Id != id && x.UserId == userId &&
                x.Name.ToLower() == name.ToLower() &&
                x.ParentCategoryId == request.ParentCategoryId);

            if (exists)
                throw new ArgumentException("Bu seviyede aynı isimde bir kategori zaten mevcut.");

            category.Name = name;
            category.Color = request.Color;
            category.Icon = request.Icon;
            category.ParentCategoryId = request.ParentCategoryId;

            await _context.SaveChangesAsync();
            return await GetByIdAsync(userId, id);
        }

        public async Task<bool> DeleteAsync(string userId, int id) {
            var category = await _context.Categories
                .Include(x => x.TodoItems)
                .Include(x => x.ChildCategories)
                .FirstOrDefaultAsync(x => x.Id == id && x.UserId == userId);

            if (category == null) return false;

            if (category.ChildCategories.Any())
                throw new InvalidOperationException("Bu kategoriye bağlı alt kategoriler bulunduğu için kategori silinemez.");

            if (category.TodoItems.Any())
                throw new InvalidOperationException("Bu kategoriye bağlı görevler bulunduğu için kategori silinemez.");

            _context.Categories.Remove(category);
            await _context.SaveChangesAsync();
            return true;
        }

        private async Task ValidateParentAsync(string userId, int? parentId, int? currentId) {
            if (!parentId.HasValue) return;
            if (currentId.HasValue && parentId.Value == currentId.Value)
                throw new ArgumentException("Kategori kendisinin alt kategorisi olamaz.");

            var parent = await _context.Categories
                .AsNoTracking()
                .FirstOrDefaultAsync(x => x.Id == parentId.Value && x.UserId == userId);

            if (parent == null)
                throw new ArgumentException("Seçilen ana kategori bulunamadı.");

            if (parent.ParentCategoryId.HasValue)
                throw new ArgumentException("Alt kategorinin altında yeni bir alt kategori oluşturulamaz. Lütfen bir ana kategori seçin.");

            if (!currentId.HasValue) return;

            var hasChildren = await _context.Categories
                .AsNoTracking()
                .AnyAsync(x => x.UserId == userId && x.ParentCategoryId == currentId.Value);

            if (hasChildren)
                throw new ArgumentException("Alt kategorileri bulunan bir ana kategori başka bir ana kategorinin altına taşınamaz.");

            var parentCursor = parent.ParentCategoryId;
            while (parentCursor.HasValue) {
                if (parentCursor.Value == currentId.Value)
                    throw new ArgumentException("Bir kategori kendi alt kategorisinin ana kategorisi olamaz.");
                parentCursor = await _context.Categories
                    .Where(x => x.Id == parentCursor.Value && x.UserId == userId)
                    .Select(x => x.ParentCategoryId)
                    .FirstOrDefaultAsync();
            }
        }
    }
}
