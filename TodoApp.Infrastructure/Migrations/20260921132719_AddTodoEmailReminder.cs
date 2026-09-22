using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddTodoEmailReminder : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<DateTime>(
                name: "EmailReminderAt",
                table: "TodoItems",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EmailReminderEnabled",
                table: "TodoItems",
                type: "bit",
                nullable: false,
                defaultValue: false);

            migrationBuilder.AddColumn<int>(
                name: "EmailReminderMinutesBefore",
                table: "TodoItems",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "EmailReminderSent",
                table: "TodoItems",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "EmailReminderAt",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "EmailReminderEnabled",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "EmailReminderMinutesBefore",
                table: "TodoItems");

            migrationBuilder.DropColumn(
                name: "EmailReminderSent",
                table: "TodoItems");
        }
    }
}
