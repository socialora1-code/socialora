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


## Antigravity yeni sohbet: başlangıç noktası — 8 Kasım 2026

Kullanıcı Socialora projesinde yeni sohbet açarak buradan devam edecek. Önce GitHub'dan güncel main'i oku; eski ortamın önbelleğini veya silinmiş webhook bilgisini yeniden kullanma.

Hazır: automation/telegram/ altında Termux kurulum paketi; 7 günlük 35 kanal gönderisi (günde 5, gündüz araları 3–4 saat, saatler her gün farklı) ve 2 grup konusu; 28 test geçti. Son davranış değişikliği commit'i 88896d637d8a92e2ee925d7a0e9dad2ed112b603. Eski webhook kaldırıldı; ControllerBot yeniden bağlanmayacak. Mevcut üyelerin bot ağırlıklı olduğu kullanıcı tarafından belirtildi; takası gerçek erişim oluşana kadar ertele.

Hazır olmayanlar: telefon kurulumu/canlı paylaşım/ekran kapalı test, gelen grup mesajlarının okunması ve doğal AI yanıtları, ücretsiz Gemini API kotasının doğrulanması, katalog kayıtları ve ziyaret/dönüşüm ölçümü. Google AI Pro aboneliğinin API kullanımını karşıladığını varsayma. Bu hazırlıkları aktif otomasyon gibi sunma.

İlk iş: mevcut paketi/testleri doğrula, ardından aynı bot için kalıcı update_id/mesaj tekrar kontrolü olan tek gelen mesaj tüketicisini hazırla. Yayın kodunu baştan yazma. Mevcut webhook durumu yeniden kontrol edilmeli; getUpdates ancak boş webhook ile kullanılabilir. Ücretsiz API erişimi kurulana kadar AI yanıtını kapalı tut; ücretli billing açma. Anahtarları chatten isteme. Telefon henüz erişilebilir değilse ondan bağımsız kod/kurulum hazırlıklarını tamamla; eve gidildiğinde yalnızca gerekli cihaz ve güvenli anahtar adımlarını tarif et.

Antigravity'nin web çalışma ortamı sürekli açık bir sunucu olarak kabul edilmez; kod hazır olduğunda işi evdeki Termux servisi yürütür. Yeni sohbet açılması tek başına zamanlayıcı veya telefon servisi başlatmaz. Bir dosyaya yönerge eklenmiş olmasını Antigravity'nin okuduğuna dair kanıt sayma; yeni sohbette bu AGENTS.md dosyası açıkça okutulmalıdır.

## Güncel canlı kurallar (8 Kasım 2026, kullanıcı talebi)

- Telefon canlı çalışıyor; Gemini ücretsiz kota anahtarı telefonda kayıtlı. Kullanıcıya her mesajda yalnızca tek adım ve tek satır Termux komutu ver; anahtar/token isteme.
- Gruptaki üye yanıtları: emojisiz, markdownsuz, kısa, düz insan dili; selamlama/övgü kalıbı yok; 2-3 dakika gecikmeli. Yalnızca doğrulanmış bilgi (ödeme: sitede kripto var, bkz. lib/catalog.ts PAYMENT_METHODS). Uydurma fiyat/süre/garanti yok. Kanal gönderilerinde emoji serbest.
- Gönderi/yanıtlardaki site linkleri Telegram'da kısa metin olarak görünür (HTML anchor), UTM href içinde kalır.
- Kanaldan gruba otomatik düşen mesajlar (@Telegram) yok sayılır.
- Profil/Bio ve sabit mesaj: `socialora optimize-profile` (telefonda tek sefer).

## Çok platformlu otomasyon ana talimatı (10 Kasım 2026, kullanıcı talebi)

Kullanıcının hedefi: sosyal medya hesaplarını tek tek ekleyip içerik paylaşımını, büyümeyi ve getsocialora.com trafiğini otomatik, insan uzmanı kalitesinde ve ban/spam riski olmadan yürütmek. Kullanıcı manuel iş istemez; ajan anahtar giriş ekranına kadar her adımı kendisi yapar, ekranı açar, kullanıcı yalnızca anahtarı yapıştırır/Connect der.

### Platform başına tek yayıncı (çakışma yasağı)

| Platform | Tek yayıncı | Not |
|---|---|---|
| Telegram (@SocialoraOfficial, @SocialoraChat) | Yerel n8n (`tgPublishSocial01`, `tgGroupAssistant01`, `tgGrowthEngine01`; özel düğümler `telegramPolling`, `telegramGrowth`) | 10 Kasım 2026 itibarıyla canlı geçiş yapıldı. Telefondaki Termux servisi durduruldu (`sv down socialora-telegram socialora-updater`); paralel açma. `tgPublishSocial01` (10 dk) canlı kanal geçmişini okuyup çift yayını önler, kuyruk yenilemede kazanan formatlara ve bağlantısız iletilebilir rehberlere öncelik verir. `tgGroupAssistant01` (30 sn) 10 adet `/komut` aracına anında, sorulara 2–3 dk gecikmeyle Gemini yanıtı verir; `@idrisoyt` özel DM `/start`, `/growth` komutlarını destekler. `tgGrowthEngine01` (6 saat) sabit karşılama hub'ı, 48 saatte bir anket (`sendPoll`), canlı görüntülenme takibi ve aktif İngilizce partner taramasıyla onaya hazır iş birliği taslakları üretir (izinsiz dış DM atmaz). |
| Pinterest | Yerel n8n, workflow `KsUuvklaYVqughM0` (`pinterest-otomasyon.json`) | GitHub Actions yayın yapmaz (`socialora-pinterest-assets.yml` devre dışı). Kullanıcı 10 Kasım 2026'da ChatGPT tarafındaki harici Pinterest görevini kapattığını bildirdi; Pinterest OAuth anahtarı girilip tek Pin denenene kadar zamanlayıcı kapalı kalır. |
| Yeni platformlar | Yalnızca yerel n8n | Önce mevcut başka yayıncı var mı kontrol edilir. |

### Yeni platform ekleme sırası

1. Resmi API ve izin verilen işlemleri doğrula (resmi dokümandan). Resmi API yoksa tarayıcı otomasyonu/bot ile hesap yönetme; kullanıcıya açıkça söyle.
2. n8n'de credential şablonunu ve workflow'u CLI/API ile hazırla; workflow pasif (inactive) kalsın.
3. Credential ekranını Chrome'da (CDP 9222, SocialoraChromeProfile) aç; anahtarı kullanıcı girer. Anahtar sohbete, repoya, loga yazılmaz/istenmez.
4. Tek içerikle test et, sonucu platformda gör (id/URL). Sonra zamanlayıcıyı aç.
5. Durumu "hazır kod" / "canlı doğrulandı" ayrımıyla raporla.

### İçerik kalitesi (bütün platformlar)

- Her gönderi tek problem, somut adım veya özgün örnek. Kanca ile başla, doğal konuşma dili, platformun formatına uygun uzunluk.
- Yasak kalıplar: "sonuç olarak", "unutmayın", "kapsamlı", "in conclusion", "game-changer", "unlock", "dive into", "elevate", genel övgü, uydurma deneyim/istatistik, büyüme veya güvenlik garantisi.
- Aynı metni platformlar arasında kopyalama; her platform için yeniden yaz. Konu, açılış ve formatı döndür.
- Site linkleri UTM'li: `utm_source=<platform>`, `utm_medium=<channel|group|pin|post>`, `utm_campaign=<icerik_id>`. Doğrudan satış içeriği en fazla %15.

### Hız sınırları (ban önleme)

- Pinterest: günde en fazla 4 Pin, 12:00–02:00 TSİ, aralar en az 3 saat, saatler rastgele kaydırılır. Aynı URL'ye art arda Pin yok.
- Telegram: günde en fazla 5 kanal gönderisi (08:00–22:59 TSİ, en az 30 dk ara), haftada 2 grup konusu (günde max 1); AI kuyruk yenileme ve grup soru yanıtları günlük max 40 Gemini Flash çağrısıyla sınırlıdır, sorulara 2–3 dk gecikmeyle yanıt verilir. İlk hafta içerik kimlikleri ve canlı kanal geçmişi korunarak devam edilir.
- Yeni hesap/platform ilk 2 hafta normal hacmin yarısıyla başlar.
- Hata/429 gelirse tekrar yığma; bekle, kaydı çöz, sonra devam.

### Etkileşim (beğeni, takip, yorum) kuralları

- Yalnızca resmi API'nin izin verdiği işlemler yapılır. Pinterest API v5'te yorum yapma ve beğeni uç noktası yoktur; sadece Pin oluşturma, panoya kaydetme ve metrik okuma vardır. Bunu varmış gibi gösterme.
- Başkalarının hesaplarına toplu/otomatik takip, beğeni, yorum veya DM yapılmaz (platform kuralları ihlali, ban sebebi). Davetsiz gruplara paylaşım yok.
- İzin verilen otomatik etkileşim: kendi gönderilerimize/grubumuza gelen sorulara bağlamı okuyarak, gecikmeli (2–3 dk), kısa, emojisiz, doğrulanmış bilgiyle yanıt. Bilgi yoksa yanıt verme.
- Üçüncü kişilere iletişim/takas, çekiliş, para harcama: önce kullanıcı onayı.

### Ajanın çalışma biçimi

- Kullanıcı Türkçe, kısa ve samimi rapor ister. Her mesajda tek net adım ver.
- Mümkün olan her şeyi CLI/API ile ajan yapar; tarayıcıda kullanıcıya sadece anahtar/giriş ekranı bırakılır.
- n8n: `n8n.cmd` `C:\Users\idoca\AppData\Local\Programs\nodejs` içinde, arayüz http://localhost:5678, veri `C:\Users\idoca\.n8n`. JSON dosyalarını BOM'suz UTF-8 yaz. n8n sekmesinde browser-id başlığı olmadan `/rest` çağrısı yapma (oturumu düşürür).
- Kanıt olmadan "canlı", "çalışıyor", "büyüdü" deme; ölçülemeyen değer için "veri yok".
