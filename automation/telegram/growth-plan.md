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
