import { PAYMENT_METHODS } from '@/lib/catalog'
import { SITE } from '@/lib/site'

export interface FaqItem {
  question: string
  answer: string[]
}

const MANUAL_COINS = PAYMENT_METHODS.filter((m) => m.id !== 'nowpayments')
  .map((m) => m.label)
  .join(', ')

export const FAQ: readonly FaqItem[] = [
  {
    question: 'How does Socialora work?',
    answer: [
      'Choose a platform and service, pick a quantity, then enter the public link or username you want to grow and your email address.',
      'Next, pay with crypto. Automatic payment takes you to a secure checkout page where you choose your coin. Your order starts as soon as the payment is confirmed.',
    ],
  },
  {
    question: 'Do I need to give you my password?',
    answer: [
      'No. We only need a public link or username. We will never ask for your password, login codes or any other account credentials. If anyone claiming to be Socialora asks for them, do not share them.',
    ],
  },
  {
    question: 'How long does an order take?',
    answer: [
      'Delivery begins after your payment has been confirmed. Each service shows its start time and speed, but timing varies by quantity and platform conditions, so we do not promise a specific delivery time.',
    ],
  },
  {
    question: 'How can I track my order?',
    answer: [
      'Open the Track page and enter your order reference (SO-XXXXXXXX) and the email you used. You will see the current status and progress. No account is needed.',
    ],
  },
  {
    question: 'What happens if followers drop?',
    answer: [
      'Some drop-off can happen on any social platform over time, for reasons outside our control. Services that include a refill show the refill period on the service itself. If you notice a significant drop, contact support with your order reference and we will review it.',
    ],
  },
  {
    question: 'Do I need to create an account?',
    answer: ['No. There is no registration or login. Your order reference and email are all you need.'],
  },
  {
    question: 'How does automatic payment work?',
    answer: [
      'Choose "Pay automatically" at checkout and submit your order. You are taken to a secure checkout page where you pick your coin and pay. The payment is confirmed on the blockchain, which can take a few minutes, and your order starts right after.',
      'Automatic payment has a minimum order of $10 USD.',
    ],
  },
  {
    question: 'How does manual payment work?',
    answer: [
      'Choose manual crypto, then pick your coin and network. You will see the full wallet address and the exact amount. Send that amount from your own wallet or exchange using the exact network shown, then submit your order.',
      'Manual payments are checked by our team on the blockchain, and your order stays pending until the payment is confirmed.',
    ],
  },
  {
    question: 'How do I find my transaction ID?',
    answer: [
      'After you send a payment, your wallet or exchange shows the transaction in your history. Open it and look for a field called "Transaction ID", "TxID" or "Hash", a long string of letters and numbers. Copy and paste it into the optional Transaction ID field to help us verify a manual payment faster.',
    ],
  },
  {
    question: 'What if I send crypto on the wrong network?',
    answer: [
      'Crypto sent on the wrong network or to the wrong address may be permanently lost and cannot be recovered by us. Always double-check the network and use the Copy Address button rather than typing the address manually.',
    ],
  },
  {
    question: 'Can I cancel an order?',
    answer: [
      `If your order has not started processing, contact ${SITE.supportEmail} with your order reference and we will review your request. Once processing has begun, an order generally cannot be cancelled. See our Refund Policy for details.`,
    ],
  },
  {
    question: 'What payment methods are supported?',
    answer: [
      `We accept crypto only. You can pay automatically on a secure checkout page in the coin of your choice, or send manually with ${MANUAL_COINS}. We do not accept cards or bank transfers at this time.`,
    ],
  },
  {
    question: 'Do you offer refunds?',
    answer: [
      'Refunds are reviewed case by case, for example when an order cannot be delivered. Approved refunds are returned in cryptocurrency. Our Refund Policy explains when refunds may apply and how to request one.',
    ],
  },
  {
    question: 'Is Socialora affiliated with Instagram, TikTok, YouTube, X or Telegram?',
    answer: [
      'No. Socialora is an independent digital marketing service and is not affiliated with, endorsed by or sponsored by Instagram, Meta, TikTok, ByteDance, YouTube, Google, X Corp. or Telegram. All trademarks belong to their respective owners. You are responsible for making sure your use of our services follows the rules of the platform you use.',
    ],
  },
] as const
