'use client'

import { useEffect } from 'react'
import { normalizeRefCode, storeRef } from '@/lib/referral'

export function ReferralCapture() {
  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get('ref')
    const code = raw ? normalizeRefCode(raw) : null
    if (code) storeRef(code)
  }, [])
  return null
}
