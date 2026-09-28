using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace TodoApp.Infrastructure.Migrations
{
    public partial class InitializeNotificationPreferenceDefaults : Migration
    {
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Phase 2 ilk kez devreye alındığında eklenen bool alanlarının
            // varsayılan değerleri mevcut kullanıcılar için true/true olmalı.
            // Email yalnızca doğrulanmış hesaplarda varsayılan olarak açık.
            migrationBuilder.Sql("""
                UPDATE AspNetUsers
                SET
                    AppNotificationsEnabled = 1,
                    TaskRemindersEnabled = 1,
                    EmailNotificationsEnabled =
                        CASE
                            WHEN EmailConfirmed = 1 THEN 1
                            ELSE 0
                        END
                WHERE
                    AppNotificationsEnabled = 0
                    AND TaskRemindersEnabled = 0
                    AND EmailNotificationsEnabled = 0;
                """);
        }

        protected override void Down(MigrationBuilder migrationBuilder)
        {
            // Bu migration yalnızca ilk varsayılanları normalize eder.
            // Kullanıcının sonradan verdiği tercihleri güvenli şekilde geri
            // almak mümkün olmadığı için Down intentionally no-op bırakılmıştır.
        }
    }
}
