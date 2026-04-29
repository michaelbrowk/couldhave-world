# Source Tabs — Техническое задание

**Дата:** 2026-04-29
**Статус:** Утверждено для реализации
**Тип:** Расширение существующего лендинга `war-cost-landing`
**Базовая спецификация:** `docs/superpowers/specs/2026-04-10-war-cost-landing-design.md`

---

## 1. Концепция

Сегодня лендинг показывает один сценарий: глобальные военные траты vs. гуманитарные альтернативы. Идея расширения — превратить страницу в **переключаемый набор сценариев пустых трат человечества**. Пользователь кликает таб, и весь хиро + блок альтернатив пересобирается под выбранный источник.

**Одно предложение:** «Не только война. Вот ещё, на что человечество спускает триллионы — и что можно было сделать вместо.»

Тон, сдержанность, типографика, монохром, accessibility-first — всё наследуется от базовой спецификации. Этот документ описывает **только дельту**.

---

## 2. Три источника (v1)

| ID | Лейбл | Сумма | Источник | Год |
|---|---|---|---|---|
| `war` | War / Война | **$2.887T** актуал 2025 → проекция 2026 ~$3.11T | SIPRI Trends in World Military Expenditure, 2025 (опубл. 27 апреля 2026) | 2025 |
| `tobacco` | Tobacco / Табак | **$1.7T/год** (медицина + потерянная продуктивность) | WHO 2022 update, 1.7% мирового ВВП | 2022 |
| `fossil-fuels` | Fossil fuels / Ископаемое топливо | **$7.4T/год** ($725B explicit + $6.7T implicit) | IMF Working Paper 2025/270 «Underpriced and Overused», данные за 2024 | 2024 |

Дефолт = `war`. Если URL `?source=...` отсутствует или указывает на неизвестный id — рендерим `war`.

### 2.1. Обновление цифр SIPRI

Текущий `data/military-spending.json` содержит проекцию `$3.184T`, основанную на SIPRI 2024 actuals + 4-летний geo-mean. SIPRI 27 апреля 2026 опубликовал данные за 2025 (`$2.887T`). Пересчёт:

- historical расширяется на `2025: 2887`
- `basedOnYear` → 2025
- `growthFactor` пересчитывается как 5-летний geo-mean (2020→2025 = 5 compounding lat) ≈ **1.0783**
- проекция 2026 = `2887 × 1.0783 ≈ $3,113B` = **~$3.11T**

Цифра становится ниже, чем была — это правильно, потому что фактический рост 2024→2025 (+6.2% nominal) оказался меньше предыдущего geomean (+8.2%). Сноска про SIPRI обновляется на «опубликовано 27 апреля 2026».

---

## 3. Категории альтернатив

Каждый source имеет свой массив `categories[]`. Часть id повторяется между табами (одна и та же «единица покупки», другой контекст), часть уникальна для таба.

**Важно:** одинаковый `id` между табами означает только переиспользование `unitCostUsd` и базовой математики. Переводы (`title`, `unit`, `compareUnit`) живут под ключом своего таба (`categories.{sourceId}.{categoryId}`) и могут отличаться по тону. Например, `world-hunger` под `war` звучит «годовой бюджет, чтобы покончить с голодом», а под `tobacco` — «то же, потеряно на табачную смертность».

### 3.1. War (наследуется без изменений)

Те же 10, что сейчас в `data/categories.json`. Мигрируют внутрь `data/sources/war.json`. id, unitCostUsd, sources, methodology — без правок.

### 3.2. Tobacco (8 категорий)

| id | unitCostUsd | scaleHint | Что |
|---|---|---|---|
| `lung-cancer-treatment` | $80,000 | perUnit | Полный курс лечения рака лёгких (хирургия + химио + иммунотерапия) |
| `smoking-cessation` | $300 | perUnit | Программа отказа от курения на одного человека (НЗТ + behavioral support, USPSTF/CDC) |
| `mpower-country` | $100,000,000 | totalSolution | Полная имплементация WHO MPOWER пакета на страну на год |
| `tb-treatment` | $600 | perUnit | DOTS-курс лечения туберкулёза (WHO/StopTB) — курение увеличивает риск TB-смерти |
| `copd-care-year` | $5,000 | annualNeed | Годичный уход за пациентом с ХОБЛ (LMIC, GOLD) |
| `child-vaccination` | $9,500,000,000 | annualNeed | Шарится с war — годовой бюджет глобальной детской иммунизации |
| `world-hunger` | $33,000,000,000 | annualNeed | Шарится с war |
| `clean-water` | $114,000,000,000 | annualNeed | Шарится с war |

### 3.3. Fossil fuels (8 категорий)

| id | unitCostUsd | scaleHint | Что |
|---|---|---|---|
| `renewable-transition` | $1,000,000,000 | perUnit | Шарится с war — 1 GW solar PV (IRENA 2024) |
| `rainforest-protection` | $45,000,000,000 | totalSolution | Шарится с war |
| `clean-cooking-lmic` | $10,000,000,000 | annualNeed | Универсальный доступ к чистым плитам в LMIC, IEA Clean Cooking Outlook |
| `climate-adaptation-africa` | $50,000,000,000 | annualNeed | Климатическая адаптация Африки, AfDB / UNEP Adaptation Gap Report |
| `building-retrofit` | $1,500,000,000,000 | totalSolution | Глобальный retrofit зданий до net-zero, IEA NZE 2050 |
| `public-transit-cities` | $5,000,000,000 | perUnit | Современная BRT-система на крупный город (World Bank) |
| `grid-storage-100gwh` | $40,000,000,000 | perUnit | 100 GWh аккумуляторного хранения (BloombergNEF 2024) |
| `world-hunger` | $33,000,000,000 | annualNeed | Шарится — символ морального выбора |

Источники для новых категорий проставляются на этапе наполнения JSON (Plan Task: «Naturalise category sources»). До тех пор каждая запись имеет хотя бы один валидный URL.

---

## 4. Архитектура данных

### 4.1. Файловая структура

```
data/
├── sources/
│   ├── war.json
│   ├── tobacco.json
│   └── fossil-fuels.json
├── sources.schema.ts        # Zod схема + типы для одного source
└── sources.index.ts         # Loader: импортирует три JSON, валидирует, экспортирует Map<id, Source>
```

Удаляются (после миграции):
- `data/military-spending.json`
- `data/military-spending.schema.ts`
- `data/categories.json`
- `data/categories.schema.ts`

Их сегодняшнее содержимое полностью переезжает в `data/sources/war.json` + общая `sources.schema.ts`.

### 4.2. Форма одного source-файла

```ts
type Source = {
  id: 'war' | 'tobacco' | 'fossil-fuels';
  labelKey: string;            // i18n key, например `sources.war.label`
  projection: {
    totalUsd: number;
    basedOnYear: number;
    baseAmountUsd: number;
    growthFactor?: number;     // optional — для tobacco/fossil-fuels не используется (см. ниже)
    growthBasis: string;
  };
  historical?: { year: number; totalUsd: number; actual: boolean }[]; // только для war
  source: string;
  sourceUrl: string;
  lastUpdated: string;
  categories: Category[];      // та же форма, что сейчас
};
```

Tobacco и fossil-fuels используют **flat** проекцию: `growthFactor` отсутствует, `totalUsd === baseAmountUsd`, `growthBasis` = `"Annual figure used as a constant rate; not projected"`. TickingCounter тогда тикает с константной ставкой (totalUsd / секунд_в_году), что физически верно — мы не утверждаем, что 2026 будет больше 2024.

### 4.3. Schema валидация

`sources.schema.ts` — единственный источник истины Zod-типа. На сборке (или в тестах) каждый JSON прогоняется через `Source.parse()`. Если хоть один не валидируется — билд падает.

---

## 5. UI / interaction

### 5.1. Размещение

Табы рендерятся **над хиро-блоком**, под locale switcher (если он на верху страницы; иначе над первой текстовой строкой). Это первое, что видит пользователь — потому что выбор сценария задаёт контекст всему ниже.

### 5.2. Стилистика

- Шрифт: моно (как существующие rate/methodology подписи).
- Размер: `text-xs md:text-sm`, `tracking-[0.18em]`, `uppercase`.
- Активный таб: `border-bottom 2px var(--text-primary)`, цвет `var(--text-primary)`.
- Неактивный: цвет `var(--text-secondary)`, hover → `var(--text-primary)`.
- Между табами: горизонтальный gap `1.5rem` (`gap-6`).
- Никаких иконок. Только текст лейбла.
- На mobile (≤ 640px): полоска `overflow-x-auto`, `flex-nowrap`, `scrollbar-none`.

### 5.3. Поведение

При клике на неактивный таб:

1. URL обновляется через `router.replace('/?source=tobacco', { scroll: false })`. Никакого скролла страницы.
2. `<SourceSwitcher>` ребилдит подкомпоненты:
   - `<SourceHero>` (caption, counter, rate, methodology) перерисовывается с fade-in opacity 0→1 за 240ms. Старый контент исчезает мгновенно (без out-fade) — двойной кросс-фейд утяжелил бы ощущение. Layout-jump гасится `min-h` на трёх местах: caption-строке, counter-блоке (учитывает максимальную длину чисел всех табов), rate-строке.
   - `<TickingCounter>` перемонтируется (через `key={sourceId}`), т.е. ресетится в актуальное значение «прошло секунд × ставка» и продолжает тикать.
   - `<SourceCategories>` перерисовывается с тем же fade-in.
3. Mixpanel-событие `source_switch` (см. §7).

### 5.4. Reduced-motion

При `prefers-reduced-motion: reduce` fade отключается, замена контента — instant. Таб всё равно подсвечивается активным состоянием, табинг по клавиатуре работает (Arrow Left/Right между табами + Enter).

---

## 6. State + код

### 6.1. Дерево компонентов

```
app/[locale]/page.tsx                  (Server Component)
└── <SourceSwitcher initialSource>     (Client Component, "use client")
    ├── <SourceTabs />                 (uses useSearchParams + router.replace)
    ├── <SourceHero source />          (caption, TickingCounter, rate, methodology)
    └── <SourceCategories source />    (map source.categories → CategoryRow)
```

### 6.2. SourceSwitcher

Сайт собирается через `output: 'export'` (статический экспорт). У статического экспорта `searchParams` на сервере отсутствует — все страницы пререндерятся в один HTML на locale. Это значит:

- HTML, отдаваемый на любой URL `/[locale]?source=*`, всегда отрендерен с **дефолтным** source (`war`).
- Клиент после гидрации читает `useSearchParams()` и, если параметр не `war`, переключается с fade-in на нужный source.
- Возможен короткий flicker (HTML → JS-смена), митигируется через CSS `[data-source]` атрибут на root + Tailwind variants, чтобы хотя бы tab-active state синхронно подсветился ещё до hydration.

Реализация:

```tsx
'use client';
const params = useSearchParams();
const activeId = parseSourceId(params.get('source')) ?? 'war';
const source = sourcesById.get(activeId);
```

Все три source-объекта импортируются статически в SourceSwitcher (50KB суммарно — проверим в Plan-задаче «bundle-size guard»; если > 100KB — переходим на dynamic import per tab).

### 6.3. SourceTabs

Чистая презентация + клик-хендлер:

```tsx
const router = useRouter();
const onSelect = (id: SourceId) => {
  router.replace(`?source=${id}`, { scroll: false });
};
```

Ручной aria-роли: `role="tablist"` на контейнере, `role="tab"` + `aria-selected` на каждом. Контент справа имеет `role="tabpanel"` и `aria-labelledby` пары с табом.

### 6.4. TickingCounter

Уже принимает `projection` пропом — менять не надо. Только убедиться, что `<TickingCounter key={sourceId} ... />` корректно перемонтируется.

Для tobacco/fossil-fuels (нет growthFactor) — `projection.totalUsd` используется напрямую как «годовой ровный поток», ставка `= totalUsd / секунд_в_году`. Логика TickingCounter уже совместима, потому что она и сейчас принимает `projection.totalUsd` и делит на длину года.

---

## 7. Аналитика (Mixpanel)

### 7.1. Новое событие

```ts
'source_switch' {
  from: SourceId,
  to: SourceId,
  locale: Locale,
  via: 'click' | 'url',  // url = пользователь пришёл со ссылкой ?source=...
}
```

### 7.2. Изменения в существующих событиях

- `page_view`: дополнить полем `initial_source: SourceId` (читается из URL на старте сессии).
- `category` (клики по строке категории): дополнить `source: SourceId`, чтобы можно было сегментировать.

### 7.3. Реализация

Существующий `components/analytics/Analytics.tsx` уже делает делегацию через data-атрибуты. Расширяем:

- `<button data-mp-event="source_switch" data-mp-source="tobacco">Tobacco</button>` — на каждый таб.
- В обработчике клика: при `data-mp-event="source_switch"` подтягиваем текущий `from` из URL и шлём событие.
- Для `via: 'url'` — отдельный one-shot хук в SourceSwitcher: на маунте, если `searchParams.has('source')`, шлём событие.

---

## 8. i18n

### 8.1. Структура словарей

`messages/{en,ru,es,de,fr}.json` пополняется секцией:

```json
{
  "sources": {
    "war":          { "label": "War",          "caption": "...", "rate": "...", "methodology": "..." },
    "tobacco":      { "label": "Tobacco use",  "caption": "...", "rate": "...", "methodology": "..." },
    "fossil-fuels": { "label": "Fossil fuels", "caption": "...", "rate": "...", "methodology": "..." }
  },
  "categories": {
    "war":          { "cancer": {...}, "malaria": {...}, ... },
    "tobacco":      { "lungCancer": {...}, "cessation": {...}, ... },
    "fossil-fuels": { "renewable": {...}, "rainforest": {...}, ... }
  }
}
```

### 8.2. Миграция

Текущий ключ `categories.cancer.title` → `categories.war.cancer.title`. Обновляем `getCategoryDictKey()` в `app/[locale]/dictionaries.ts`, чтобы он принимал `(sourceId, categoryId)`.

### 8.3. Объём перевода в v1

Проект сегодня поддерживает 4 локали: `en`, `de`, `es`, `fr` (русского нет — проверено по `messages/` и `LOCALES` в `dictionaries.ts`).

- **EN**: полный перевод всех новых ключей.
- **DE, ES, FR**: оставляем EN-фолбэк через явный fallback в `getDictionary` / `interpolate` — если ключ отсутствует, берём из `en.json`. Полный профессиональный перевод — отдельный PR с переводчиком.

Это сознательный YAGNI-trade-off: 3 локали × 2 новых таба × ~12 ключей = 70+ строк, которые я не могу качественно перевести на DE/ES/FR без переводчика. Лучше показать EN-фолбэк, чем фейковый машинный перевод.

---

## 9. Файлы

### 9.1. Новые

- `data/sources/war.json`
- `data/sources/tobacco.json`
- `data/sources/fossil-fuels.json`
- `data/sources.schema.ts`
- `data/sources.index.ts`
- `lib/sources.ts` — мелкие утилиты: `parseSourceId`, `isValidSourceId`, `SOURCE_IDS` константа
- `components/sources/SourceSwitcher.tsx`
- `components/sources/SourceTabs.tsx`
- `components/sources/SourceHero.tsx` (выделение текущего хиро в отдельный компонент)
- `components/sources/SourceCategories.tsx` (выделение текущего блока категорий)
- `tests/source-switcher.spec.ts` (Playwright: смена таба, URL state, fade-in)
- `tests/sources-data.test.ts` (Vitest: каждый JSON валидируется по схеме, totalUsd > 0, ≥ 6 категорий)

### 9.2. Изменяемые

- `app/[locale]/page.tsx` — заменяет inline-хиро + categories на `<SourceSwitcher>`
- `app/[locale]/dictionaries.ts` — `getCategoryDictKey(sourceId, categoryId)`, добавление `sources` секции в Dictionary типе
- `messages/en.json` — новые ключи (полный перевод)
- `messages/es.json`, `messages/de.json`, `messages/fr.json` — пока EN-фолбэк, без правок; в `dictionaries.ts` добавить fallback-логику и проверить тестом
- `components/analytics/Analytics.tsx` — обработка `source_switch`, расширение `category` события полем source
- `components/categories/CategoryRow.tsx` — принимает `sourceId` для аналитики (только проброс, рендер не меняется)
- `lib/site-config.ts` — если используется в metadata, проверить что не ломается

### 9.3. Удаляемые (после успешной миграции)

- `data/military-spending.json`
- `data/military-spending.schema.ts`
- `data/categories.json`
- `data/categories.schema.ts`

---

## 10. Тесты

### 10.1. Unit (Vitest)

- `tests/sources-data.test.ts` — каждый JSON парсится Zod-схемой; totalUsd > 0; ≥ 6 категорий; нет дубликатов id; все sourceUrl — валидные URL.
- `tests/source-id-parsing.test.ts` — `parseSourceId`: валидные → возвращает; невалидные → null.

### 10.2. E2E (Playwright)

- `tests/source-switcher.spec.ts`:
  - Дефолт → таб "War" активный, URL без `?source=`
  - Клик на "Tobacco" → URL = `?source=tobacco`, хиро-цифра меняется, активный таб обновляется
  - Прямой заход на `/?source=fossil-fuels` → активный fossil-fuels с первой отрисовки
  - Клик на текущий активный таб → ничего не меняется (no-op)
  - `prefers-reduced-motion` → нет fade-анимации, контент меняется instant
  - Аxe-core accessibility check на каждом из 3 состояний

### 10.3. Lighthouse

Без регрессий vs main: 100/100/100/100 на проде. Проверка в CI на финальном этапе.

---

## 11. Дизайн-проходы (обязательные)

После реализации, перед merge:

1. **`design-taste-frontend`** — layout-ритмика табов, типографика, отступы, hover.
2. **`emil-design-eng`** — fade-таймнинг, перемонтаж счётчика, focus-кольца, keyboard nav.
3. **`impeccable`** — финальная полировка перед мерджем.

Этот трёхступенчатый pass — фиксированная конвенция проекта (см. базовый спек §15).

---

## 12. Out of scope (v1)

- Pretty URLs (`/tobacco` вместо `?source=tobacco`) — потребуют отдельной маршрутизации с `generateStaticParams`. Можно добавить как v2, если понадобится для шаринга.
- Per-source OG-картинки — пока одна общая.
- Полный перевод ES/DE/FR — отдельный PR.
- Анимации сложнее opacity fade (slide, морфинг цифр) — мешают спокойному тону, не делаем.
- Сравнения "across" источников ("сколько лет табака равно одному году войны") — потенциально мощный UX, но требует отдельного мини-блока + перевода. v2.
- Кастомные favicon/title под таб.

---

## 13. Риски и подводные камни

| Риск | Митигация |
|---|---|
| Bundle size: 3 source-JSON статически импортируются | Замерим. Если > 100KB total — переезд на dynamic import per tab |
| TickingCounter «прыгает» при перемонтировании | `key={sourceId}` гарантирует чистый ремонт; убедиться, что нет flicker за счёт `min-height` на контейнере |
| URL state vs SSR в static export | Дефолт всегда `war` в HTML; ?source= перехватывается на клиенте после hydration. Краткий «flicker» возможен — митигируется через CSS `[data-source]` атрибут на root + Tailwind variants, чтобы хотя бы tab-active state синхронно подсвечивался |
| Шаренные категории дублируются в bundle | OK — это 200 байт каждая, JSON gzip съест |
| `prefers-reduced-motion` нарушится при перемонтировании | Тестируется в e2e, использовать `motion-safe:` Tailwind вариант |
| Регрессия аналитики (`category` event для существующего war-flow) | E2E проверяет, что `source: 'war'` шлётся при клике на категорию в дефолтном табе |

---

## 14. Definition of done

- [ ] 3 source-JSON созданы, валидируются схемой, наполнены проверенными числами + источниками
- [ ] SIPRI 2025 actuals перенесены в `war.json`, проекция 2026 пересчитана
- [ ] SourceSwitcher + SourceTabs + SourceHero + SourceCategories реализованы
- [ ] URL deep-link работает (`/?source=tobacco` рендерит активный таб)
- [ ] Mixpanel `source_switch` шлётся, `page_view` включает `initial_source`, `category` включает `source`
- [ ] EN-словарь обновлён полностью; DE/ES/FR падают на EN-фолбэк через явную fallback-логику в `getDictionary`, без ошибок в рантайме
- [ ] Все unit-тесты зелёные
- [ ] Все Playwright e2e зелёные, включая reduced-motion
- [ ] Lighthouse 100/100/100/100 на проде
- [ ] Дизайн-passes (`design-taste-frontend`, `emil-design-eng`, `impeccable`) применены, коммиты помечены
- [ ] Старые `military-spending.*` и `categories.*` удалены, нигде не импортируются
- [ ] PR проходит существующий CI (biome, vitest, playwright)
