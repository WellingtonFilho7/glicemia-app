"use client";

import { useState, useRef, useEffect } from "react";
import { Send, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { AiMessage, type Message } from "./AiMessage";
import { QuickPrompts } from "./QuickPrompts";

interface AiChatProps {
  initialPrompt?: string;
}

export function AiChat({ initialPrompt }: AiChatProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const sentInitial = useRef(false);

  // Auto-scroll ao surgir nova mensagem
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Auto-send initialPrompt if provided
  useEffect(() => {
    if (initialPrompt && !sentInitial.current) {
      sentInitial.current = true;
      sendMessage(initialPrompt);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialPrompt]);

  async function sendMessage(text: string) {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    setInput("");
    setError(null);
    setLoading(true);

    const userMsg: Message = { role: "user", content: trimmed };
    const aiMsg: Message = { role: "assistant", content: "" };

    setMessages((prev) => [...prev, userMsg, aiMsg]);

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: trimmed }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Erro ao conectar com a IA.");
      }

      if (!res.body) throw new Error("Resposta sem corpo.");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        accumulated += chunk;

        // Update the last message (the assistant one) in real time
        setMessages((prev) => {
          const next = [...prev];
          next[next.length - 1] = { role: "assistant", content: accumulated };
          return next;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido.");
      // Remove the empty assistant message on error
      setMessages((prev) => prev.filter((_, i) => i < prev.length - 1));
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    sendMessage(input);
  }

  const showQuickPrompts = messages.length === 0;

  return (
    <div className="flex flex-col gap-4">
      {/* Histórico de mensagens */}
      {messages.length > 0 && (
        <div className="space-y-4">
          {messages.map((msg, i) => (
            <AiMessage
              key={i}
              message={msg}
              isStreaming={loading && i === messages.length - 1 && msg.role === "assistant"}
            />
          ))}
          <div ref={bottomRef} />
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          {error}
        </div>
      )}

      {/* Perguntas rápidas (só quando não tem mensagens) */}
      {showQuickPrompts && (
        <div>
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-[var(--muted-foreground)]">
            Perguntas rápidas
          </p>
          <QuickPrompts onSelect={sendMessage} disabled={loading} />
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Pergunte algo sobre seus dados..."
          disabled={loading}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--card)] px-4 py-3 text-sm text-[var(--foreground)] placeholder:text-[var(--muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[var(--ring)] disabled:opacity-50"
          maxLength={2000}
        />
        <Button
          type="submit"
          disabled={loading || !input.trim()}
          size="icon"
          className="h-12 w-12 flex-shrink-0 rounded-xl"
          aria-label="Enviar"
        >
          {loading ? (
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </Button>
      </form>
    </div>
  );
}
