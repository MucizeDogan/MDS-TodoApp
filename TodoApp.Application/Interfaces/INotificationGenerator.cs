using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace TodoApp.Application.Interfaces {
    public interface INotificationGenerator {
        Task GenerateUpcomingTaskNotificationsAsync(string userId);
    }
}
