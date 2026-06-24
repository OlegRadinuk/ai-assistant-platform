// Returns a streaming text response when ANTHROPIC_API_KEY is not configured.
// The response is clearly labeled as demo mode — no deception.

export function streamMockReply(userMessage: string): Response {
  const text =
    `[Демо-режим — API-ключ Claude не задан]\n\n` +
    `Я бы ответил исходя из роли, которую вы настроили (см. system prompt), ` +
    `но реальный ответ требует ключа Claude. Установите ANTHROPIC_API_KEY в .env.local, ` +
    `чтобы увидеть полноценный диалог.\n\n` +
    `Ваше сообщение: «${userMessage.slice(0, 200)}»`

  return streamPlainText(text)
}

/** Stream any arbitrary plain text with the same envelope as a real chat response. */
export function streamPlainText(text: string): Response {
  const encoder = new TextEncoder()
  const chunks = splitIntoChunks(text, 12)

  const stream = new ReadableStream({
    async start(controller) {
      for (const chunk of chunks) {
        controller.enqueue(encoder.encode(chunk))
        // Small delay to simulate streaming
        await new Promise<void>((resolve) => setTimeout(resolve, 20))
      }
      controller.close()
    },
  })

  return new Response(stream, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
      "Cache-Control": "no-cache",
    },
  })
}

function splitIntoChunks(text: string, size: number): string[] {
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += size) {
    chunks.push(text.slice(i, i + size))
  }
  return chunks
}
