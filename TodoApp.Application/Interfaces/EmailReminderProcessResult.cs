namespace TodoApp.Application.Interfaces {
    public sealed class EmailReminderProcessResult {
        public int Found { get; init; }
        public int Sent { get; init; }
        public int Failed { get; init; }
    }
}
