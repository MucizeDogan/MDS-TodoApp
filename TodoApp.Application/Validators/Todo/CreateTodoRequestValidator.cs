using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using TodoApp.Application.DTOs.Todo;

namespace TodoApp.Application.Validators.Todo {
    public class CreateTodoRequestValidator : AbstractValidator<CreateTodoRequest> {
        public CreateTodoRequestValidator() {
            RuleFor(x => x.Title)
                .NotEmpty()
                .WithMessage("Görev başlığı başlığı zorunludur.")
                .MaximumLength(200)
                .WithMessage("Görev başlığı en fazla 200 karakter olabilir.");

            RuleFor(x => x.Description)
                .MaximumLength(2000)
                .WithMessage("Açıklama en fazla 2000 karakter olabilir.");

            RuleFor(x => x.CategoryId)
                .GreaterThan(0)
                .WithMessage("Geçerli bir kategori seçilmelidir.");

            RuleFor(x => x.Priority)
                .InclusiveBetween(1, 3)
                .WithMessage("Öncelik 1 ile 3 arasında olmalıdır.");

            RuleFor(x => x.EmailReminderMinutesBefore)
                .Must(x => !x.HasValue || x > 0)
                .WithMessage("Email hatırlatma süresi 0'dan büyük olmalıdır.");

            RuleFor(x => x.TimeZoneOffsetMinutes)
                .InclusiveBetween(-840, 840)
                .When(x => x.TimeZoneOffsetMinutes.HasValue)
                .WithMessage("Geçersiz saat dilimi bilgisi.");

            RuleFor(x => x)
                .Must(x =>
                    !x.EmailReminderEnabled ||
                    (x.DueDate.HasValue &&
                     x.EmailReminderMinutesBefore.HasValue &&
                     x.TimeZoneOffsetMinutes.HasValue))
                .WithMessage(
                    "Email hatırlatma için son tarih ve hatırlatma süresi belirtilmelidir.");
        }
    }
}
