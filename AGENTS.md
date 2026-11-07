# Socialora proje talimatları

Telegram kuralları yalnızca Socialora Telegram görevlerinde uygulanır. Kod/website görevinde kendiliğinden Telegram işlemi başlatma. FivePicked ve Threads bu projeye dahil değildir.

## Amaç ve dil

Hedef gerçek, ilgili üyeler; güven, getsocialora.com'a nitelikli trafik ve müşteridir. Gönderiler ve üyelere yanıtlar kısa, doğal, somut faydalı İngilizce; sahibine raporlar Türkçe. Her içerik tek bir problemi açıklasın, uygulanabilir adım veya özgün örnek versin. Konu, giriş ve formatları çeşitlendir. Robotik kalıp, genel övgü, uydurma deneyim veya büyüme garantisi kullanma.

## Güncel kurulum ve tek çalışma talimatı

Bu dosya Socialora Telegram çalışmasının güncel ana talimatıdır. Eski sohbetlerdeki 7/14 günlük aşama listeleri ve ControllerBot üzerinden çalışma taslakları operasyon talimatı olarak kullanılmaz. Yararlı dil, doğruluk ve onay kuralları aşağıda korunmuştur.

## Telegram ilk aşama

Kaynak kodu ve evde Termux kurulumu `automation/telegram/README.md`; içerik `content.json`; doğrulanmış site bilgisi `sources.json`; edinim planı `growth-plan.md` içindedir.

- Telefon yayın motoru günde 5 kanal gönderisi, 7 günde 2 grup tartışması planlar. Bütün saatler Türkiye saatidir. Başlangıç tarihi kurulumda belirlenir.
- Her yayın için kalıcı kayıt ve message_id gerekir. Hazır kod, test başarısı veya import işlemi gerçek telefonun kurulmuş/çalışıyor olduğunu kanıtlamaz. Durumu bu ayrımla raporla.
- Her gün Antigravity oturumu açarak takvimi yönetme. Mümkün olan işleri AI'sız çalışan koda bırak; içerik yenilemeyi haftalık tek çalışmada yap.
- Telefonun yayın kaydı esas kaynaktır. Aynı işi ayrıca GitHub Actions veya ControllerBot kuyruğuna ekleme. Mevcut diğer kuyruğu incelemeden paralel yayıncı etkinleştirme.
- Eski webhook, kullanıcının açık talebiyle 7 Kasım 2026 23.44 Türkiye saatinde kaldırıldı ve boş olduğu doğrulandı. ControllerBot'u yeniden bağlama. Bu işlem üçüncü tarafın daha önce aldığı tokeni iptal etmiş sayılmaz.
- İlk sürüm gelen grup mesajlarını okumaz, otomatik AI yanıtı vermez. Sonraki teknik öncelik aynı bot için tek bir gelen mesaj tüketicisi kurmaktır. Polling ancak güncel getWebhookInfo kontrolü boşsa açılır; bekleyen güncellemeler silinmez. Gelen mesaj desteği ve ücretsiz AI kotası doğrulanmadan otomatik yanıtı çalışıyor diye anlatma.
- Kodda AI/API çağrısı yoktur. Ücretli faturalandırma açma; Pro aboneliğinin API kotası sağladığını varsayma.
- Kesinti sonrası eski gönderileri yığma. Belirsiz gönderim otomatik tekrarlanmaz; Telegram'da kontrol edilip kayıt çözülür.
- Telefonun Android pil/arka plan ve yeniden başlatma testleri yapılmadan kesintisiz çalışıyor deme.

## Haftalık içerik çalışması

Önce yayınlanan içerikleri ve erişilebilir sonuçları oku. Eski metinleri/örnekleri tekrar etme. Yalnızca kullanacağın değişebilir site bilgilerini yeniden doğrula; her seferinde bütün siteyi tarama. Yaklaşık yarı uygulanabilir ipucu, kalan ücretsiz araç/rehber ve anlamlı soru; doğrudan teklifler en fazla %15. Veriye göre saat veya içerik yaklaşımını geliştir; verisi olmayan başarıyı iddia etme.

Yeni içerikler benzersiz kimlikle eklenir; eski kimlikteki metin değiştirilmez. Site bağlantılarında `utm_source=telegram`, hedefe göre `utm_medium=channel|group`, `utm_campaign=benzersiz_kimlik` kullan. Faydayı gönderinin içinde ver; bağlantıyı ancak devamında anlamlı değer varsa ekle. Kampanya etiketi analitik entegrasyonu veya ölçülmüş tıklama değildir.

Kuyruk bitince eski içerikleri döngüye alma. Yeni paket hazırlanmamışsa bekle ve sahibine bildir. Telefon dosyaları bu oturumdan erişilemiyorsa eriştiğini veya güncel raporu okuduğunu söyleme.

## Büyüme ve onay sınırları

Büyüme işi her hafta şu üç hattı ilerletsin:
1. Telegram içinden yeni üyeler: mevcut açıklama ve sabit mesajları önce oku; ilgili arama terimlerini doğal biçimde kullan. Güvenilir ücretsiz katalogları doğrula ve uygun olanları kaydet. Kullanıcı mevcut üyelerin bot ağırlıklı olduğunu belirtti; üye toplamını gerçek kitle diye sunma. Takası gerçek görüntülenme/etkileşim kanıtı oluşana kadar ertele. Sonrasında gerçek takas adaylarını konu, dil, boyut ve son gönderi görüntülenmeleriyle değerlendir; mesaj gönderimi kullanıcı onayına bağlıdır. Sırf listeyi doldurmak için ilgisiz aday ekleme.
2. Üyeyi elde tutma: faydalı kanal içerikleri; gelen mesaj bağlantısı tamamlanınca grupta bize yöneltilen sorulara kısa, bağlama özel çözüm. Sürekli reklam veya herkese müdahale yok. Kullanıcı talebiyle mevcut kod günde 5 kanal gönderisi ve 7 günlük 35 içerik olarak güncellendi. Saatler günler arasında değişir; gündüz araları 3–4 saattir, gece ara verilir.
3. Siteye nitelikli dönüş: önce faydayı mesajda sun, devamında işlem yapılacaksa doğrudan ilgili ücretsiz araca/hizmet rehberine takipli link ver. Analitikte oturum ve dönüşüm kaydını doğrula. Site üzerinden gruba gelen mevcut davet, yeni dış kitle kazanımıyla karıştırılmaz.

Haftalık bir çalışma içinde içerik, aday listesi ve sonuç değerlendirmesini birlikte yap; aynı araştırmayı her gün baştan tekrarlama. Website/müşteri davet metinleri hazır olsa da gerçek yerleştirme ve gönderim ayrı doğrulanır. Kaynakta olmayan üye/izlenme veya site trafiği sayısı uydurma.

Şunlardan önce kullanıcı onayı gerekir: üçüncü kişilere iletişim/takas mesajı; yarışma/çekiliş/ödül; fiyat/refill şartı/vaka örneği yayınlama; para harcama; kanal/grup adı veya kullanıcı adı değiştirme; mevcut içerik veya üye silme; giriş doğrulaması ve mevcut webhook tüketicisini değiştirme.

İstenmeyen DM, toplu üye ekleme, davetsiz başka gruplara paylaşım, sahte üye/sonuç, uydurma teklif veya güvenlik garantisi asla kullanma. Üye sorularına erişim daha sonra kurulursa önce konuşmanın bağlamını oku; yeni bilgi veya gerçek çözüm ekle. Bilgi yoksa uydurma cevap verme. Özel sipariş/ödeme/iletişim bilgilerini herkese açık grupta isteme, ücretsiz AI servislerine gönderme.

## Anahtarlar ve mevcut GitHub köprüsü

Bot kimliği `@socialora_publisher_2026_bot`, hedefler `@SocialoraOfficial` ve `@SocialoraChat`. GitHub secret `SOCIALORA_TELEGRAM_BOT_TOKEN` ve telefonun özel config dosyası ayrı güvenli saklama yerleridir. Token sohbete, repoya, workflow girdisine, loga veya ekran görüntüsüne yazılmaz. GitHub secret değeri sonradan okunmaya çalışılmaz.

`.github/workflows/socialora-telegram.yml` eski manuel kontrol/yayın köprüsüdür; sınırları `docs/telegram-antigravity.md` içindedir. `inspect` yalnızca erişim kontrolüdür. `send` ancak hedefi/metni belirli talep için, telefon/ControllerBot takviminde çakışma olmadığı doğrulanarak kullanılır. Belirsiz workflow'u körlemesine tekrar çalıştırma. Websitedeki `FREE_VIEWS_TELEGRAM_BOT_TOKEN` davet imzası için kullanılan ayrı yapılandırmadır; değiştirme veya iptal etme.

## Rapor

En fazla 8 satır: doğrulanmış yayınlar/bağlantılar, mevcut ve önceki üye sayısı, bekleyen/hatalı işler, ölçülebiliyorsa Telegram kaynaklı ziyaretler ve yarının işi. Ölçemediğin değer için “veri yok” de. Türkçe raporu İngilizce marka kanalına gönderme. Kanıt olmadan zamanlayıcı, telefon, canlı yayın, grup okuma veya büyüme tamamlandı deme.
