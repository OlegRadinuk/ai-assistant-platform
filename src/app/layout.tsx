import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "AI Assistant Platform — Наймите AI-сотрудника за 10 минут",
  description:
    "Создайте собственного AI-ассистента для бизнеса: отвечает на вопросы, собирает заявки и встраивается на сайт одной строкой кода.",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="ru">
      <body>{children}</body>
    </html>
  )
}
