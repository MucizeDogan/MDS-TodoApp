using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Options;
using MimeKit;
using TodoApp.Application.Interfaces;
using TodoApp.Application.Settings;

namespace TodoApp.Infrastructure.Services {
    public class EmailService : IEmailService {
        private readonly EmailSettings _settings;

        public EmailService(
            IOptions<EmailSettings> settings) {
            _settings = settings.Value;
        }

        public async Task SendAsync(
            string toEmail,
            string subject,
            string body) {
            var message = new MimeMessage();

            message.From.Add(
                new MailboxAddress(
                    _settings.FromName,
                    _settings.Username));

            message.To.Add(MailboxAddress.Parse(toEmail));

            message.Subject = subject;

            message.Body = new TextPart("plain") {
                Text = body
            };

            using var smtp = new SmtpClient();

            await smtp.ConnectAsync(
                _settings.Host,
                _settings.Port,
                SecureSocketOptions.StartTls);

            await smtp.AuthenticateAsync(
                _settings.Username,
                _settings.Password);

            await smtp.SendAsync(message);

            await smtp.DisconnectAsync(true);
        }
    }
}
