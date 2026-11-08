# Socialora Telegram Otomasyonu — Devir Teslim Kaydı (9 Kasım 2026)

Bu belge, Socialora Telegram yayın ve grup otomasyonunun doğrulanmış canlı durumunu, marka sınırlarını ve teknik devir bilgilerini içerir. FivePicked ve Threads bu projeye dahil değildir.

## 1. Hedef ve Marka Kimliği

- **Site ve Konumlandırma:** `getsocialora.com` Instagram, TikTok, YouTube, X ve Telegram için takipçi, izlenme, beğeni, otomatik beğeni ve izlenme süresi hizmetleri sunar; ücretsiz araçlar (`shadowban checker`, hesaplayıcılar vb.) ek değerdir. Marka yalnızca "ücretsiz araç sitesi" olarak tanıtılmaz.
- **Telegram Hedefleri:**
  - Kanal: `@SocialoraOfficial` — Başlık: `Socialora | Instagram, TikTok & Telegram Growth`
  - Grup: `@SocialoraChat` — Başlık: `Socialora Chat | Creator Growth & Free Tools`
  - Bot: `@socialora_publisher_2026_bot`
- **Dil ve Ton:** Kanal ve grup dili kısa, doğal, somut faydalı İngilizce (kanal gönderilerinde ölçülü emoji serbest; grup cevaplarında sıfır emoji ve sıfır markdown); sahibine durum raporları kısa Türkçe.
- **Sınırlar ve Onay:**
  - Mevcut üyeler büyük ölçüde bot ağırlıklıdır; toplam üye sayısı organik büyüme veya erişim kanıtı olarak raporlanmaz.
  - Ücretli büyüme, istenmeyen DM, davetsiz başka gruplara paylaşım, sahte üye/sonuç veya büyüme/güvenlik garantisi (`100% safe`, `never drops`, `guaranteed followers`) kesinlikle kullanılmaz.
  - Gerçek fiyat, refill ve ödeme bilgisi yalnız siteden doğrulanmış haliyle paylaşılır; herkese açık grupta özel sipariş/ödeme/e-posta bilgisi istenmez (`info@getsocialora.com` veya `/track` sayfasına yönlendirilir).
  - Kullanıcının açık onayı olmadan üçüncü kişilere takas mesajı, yarışma/ödül, içerik/üye silme, para harcama, kanal/grup adı veya kullanıcı adı değişikliği yapılmaz.

## 2. Depo, Dağıtım ve Vercel Durumu

- **GitHub Deposu:** `socialora1-code/socialora` (public).
- **Vercel Bağlantısı:** Hesap `idrisoyt20@gmail.com`, çalışma alanı `idrisoyt`, proje `socialora`. Normal dağıtım yolu `GitHub -> Vercel` hattıdır.
- **Kaynak ve Paket:**
  - Kaynak kod ve belgeler: `automation/telegram/socialora.py`, `README.md`, `sources.json`, `content.json`, `growth-plan.md`, `tests/test_publisher.py`.
  - Dağıtım paketi: `public/dl/socialora-telegram-termux.zip` (`optimize-profile`, `replace-pending`, günlük 40 Gemini bütçesi, 429 cooldown ve `v2` 37 gönderilik hizmet + araç içerik kuyruğu dahil; 35 birim testi ve 37 içerik kontrolü başarılı).
- **Site -> Telegram Dönüşüm Noktaları:**
  - Sağ alt yüzen Telegram butonu (`components/site/telegram-button.tsx`), ana sayfa daveti (`components/home/telegram-invite.tsx`), footer (`components/site/site-footer.tsx`), platform hizmet sayfaları (`components/services/platform-page.tsx`), sipariş alındı ekranı (`components/order/order-submitted.tsx`), ödeme başarılı sayfası (`app/payment-success/page.tsx`) ve sipariş takip sayfası (`app/track/page.tsx`) doğrudan `@SocialoraOfficial` ve `@SocialoraChat` hedeflerine yönlendirir.

## 3. Telefonda Doğrulanan Canlı Kurulum (9 Kasım 2026)

- **Dosya Konumları (Termux):**
  - Kod: `~/.local/opt/socialora-telegram/socialora.py` (`$PREFIX/bin/socialora` sarmalayıcısının hedefi) ve `~/.socialora/socialora.py` (her iki konum senkron tutulur)
  - Yapılandırma: `~/.config/socialora-telegram/config.json` (bot token ve ücretsiz kota Gemini API anahtarı yerel olarak 600 izinle kayıtlıdır; sohbetten istenmez veya yazdırılmaz)
  - Durum ve SQLite kuyruk: `~/.local/share/socialora-telegram`
- **Doğrulanan Geçmiş Anlık Durum (`status` çıktısı — 9 Kasım 2026 02:26 TSİ):**
  - `YAYIN İZNİ AÇIK`; kanal `1202`, grup `324`; bugün `0` yayın, `37` bekleyen (`tg_v2_...` serisi), `0` belirsiz, `0` hata, `0` süresi geçmiş; grup kutusunda `1` bekleyen ve `1` yanıtlanan; `Gemini Flash aktif (bugün=0/40)`; `Son motor kontrolü (saniye): 21`. *(Not: Bu veri doğrulama anındaki geçmiş kesittir, anlık canlı veri olarak sunulmaz.)*
- **Çalışma Düzeni:**
  - Günde 5 kanal gönderisi (gündüz 3–4 saat değişken aralıklar, gece ara) ve haftada 2 grup tartışması.
  - Grup sorularına ve hizmet/fiyat/sipariş/platform mesajlarına 2–3 dakika (`120–180 sn`) gecikmeli, emojisiz, markdownsuz, selamlama/övgü kalıbı içermeyen doğal insan diliyle yanıt.
  - Kanaldan gruba otomatik düşen mesajlar (`@Telegram` vb.) yok sayılır.
  - Eski webhook 7 Kasım 2026 23:44 (TSİ) itibarıyla kaldırılmıştır; ControllerBot yeniden bağlanmaz ve ikinci bir poller/yayıncı çalıştırılmaz.
- **Güvenli Süreç Yönetimi:**
  - `pkill -f socialora.py` komutu kendi kabuk zincirini de sonlandırabildiği için kullanılmaz; yalnızca `pkill -f '[s]ocialora[.]py run'` deseniyle motor durdurulur ve `sv up socialora-telegram` ile başlatılır.
  - Güncellemelerde mevcut SQLite kuyruğu ve `config.json` korunur; bekleyen içerik yenilemesi gerektiğinde geçmiş gönderilenlere dokunmayan `replace-pending` komutu kullanılır.
- **Profil ve Sabit Mesaj Durumu:**
  - Botun `Change info` ve `Pin messages` yetkileri açıktır; Rose ayarlarına dokunulmamıştır.
  - Telefonda `optimize-profile` ile güncellenip doğrulanan canlı başlıklar, açıklamalar ve sabit mesaj:
    - **Kanal Başlığı (`@SocialoraOfficial`):** `Socialora | Instagram, TikTok & Telegram Growth`
    - **Grup Başlığı (`@SocialoraChat`):** `Socialora Chat | Creator Growth & Free Tools`
    - **Kanal Açıklaması (`@SocialoraOfficial`):** `Instagram, TikTok and Telegram growth: followers, views and likes services plus free tools like shadowban checkers and money calculators. Practical tips every day. Questions: @SocialoraChat. getsocialora.com`
    - **Grup Açıklaması (`@SocialoraChat`):** `Creator chat for Instagram, TikTok and Telegram growth. Ask about stuck views, low reach, shadowban, pricing or orders. Real answers, no spam. Services and free tools: getsocialora.com`
    - **Grup Sabit Mesajı:** Hizmetleri (takipçi, izlenme, beğeni) ve ücretsiz araçları birlikte tanıtan yeni karşılama mesajı gönderilmiş ve sabitlenmiştir.

## 4. Bekleyen ve Açık Konular

- **Analitik ve Dönüşüm:** UTM etiketleri eklidir ancak gerçek site trafiği, tıklama ve dönüşüm ölçümü henüz doğrulanmamıştır; veri yokken tahmin yapılmaz.
- **Kataloglar ve Ortaklıklar:**
  - `tgmetrix.com/en/add-channel/` üzerinden hem `@SocialoraOfficial` hem `@SocialoraChat` başvuruları gönderilmiş ve `?ok=1` (`Your submission has been received`) onayı alınmıştır.
  - Diğer kataloglar (`tdirectory.me`, `tgstat.com`, `telegramchannels.me`, `telegramic.org`) Cloudflare/reCAPTCHA doğrulaması gerektirdiğinden açık tarayıcı sekmesinde hazır bırakılmıştır.
  - Kanal takasları gerçek görüntülenme kanıtı oluşana kadar bekletilir ve iletişim öncesi kullanıcı onayı şarttır.
- **Video Hesabı:** `@socialoratools` için doğrulanmış hesap erişimi veya yayınlanmış video bulunmamaktadır; mevcut odaktan sapılmaz.
