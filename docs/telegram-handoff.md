# Socialora Telegram & n8n Otomasyonu — Güncel Devir Teslim Rehberi (10 Kasım 2026)

Bu belge, yeni açılacak Antigravity sohbetinin önceki sohbet kadar projeye, sosyal medya büyüme stratejisine ve yerel Windows `n8n` mimarisine hakim olması için hazırlanmıştır. **Gizli anahtar/token içermez.**

## 1. Uzman Rolü, Strateji ve İletişim Tarzı

- **Kullanıcı ile İletişim:** Kullanıcı teknik terim yerine **basit, samimi, net Türkçe** konuşulmasını ister; uzun gereksiz teknik boğmaca ve arka arkaya onay sorma yerine kararlıca işi kurup temiz özet bekler.
- **Sosyal Medya Büyüme Felsefesi (`@SocialoraOfficial` & `@SocialoraChat`):**
  - Gerçek, organik ve ban/spam risksiz büyüme esastır (`getsocialora.com` için nitelikli trafik + müşteri).
  - Mevcut aboneler (`1145` kanal / `327` grup) büyük ölçüde legacy/bot ağırlıklı olduğundan üye toplamı başarı sayılmaz; esas ölçüt **son gönderi görüntülenmeleri**, **anket oyları** ve **gerçek grup sorularıdır**.
  - Şu an son 5 gönderinin ortalama okunması `2.2` görüntülenme olduğu için tanıtım takası/ortaklık mesajları **kasıtlı olarak uyku modundadır**. Gerçek erişim ortalama **`>= 25` görüntülenmeye** çıktığında motor otomatik uyanıp takas mesajlarını hazırlar (ayrıca Telegram Bot API kısıtı gereği resmi botlar üçüncü kişilere ilk DM'i başlatamaz; izinsiz dış DM asla atılmaz).
  - Şu an ana büyüme odağı: kanalda yüksek değerli/iletilebilir içerikler + 48 saatte bir tek tık etkileşim anketi (`sendPoll`) + gruptaki 10'dan fazla ücretsiz `/komut` aracını (`shadowban`, `caption`, `bio`, `rate`, `photo`, `blur`, `safezone` vb.) öne çıkarmaktır.
  - Kesin yasaklar: sahte istatistik, `100% safe` / `never drops` / `guaranteed followers` vaatleri, robotik kalıp cümleler, grup AI yanıtlarında emoji/markdown, doğrudan satışın %15'i geçmesi, günde 5'ten fazla kanal gönderisi (`08:00–22:59` TSİ).

## 2. Canlı Windows & n8n Altyapısı

- **n8n Sunucusu:** `http://localhost:5678` (veri dizini `C:\Users\idoca\.n8n`, SQLite `C:\Users\idoca\.n8n\database.sqlite`, log `C:\Users\idoca\.n8n\n8n.log`). Arka planda `n8n start` çalışmıyorsa mutlaka daemon olarak (`IsDaemon: true`) başlatılır.
- **Kayıtlı Credential Kimlikleri (değerler okunmaz/yazdırılmaz):**
  - `telegramSocialora01` (Bot `@socialora_publisher_2026_bot`)
  - `GKMR8LAL70kOA0mV` (Google Gemini Flash — ücretli billing/uydurma kota açılmaz, günlük 40 çağrı tavanlıdır)
- **Windows Güç Ayarları:** Balanced şemasında (`381b4222-f694-41f0-9685-ff5bb260df2e`) uyku, ekran kapanma, kilit ekranı, hazırda bekleme ve AC kapak kapatma uykusu `powercfg` ile sıfırlanmıştır. Termux tarafı kapatılmıştır (`sv down socialora-telegram socialora-updater`).
- **Chrome CDP Profili:** Açık Chrome debug portu `127.0.0.1:9222` (`SocialoraChromeProfile`).

## 3. Özel n8n Düğümleri ve 3 Aktif Akış

Özel düğümler `C:\Users\idoca\.n8n\custom\` altındadır ve repo içi workflow JSON'ları `C:\Users\idoca\Socialora\automation\telegram\n8n\` dizinindedir (`n8n` tarafı `n8n import:workflow` ile güncellenir).

1. **`TelegramPolling.node.js` (`CUSTOM.telegramPolling`)**
   - `getWebhookInfo` kontrolüyle polling güvenliği sağlar, `@SocialoraChat` gelen mesajlarını tekil okur ve `@idrisoyt` özel `/start|/growth|/report|/status` komutlarını yakalayıp `C:\Users\idoca\.n8n\socialora-growth.json` içindeki `ownerChatId` alanına kaydeder.
2. **`TelegramGrowth.node.js` (`CUSTOM.telegramGrowth`)**
   - İşlemler: `getSnapshot`, `readState`, `fetchText` (yalnızca `https://t.me/s/<kanal>`), `sendPoll`, `sendRichPost` (inline butonlu + sessiz pin), `saveState`, `sendOwnerDm`.
   - Kalıcı büyüme/anket/takas durumu `C:\Users\idoca\.n8n\socialora-growth.json` dosyasında tutulur.
3. **Aktif Workflow'lar (`active: 1`):**
   - `tgPublishSocial01` (`telegram-publish-workflow.json`) — 10 dk'da bir yayın takvimi + canlı kanal dedup + büyüme verisinden kazanan format önceliği + HTML UTM link filtresi.
   - `tgGroupAssistant01` (`telegram-assistant-workflow.json`) — 30 sn'de bir polling + 11 fast-lane `/komut` + 2–3 dk gecikmeli Gemini Flash grup soru yanıtı + `@idrisoyt` DM rapor komutu.
   - `tgGrowthEngine01` (`telegram-growth-workflow.json`) — 6 saatte bir canlı kanal/grup metriği ve son gönderi okunma analizi, 48 saatte bir `sendPoll` anketi (`10:00–20:59` TSİ, günlük `< 4` gönderi varken), `avgLast5Views >= 25` olunca devreye giren partner radar/mesaj hazırlığı.
4. **Pasif Akış (`active: 0`):**
   - `KsUuvklaYVqughM0` (`pinterest-otomasyon.json`) — OAuth anahtarı girilip tek Pin denenene kadar kapalı kalır.

## 4. Yeni Oturumun Bilmesi Gereken Kritik n8n Teknik Kuralları

Bu oturumda canlı testlerle öğrenilmiş kurallardır; **aynı hatalara düşülmez**:
1. **`Code` node sandbox kısıtı:** `@n8n/task-runner` JS VM içinde `URL`, `URLSearchParams`, `fetch`, `require` **yoktur** (`URL is not defined` hatası verir) ve mod `runOnceForAllItems` olduğundan `$input.first()?.json` kullanılır (`$json` tek başına tanımlı değildir). HTTPS URL ayrıştırma ve UTM ekleme saf string/regex JS ile yapılmalıdır.
2. **Axios Windows HTTP takılma tuzağı:** n8n `HttpRequest` düğümü `https://t.me/s/...` isteklerinde Windows IPv6 nedeniyle zaman aşımına düşmeden askıda kalabildiği için tüm `t.me/s/` okumaları Node `fetch` + `AbortSignal.timeout(12000)` kullanan `CUSTOM.telegramGrowth` -> `fetchText` ile yapılmalıdır.
3. **`import:workflow` `staticData` sıfırlar ve akışları kapatır:** Workflow JSON içe aktarılacaksa önce `n8n` kapatılır, `workflow_entity.staticData` (özellikle `global` ve `node:Telegram Polling`) yedeklenip import sonrası geri yazılır (`node:Zamanlayıcı` anahtarları hariç), sonra `n8n` başlatılıp Chrome UI üzerinden Publish edilir.
4. **Özel düğüm dönüş biçimi:** `execute()` mutlaka 2 boyutlu dizi `[[{ json: ... }]]` döndürmelidir (`[out]`).
5. **Yerleşik `Telegram` düğümü:** Bot imzasını kapatmak için `appendAttribution: false` açıkça verilmelidir.
6. **Chrome CDP kullanımı:** Yeni sayfa açtıktan sonra `Runtime.evaluate` öncesi `/types/nodes.json` + Vue render için ~7 sn beklenir; `/rest/...` endpoint'lerine sayfa içinden ham fetch atılmaz.
7. **Doğrulama disiplini:** Hiçbir şey canlı çalıştırılıp DB (`execution_entity` / `execution_data`) veya canlı `https://t.me/s/SocialoraOfficial` çıktısından görülmeden "tamamlandı" denmez.

## 5. Sıradaki Doğal Adımlar (Kullanıcı İstediğinde)

1. Telegram büyüme sonuçlarını izleme (anket katılımı, son 5 gönderi ortalaması `25+` olursa ortaklık mesajlarının otomatik hazırlanması, gerekirse haftalık içerik formatı iyileştirmesi).
2. Kullanıcı hazır olduğunda Pinterest (`KsUuvklaYVqughM0`) OAuth anahtarı ekranını Chrome'da açıp bağlama ve ilk Pin'i canlı doğrulama.
3. Ardından Instagram, TikTok, YouTube ve X'i `AGENTS.md` sırasıyla tek tek `n8n`'e ekleme.
