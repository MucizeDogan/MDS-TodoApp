using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using TodoApp.Domain.Entities;
using TodoApp.Infrastructure.Identity;

namespace TodoApp.Infrastructure.Data {
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser> {
        public ApplicationDbContext(DbContextOptions<ApplicationDbContext> options): base(options) {
        }

        public DbSet<TodoItem> TodoItems { get; set; }

        public DbSet<Category> Categories { get; set; }


        protected override void OnModelCreating(ModelBuilder builder) {
            base.OnModelCreating(builder);


            // -----------------------------------------
            // TodoItem - Category
            // -----------------------------------------

            builder.Entity<TodoItem>()
                .HasOne(x => x.Category)
                .WithMany(x => x.TodoItems)
                .HasForeignKey(x => x.CategoryId)
                .OnDelete(DeleteBehavior.Restrict);


            // -----------------------------------------
            // TodoItem - User
            // -----------------------------------------

            builder.Entity<TodoItem>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // -----------------------------------------
            // Category - User
            // -----------------------------------------

            builder.Entity<Category>()
                .HasOne<ApplicationUser>()
                .WithMany()
                .HasForeignKey(x => x.UserId)
                .OnDelete(DeleteBehavior.Cascade);


            // -----------------------------------------
            // Category
            // -----------------------------------------

            builder.Entity<Category>()
                .Property(x => x.Name)
                .HasMaxLength(100)
                .IsRequired();


            // -----------------------------------------
            // Todo Title
            // -----------------------------------------

            builder.Entity<TodoItem>()
                .Property(x => x.Title)
                .HasMaxLength(200)
                .IsRequired();


            // -----------------------------------------
            // Todo Description
            // -----------------------------------------

            builder.Entity<TodoItem>()
                .Property(x => x.Description)
                .HasMaxLength(2000);


            // -----------------------------------------
            // Todo UserId
            // -----------------------------------------

            builder.Entity<TodoItem>()
                .Property(x => x.UserId)
                .HasMaxLength(450)
                .IsRequired();


            // -----------------------------------------
            // Category UserId
            // -----------------------------------------

            builder.Entity<Category>()
                .Property(x => x.UserId)
                .HasMaxLength(450)
                .IsRequired();
        }
    }
}