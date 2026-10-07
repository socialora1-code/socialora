import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { fiyat, paketAdi } = await request.json();
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    // NOWPayments sisteminden ödeme linki talep ediyoruz
    const response = await fetch('https://nowpayments.io', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        price_amount: fiyat, // Örn: 15
        price_currency: 'usd', // Dolar cinsinden
        pay_currency: 'usdttrc20', // Müşteriye ilk olarak USDT (TRC20) önerir
        order_description: paketAdi, // Örn: 1000 Instagram Takipçi
        success_url: `${request.nextUrl.origin}/basarili`, // Ödeme bitince döneceği sayfa
        cancel_url: `${request.nextUrl.origin}/`, // İptal ederse döneceği sayfa
      }),
    });

    const data = await response.json();

    if (data.invoice_url) {
      // Oluşan güvenli ödeme linkini sitenize geri gönderir
      return NextResponse.json({ url: data.invoice_url });
    } else {
      return NextResponse.json({ error: 'Ödeme linki oluşturulamadı' }, { status: 400 });
    }
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
