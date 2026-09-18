using System.Text.Json;

namespace TodoApp.API.Middleware {
    public class ExceptionHandlingMiddleware {
        private readonly RequestDelegate _next;

        public ExceptionHandlingMiddleware(
            RequestDelegate next) {
            _next = next;
        }


        public async Task InvokeAsync(
            HttpContext context) {
            try {
                await _next(context);
            } catch (Exception ex) {
                await HandleExceptionAsync(
                    context,
                    ex);
            }
        }


        private static async Task HandleExceptionAsync(
            HttpContext context,
            Exception exception) {
            context.Response.ContentType =
                "application/json";


            context.Response.StatusCode =
                exception switch {
                    UnauthorizedAccessException
                        => StatusCodes.Status401Unauthorized,

                    ArgumentException
                        => StatusCodes.Status400BadRequest,

                    InvalidOperationException
                        => StatusCodes.Status400BadRequest,

                    _ => StatusCodes.Status500InternalServerError
                };


            var response = new {
                message = exception.Message
            };


            await context.Response.WriteAsync(
                JsonSerializer.Serialize(response));
        }
    }
}
