import { injectable } from "inversify";

@injectable()
export class Log {
    public debug(text: string): void {
        console.error("\x1b[90m", text, "\x1b[0m");
    }

    public Error(text: string): void {
        console.error("\x1b[31m", text, "\x1b[0m");
    }

    public Success(text: string): void {
        console.log("\x1b[32m", text, "\x1b[0m");
    }

    public Info(text: string): void {
        console.log("\x1b[36m", text, "\x1b[0m");
    }

    public Warn(text: string): void {
        console.log("\x1b[33m", text, "\x1b[0m");
    }
}