import { handleFreeReliableOrder } from '@/lib/free-reliable-order'
import { FREE_FACEBOOK_QUANTITY, normalizeFacebookProfile } from '@/lib/free-facebook-followers'

export const runtime = 'nodejs'

export function POST(request: Request) {
  return handleFreeReliableOrder(request, {
    namespace: 'facebook',
    service: '7230',
    quantity: FREE_FACEBOOK_QUANTITY,
    normalize: normalizeFacebookProfile,
    invalidRequest: 'This offer is fixed at 10 followers. Submit only a public Facebook link.',
    invalidLink: 'Enter the public link to a Facebook Page or profile.',
    duplicate: 'A request already exists for this Facebook profile or connection.',
    unavailable: 'Free Facebook follower orders are temporarily unavailable. Please try again later.',
  })
}
