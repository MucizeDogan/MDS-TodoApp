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
        }
    }
}
