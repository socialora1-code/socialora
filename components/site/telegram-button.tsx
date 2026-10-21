import { Send } from 'lucide-react'

const TELEGRAM_URL = 'https://t.me/SocialoraSupport'

export function TelegramButton() {
  return (
    <a
      href={TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on Telegram"
      className="fixed right-4 bottom-4 z-40 inline-flex h-14 items-center justify-center gap-2 rounded-full bg-[#229ED9] px-4 text-base font-semibold text-white shadow-lg transition-transform hover:scale-105 sm:right-6 sm:bottom-6 sm:px-5"
      style={{ marginBottom: 'env(safe-area-inset-bottom, 0px)' }}
    >
      <Send className="size-6" aria-hidden="true" />
      <span className="hidden sm:inline">Chat on Telegram</span>
    </a>
  )
}
