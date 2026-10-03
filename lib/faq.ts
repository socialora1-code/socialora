import { PAYMENT_METHODS } from '@/lib/catalog'
import { SITE } from '@/lib/site'

export interface FaqItem {
  question: string
  answer: string[]
}

export const FAQ: readonly FaqItem[] = [
  {
    question: 'How does Socialora work?',
    answer: [
      'Choose a platform and service, pick a package and quantity, then enter the public profile or post URL you want to grow and your email address.',
      'Next, pick a crypto payment method, send the exact amount to the wallet address shown and submit your order. Our team reviews it manually once your payment is confirmed.',
    ],
  },
  {
    question: 'Do I need to give you my password?',
    answer: [
      'No. We only need a public profile URL, post URL or username. We will never ask for your password, login codes or any other account credentials. If anyone claiming to be Socialora asks for them, do not share them.',
    ],
  },
  {
    question: 'How long does an order take?',
    answer: [
      'Delivery begins after your payment has been confirmed and your order has been reviewed manually. Timing varies by service, quantity and platform conditions, so we do not promise a specific delivery time. The estimated delivery shown on each service describes what to expect.',
    ],
  },
  {
    question: 'What happens if followers drop?',
    answer: [
      'Some drop-off can happen on any social platform over time, for reasons outside our control. Refill information, where applicable, is shown on each service. If you notice a significant drop, contact support with your order reference and we will review it.',
    ],
  },
  {
    question: 'Do I need to create an account?',
    answer: [
      'No. There is no registration or login. Your order reference and confirmation email are all you need.',
    ],
  },
  {
    question: 'How does manual payment work?',
    answer: [
      'After selecting a payment method, you will see the full wallet address and the exact amount in USD. Send that amount from your own wallet or exchange using the exact network shown, then submit your order.',
      'Payments are not verified automatically. Our team checks the blockchain manually, and your order stays in Pending Manual Verification status until the payment is confirmed.',
    ],
  },
  {
    question: 'How do I find my transaction ID?',
    answer: [
      'After you send a payment, your wallet or exchange shows the transaction in your history. Open it and look for a field called "Transaction ID", "TxID" or "Hash" — a long string of letters and numbers. Copy and paste it into the optional Transaction ID field to help us verify your payment faster.',
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
    answer: [`We currently accept ${PAYMENT_METHODS.map((m) => m.label).join(', ')}. We do not accept cards or bank transfers at this time.`],
  },
  {
    question: 'Do you offer refunds?',
    answer: [
      'Refunds are reviewed case by case, for example when an order cannot be delivered. Approved refunds are returned in cryptocurrency. Our Refund Policy explains when refunds may apply and how to request one.',
    ],
  },
  {
    question: 'Is Socialora affiliated with Instagram, TikTok or YouTube?',
    answer: [
      'No. Socialora is an independent digital marketing service and is not affiliated with, endorsed by or sponsored by Instagram, Meta, TikTok, ByteDance, YouTube or Google. All trademarks belong to their respective owners. You are responsible for making sure your use of our services follows the rules of the platform you use.',
    ],
  },
] as const
