# Socialora Telegram — evde kurulum

Bu paket yalnızca `@SocialoraOfficial` ve `@SocialoraChat` için hazırlanmıştır. Threads ve FivePicked ile bağlantısı yoktur. Python standart kütüphanesini kullanır; AI aboneliği/API anahtarı veya ek sunucu gerekmez.

## Hazır olanlar

- 7 gün: kanala günde 5 farklı İngilizce gönderi (toplam 35); gruba 3. ve 6. günlerde 17.05'te iki ayrı tartışma konusu. Kanal saatleri her gün değişir; gündüz gönderilerinin arası 3–4 saattir, gece ara verilir. Bütün saatler Türkiye saati.
- Siteye giden her bağlantıda ayrı UTM kampanyası. Her paylaşım reklam değildir; bağlantısız faydalı içerik de vardır.
- Kalıcı SQLite yayın kaydı; tekrar yüklemeye ve aynı anda iki motor çalışmasına karşı koruma.
- Kesintiden sonra 90 dakikadan eski yayın atlanır. Eski gönderiler arka arkaya gönderilmez. İki yayın arasında en az 30 dakika vardır.
- Zaman aşımı veya belirsiz cevapta otomatik tekrar yok. İşlem durur; Telegram'da kontrol edilir.
- Telegram'ın açıkça reddettiği 429 cevabında belirtilen bekleme süresine uyulur; sınırlı tekrar yapılır. Yetki sorunu yayını durdurur.
- Token yalnızca telefonun özel uygulama alanında, 600 izinli dosyadadır. Kişisel Telegram hesabına giriş yapılmaz.
- Servis yöneticisi ve Termux:Boot için başlangıç dosyası; durum, günlük, kalp atışı ve veritabanı yedeği.

## Telefona kurulacaklar

Android 7+ üzerinde güncel Termux paketleri gerekir. Termux ve Termux:Boot'u **aynı resmi dağıtım kaynağından** kurun (örneğin ikisi de F-Droid). Var olan Termux verilerini uygulama silerek kaybetmeyin. Android'in özellikle arka plan/pil kısıtları cihazda test edilmelidir; şarj ve internet tek başına kesintisizlik garantisi değildir.

1. Termux'a bu paketin ZIP dosyasını indirip açın. Dosya adını `socialora-telegram-termux.zip` olarak koruyun. Termux'ta:

```sh
pkg install -y unzip
termux-setup-storage
unzip -n "$HOME/storage/downloads/socialora-telegram-termux.zip" -d "$HOME"
cd "$HOME/socialora-telegram-termux"
bash install-termux.sh
```

2. Termux'u yeniden açın. Bot tokenini **yalnızca telefondaki gizli giriş alanına** girin:

```sh
socialora setup
socialora doctor
```

GitHub'daki kayıtlı secret sonradan okunamaz; mevcut tokeni BotFather'daki kendi botunuzdan alıp bu alana girmeniz gerekir. Tokeni sohbete, dosya paylaşımına veya komut satırı argümanına yazmayın. BotFather'dan tokeni gelişigüzel revoke etmeyin: GitHub/telefon yapılandırması da güncellenmek zorunda kalır. Eski webhook kaldırıldı; ControllerBot'u yeniden bağlamayın. `setup` hiçbir mesaj göndermez, webhook'u değiştirmez. Başarısız doğrulama tokeni kaydetmez.

3. Takvimi görüntüleyip kuyruğa yükleyin. Varsayılan başlangıç **ertesi gün**dür; böylece kurulurken bir anda paylaşım olmaz:

```sh
socialora preview
socialora import
socialora status
```

Farklı başlangıç için `socialora import --start YYYY-MM-DD` kullanılır. Aynı paketi tekrar yüklemek takvimi kaydırmaz ve yeni kopyalar oluşturmaz.

4. **ControllerBot'un planlı gönderilerini kontrol edin.** Bu paket o kuyruğu göremez. Aynı saat veya metin varsa iki yayıncıyı birden etkin bırakmayın. Mevcut gönderileri otomatik silmeyin. Sonra:

```sh
socialora resume --queue-reviewed
sv-enable socialora-telegram
sv up socialora-telegram
socialora status
```

Termux:Boot'u bir kez açın. Android'de Termux ve Termux:Boot için pil kullanımını kısıtlamayın; varsa otomatik başlatmaya izin verin. Termux'un kalıcı bildirimini etkin tutun. Gözetim altında kısa ekran kapalı testi ve daha sonra yeniden başlatma testi yapın. Bazı cihazlarda ilk kilit açılmadan servis başlayamaz; model bilinmeden bunun çözüldüğü varsayılmaz.

İlk günün 08.10 gönderisi “Start here” metnidir. Yayınlanınca Telegram'dan sabitleyin. Paket mevcut sabit mesajı değiştirmez.

## Günlük kullanım ve grup gelen kutusu

```sh
socialora status                  # doğrulanmış durum ve sorunlar
socialora report                  # en fazla 8 satır Türkçe rapor
socialora poll                    # webhook boşsa gelen grup mesajlarını tek tüketici olarak çeker
socialora inbox                   # grupta yanıt bekleyen soruları listeler (--all tümünü gösterir)
socialora reply UPDATE_ID --text "Natural English reply..." # soruya bağlama özel yanıt verir
socialora ignore-inbox UPDATE_ID  # yanıt gerektirmeyen mesajı kapatır
socialora pause                   # gelecekteki gönderimleri durdurur
socialora resume --queue-reviewed # sorunlar giderilince devam
sv down socialora-telegram        # servis motorunu kapatır
sv up socialora-telegram          # motoru yeniden açar
```

Duraklatma halihazırda Telegram'a ulaşmış isteği geri alamaz. Yayımlanmış içerik veya üye silinmez.

- Servis (`run`) çalışırken dakikada bir `getWebhookInfo` kontrol edilir; yalnızca webhook boşsa `getUpdates` ile `@SocialoraChat` mesajları okunur.
- Her mesaj `update_id` ve `(chat_id, message_id)` ile SQLite `inbox` tablosuna tekil olarak kaydedilir; tekrar işlenmez veya çift yanıtlanmaz.
- Ücretsiz AI kotası doğrulanmadan otomatik AI yanıtı kapalıdır (ücretli API/faturalandırma açılmaz). Sorular `socialora inbox` ile görülüp `socialora reply` ile kısa, doğal İngilizce ve takipli (`utm_campaign=reply_u<update_id>`) bağlantılarla yanıtlanır.

Rapor ve durum kayıtları `~/.local/share/socialora-telegram/` içindedir. Rapor otomatik olarak gruba gönderilmez; Türkçe iç rapor marka kanalına karışmaz. Üye sayısı günde bir kez okunur. Bot API'sinden site tıklamaları, satışlar veya geçmiş post görüntülenmeleri alınmış gibi raporlanmaz.

## Belirsiz yayın veya yanıt

`unknown` durumunda motor durur. Mesajın Telegram'da yayınlandığını görürseniz bağlantı sonundaki mesaj numarasıyla:

```sh
socialora resolve tg_v1_ORNEK --sent-message-id 123
socialora resolve-inbox UPDATE_ID --sent-message-id 456
```

Yayınlanmadığı doğrulanırsa `--skip` ile atlayın. Otomatik yeniden gönderme yoktur. Sonra gerekirse farklı, incelenmiş bir içerik hazırlayın. Boş veritabanına geçerek veya yedekten körlemesine dönerek gönderilmiş mesajları tekrar kuyruğa almayın.

## İçerik bitince

Paket içerikleri tekrar döndürmez. 7 gün sonunda yeni gönderi yoksa bekler. İlk haftanın sonuçlarına göre gelecek haftayı ChatGPT/Antigravity'de **tek çalışmada** hazırlayıp `brand=Socialora`, `version=1` formatında yeni JSON ekleyin. Her yeni gönderinin benzersiz kimliği olmalı; eski kimliklerin metnini değiştirmeyin. Yeni haftayı `socialora import --file DOSYA --start YYYY-MM-DD` ile ekleyin. `import` mevcut servisi durdurmadan çalışabilir; yoğun işlemle aynı ana denk gelirse kısa süre sonra tekrar deneyin.

Fiyat, refill, kampanya ve müşteri sonucu içeriklerine kullanıcı onayı gerekir. Yeni içerikteki değişebilir ürün bilgilerini yeniden doğrulayın. Bu paket fiyat/refill veya süre garantisi yayınlamaz. Metin benzerliğinin anlam düzeyindeki kontrolü editoryal incelemenin parçasıdır; otomatik kontrol tam eşleşmeleri ve URL etiketleri değiştirilmiş kopyaları yakalar.

## Şu anda yapılmayanlar

- Eski webhook 7 Kasım 2026 tarihinde sahibinin talebiyle kaldırıldı ve boş olduğu doğrulandı. Paket `setWebhook` veya `deleteWebhook` çağırmaz; yalnızca mevcut `getWebhookInfo` boşsa `getUpdates` ile tek tüketici olarak grup mesajlarını okur.
- Ücretsiz API kotası doğrulanmadığı için **otomatik AI yanıtı kapalıdır**; ücretli faturalandırma kullanılmaz ve hazır robotik kalıp yanıtlar otomatik atılmaz.
- Dış gruplara yazma, DM, üye ekleme, takas mesajı gönderme, çekiliş veya ödül başlatma yoktur.
- Telefon kapalıyken veya Android uygulamayı tamamen durdurduğunda çalışamaz. Runit süreç hatalarını toparlar; işletim sisteminin tüm Termux'u kapatmasını tek başına önleyemez.
- Bu makinedeki testler gerçek telefonun ekran kapalı çalışma testinin yerini tutmaz.

## Teknik doğrulama

```sh
python -m unittest discover -s tests -v
python socialora.py check-content
```

Testler Telegram'a mesaj yollamaz. Uygulama yalnızca izin verilen Telegram yöntemlerini kullanır; üçüncü taraf Python paketi gerektirmez. Sürüm: 1.2.0.


## Tek seferlik GitHub → Termux otomatik güncelleme (9 Kasım 2026)

Canlı `socialora-telegram` yayın servisi çalışırken **yalnızca kod** güncellemek için ayrı `socialora-updater` servisi vardır. Günlük **04:15 Türkiye saati** GitHub `main` sürümü kontrol edilir. Değişiklik yoksa mevcut yayıncı yeniden başlatılmaz. Kod değişmişse `socialora.py` ile o commite ait testler ve içerik paketi **aynı sabit commit SHA** üzerinden indirilir; Python derleme ve unittest kontrolü başarılı olmadan çalışan dosyaya dokunulmaz. Ardından önce çalışan Python dosyaları geçici yere yedeklenir, yayıncı durdurulur, iki yerel dosya güncellenir, servis yeniden başlatılır ve yeni kalp atışı kontrol edilir. Sağlık testi başarısızsa eski Python dosyaları geri getirilir.

**Bir defalık kurulum** (yalnız mevcut kurulu Socialora/termux-services olan telefonda):

```bash
curl -fsSL --retry 2 "https://raw.githubusercontent.com/socialora1-code/socialora/main/automation/telegram/auto-update.sh" -o "$HOME/socialora-auto-update-install.sh" && bash "$HOME/socialora-auto-update-install.sh" --install
```

Bu komut güncellemeyi aynı anda bir kez dener. Gerekirse Termux'u kapatıp yeniden açarak yeni runit servisinin göründüğünü kontrol et. Kontrol: `sv status socialora-updater` ve `tail -n 12 ~/.local/share/socialora-telegram/auto-update.log`. Manuel tek güncelleme: `~/.local/bin/socialora-auto-update --once`.

Önemli sınırlar: Hatalı kodun **her tür davranışsal hatasını** yerel unit test + heartbeat yakalayamaz. GitHub `main` erişim yetkileri sıkı tutulmalı; yalnız test edilmiş değişiklikler commit edilmelidir. Telefon kapalıysa güncelleme ve bot çalışmaz; Android arka plan kısıtları ayrıca yönetilmelidir. Bu mekanizma `config.json`, bot/Gemini anahtarları, SQLite kuyruk, eski gönderiler veya içerik importu üzerinde işlem yapmaz. Telegram komutlarını test etmek için yine grupta kendi hesabından `/tools` yazmak gerekir.


## GitHub'dan uzaktan raporlama + 5 dakikalık güncelleme (9 Kasım)

Önceki günlük güncelleme yönergesi yerine **tek adımlı yeni kurulum**:

```bash
curl -fsSL --retry 2 https://raw.githubusercontent.com/socialora1-code/socialora/main/automation/telegram/bootstrap-remote.sh -o "$HOME/socialora-bootstrap.sh" && bash "$HOME/socialora-bootstrap.sh"
```

Kurulum iki ayrı runit hizmeti oluşturur:
- `socialora-updater`: GitHub `main` sürümünü yaklaşık **5 dakikada bir** kontrol eder. Sadece çalışan Python kodu değiştiğinde test eder ve yayıncıyı kontrollü yeniden başlatır. Python/ünite testleri veya servis heartbeat kontrolü başarısızsa güncellemeyi reddeder / eski Python koduna geri döner. Yapılandırma, SQLite kuyruğu ve API anahtarları korunur.
- `socialora-health`: yaklaşık **6 saatte bir** yalnız toplu sayıları (servis durumu, heartbeat yaşı, yayın/yanıt ve bekleyen/hata sayıları, kurulu commit) `socialora1-code/socialora` GitHub issue **#2** yorumuna gönderir. Ham Telegram mesajı, kullanıcı adı, token, e-posta, sipariş veya log göndermez. **Issue public olduğu için yalnız anonim toplamlar** yayımlanır.

**Raporlama için gerekli bir defalık izin:** GitHub'da `Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token` kısmından owner `socialora1-code`, **Only selected repositories → socialora**, `Repository permissions → Issues: Read and write`, diğer izinler mümkün olan en az düzeyde. Kısa süreli expiration seçilebilir ama süresi dolunca raporlar durur. Terminal gizli giriş alanına tokeni yapıştır; **sohbete, GitHub dosyasına, ekran görüntüsüne veya loga koyma**. Bu yetki yalnız sağlık yorumları için kullanılmalı; kod yazma izni verme. Token boş bırakılırsa otomatik güncelleme çalışabilir fakat uzaktan sağlık raporu **çalışmaz**. Rapor gönderimi yalnız GitHub issue #2'ye ilk gerçek yorum geldiğinde doğrulanmış sayılır.

Kurulumdan sonra `sv status socialora-telegram socialora-updater socialora-health` ile üç hizmeti kontrol et. Kullanıcıya normal yayınların kesintisiz olduğuna dair garanti verilmez: telefon çevrimdışıysa, Android uygulamayı öldürürse veya GitHub limit/izin sorunu olursa rapor ve güncelleme aksayabilir. GitHub Issue raporlarında ham hata günlükleri yoktur; sadece hata sayılarından ayrıntı teşhis edilemeyebilir. İlk gerçek rapordan sonra 6 saatte bir çalışan ChatGPT otomasyonu son kaydı izler ve anormallik varsa kullanıcıya haber verir; bu otomasyon cihazı uzaktan yönetmez.
