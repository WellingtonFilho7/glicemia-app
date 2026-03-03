import { NextResponse } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { createClient } from "@/lib/supabase/server";
import { fetchAnalysisContext } from "@/lib/ai/data-fetcher";
import { buildSystemPrompt } from "@/lib/ai/prompt-builder";
import { z } from "zod";

const RequestSchema = z.object({
  message: z.string().min(1).max(2000),
});

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Não autenticado" }, { status: 401 });
    }

    const body = await request.json();
    const parsed = RequestSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ error: "Mensagem inválida" }, { status: 400 });
    }

    const { message } = parsed.data;

    // 1. Buscar dados frescos do banco
    const context = await fetchAnalysisContext(supabase, user.id, 7);

    // 2. Montar system prompt com todos os dados
    const systemPrompt = buildSystemPrompt(context);

    // 3. Chamar Anthropic API com streaming
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY,
    });

    let fullResponse = "";

    const stream = anthropic.messages.stream({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 1024,
      system: systemPrompt,
      messages: [{ role: "user", content: message }],
    });

    // 4. Converter para ReadableStream de texto
    const readable = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if (
              chunk.type === "content_block_delta" &&
              chunk.delta.type === "text_delta"
            ) {
              const text = chunk.delta.text;
              fullResponse += text;
              controller.enqueue(new TextEncoder().encode(text));
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
          return;
        }

        // 5. Salvar conversa no banco após stream completo
        const finalMsg = await stream.finalMessage();
        await supabase.from("ai_conversations").insert({
          user_id: user.id,
          user_message: message,
          ai_response: fullResponse,
          data_context_summary: `${context.glucoseEntries.length} glicemias, ${context.meals.length} refeições, ${context.checkins.length} check-ins (7 dias)`,
          tokens_used: finalMsg.usage
            ? finalMsg.usage.input_tokens + finalMsg.usage.output_tokens
            : null,
        });
      },
    });

    return new Response(readable, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("Erro na análise de IA:", error);
    return NextResponse.json(
      { error: "Erro ao processar análise. Tente novamente." },
      { status: 500 }
    );
  }
}
