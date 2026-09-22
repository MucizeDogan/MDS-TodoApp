using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using TodoApp.Application.DTOs.Category;

namespace TodoApp.Application.Validators.Category {
    public class CreateCategoryRequestValidator : AbstractValidator<CreateCategoryRequest> {
        public CreateCategoryRequestValidator() {
            RuleFor(x => x.Name)
                .NotEmpty()
                .WithMessage("Kategori adı zorunludur.")
                .MaximumLength(100)
                .WithMessage("Kategori adı en fazla 100 karakter olabilir.");


            RuleFor(x => x.Color)
                .MaximumLength(20)
                .WithMessage("Renk bilgisi en fazla 20 karakter olabilir.");


            RuleFor(x => x.Icon)
                .MaximumLength(100)
                .WithMessage("İkon bilgisi en fazla 100 karakter olabilir.");
        }
    }
}
