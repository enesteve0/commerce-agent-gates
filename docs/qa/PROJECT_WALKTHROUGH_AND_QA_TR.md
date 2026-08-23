# commerce-agent-gates — Proje Gezintisi ve QA Raporu (Türkçe)

Görev: Depo genelinde kapsamlı doğrulama, keşfedilebilen her CLI yüzeyinin
canlı uçtan uca test edilmesi, bulunan sorunların anında giderilmesi ve nihai
çalışan ürünün belgelenmesi.

Uyarlama notu (görevin kendi §4 maddesi gereği): bu depo, çalışma zamanı
bağımlılığı sıfır olan bir Node.js komut satırı aracıdır. Sayfası, rotası,
formu, CRUD varlığı, kimlik doğrulaması veya tarayıcı çalışma zamanı yoktur.
Tarayıcı otomasyonunu zorlamak görevin "yığına uygun araç kullan" ilkesine
aykırı düşeceği için "ekran görüntüsü kanıtı", `docs/qa/evidence/`
altındaki terminal çıktı dökümleriyle yakalanmış ve aşağıya gömülmüştür;
CRUD/kimlik doğrulama/responsive/tarayıcı kalemleri kapsam defterinde
gerekçesiyle birlikte `NOT APPLICABLE` (uygulanamaz) olarak işaretlenmiştir.

---

## 1. Yönetici Özeti

- **Ürün**: `commerce-agent-gates` v2.0.0 — Next.js App Router projelerinde
  yapay zekâ kodlama ajanlarının yaptığı somut hata biçimlerini kodlayan üç
  fikirli statik analiz kontrolü (`no-mock-data-in-production`,
  `mutating-routes-must-be-guarded`, `queries-must-be-tenant-scoped`); npm CLI
  ve programatik API olarak yayımlanır, çalışma zamanı bağımlılığı sıfırdır.
- **Ne test edildi**: eksiksiz statik kalite kapısı (kurulum sağlığı, lint,
  biçimlendirme, testler, paketleme hijyeni, kendini kapıdan geçirme
  /dogfooding/) ve ürünün canlı yüzeyinin tamamı — her bayrak, her çıktı
  biçimi, çıkış kodu sözleşmesinin tamamı, tüm yapılandırma hata yolları,
  yürüyücü (walker) uç durumları (sembolik bağlantı döngüleri, aşırı büyük
  dosyalar), gerçek TTY altında renk davranışı, programatik API/CLI
  eşdeğerliliği ve CI'ın kullandığı paketlenmiş tarball kurulum yolu.
- **Nihai durum**: tüm statik kapılar soğuk çalıştırmadan geçiyor; canlı
  senaryoların tamamı sözleşmeye uygun; bilinen hiçbir proje kaynaklı
  düzeltilebilir hata veya uyarı kalmadı.
- **Envanterlenen yüzey**: 19 (16'sı canlı test edildi, 2'si platform/birim
  test kapsamıyla belgelendi, 1'i kabul edilmiş gözlem).
- **Bulunan kusur**: 3 (QA-001 biçimlendirme kapısı hatası; QA-002 boş taramada
  yürüyücü bildirimlerinin yutulması; QA-003 bilgi amaçlı JSON şeması gözlemi).
- **Düzeltilen kusur**: 2 (QA-001 ve QA-002 — her ikisi de düzeltme sonrası
  orijinal hatanın yeniden üretilmesiyle doğrulandı).
- **Kalan harici engel**: yok. §15'te iki ortamsal sınırlama belgelendi
  (Node 24 matrisi yalnızca CI'da; Windows posix normalizasyonu yerel Windows
  makine yerine birim testlerle kanıtlandı).

## 2. Test Ortamı

| Kale                        | Değer                                                                                                                                                            |
| --------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Tarih                       | 23.08.2026                                                                                                                                                       |
| Dal / işlemeler             | `master`, başlangıç `fb448ce`; görev geçmişi için `git log fb448ce..HEAD` (biçim kapısı düzeltmesi, boş tarama bildirimi düzeltmesi, QA raporları, denetim turu) |
| Çalışma zamanı              | Node v22.23.2, npm 10.9.8                                                                                                                                        |
| İşletim sistemi / kabuk     | macOS (darwin), zsh; TTY testleri için `script(1)` ile pty                                                                                                       |
| Test araçları               | `node --test` gömülü koşucu; ESLint 10.9.0 (`--max-warnings 0`); Prettier 3.9.6; publint 0.3.24                                                                  |
| Kanıt toplama               | Gerçek ikili çalıştırma (`node bin/commerce-agent-gates.mjs`), ANSI temizlenmiş dökümler `docs/qa/evidence/` altında                                             |
| Kanıtlardaki gizli bilgiler | Yok (tamamı sentetik fixture ağaçları)                                                                                                                           |

## 3. Statik Doğrulama Sonuçları

Son kod değişikliğinden sonra sıfırdan yeniden çalıştırılan temiz boru hattı:

| Kontrol                 | Komut                                 | Sonuç                                                           |
| ----------------------- | ------------------------------------- | --------------------------------------------------------------- |
| Bağımlılık ağacı        | `npm ls`                              | Temiz — 4 devDependency, fazladan/eksik paket yok               |
| Lockfile tutarlılığı    | `npm ci --dry-run`                    | `package.json` ile tutarlı                                      |
| Güvenlik açıkları       | `npm audit`                           | 0 güvenlik açığı                                                |
| Güncellik               | `npm outdated`                        | Güncel olmayan paket yok                                        |
| Lint                    | `eslint . --max-warnings 0`           | Geçti, **sıfır uyarı**                                          |
| Biçimlendirme           | `prettier --check .`                  | Geçti                                                           |
| Testler                 | `npm test`                            | **112/112 geçti**, 13 süit, 0 atlanan, 0 todo, stderr'de 0 bayt |
| Paketleme               | `npx publint`                         | Sorun yok                                                       |
| Kendini kapıdan geçirme | `node bin/commerce-agent-gates.mjs .` | Exit 0 — kapılar kendi deposundan da geçiyor                    |

Kanıtlar: `evidence/l37-final-tests.txt` (tam süit günlüğü),
`evidence/l38-final-dogfood.txt` (kendi kendine tarama).

Kaynak kodu uyarı taraması: üretim kodunda `TODO`/`FIXME`/`HACK`/`XXX` yok,
`console.*` yok, `eslint-disable` yok, `@ts-ignore` yok, bildirim üretmeyen
boş `catch {}` yok (`src/cli.mjs:224`, `src/lib/walk.mjs:88`,
`src/lib/walk.mjs:135` içindeki üç bare catch ya açık yürüyücü bildirimi
basıyor ya da sürüm raporlamasını `"unknown"`'a düşürüyor — bilinçli ve
belgelenmiş, sessiz değil). Hiçbir testte `.only`/`.skip` yok.

## 4. Uygulama Yapısı / Yüzey Genel Görünümü

Boru hattı: `walk.mjs` kaynak dosyaları deterministik biçimde keşfeder →
`config.mjs` yapılandırmayı yükler ve katı biçimde doğrular → her kontrol
modülü konumlu bulgu döndürür → `report.mjs` tek bulgu şeklini dört biçimleyici
ile işler → `cli.mjs` her şeyi 0/1/2 çıkış kodlarına çevirir. `src/index.mjs`
aynı motoru `runGates()` ile programatik olarak sunar. Kullanıcıya dönük
yüzeyler: varsayılan tarama, `--format pretty|json|sarif|github`, `--only/--skip`,
`--list`, `--help`, `--version`, `--config`, `--allow-empty`, `--no-color`,
çok kökenli konumsal yollar, satır içi `gate-exempt(reason)` direktifleri ve
yapılandırma dosyasının kendisi.

## 5. Tam Yüzey Envanteri

| #   | Yüzey                                                                            | Defter durumu         |
| --- | -------------------------------------------------------------------------------- | --------------------- |
| S1  | Varsayılan tarama, pretty biçim, temiz ağaç                                      | PASS                  |
| S2  | `--format json`, temiz + kirli                                                   | PASS                  |
| S3  | `--format sarif`, temiz + kirli                                                  | PASS                  |
| S4  | `--format github`, temiz + kirli                                                 | PASS                  |
| S5  | Kirli ağaç pretty raporu, konumlu bulgular                                       | PASS                  |
| S6  | `--list`                                                                         | PASS                  |
| S7  | `--help`                                                                         | PASS                  |
| S8  | `--version`                                                                      | PASS                  |
| S9  | Çıkış kodu sözleşmesi (0 temiz / 1 bulgu / 2 kullanım-yapılandırma)              | PASS                  |
| S10 | Boş dizin taraması                                                               | FIXED → PASS (QA-002) |
| S11 | `--allow-empty`                                                                  | FIXED → PASS (QA-002) |
| S12 | Var olmayan kök yolu                                                             | PASS                  |
| S13 | Bilinmeyen bayrak / değersiz bayrak / bilinmeyen biçim / hatalı `--only` kimliği | PASS                  |
| S14 | Yapılandırma hata yolları (8 varyant)                                            | PASS                  |
| S15 | Kök başına atıflı çok kökenli tarama                                             | PASS                  |
| S16 | Renk mantığı: TTY / pipe / `NO_COLOR` / `--no-color`                             | PASS                  |
| S17 | Yürüyücü sağlamlığı: büyük dosya bildirimi, sembolik bağlantı döngüleri          | PASS (S10 düzeltmesi) |
| S18 | Programatik API eşdeğerliliği (`runGates()` ↔ CLI JSON)                          | PASS                  |
| S19 | Paketlenmiş tarball kurulum duman testi                                          | PASS                  |

CLI aracı için uygulanamaz (gerekçeli): sayfa ekran görüntüleri, responsive
düzenler, formlar/CRUD, kimlik doğrulama/roller, tarayıcı konsolu/ağ, DOM
erişilebilirlik denetimleri. Platform notları: Windows yol normalizasyonu
birim testiyle kilitli (`test/walk.test.mjs` — "uses posix separators in
relative paths"); burada Windows makine bulunmadığı için canlı çalıştırma
yoktur. Node 24 yalnızca yerelde kurulu olmadığından CI matrisi tarafından
kapsanır (`.github/workflows/ci.yml`).

## 6. Yüzey Yüzey İnceleme

### Varsayılan Tarama — Pretty Biçim (Temiz Ağaç)

**Çağrı:** `commerce-agent-gates fixtures/pass` · **Erişim:** uygulanamaz (CLI)
· **Kanıt:** [`a01-pass-pretty.txt`](./evidence/a01-pass-pretty.txt)

Her kontrol için bir `PASS <kontrol-kimliği>` satırı, ardından dosya sayısını
içeren yeşil özet satırı basar. Çıktı deterministiktir (sıralı keşif, kararlı
sıralama).

```text
PASS  no-mock-data-in-production
PASS  mutating-routes-must-be-guarded
PASS  queries-must-be-tenant-scoped

✓ 3 checks passed (9 files scanned)
```

Çıkış kodu `0`. Etkileşimli öğe yok (bayraklar aşağıda kapsandı).

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** dolu temiz ağaç; tekrarlı deterministik çalıştırmalar
- **Çalışma zamanı gözlemleri:** yalnızca stdout, exit 0, not yok
- **Son durum:** PASS

### `--format json`

**Kanıt:** [`a02-pass-json.txt`](./evidence/a02-pass-json.txt),
[`b06-fail-json.txt`](./evidence/b06-fail-json.txt)

Her iki ağaçta da katı JSON olarak ayrıştırılır. Kirli ağaç `tool`, `version`
(2.0.0), `filesScanned: 10` ve pretty raporla birebir örtüşen 15 bulgu
bildirir:

```text
summary.findings = 15
summary.checks   = { no-mock-data-in-production: 8,
                     mutating-routes-must-be-guarded: 3,
                     queries-must-be-tenant-scoped: 4 }
```

- **Erişim:** Herkese açık CLI / betikler
- **Test edilen durumlar:** temiz + kirli ağaçlar
- **Çalışma zamanı gözlemleri:** her iki koşuda ayrıştırılabilir JSON; çıkış sırasıyla 0 ve 1
- **Son durum:** PASS

### `--format sarif`

**Kanıt:** [`a03-pass-sarif.txt`](./evidence/a03-pass-sarif.txt),
[`b07-fail-sarif.txt`](./evidence/b07-fail-sarif.txt)

Geçerli SARIF 2.1.0: `$schema` mevcut, tek run, sürücü kuralları = 3, sonuçlar
= 15; hepsinde `level: "error"` ve
`physicalLocation.region.startLine/startColumn` dolu. `informationUri`
normalize edilmiş: `https://github.com/enesteve0/commerce-agent-gates`
(`git+` kalıntısı yok).

- **Erişim:** Herkese açık CLI / kod tarama
- **Test edilen durumlar:** temiz + kirli ağaçlar
- **Çalışma zamanı gözlemleri:** her iki koşuda geçerli SARIF 2.1.0
- **Son durum:** PASS

### `--format github`

**Kanıt:** [`b08-fail-github.txt`](./evidence/b08-fail-github.txt)

Her satır kurala uygun iş akışı komutu
(`::error file=…,line=…,col=…,title=…::message`). Kaçışlama canlı doğrulandı:
iki nokta `%3A`, virgül `%2C` olarak yazılıyor. Temiz ağaç tek satırsonu
basıyor (annotation yok).

- **Erişim:** CI annotation akışı
- **Test edilen durumlar:** temiz (boş) + kirli (15 annotation)
- **Çalışma zamanı gözlemleri:** kurala uygun iş akışı komutları; kaçışlama doğrulandı
- **Son durum:** PASS

### Kirli Ağaç Pretty Raporu

**Kanıt:** [`b05-fail-pretty.txt`](./evidence/b05-fail-pretty.txt)

Üç kontrolün hepsinde 15 bulgu; her biri doğru `dosya:satır:sütun` ile. Ekilen
tuzaklar yakalanıyor: korumasız `DELETE` (billing), çıplak fonksiyon `POST`
(orders, webhooks), istek gövdesinden scoped sorgular, production'da reddetmeyen
yetki modülü, yarışan bayrak çözücüler (`process.env["DEMO_MODE"]`,
destructure edilmiş env), `.includes("sandbox_")` ve `token.test(/^demo_/)`
ile önek güveni — buna karşılık `page.tsx` içindeki yorum ve dizgi tuzakları
doğru biçimde sessiz kalıyor. Çıkış kodu `1`.

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** üç kontrolün aynı anda ihlali; yorum/dizgi tuzakları sessiz
- **Çalışma zamanı gözlemleri:** exit 1, bulgular stdout'ta, stderr boş
- **Son durum:** PASS

### `--list` / `--help` / `--version`

**Kanıt:** [`c09-list.txt`](./evidence/c09-list.txt),
[`c10-help.txt`](./evidence/c10-help.txt),
[`c11-version.txt`](./evidence/c11-version.txt)

`--list` üç kontrol kimliğini meta verilerdeki tek satırlık açıklamalarla
hizalarak basar. `--help` kullanım metni, seçenek referansı, kontrol
kimlikleri ve çıkış kodlarını gösterir. `--version` `2.0.0` yazar. Üçü de `0`
döner.

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** bilgi yüzeyleri
- **Çalışma zamanı gözlemleri:** exit 0, yalnızca stdout
- **Son durum:** PASS

### Boş Dizin / `--allow-empty` / Var Olmayan Kök

**Kanıt:** [`d12-empty.txt`](./evidence/d12-empty.txt),
[`d13-empty-allowed.txt`](./evidence/d13-empty-allowed.txt),
[`d14-missing-root.txt`](./evidence/d14-missing-root.txt),
[`g28-oversize.txt`](./evidence/g28-oversize.txt)

Boş ve var olmayan kökler eyleme geçirilebilir mesajla `2` döner;
`--allow-empty` durum satırıyla `0` döner. Tek dosyası 1 MiB sınırını aşan bir
ağaç başlangıçta _hiç açıklama vermiyordu_ — QA-002 kusuru; bu görevde
düzeltildi. Düzeltilmiş döküm artık şunu gösteriyor:

```text
note: …/big: src/huge.ts: skipped, larger than 1048576 bytes
error: no source files found under …/big. Point at a directory containing source, or pass --allow-empty if that is expected.
```

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** boş ağaç, yalnız-atlanan ağaç, var olmayan kök, --allow-empty ile ve onsuz — QA-002 düzeltilmiş hâli dahil
- **Çalışma zamanı gözlemleri:** stderr'de not + hata eşli çıkışı; çıkış kodları 2/0 korundu
- **Son durum:** FIXED → VERIFIED → PASS (QA-002)

### Kullanım Hataları

**Kanıt:** [`d15-bad-flag.txt`](./evidence/d15-bad-flag.txt),
[`d16-config-noval.txt`](./evidence/d16-config-noval.txt),
[`d17-bad-format.txt`](./evidence/d17-bad-format.txt),
[`d18-bad-only.txt`](./evidence/d18-bad-only.txt)

Bilinmeyen seçenek, değersiz `--config`, bilinmeyen `--format` ve `--only` içinde
bilinmeyen kontrol kimliğinin tamamı hassas mesajlarla `2` döner; bilinmeyen
biçim kullanım metnini de yeniden basar. Hiçbir yerde stack trace yok.

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** geçersiz bayrak, değersiz seçenek, bilinmeyen biçim değeri, bilinmeyen kontrol kimliği
- **Çalışma zamanı gözlemleri:** hassas stderr mesajları, stack frame yok
- **Son durum:** PASS

### Yapılandırma Hataları (8 varyant)

**Kanıt:** [`d19-cfg-unknown-top.txt`](./evidence/d19-cfg-unknown-top.txt) …
[`d26-cfg-missing-explicit.txt`](./evidence/d26-cfg-missing-explicit.txt)

Bilinmeyen üst düzey anahtar, bilinmeyen kontrol kimliği, bilinmeyen seçenek
adı, gerekçesiz muafiyet, geçersiz `scopePattern` regex'i, bozuk JSON, dizi
belgesi ve var olmayan açık `--config` yolu — her varyant `2` döner, suçlu
dosyayı/anahtarı adlandırır, geçerli alternatifleri listeler ve **sıfır stack
frame** basar (stderr `   at` için makineyle taranarak doğrulandı).

```text
error: …/commerce-agent-gates.config.json: checks.queries-must-be-tenant-scoped.exemptions[0].reason must state why this file is exempt; a bare path rots into a list nobody agreed to
```

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** sekiz farklı geçersiz yapılandırma durumu
- **Çalışma zamanı gözlemleri:** her biri exit 2; sıfır stack frame (makineyle savunuldu)
- **Son durum:** PASS

### Çok Kökenli Tarama

**Kanıt:** [`e27-multiroot.txt`](./evidence/e27-multiroot.txt)

Tek çağrıda taranan iki kök, bulgularını mutlak kök önekiyle üretir; atıf
belirsizleşmez; özet her iki kökü toplar.

- **Erişim:** Herkese açık CLI
- **Test edilen durumlar:** iki kök, kök başına atıf
- **Çalışma zamanı gözlemleri:** önekli bulgular; beklendiği gibi exit 1
- **Son durum:** PASS

### Renk Mantığı

**Kanıt:** [`h30-tty-color.txt`](./evidence/h30-tty-color.txt),
[`h31-nocolor.txt`](./evidence/h31-nocolor.txt),
[`h32-no-color-flag.txt`](./evidence/h32-no-color-flag.txt)

Gerçek pty altında FAIL satırları ANSI kırmızısı taşır (38 kaçış dizisi
sayıldı); pipe çıktısında hiç yoktur; `NO_COLOR=1` tty'de bile rengi kapatır;
`--no-color` aynı etkiyi yapar. Belgelenen öncelik sırasının ta kendisi.

- **Erişim:** Genel terminal
- **Test edilen durumlar:** tty, pipe, NO_COLOR, --no-color
- **Çalışma zamanı gözlemleri:** ANSI tam olarak tty olup vazgeçmeyen durumlarda
- **Son durum:** PASS

### Yürüyücü Sağlamlığı (Sembolik Bağlantı Döngüleri)

**Kanıt:** [`g29-symlink-cycle.txt`](./evidence/g29-symlink-cycle.txt)

Kendine atıf yapan sembolik bağlantı içeren dizin anında sonlanır, bağlanan
dosyayı bir kez tarar (kanonik yol takibi) ve normal biçimde tamamlanır.

- **Erişim:** Düşmanca dosya sistemi girdisi
- **Test edilen durumlar:** kendine atıf yapan dizin bağı + bağlı dosya
- **Çalışma zamanı gözlemleri:** anında sonlanma, bağlı dosyanın tek taraması
- **Son durum:** PASS

### Programatik API Eşdeğerliliği

**Kanıt:** [`i33-api-equivalence.txt`](./evidence/i33-api-equivalence.txt)

`runGates({ root: "fixtures/fail" })` sonucunun JSON'a çevrilmiş hâli, CLI'ın
`--format json` belgesiyle bayt bayt örtüşüyor (15 bulgu, aynı sıra, aynı
alanlar).

- **Erişim:** Gömülü tüketiciler
- **Test edilen durumlar:** aynı kök, API ve CLI üzerinden
- **Çalışma zamanı gözlemleri:** bayt bayt örtüşen JSON serileştirme
- **Son durum:** PASS

### Paketlenmiş Tarball Duman Testi

**Kanıt:** [`k35-packed-fail.txt`](./evidence/k35-packed-fail.txt),
[`k36-packed-pass.txt`](./evidence/k36-packed-pass.txt)

CI'ın işi yerelde yeniden üretildi: `npm pack` → yeni boş proje →
`npm install <tarball>` → `npx commerce-agent-gates`. Yayımlanan artefakt
kontrolleri listeler, sürümünü yazar, temiz ağaçtan geçer (exit 0) ve kirli
ağaçtan birebir aynı 15 bulguyla başarısız olur (exit 1).

- **Erişim:** İzole projede yayımlanmış artefakt
- **Test edilen durumlar:** kurulum + temiz ağaç + kirli ağaç
- **Çalışma zamanı gözlemleri:** sıfır kurulum uyarısı/deprecation; depo ikilisiyle özdeş kararlar
- **Son durum:** PASS

### Depo Yapılandırmasıyla Kendi Kendine Tarama

**Kanıt:** [`j34-dogfood-json.txt`](./evidence/j34-dogfood-json.txt),
[`l38-final-dogfood.txt`](./evidence/l38-final-dogfood.txt)

Depoyu taramak `commerce-agent-gates.config.json` dosyasını alır (`fixtures/fail`
ve `test` hariç tutulur, `flagAuthority` ezilir), 22 dosya tarar ve 0 döner —
kendi konularını adlandırdığı için belgelenmiş satır içi `gate-exempt`
direktifi taşıyan `src/checks/no-mock-data-in-production.mjs` dahil.

- **Erişim:** Depo CI kapısı
- **Test edilen durumlar:** gerçek yapılandırmayla 22 dosyalık öz-tarama
- **Çalışma zamanı gözlemleri:** exit 0; satır içi muafiyet onurlandırıldı
- **Son durum:** PASS

## 7. Tam İşlevsel Kapsam

| Davranış                                                                 | Test edildi             | Sonuç |
| ------------------------------------------------------------------------ | ----------------------- | ----- |
| Konumsal yollar (tek, çoklu, eksik)                                      | Evet                    | PASS  |
| Dört çıktı biçimi × iki fixture ağacı                                    | Evet                    | PASS  |
| `--only` / `--skip` seçimi (`=` sözdizimi dahil)                         | Evet                    | PASS  |
| 30+ çağrıda 0/1/2 çıkış kodları                                          | Evet                    | PASS  |
| stdout/stderr ayrımı (hatalar stdout'u kirletmez)                        | Evet                    | PASS  |
| Satır içi `gate-exempt(reason)` direktifi                                | Evet                    | PASS  |
| Tarama kökünde yapılandırma keşfi; alt dizinde doğru biçimde görünmemesi | Evet                    | PASS  |
| Tekrarlı çalıştırmalarda deterministik sıra                              | Evet (kararlı dökümler) | PASS  |

## 8. CRUD Testleri

Uygulanamaz — ürünün sahip olduğu bir veri deposu yok. En yakın karşılığı olan
yapılandırma üzerindeki create/read/update/delete davranışı S14'te kapsanır:
geçerli yapılandırla oluşturma, keşifle okuma, hatalı değişikliklerin hassas
hatalarla reddi. Gerekçesiyle birlikte `NOT APPLICABLE`.

## 9. Kimlik Doğrulama ve Yetkilendirme

Uygulanamaz — ağ, oturum veya rol yok. Kontrollerin _konu madyesi_ olan yetki
sarmalayıcıları ve kiracı kapsamı, üç kontrol-süitindeki 48 düşmanca parçacık
ve fixture sözleşmesiyle kapsamlı biçimde denenmiştir.

## 10. Tarayıcı / Çalışma Zamanı / Ağ Bulguları

Tarayıcı çalışma zamanı yok. Onun yerine izlenen çalışma zamanı sinyalleri:
süreç çıkış kodları, stdout/stderr ayrımı, TTY algısı, her senaryoda sinyalsiz
temiz sonlanma. Sunucu günlüğü karşılığı = test koşucusunun kendi stderr'i;
tüm süit boyunca 0 bayt ölçüldü. Beklenmedik uyarı yok.

Performans sinyalleri (§67 karşılığı): 112 testlik süit bir saniyenin altında
tamamlanıyor; bu deponun 22 dosyasını taramak anlıktır; CLI tasarımı gereği tek
geçişli ve senkron olduğundan istek şelaleleri, tekrarlayan ağ çağrıları veya
arayüz kilitlenmeleri yapısal olarak imkânsızdır. Bariz bir performans kusuru
gözlenmedi, dolayısıyla düzeltilen de olmadı.

## 11. Bulunan ve Düzeltilen Sorunlar

| ID     | Önem  | Kategori                  | Yüzey/Akış                    | Sorun                                                                                         | Kök Neden                                                                                           | Çözüm                                                                                                                                              | Doğrulama                                                                                                                                                                                                                                                                                                                   | Son Durum         |
| ------ | ----- | ------------------------- | ----------------------------- | --------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| QA-001 | Orta  | Derleme/Biçimlendirme     | Biçim kapısı                  | `prettier --check .` izlenmemiş görev-prompt markdown'ında başarısız oldu                     | Prettier yoksayılmayan tüm dosyalara bakar, izlenmemişler dahil                                     | Dosya adı `.prettierignore`'a eklendi (kullanıcı onaylı; baytlar korunur)                                                                          | `npm run format` yeniden çalıştırıldı → geçti                                                                                                                                                                                                                                                                               | FIXED → VERIFIED  |
| QA-002 | Orta  | UX/Çalışma zamanı teşhisi | Boş tarama yolu (S10/S11/S17) | `filesScanned === 0` olduğunda büyük-dosya/okunamayan-dizin bildirimleri sessizce yutuluyordu | CLI herhangi bir biçimleyici çalışmadan erken çıkıyor; `result.notices`'ı basan başka bir yol yoktu | `src/cli.mjs` artık exit-2 hatasının ve `--allow-empty` durumunun yanına `note:` satırları basıyor; iki regresyon testi eklendi; CHANGELOG girdisi | Düzeltme sonrası orijinal senaryo yeniden çalıştırıldı: not görünüyor, çıkış kodları aynı; süit 112/112. Öncesi/sonrası kanıtı: [`issues/QA-002-before.txt`](./evidence/issues/QA-002-before.txt) / [`issues/QA-002-after.txt`](./evidence/issues/QA-002-after.txt) (düzeltme öncesi ikili `3afdda3^`'den yeniden üretildi) | FIXED → VERIFIED  |
| QA-003 | Bilgi | API/Dokümantasyon         | `--format json`               | API sonucundaki `result.configPath` alanı JSON çıktısına serileştirilmiyor                    | Biçimleyici alandan önce yazılmış; 2.x ortasında makine şeması kararlılığı tercih edildi            | Yok (kabul edildi)                                                                                                                                 | Burada belgelendi                                                                                                                                                                                                                                                                                                           | EXPECTED BEHAVIOR |

Görev sırasında eklenen regresyon kapsamı: `test/cli.test.mjs` —
"explains skipped files when nothing scannable remains" ve "surfaces notices on
an allowed empty scan without failing".

## 12. Responsive Testler

Uygulanamaz — terminal aracıdır. Karşılık gelen boyut (çıktı genişliği
duyarlılığı) tesadüfen de gözlendi: raporlar satır tabanlıdır ve güvenle sarar.

## 13. Erişilebilirlik Testleri

Terminal erişilebilirliği karşılıkları doğrulandı: renk asla anlam taşıyan tek
araç değil (`FAIL`/`PASS` önekleri ve `✓`/`✖` simgeleri durumu düz metinde de
tekrarlar), `NO_COLOR` ve `--no-color` desteklenir, ekran okuyucu dostu
deterministik çıktı sırası vardır, fareye bağımlılık yoktur (zaten geçersiz).

## 14. Tarayıcı / Platform Kapsamı

- Node 22.23.2, matrisin tamamında yerel olarak çalıştırıldı.
- Node 24: push'ta CI matrisi tarafından kapsanır
  (`.github/workflows/ci.yml`); yerelde Node 24 kurulumu yok — ortamsal
  sınırlama, ürün eksikliği değil.
- Windows: yerelde çalıştırılamaz; bilinen win32 tehlikesinin (ters bölü
  ayraçların route-dosyası regex'lerini kırması) doğruluğu, keşif anındaki
  posix normalizasyonunu savunan birim testlerle kilitlidir.

## 15. Kalan Harici Kısıtlar

Proje kaynaklı hiçbir garantiyi engelleyen kısıt yok. Belgelenen ortam
sınırları: Node 24 kapsamı yalnızca CI'da; Windows kapsamı yalnızca birim
testlerle. Bunları yerelde tamamlamak ilgili platformların sağlanmasını
gerektirir.

## 16. Nihai Doğrulama Matrisi

| Alan                               | Kapı                                  | Durum |
| ---------------------------------- | ------------------------------------- | ----- |
| Kurulum                            | lockfile tutarlı, audit 0, outdated 0 | PASS  |
| Lint                               | `eslint . --max-warnings 0`           | PASS  |
| Biçim                              | `prettier --check .`                  | PASS  |
| Birim/entegrasyon testleri         | `npm test` — 112/112, atlama yok      | PASS  |
| Paketleme                          | publint + tarball duman testi         | PASS  |
| Canlı ürün                         | 19 yüzeylik defter, 38 kanıt dökümü   | PASS  |
| Kendini kapıdan geçirme            | bu depo üzerinde kapılar              | PASS  |
| Uyarılar (statik + çalışma zamanı) | proje kaynaklı düzeltilebilir sayı    | **0** |

## 17. Sonuç

Ürün, kendi felsefesinin talep ettiği hâlde sevk ediliyor: her kapı soğuk
çalıştırmadan yeşil, belgelenen her davranış gerçek ikiliye karşı yeniden
üretilmiş, keşfedilen her iki kusur kökten düzeltilip orijinal yeniden
üretimlerine karşı doğrulanmış ve envanterdeki her yüzey `PASS`,
`FIXED → VERIFIED → PASS`, `EXPECTED BEHAVIOR` ya da gerekçeli
`NOT APPLICABLE`/ortam notuyla sonuçlanmış durumda. Bilinen hiçbir proje
kaynaklı düzeltilebilir hata veya uyarı kalmamıştır.
