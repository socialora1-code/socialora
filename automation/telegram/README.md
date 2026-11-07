# Socialora Telegram — evde kurulum

Bu paket yalnızca `@SocialoraOfficial` ve `@SocialoraChat` için hazırlanmıştır. Threads ve FivePicked ile bağlantısı yoktur. Python standart kütüphanesini kullanır; AI aboneliği/API anahtarı veya ek sunucu gerekmez.

## Hazır olanlar

- 14 gün: kanala her gün 11.00 ve 19.30'da iki farklı İngilizce gönderi; gruba 2., 5., 9. ve 13. günlerde 17.00'de dört ayrı tartışma konusu. Bütün saatler Türkiye saati.
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

GitHub'daki kayıtlı secret sonradan okunamaz; mevcut tokeni BotFather'daki kendi botunuzdan alıp bu alana girmeniz gerekir. Tokeni sohbete, dosya paylaşımına veya komut satırı argümanına yazmayın. BotFather'dan tokeni revoke etmeyin: mevcut ControllerBot bağlantısını bozabilir. `setup` hiçbir mesaj göndermez, webhook'u değiştirmez. Başarısız doğrulama tokeni kaydetmez.

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

İlk günün 11.00 gönderisi “Start here” metnidir. Yayınlanınca Telegram'dan sabitleyin. Paket mevcut sabit mesajı değiştirmez.

## Günlük kullanım

```sh
socialora status                  # doğrulanmış durum ve sorunlar
socialora report                  # en fazla 8 satır Türkçe rapor
socialora pause                   # gelecekteki gönderimleri durdurur
socialora resume --queue-reviewed # sorunlar giderilince devam
sv down socialora-telegram        # servis motorunu kapatır
sv up socialora-telegram          # motoru yeniden açar
```

Duraklatma halihazırda Telegram'a ulaşmış isteği geri alamaz. Yayımlanmış içerik veya üye silinmez.

Rapor ve durum kayıtları `~/.local/share/socialora-telegram/` içindedir. Rapor otomatik olarak gruba gönderilmez; Türkçe iç rapor marka kanalına karışmaz. Üye sayısı günde bir kez okunur. Bot API'sinden site tıklamaları, satışlar veya geçmiş post görüntülenmeleri alınmış gibi raporlanmaz.

## Belirsiz yayın

`unknown` durumunda motor durur. Mesajın Telegram'da yayınlandığını görürseniz bağlantı sonundaki mesaj numarasıyla:

```sh
socialora resolve tg_v1_ORNEK --sent-message-id 123
```

Yayınlanmadığı doğrulanırsa `socialora resolve tg_v1_ORNEK --skip` ile atlayın. Otomatik yeniden gönderme yoktur. Sonra gerekirse farklı, incelenmiş bir içerik hazırlayın. Boş veritabanına geçerek veya yedekten körlemesine dönerek gönderilmiş mesajları tekrar kuyruğa almayın.

## İçerik bitince

Paket içerikleri tekrar döndürmez. 14 gün sonunda yeni gönderi yoksa bekler. İlk haftanın sonuçlarına göre gelecek haftayı ChatGPT/Antigravity'de **tek çalışmada** hazırlayıp `brand=Socialora`, `version=1` formatında yeni JSON ekleyin. Her yeni gönderinin benzersiz kimliği olmalı; eski kimliklerin metnini değiştirmeyin. Yeni haftayı `socialora import --file DOSYA --start YYYY-MM-DD` ile ekleyin. `import` mevcut servisi durdurmadan çalışabilir; yoğun işlemle aynı ana denk gelirse kısa süre sonra tekrar deneyin.

Fiyat, refill, kampanya ve müşteri sonucu içeriklerine kullanıcı onayı gerekir. Yeni içerikteki değişebilir ürün bilgilerini yeniden doğrulayın. Bu paket fiyat/refill veya süre garantisi yayınlamaz. Metin benzerliğinin anlam düzeyindeki kontrolü editoryal incelemenin parçasıdır; otomatik kontrol tam eşleşmeleri ve URL etiketleri değiştirilmiş kopyaları yakalar.

## Şu anda yapılmayanlar

- Mevcut webhook başka sistemdedir. Bu paket **gelen grup mesajlarını okumaz veya otomatik cevaplamaz**; `getUpdates`, `setWebhook`, `deleteWebhook` kullanmaz. Doğal, bağlama göre AI yanıtı için ayrıca doğrulanmış gelen mesaj bağlantısı ve ücretsiz API kotası gerekir. Hazır, alakasız yanıtlarla bunun yerini doldurmaz.
- Dış gruplara yazma, DM, üye ekleme, takas mesajı gönderme, çekiliş veya ödül başlatma yoktur.
- Telefon kapalıyken veya Android uygulamayı tamamen durdurduğunda çalışamaz. Runit süreç hatalarını toparlar; işletim sisteminin tüm Termux'u kapatmasını tek başına önleyemez.
- Bu makinedeki testler gerçek telefonun ekran kapalı çalışma testinin yerini tutmaz.

## Teknik doğrulama

```sh
python -m unittest discover -s tests -v
python socialora.py check-content
```

Testler Telegram'a mesaj yollamaz. Uygulama yalnızca izin verilen Telegram yöntemlerini kullanır; üçüncü taraf Python paketi gerektirmez. Sürüm: 1.0.0.
