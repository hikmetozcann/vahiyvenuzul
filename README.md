# Vahiy ve Nüzul

İslam tarihinin kronolojik, kaynak destekli, çok dilli (TR/EN/AR + RTL) zaman çizgisi.

## Hedef

Peygamberlik döneminden vefâta kadar — her olay, her vahiy, her nüzul sebebi, aralarındaki ilişkiler — tek bir kronolojik veri modelinde, **sahih kaynak referansı zorunlu** olacak şekilde. Mimari geçmişe (doğum → bi'set öncesi) ve geleceğe (Hulefâ-i Râşidîn → Tâbiîn) genişletilebilir.

## Mimari

```
content/        # YAML veri (PR ile girilir)
  events/       # Tarihî olaylar
  people/       # Şahıslar (peygamber, sahabe, vd.)
  places/       # Mekânlar
  sources/      # Kaynak eserler (Buhârî, İbn Hişam, Vâhidî, ...)
  surahs/       # Sûre meta-verisi (nüzul sırası dahil)
  ayahs/        # Âyet kayıtları + nüzul sebebi linki

src/
  schemas/      # Zod şemaları — kaynaksız veri girilemez
  lib/          # İçerik yükleyici + referans bütünlük + timeline ekseni
  i18n/         # TR/EN/AR yapılandırması + RTL
  app/[locale]/ # Next.js App Router sayfaları
  components/   # Timeline, header, locale switcher

messages/       # UI metinleri (TR/EN/AR)
scripts/        # validate-content.ts — build öncesi doğrulama
```

## Geliştirme

```bash
npm install
npm run content:validate    # Tüm YAML'leri şemaya ve referanslara karşı kontrol et
npm run dev                 # http://localhost:3000
npm run typecheck
```

## Yeni veri ekleme

1. `content/<tip>/` altına `<id>.yaml` aç.
2. Şemayı `src/schemas/<tip>.ts`'den oku.
3. `sources[]` en az bir kayıt içermek **zorunda** — sıhhat derecesi (`sahih` / `hasan` / `daif` / `mutawatir` / `quran`) belirt.
4. `npm run content:validate` ile doğrula.
5. PR aç — yetkili editör onaylar.

## Sıhhat etiketleri

- `quran` — Kur'ân nassı
- `mutawatir` — Tevatür derecesinde
- `sahih` — Sahih hadis/rivayet
- `hasan` — Hasen
- `daif` — Zayıf (gösterilir ama uyarıyla)
- `mawdu` — Mevzû (uydurma) — sadece reddiye için

## Genişletme

- Yeni olay türü → `src/schemas/event.ts` içindeki `EventType` enum'una ekle + `messages/*.json`'a filtre etiketi.
- Yeni dil → `src/i18n/config.ts`'e ekle, `messages/<locale>.json` oluştur, RTL ise `rtlLocales` listesine ekle.
- Admin paneli → şu an PR akışı; ileride `src/app/[locale]/admin/` altında auth korumalı editör.
