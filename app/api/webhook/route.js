import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    const apiKey = process.env.NOWPAYMENTS_API_KEY;

    // NOWPayments'tan gelen bildirim durumunu kontrol ediyoruz
    // "finished" ödemenin başarıyla tamamlandığı ve paranın cüzdanınıza geçtiği anlamına gelir
    if (body.payment_status === 'finished') {
      
      // BURASI: Ödeme onaylandığında size otomatik sipariş maili gönderen 
      // mevcut kodunuz veya tetikleyiciniz buraya gelecek.
      console.log('Ödeme Başarılı! Sipariş onaylanıyor:', body.order_description);
      
      return NextResponse.json({ message: 'Sipariş maili tetiklendi' }, { status: 200 });
    }

    return NextResponse.json({ message: 'Ödeme henüz tamamlanmadı' }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
