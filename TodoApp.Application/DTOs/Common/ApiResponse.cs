using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.DTOs.Common {
    public class ApiResponse<T> {
        public bool Success { get; set; }

        public string Message { get; set; } = string.Empty;

        public T? Data { get; set; }

        public static ApiResponse<T> Ok(
            T data,
            string message = "İşlem başarılı.") {
            return new ApiResponse<T> {
                Success = true,
                Message = message,
                Data = data
            };
        }
    }
}