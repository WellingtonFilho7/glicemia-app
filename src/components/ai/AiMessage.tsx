import { Sparkles, User } from "lucide-react";
import { cn } from "@/lib/utils";

export interface Message {
  role: "user" | "assistant";
  content: string;
}

interface AiMessageProps {
  message: Message;
  isStreaming?: boolean;
}

export function AiMessage({ message, isStreaming }: AiMessageProps) {
  const isUser = message.role === "user";

  return (
    <div className={cn("flex gap-3", isUser && "flex-row-reverse")}>
      {/* Avatar */}
      <div
        className={cn(
          "flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full",
          isUser
            ? "bg-[var(--primary)] text-white"
            : "bg-violet-100 text-violet-600"
        )}
      >
        {isUser ? (
          <User className="h-4 w-4" />
        ) : (
          <Sparkles className="h-4 w-4" />
        )}
      </div>

      {/* Bubble */}
      <div
        className={cn(
          "max-w-[85%] rounded-2xl px-4 py-3 text-sm",
          isUser
            ? "rounded-tr-sm bg-[var(--primary)] text-white"
            : "rounded-tl-sm border border-[var(--border)] bg-[var(--card)] text-[var(--foreground)]"
        )}
      >
        {/* Render with basic line breaks — markdown can be added in a future session */}
        {message.content
          .split("\n")
          .map((line, i) => (
            <span key={i}>
              {line}
              {i < message.content.split("\n").length - 1 && <br />}
            </span>
          ))}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-0.5 animate-pulse bg-current opacity-70" />
        )}
      </div>
    </div>
  );
}
