# Socialora — Aktif Proje Hafızası ve Son Durum Özeti (10 Kasım 2026)

Bu dosya, yeni sohbet oturumlarında sıfırdan tarama yapmadan doğrudan devam etmek için doğrulanmış güncel operasyon hafızasıdır.

## 1. Ana Otomasyon Merkezi: Yerel Windows n8n (`http://localhost:5678`)
- **Durum:** Telegram otomasyonu Android Termux'tan yerel Windows `n8n` (`C:\Users\idoca\.n8n`) üzerine taşındı ve canlı doğrulandı.
- **Termux:** Telefondaki `socialora-telegram` ve `socialora-updater` servisleri kullanıcı tarafından durduruldu (`sv down`); paralel çalıştırılmaz.
- **Güç Ayarları:** Bilgisayarın uykuya geçip `n8n`'i durdurmaması için aktif Balanced güç şemasında uyku, hazırda bekleme, ekran kapatma, ekran karartma, kilit ekranı ve prize takılıyken kapak kapatma uykusu kapatılmıştır.
- **Çalışan Telegram Akışları (`active: 1`):**
  1. `tgPublishSocial01` (`automation/telegram/n8n/telegram-publish-workflow.json`): 10 dakikada bir sırayı ve canlı kanal geçmişini kontrol eder, günde max 5 gönderi (`08:00–22:59` TSİ) yayınlar. Canlı `#30` (`tg_v2_d1_s5_sponsorship_calc`) yayınlandı.
  2. `tgGroupAssistant01` (`automation/telegram/n8n/telegram-assistant-workflow.json`): 30 saniyede bir özel `TelegramPolling` düğümüyle `@SocialoraChat` mesajlarını okur; 10+ bedava araç `/komut`una (`/tools`, `/shadowban`, `/bio`, `/caption`, `/rate`, `/ideas`, `/photo`, `/blur`, `/score`, `/thumbnail`, `/safezone`) anında, üye sorularına 2–3 dakika gecikmeyle emojisiz/markdownsuz Gemini yanıtı verir. `@idrisoyt` özel DM `/start`, `/growth`, `/status` komutlarını destekler.
  3. `tgGrowthEngine01` (`automation/telegram/n8n/telegram-growth-workflow.json`): 6 saatte bir `TelegramGrowth` düğümüyle canlı abone/görüntülenme/format ölçer; 48 saatte bir kanala tek tık anket (`sendPoll`) atar. Son 5 gönderi ortalama görüntülenmesi `>= 25` olana kadar ortaklık/takas mesajı hazırlamayı otomatik bekletir ve kullanıcıya onay sorup darlamaz (`crossPromoStatus: "waiting_for_higher_activity"`).
- **Bekleyen Akış (`active: 0`):**
  - `KsUuvklaYVqughM0` (`pinterest-otomasyon.json`): Harici Pinterest OAuth anahtarı girilip tek Pin test edilene kadar bilerek kapalıdır. Diğer sosyal platformlar sonraki aşamaya ertelendi.

## 2. Doğrulanmış Canlı Başlangıç Çizgisi (10 Kasım 2026 23:04 TSİ)
- **Kanal (`@SocialoraOfficial`):** `1145` kayıtlı üye (legacy/bot ağırlıklı, gerçek büyüme kanıtı sayılmaz), sabit mesaj `#14`, son canlı gönderi `#30`, son 5 gönderi ortalaması `2.2` görüntülenme (`avgLast5Views`).
- **Grup (`@SocialoraChat`):** `327` kayıtlı üye, sabit mesaj `#405`.
- **Kalıcı Durum Dosyası:** `C:\Users\idoca\.n8n\socialora-growth.json`.

## 3. Web Sitesi (`getsocialora.com`)
- Next.js sitesi `socialora1-code/socialora` -> Vercel hattıyla yayında; ana sayfa, footer, platform sayfaları, sipariş ekranları ve `/tools/*` sayfalarında `@SocialoraOfficial` / `@SocialoraChat` CTA yönlendirmeleri mevcuttur.
## 4. Görev 11, 12 ve 13 Tamamlanma Durumu (12 Kasım 2026)
- **Görev 11 (Threads ve Instagram Kuyruk Yenileme):**
  * `wdclOfEylztD8H4v` Threads planlı paylaşım akışına 14 günlük link-free ısınma modu (`SAFE_WARMUP_MODE = true`) eklendi, ilk yanıtlardaki dış URL kaldırıldı ve yanıt gecikmesi 120-240 saniye rastgele jitter aralığına alındı.
  * 90 Threads gönderisi ve 36 Instagram gönderisi 3 altın şablona uygun olarak sıfırdan yeniden yazıldı; yasaklı tireler ve yapay zeka klişeleri temizlendi.
- **Görev 12 (Telegram Pusu ve Altın Yorum Motoru):**
  * `C:\Users\idoca\.n8n\custom\creator_watchlist.json` içinde 60 küresel üretici hesabı tanımlandı.
  * `TelegramGrowth.node.js` içinde 3.5 saatlik zamanlanmış (11:00, 14:30, 18:00, 21:30 TSİ) ve `/pusu` komutlu pusu sistemi kuruldu; 5 Threads + 8 beğeni, 5 IG + 8 beğeni/kaydetme, 5 Pinterest pini tek tık kopyalanabilir HTML formatında teslim ediliyor.
  * Yorum üretim motoru (`fetchFreshTargets` ve `thRepliesAssistant01`) 5 altın kural ve referans örneklere göre yapılandırıldı.
- **Görev 13 (51 Ücretsiz Araç Arama Motoru Şeması ve İç Linkleme Ağı):**
  * Tüm 51 ücretsiz araç için zengin `SoftwareApplication` (`applicationCategory: "UtilitiesApplication"`, `operatingSystem: "Any (Web Browser)"`, `offers: { price: "0", priceCurrency: "USD" }`) ve her araca özel en az 3 soruluk dinamik `FAQPage` şeması gömüldü.
  * `components/tools/related-creator-tools.tsx` bileşeni oluşturuldu; aynı kategorideki 4 ilgili araca, `/free-instagram-views` sayfasına ve `/tools` dizinine temiz SEO anchor text ile linkleme sağlandı.
  * `app/sitemap.ts` içinde 51 aracın tamamı `priority: 0.9` ve güncel tarih (`2026-11-12`) ile yapılandırıldı.
  * `npm run build` ile 110/110 statik sayfa sıfır hatayla derlendi.

