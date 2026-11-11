# Socialora — ilk 7 günün büyüme planı

## Hedef ve ölçüm

Öncelik, içerikten yararlanan gerçek üyeler ve getsocialora.com'a ilgili ziyaretçilerdir. Sadece gönderi sayısını artırmak tek başına yeni insanları kanala getirmez. Bu ilk sürüm içerik dağıtımını düzenler; dışarıdan keşif için aşağıdaki yerleşimler ve daha sonra onaylı ortaklıklar gerekir. Takipçi veya satış artışı garanti edilmez.

Başlangıç ölçümleri aktivasyon gününde `doctor` ile alınır. 7 gün sonunda kanal/grup üyesi, sitedeki Telegram UTM oturumları ve mümkünse dönüşümler karşılaştırılır. UTM linki eklemek analitik ölçümünün kurulduğu anlamına gelmez. Analitikte kampanya raporu erişimi yoksa tıklama ve satış için “veri yok” denir. Farklı günlerdeki toplam üyeden doğrudan hangi gönderinin üyelik getirdiği çıkarılmaz.

## Yayın düzeni

- Kanal: günde 5 yayın, 7 gün boyunca 35 içerik; content.json içinde her gün farklı saatler, gündüz araları 3–4 saat, geceleri ara; bunlar ilk deneme saatleridir, “en iyi saat” oldukları kanıtlanmış değildir.
- Grup: haftada ikiye yakın tartışma konusu, kanalın tüm içeriklerini ayrıca kopyalamak yok.
- İlk mesaj “Start here”. Yayınlandıktan sonra sabitlenir. Mevcut sabit mesaj otomatik değiştirilmez.
- Haftanın sonunda veriye göre bir konu veya saat değiştirilir. Aynı anda her şeyi değiştirmeyin.
- Takvim bitince eski gönderiler döngüye alınmaz; yeni ve incelenmiş bir paket gerekir.

## Site ve müşteri davetleri — metinler hazır, henüz yerleştirilmedi

Her yerleşim için Telegram'ın yönetici menüsünden ayrı, isimlendirilmiş kanal davet linki oluşturun. Mevcut davetleri iptal etmeyin. Burada verilen genel bağlantı `https://t.me/SocialoraOfficial` çalışır; fakat kaynak başına üyelik atfı vermez. Yalnızca UTM ekleyerek Telegram'ın davet istatistiği oluşmaz.

| Yerleşim | İngilizce metin | Davet linki adı |
| --- | --- | --- |
| Ücretsiz araç sonucu altı | “More practical creator tips, without another app to install. Join Socialora on Telegram.” Buton: “Get creator tips” | website_tools |
| Footer | “Free creator tools and practical content tips.” Buton: “Join our Telegram channel” | website_footer |
| Sipariş teşekkür sayfası | “While you wait, find useful tools and content ideas in our Telegram channel.” Buton: “Explore the channel” | website_thankyou |
| Sipariş onayı e-postası | “For practical content tips and free creator tools, you can join Socialora on Telegram: [channel invitation]. This is optional; order updates still arrive by email.” | customers |
| Genel destek yanıtı sonu | “If useful, our Telegram channel shares free tools and practical content tips: [channel invitation].” | support |

Gönderim veya müşteri listesine mesaj atma yapılmadı. Web sitesinde zaten ücretsiz izlenme akışına bağlı grup daveti var; onu yeni davetlerle karıştırmayın, silmeyin veya üyelik doğrulaması varmış gibi anlatmayın. Bu pakette website kodu değiştirilmedi.

## Yeni üye kazanımı: önce gerçek kitle

Kullanıcı mevcut üyelerin bot ağırlıklı olduğunu belirtti. Bu nedenle takas şu an öncelik değildir; mevcut üye sayısı erişim kanıtı olarak sunulmaz. Önce gönüllü website/müşteri davetleri ve ücretsiz, ilgili kataloglardan gerçek ilgi oluşturulur; gerçek görüntülenme ve etkileşim oluşursa ortaklık araştırılır.

İlgili küçük creator/marketing kanallarını konu uyumu, gönderi faydası ve gerçek görüntülenmeler üzerinden değerlendirin. Kaynak verisi olmadan üye/etkileşim rakamı uydurmayın. Gerçek erişim oluştuğunda uygun aday listesi hazırlayın. Sahiplere mesaj gitmeden önce kullanıcı onayı alın. Yarışma veya ödül olmadan ücretsiz araç rehberi gibi somut faydalı içerik etrafında takas teklif edilebilir.

## Grup yanıtları: sıradaki teknik iş

Eski webhook kullanıcının açık talebiyle 7 Kasım 2026 23.44 Türkiye saatinde kaldırıldı; boş olduğu API üzerinden doğrulandı. Mevcut bot ve kanal/grup yetkileri korundu. ControllerBot yeniden bağlanmayacak. Webhook kaldırılması üçüncü tarafın token erişimini iptal etmiş sayılmaz.

Aynı bot için yalnızca bir gelen mesaj tüketicisi hazırlanacak. Polling öncesinde güncel webhook kontrolü boş olmalı. Bekleyen güncellemeler silinmeyecek; kalıcı update_id ve işlenmiş mesaj kaydıyla tekrar yanıt önlenecek. Telefon kurulumu ve ücretsiz model kotası doğrulanmadan canlı yanıt açılmayacak. Doğal AI yanıtlarında önce bize yöneltilen anlamlı sorular ele alınır; konuşmanın kısa bağlamı kullanılır; herkese araya girilmez. Özel müşteri/sipariş bilgileri ücretsiz AI servisine gönderilmez. Ücretsiz API kotası doğrulanmadan ücretli çağrı veya otomatik yanıt açılmaz. Kota biterse genel kalıp yanıt üretmek yerine beklenir.

## Somut uygulama sırası ve tamamlanma ölçütü

1. Gelen mesaj alımı ve doğal yanıt: tek tüketici, kalıcı tekrar kontrolü, yalnızca ilgili sorular, doğrulanmış ücretsiz model kotası. Gerçek grup sorusuna test yanıtı görülmeden tamamlandı denmez.
2. Üye edinimi: mevcut kanal açıklaması ve sabit mesajı incele; ücretsiz ilgili katalogları doğrula; takas adaylarını gerçek erişim oluşana kadar beklet. Her aday için dil/konu uyumu ve erişilebilir gerçek metrikler. Dış iletişimden önce kullanıcının önceki onay sınırına uy.
3. Dönüşüm: içerikteki somut problemi ilgili araçla eşleştir. Site analitiğinde Telegram kampanyalarını gerçekten görebildiğini doğrula; erişim yoksa başarı rakamı üretme. Mevcut website→grup daveti ile dışarıdan kazanılan yeni kitleyi ayrı değerlendir.
4. Telefon aktivasyonu: paket yükleme, gizli token girişi, canlı yayın, ekran kapalı ve yeniden başlatma testi. Bunlar henüz tamamlanmadı.
5. Bir hafta sonra: erişilebilir görüntülenme/üyelik ve Telegram kaynaklı oturum/dönüşüm sonuçlarına göre bir değişiklik seç. Kullanıcının günde 5 gönderi talebi kod ve 7 günlük içerik takviminde birlikte uygulandı. Yayın kalitesini ve gerçek görüntülenmeleri değerlendir.

Bu liste hazırlık planıdır: katalog kaydı, ortaklık listesi, AI yanıtı veya analitik bağlantısı henüz tamamlanmış değildir.

## Haftalık editoryal brief

Yeni paketi hazırlarken önce yayın kaydını, geçen haftanın metinlerini ve erişilebilir analitik sonuçlarını okuyun. Yeni paket için benzersiz `tg_v2_...` kimlikleri kullanın. Aynı giriş, örnek, konu sırası veya CTA'yı tekrar etmeyin. Yaklaşık yarı pratik ipucu, kalan ücretsiz araç/rehber ve az sayıda anlamlı soru. Fiyat, refill, müşteri sonucu veya kampanya varsa önce kaynak ve kullanıcı onayı gerekir. İngilizce kısa, açık, markaya uygun; Türkçe rapor yalnızca sahibine. İyileştirme önerisini ve dayandığı ölçümü kaydedin.


## 9 Kasım 2026 — canlı durum ve 30 günlük organik büyüme işletim planı

Bu bölüm önceki kurulum öncesi notlarından daha günceldir. 9 Kasım'da kullanıcı `socialora reply-now` komutunun iki grup mesajını başarıyla yanıtladığını doğruladı (`update_id=341189560` ve `341189569`). Bu, **iki yanıtın Telegram'a gönderildiğini** kanıtlar; gün boyu kesintisiz otomatik yanıtı, cevapların kalite kontrolünü, yeni üye kazanımını veya satışları kanıtlamaz. Telefonda kayıtlı SQLite durumu ana kaynaktır; GitHub commit'i tek başına kurulu sürümü göstermez.

### Kuzey yıldızı: bot aktivitesi değil gerçek büyüme

1. Her hafta: Telegram kaynaklı **doğrulanmış** site oturumları, ilgili hizmet sayfası geçişleri ve mümkünse ödeme/sipariş dönüşümü. Ölçüm yoksa `veri yok`.
2. Gerçek katılım: yeni gerçek üyeler, birbirinden farklı gerçek katılımcıların özgün soruları ve faydalı konuşmalar. Mevcut bot ağırlıklı üye tabanı başarı metriği değildir.
3. Kalite: özgün içerik, kullanıcı sorusuna uygun doğru yanıt, yanlış fiyat/garanti içermeyen iletişim, spam şikâyetinden kaçınma. Yayın sayısı tek başına KPI değildir.

### Sürekli çalışan üç halka

**1. Keşif / edinim:** Mevcut sitedeki Telegram davetleri kontrol edilir: ücretsiz araç sonucu, hizmet sayfası, sipariş sonrası ve ilgili rehber. Her yerde net fayda vaadi ve doğru hedef (kanal veya grup) kullanılmalı; ücretsiz izlenme için mevcut bir defalık davet akışı bozulmaz. Sadece organik ve opt-in davet. Telegram araması için başlık/bio/pin doğal anahtar kelimeleri içerir. Ücretsiz kanal katalogları doğrulanır; CAPTCHA geçme veya davetsiz mesaj otomasyonu yok. İş ortaklığı adayları ancak gerçek görüntülenme kanıtından sonra değerlendirilir; dış mesaj kullanıcı onayı olmadan atılmaz.

**2. Tutundurma / güven:** Kanalda günde en fazla beş **kaliteli ve farklı** yayın (asla sayı doldurmak için değil): somut problem → hemen uygulanabilir çözüm → gerekirse ilgili link. İçerik karması başlangıç hipotezi: %50 uygulanabilir ipucu, %25 ücretsiz araç açıklaması, %15 kaynaklı hizmet eğitimi, %10 tartışma/SSS. Bu yüzdeler gözlenen performansa göre değişir. Grup gündeminde haftada yaklaşık iki özgün soru, kanaldan otomatik kopya yok. Gerçek sorulara bağlamlı, kısa, insan diliyle yanıt; emin olunmayan fiyat/teslimat/algoritma iddiaları yok; hassas müşteri verileri AI API'sine iletilmez. Yapay sohbet, sahte kullanıcı, toplu DM veya rastgele gruplara tanıtım yapılmaz. Robotik dil tespit edilirse otomatik yanıtı iyileştir; kullanıcıyı spam ile meşgul etme.

**3. Dönüşüm / ölçüm:** Site bağlantılarının `utm_source=telegram`, `utm_medium=channel|group`, `utm_campaign=<benzersiz_gonderi_id>` parametreleri korunur. Bunlar yalnızca izleme etiketidir; oturum/satış analitiği kurulu olmalıdır. Her 7 günde kampanya bazlı oturumlar, ilgili sayfa etkileşimi, siparişler ve gerçek üye değişimi değerlendirilir. Kaynaklara göre yeni üyeler için Telegram yönetici arayüzündeki adlandırılmış davet bağlantıları ve mevcut erişim varsa kanal istatistikleri kullanılır. Bot API `getChatMemberCount` yalnız toplamı verir; gerçek insan sayısı veya bireysel gönderi görüntülenmesi sağlamaz.

### Otonomi için öncelikli teknik işler (mevcut canlı motoru kırmadan)

- **P0 / güvenilirlik:** Tek poller/worker, servis yeniden açılışı, Android ekran kilidi, pil istisnası, otomatik başlatma ve yedek testlerini gerçek telefonda ayrı doğrula. Telegram'a yanıt gönderilmesi, tüm bu kontrollerin geçtiği anlamına gelmez. 429 ve diğer Gemini API hatalarını günlükte anahtar sızdırmadan raporla; belirsiz Telegram gönderimini körlemesine tekrar deneme.
- **P0 / içerik bitmesi:** Şu anki 37 öğelik `v2` kuyruğu yaklaşık 7 gün sürer ve otomatik sonsuz üretim yoktur. Günlük `status` raporunda önümüzdeki 72 saatte yeterli planlı içerik kalıp kalmadığı kontrol edilmeli. Eksilirse raporda açıkça belirtilmeli. Önceden gönderilmiş metinleri yeniden döndürme veya kontrolsüz AI içerik üretip yayınlama. Yeni haftalık paket benzersiz ID, kaynak kontrolü, editoryal doğrulama ve atomik içe aktarmayla hazırlanır; cihazdaki mevcut SQLite kuyruğu korunur.
- **P1 / editoryal kontrol:** Haftada bir, yanıtlanan ve yok sayılan gerçek soruların *kişisel verisiz* konu özeti; yayınlanan son içeriklerin teması ve açılış cümleleri incelenir. Benzer format/CTA yinelenirse yeni pakette çeşitlendir. İçerik kategorisi ve haftalık gönderi dağılımını ayrıca raporla.
- **P1 / ölçüm:** Site analitik erişimi sağlanırsa Telegram UTM oturumları ve sipariş dönüşümleri haftalık rapora eklenir. Erişim sağlanamazsa `veri yok` de; tıklama, kâr ve müşteri sayısı uydurma.
- **P2 / kaynak edinimi:** Sitedeki ilgili organik ziyaretçilere katılım davetini iyileştir; Telegram katalog başvurularının onay/durumunu takip et; gerçek görüntülenme oluştuğunda mikro topluluklarla iş birliği adaylarını *taslak* olarak hazırla. İlk mesajı veya takası kullanıcıdan yeni onay almadan gönderme.

### 30 gün uygulama sırası

- **1. hafta:** Telefon servis dayanıklılığı + 7 günlük kuyruk ve kaliteli cevaplar. Analytics ölçümü için gerçek erişimi doğrula. Sitedeki davet yerleşimlerinin mobil görünüm ve doğru hedef kontrolü.
- **2. hafta:** Önceki içeriklere bakarak ikinci özgün paket; gelen gerçek sorulara dayalı mini rehberler, açıklayıcı konuşmalar. UTM bazlı trafik ve üye değişimini karşılaştır.
- **3. hafta:** İşe yarayan iki formatı sürdür, düşük kaliteli olanı değiştir. Ücretsiz ilgili katalogların onay durumlarını kontrol et; reklam veya spam yok.
- **4. hafta:** 28 günlük net tablo: doğrulanmış site oturumu, mümkünse dönüşüm, gerçek katılım, yayın kalite/hata durumu. Veriye göre bir sonraki ayın ritmini belirle. Dört haftalık büyüme için sayı garantisi verilmez.

**Tam otonomi sınırı:** GitHub'daki bir plan dosyası Termux üzerinde kendiliğinden zamanlanmış iş başlatmaz. Şu an içerik otomatik gönderiliyor ve iki cevap test edildi; 7 günden sonra özgün içerik üretme, harici katalog/iş birliği ve gerçek web analitiği ayrıca bağlanmadıkça tamamen insansız çalıştığı iddia edilemez. Gönderi/yanıt sistemini baştan yazmak yerine önce bu üç boşluğu kapat.


## 9 Kasım — Socialora Creator Toolkit: yeni kullanıcı kazanım ürünü

**Uygulanan GitHub kodu:** `automation/telegram/socialora.py` içinde yalnızca özel komutlara cevap veren araç yönlendiricisi. Var olan gönderi takvimi ve doğal AI yanıt yönergeleri değiştirilmedi. **Canlı Termux dağıtımı ayrıca gereklidir; commit tek başına telefona kod yüklemez.**

### Kodları incelenerek seçilen araçlar

| Telegram grup komutu | Gerçek site aracı | Kullanıcıya sağladığı değer |
| --- | --- | --- |
| `/tools` | Komut listesi | Tek mesajda 5 ilgili seçenek |
| `/photo` | `/tools/social-media-photo-resizer` | Instagram, TikTok, YouTube için tarayıcıda fotoğraf boyutlandırma |
| `/blur` | `/tools/instagram-no-crop-blur-background` | Kırpma olmadan bulanık arka plan |
| `/score` | `/tools/instagram-account-scorecard` | Girilen profil verilerinden tahmini puan, paylaşılabilir kart; resmi Instagram verisi değil |
| `/thumbnail` | `/tools/video-frame-to-thumbnail` | Kullanıcının kendi videosundan kapak kare seçme |
| `/safezone` | `/tools/reels-tiktok-safe-zone-guide` | Reels / TikTok yazı güvenli alan kılavuzu |

**Doğruluk:** Bot doğrudan fotoğraf düzenlemez, dosya yüklemez veya puan hesaplamaz; kullanıcıyı mevcut tarayıcı tabanlı aracın **gerçek** işlevine götürür. Görüntü/özel veriler Telegram komutuyla bot sistemine gönderilmez. Bot yanıtında UTM etiketli tek araç bağlantısı yer alır. Komutlar yalnızca `@SocialoraChat` içinde ve kullanıcı tarafından istek gelince çalışır; kendi kendine reklam/DM/başka gruplara gönderi yapmaz. Gemini çağrısı gerektirmez, dolayısıyla pahalı API harcaması olmadan yönlendirme yapılır.

### Sıfır trafikten tanıtım yöntemi

1. **Önce ürünün çalıştığını ispatla:** Telefonun mevcut Python dosyasını yedekle. GitHub'daki yeni dosyayı ayrı geçici konuma alıp Python derleme doğrulaması yap. Mevcut tek servisi kontrollü yeniden başlat; `/tools` ve `/photo` komutlarını **kendi grup hesabından** göndererek tek yanıt, doğru URL, UTM ve eski AI soru yanıtlarının çalıştığını test et. Hata olursa hemen yedeğe dön; boş veritabanına geçme, tokeni açığa çıkarma.
2. **Yumuşak lansman:** Grup sabit karşılama mesajı uygun zamanda, mevcut kurallar ve izinlerle uyumlu şekilde komut listesini gösterebilir; zaten sabitlenmiş olan önemli kuralları silme/değiştirme. Kanala yalnızca **bir** yararlı tanıtım mesajı (örnek: fotoğrafı kırpmadan 4:5 boyuta getirme) eklenebilir; mevcut 5/gün takvimini spam yapacak biçimde çoğaltma. Tanıtım mesajları İngilizce ve doğal olacak.
3. **Paylaşılabilir çıktı:** Özellikle Account Scorecard'ın indirilebilir görsel kartını ve Photo Studio'nun önce/sonra örneklerini gerçek verilerle paylaşılabilir hale getir. Sahte sonuç, sahte kullanıcı yorumları, uydurma başarı hikâyesi ve Telegram'da spam yok.
4. **Dış topluluklar:** Yalnız ilgili creator/eğitim gruplarının kurallarına uygun, yöneticiye izinli tekil iş birliği önerileri hazırla. Kullanıcının onayı alınmadan üçüncü kişilere iletişim yok. Sadece dizin başvuruları ile organik büyüme garantisi verilmez.
5. **Ölçüm:** Komutlara verilen bot yanıtlarını (kişisel veri toplamadan) SQLite kayıtlarından say. UTM kampanyalarına bağlı gerçek site oturumları analitik erişim varsa kontrol edilir. Komut kullanımı = site tıklaması veya yeni üye **değildir**. Gerçek üyeleri ve dönüşümleri haftalık gözle.

**İkinci aşama opsiyonu:** Kullanıcıların Telegram sohbetinden çıkmadan araç kullanması istenirse, ayrı bir Telegram Mini App veya doğrudan bot içinde sınırlı metin tabanlı hesaplama modülü tasarla. Fotoğraf/kapak düzenleme mevcut tarayıcıda tutulur. İhtiyaç ve kullanım kanıtı olmadan 50 aracı yeniden yazma.


## 9 Kasım — izinli Creator Toolkit dağıtımı: ilk doğrulanmış adaylar

Dış topluluklara otomatik paylaşım, üye ekleme veya toplu DM yapılmaz. Bu tablo yalnızca herkese açık Telegram sayfalarından bulunmuş **iletişim araştırmasıdır**; iş birliği veya yöneticiden izin alınmış değildir.

| Aday | Herkese açık kaynak | Somut uyum | Durum |
| --- | --- | --- | --- |
| Trybe — Bloggers, influencers and collaborations | https://t.me/s/socialkyte | Creator büyümesi ve öğrenme içerikleri; ücretsiz fotoğraf boyutlandırma rehberi uygun olabilir | Aday; yönetici ve paylaşım kuralları doğrulanmalı |
| Creatorskit.app — UGC Jobs | https://t.me/s/creatorskit_app | UGC üreticileri; kendi videosundan thumbnail alma ve safe-zone açıklaması faydalı olabilir | Aday; ayrı platform/işletme, izinsiz tanıtım yok |
| SG Influencers & Content Creator | https://t.me/s/sgigshare | Mikro üreticiler ve içerik üretimi; no-crop örneği konuya uyabilir | Aday; yerel dil ve kurallar doğrulanmalı |
| BEST COLLABS FOR INFLUENCERS | https://t.me/collabsforinstainfluencers | Instagram içerik üreticileri, iş birliklerine odaklı | Aday; aktif moderasyon ve izin yolu doğrulanmalı |

İlk teklif: **tek bir ücretsiz, tarayıcıda çalışan araç** için kısa örnek + yöneticinin açık izni. İlk temas, yöneticinin yayımladığı resmî iletişim yöntemi üzerinden kişiye özel ve bir kez yapılır; olumlu yanıt alınmazsa gruba link gönderilmez. Başarılı iş birliği sayısını yalnız izin ve yayımlanmış bağlantı kanıtıyla raporla.

### Telegram Creator Toolkit canlı doğrulama sınırı

- GitHub'da Python testinin geçmesi veya botun canlı olması, Termux'un Toolkit içeren yeni `socialora.py` dosyasını kullandığını **kanıtlamaz**.
- Mevcut GitHub Actions `inspect` işlemi bot kimliği/yetkileri ölçer; Toolkit komutunu bir **gerçek grup üyesi** adına gönderip yanıtını doğrulamaz. Bot kendi mesajını göndermekle kullanıcı komutunu taklit etmiş olmaz.
- İlk gerçek `/tools` yanıtı görülene kadar durumu **canlı test edilmedi** olarak koru. Mevcut takvimi, Gemini cevaplarını ve sıraya alınmış gönderileri değiştirme.

---

## 11 Kasım 2026 — Dev İçerik Havuzu, Sahip DM Bağlantısı & Çoklu Kanal Sinerjisi

- **Sahip Raporlama Bağlantısı:** `TelegramPolling.node.js` yalnızca `@idrisoyt` yerine hem `@SocialoraSupport` hem `@idrisoyt` hesaplarından gelen `/start`, `/growth`, `/report` ve `/status` komutlarını tanıyacak şekilde güncellendi. `tgGrowthEngine01`, dış kanal takas eşiği (`avgLast5Views >= 25`) dolana kadar ortaklık mesajı üretmese bile, bağlı sahibe günde bir kez net büyüme + kuyruk özeti DM'i gönderir.
- **Anti-Robotik Editoryal Standart:** Kanal yayınlarında şu yapay kalıplar kesinlikle yasaktır: *"In today's digital landscape"*, *"Unlock your potential"*, *"Game-changer"*, *"Let's dive in"*, *"Skyrocket"*, *"Unleash"*, *"In conclusion"*, *"Remember that"*. Her gönderi bir sosyal medya stratejistinin gerçek notu gibi somut problem, net örnek veya kontrol listesi içerir.
- **Sıfır-Link Değer Paylaşımları & Çoklu Platform Beslemesi:** İçerik havuzunun yaklaşık yarısı site bağlantısı içermeyen, doğrudan kanala üye kazandıran ("bunu kaydet" / "içerik üreticisi arkadaşına ilet") uygulanabilir kancalar ve analizlerden oluşur; kalan kısım ise ilgili ücretsiz araçlara ve şeffaf hizmet rehberlerine yönlendirir. Telegram'da yüksek görüntülenme ve tartışma üreten konular Instagram Reels/Carousel ve Threads içerik havuzlarına da taşınır.
