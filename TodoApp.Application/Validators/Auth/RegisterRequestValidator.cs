using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using TodoApp.Application.DTOs.Auth;

namespace TodoApp.Application.Validators.Auth {
    public class RegisterRequestValidator : AbstractValidator<RegisterRequest> {
        public RegisterRequestValidator() {
            RuleFor(x => x.FullName)
                .NotEmpty()
                .WithMessage("Ad soyad zorunludur.")
                .MaximumLength(100)
                .WithMessage("Ad soyad en fazla 100 karakter olabilir.");

            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("E-posta adresi zorunludur.")
                .EmailAddress()
                .WithMessage("Geçerli bir e-posta adresi giriniz.")
                .MaximumLength(256)
                .WithMessage("E-posta adresi en fazla 256 karakter olabilir.");

            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Şifre zorunludur.")
                .MinimumLength(6)
                .WithMessage("Şifre en az 6 karakter olmalıdır.");
        }
    }
}
