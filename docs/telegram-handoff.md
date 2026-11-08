# Socialora Telegram Otomasyonu — Devir Teslim Kaydı (8 Kasım 2026)

Bu belge, Socialora Telegram yayın ve grup otomasyonunun doğrulanmış canlı durumunu, marka sınırlarını ve teknik devir bilgilerini içerir. FivePicked ve Threads bu projeye dahil değildir.

## 1. Hedef ve Marka Kimliği

- **Site ve Konumlandırma:** `getsocialora.com` Instagram, TikTok ve Telegram için takipçi, izlenme ve beğeni hizmetleri sunar; ücretsiz araçlar (`shadowban checker`, hesaplayıcılar vb.) ek değerdir. Marka yalnızca "ücretsiz araç sitesi" olarak tanıtılmaz.
- **Telegram Hedefleri:** Kanal `@SocialoraOfficial`, grup `@SocialoraChat`, bot `@socialora_publisher_2026_bot`.
- **Dil ve Ton:** Kanal ve grup dili kısa, doğal, somut faydalı İngilizce; sahibine durum raporları kısa Türkçe.
- **Sınırlar ve Onay:**
  - Mevcut üyeler büyük ölçüde bot ağırlıklıdır; toplam üye sayısı organik büyüme veya erişim kanıtı olarak raporlanmaz.
  - Ücretli büyüme, istenmeyen DM, davetsiz başka gruplara paylaşım, sahte üye/sonuç veya büyüme/güvenlik garantisi (`100% safe`, `never drops`, `guaranteed followers`) kesinlikle kullanılmaz.
  - Gerçek fiyat, refill ve ödeme bilgisi yalnız siteden doğrulanmış haliyle paylaşılır; herkese açık grupta özel sipariş/ödeme/e-posta bilgisi istenmez (`info@getsocialora.com` veya `/track` sayfasına yönlendirilir).
  - Kullanıcının açık onayı olmadan üçüncü kişilere takas mesajı, yarışma/ödül, içerik/üye silme, para harcama, kanal/grup adı veya kullanıcı adı değişikliği yapılmaz.

## 2. Depo, Dağıtım ve Vercel Durumu

- **GitHub Deposu:** `socialora1-code/socialora` (public). Bu depoya erişimi olan mevcut yetkili GitHub kimlikleriyle (`fatihcankripto-svg` dahil) kimlik taklidi yapılmadan çalışılır.
- **Vercel Bağlantısı:** Hesap `idrisoyt20@gmail.com`, çalışma alanı `idrisoyt`, proje `socialora`. Depo public yapıldıktan sonra `d3b2a0ff6dd458029a415a5e1b776ae49a6413d2` commiti ile dağıtım `SUCCESS` olarak doğrulandı (`https://vercel.com/idrisoyt/socialora/4jyBGeAw5aeezoXgQPQzSK9pTQeB`). Normal dağıtım yolu `GitHub -> Vercel` hattıdır.
- **Kaynak ve Paket:**
  - Kaynak kod ve belgeler: `automation/telegram/socialora.py`, `README.md`, `sources.json`, `content.json`, `growth-plan.md`, `tests/test_publisher.py`.
  - Dağıtım paketi: `public/dl/socialora-telegram-termux.zip` (git blob SHA: `8fae8e45d5569cab919d89cbf37a0f180d9223dd`, `optimize-profile` komutu dahil, 32 birim testi ve 37 içerik kontrolü başarılı).

## 3. Telefonda Doğrulanan Canlı Kurulum (8 Kasım 2026)

- **Dosya Konumları (Termux):**
  - Kod: `~/.socialora`
  - Yapılandırma: `~/.config/socialora-telegram/config.json` (bot token ve ücretsiz kota Gemini API anahtarı yerel olarak 600 izinle kayıtlıdır; sohbetten istenmez veya yazdırılmaz)
  - Durum ve SQLite kuyruk: `~/.local/share/socialora-telegram`
- **Doğrulanan Geçmiş Anlık Durum (`status` çıktısı):**
  - `YAYIN İZNİ AÇIK`; kanal `1202`, grup `323`; o anki kesitte bugün `3` yayın, `33` bekleyen, `0` belirsiz, `0` hata, `1` süresi geçmiş; grup kutusunda `1` bekleyen ve `1` yanıtlanan; `Gemini Flash aktif (ücretsiz kota)`; heartbeat `11` saniye. *(Not: Bu veri kurulum anındaki geçmiş kesittir, anlık canlı veri olarak sunulmaz.)*
- **Çalışma Düzeni:**
  - Günde 5 kanal gönderisi (gündüz 3–4 saat değişken aralıklar, gece ara) ve haftada 2 grup tartışması.
  - Grup sorularına 2–3 dakika gecikmeli, emojisiz, markdownsuz, selamlama/övgü kalıbı içermeyen doğal insan diliyle yanıt.
  - Kanaldan gruba otomatik düşen mesajlar (`@Telegram` vb.) yok sayılır.
  - Eski webhook 7 Kasım 2026 23:44 (TSİ) itibarıyla kaldırılmıştır; ControllerBot yeniden bağlanmaz ve ikinci bir poller/yayıncı çalıştırılmaz.
- **Güvenli Süreç Yönetimi:**
  - `pkill -f socialora.py` komutu kendi kabuk zincirini de sonlandırabildiği için kullanılmaz; yalnızca `pkill -f '[s]ocialora[.]py run'` deseniyle motor durdurulur.
  - Güncellemelerde mevcut SQLite kuyruğu ve `config.json` korunur; tekrar `import` ile zamanlar/gönderilenler sıfırlanmaz, belirsiz gönderiler otomatik tekrarlanmaz.
- **Profil ve Sabit Mesaj Durumu:**
  - Botun `Change info` ve `Pin messages` yetkileri açıktır; Rose ayarlarına dokunulmamıştır.
  - Telefonda güncellenip doğrulanan canlı açıklamalar:
    - **Kanal (`@SocialoraOfficial`):** `Instagram, TikTok and Telegram growth: followers, views and likes services plus free tools like shadowban checkers and money calculators. Practical tips every day. Questions: @SocialoraChat. getsocialora.com`
    - **Grup (`@SocialoraChat`):** `Creator chat for Instagram, TikTok and Telegram growth. Ask about stuck views, low reach, shadowban, pricing or orders. Real answers, no spam. Services and free tools: getsocialora.com`
  - Gruptaki sabit mesaj henüz yalnız ücretsiz araç odaklıdır; üst üste yeni pin göndermeden önce mevcut sabit mesajı okuma/düzenleme yolu kontrol edilmelidir.

## 4. Bekleyen ve Açık Konular

- **Analitik ve Dönüşüm:** UTM etiketleri eklidir ancak gerçek site trafiği, tıklama ve dönüşüm ölçümü henüz doğrulanmamıştır; veri yokken tahmin yapılmaz.
- **Kataloglar ve Ortaklıklar:** Ücretsiz katalog adayları (`tgmetrix.com`, `tgstat.com`, `telegramchannels.me`, `tdirectory.me`, `telegramic.org`) henüz kayıt/başarı olarak doğrulanmamıştır. Kanal takasları gerçek görüntülenme kanıtı oluşana kadar bekletilir ve iletişim öncesi kullanıcı onayı şarttır.
- **Video Hesabı:** `@socialoratools` için doğrulanmış hesap erişimi veya yayınlanmış video bulunmamaktadır; mevcut odaktan sapılmaz.
