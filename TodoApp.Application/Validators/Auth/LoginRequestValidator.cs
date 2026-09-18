using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using FluentValidation;
using TodoApp.Application.DTOs.Auth;

namespace TodoApp.Application.Validators.Auth {
    public class LoginRequestValidator : AbstractValidator<LoginRequest> {
        public LoginRequestValidator() {
            RuleFor(x => x.Email)
                .NotEmpty()
                .WithMessage("Email zorunludur.")
                .EmailAddress()
                .WithMessage("Geçerli bir email adresi giriniz.");


            RuleFor(x => x.Password)
                .NotEmpty()
                .WithMessage("Parola zorunludur.");
        }
    }
}