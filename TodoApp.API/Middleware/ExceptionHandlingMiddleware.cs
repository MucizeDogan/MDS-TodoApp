using System.Net;
using System.Text.Json;
using TodoApp.Application.DTOs.Common;

namespace TodoApp.API.Middleware {
    public class ExceptionHandlingMiddleware {
        private readonly RequestDelegate _next;
        private readonly ILogger<ExceptionHandlingMiddleware> _logger;

        public ExceptionHandlingMiddleware(
            RequestDelegate next,
            ILogger<ExceptionHandlingMiddleware> logger) {
            _next = next;
            _logger = logger;
        }

        public async Task InvokeAsync(HttpContext context) {
            try {
                await _next(context);
            } catch (Exception ex) {
                _logger.LogError(
                    ex,
                    "Beklenmeyen bir hata oluştu.");

                await HandleExceptionAsync(context, ex);
            }
        }

        private static async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception) {
            context.Response.ContentType = "application/json";

            var statusCode = exception switch {
                UnauthorizedAccessException => (int)HttpStatusCode.Unauthorized,

                ArgumentException => (int)HttpStatusCode.BadRequest,

                InvalidOperationException => (int)HttpStatusCode.BadRequest,

                _ => (int)HttpStatusCode.InternalServerError
            };

            context.Response.StatusCode = statusCode;

            //var response = new {
            //    statusCode = statusCode,
            //    message = GetMessage(exception, statusCode)
            //};

            var response = new ApiErrorResponse {
                Success = false,
                Message = GetMessage(exception, statusCode),
                Errors = new List<string>()
            };

            var json = JsonSerializer.Serialize(response);

            await context.Response.WriteAsync(json);
        }

        private static string GetMessage(
            Exception exception,
            int statusCode) {
            if (statusCode == (int)HttpStatusCode.InternalServerError) {
                return "Beklenmeyen bir hata oluştu.";
            }

            return exception.Message;
        }
    }
}