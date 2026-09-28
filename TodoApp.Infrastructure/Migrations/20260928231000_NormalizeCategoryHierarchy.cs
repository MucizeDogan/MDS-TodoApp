using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Infrastructure.Migrations
{
    public partial class NormalizeCategoryHierarchy : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // One-time Phase 2 normalization: verified accounts should start
            // with email task reminders enabled. After this migration, the
            // user's toggle is authoritative and future changes are preserved.
            migrationBuilder.Sql("""
                UPDATE AspNetUsers
                SET EmailNotificationsEnabled = 1
                WHERE EmailConfirmed = 1
                  AND EmailNotificationsEnabled = 0;
                """);

            // Product rule: currently the application supports exactly one
            // child level (Root -> Child). Existing data that was created
            // with deeper nesting is flattened to the nearest root.
            migrationBuilder.Sql("""
                ;WITH CategoryDepth AS
                (
                    SELECT Id, Id AS RootId, 0 AS Depth
                    FROM Categories
                    WHERE ParentCategoryId IS NULL

                    UNION ALL

                    SELECT c.Id, d.RootId, d.Depth + 1
                    FROM Categories c
                    INNER JOIN CategoryDepth d
                        ON c.ParentCategoryId = d.Id
                )
                UPDATE c
                SET ParentCategoryId = d.RootId
                FROM Categories c
                INNER JOIN CategoryDepth d ON d.Id = c.Id
                WHERE d.Depth > 1
                OPTION (MAXRECURSION 100);
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // The previous hierarchy is not reconstructable without storing
            // its original parent chain. This data-only normalization is
            // intentionally irreversible.
        }
    }
}
