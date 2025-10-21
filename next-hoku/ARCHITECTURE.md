# Next.js + Supabase Architecture (FSD-based)

> Компактный архитектурный гайд для разработки через Claude Code

---

## 1. Quick Decision Matrix

| Что просит пользователь | Тип | Где создавать | Файлы |
|------------------------|-----|---------------|-------|
| "Добавь страницу /clubs" | Page | `views/clubs-list/ui/` + `app/(routes)/clubs/` | `ClubsListPage.tsx`, `page.tsx` (wrapper) |
| "Добавь кнопку избранного" | Feature | `features/add-club-to-favorites/ui/` + `api/` | `FavoriteButton.tsx`, `add-favorite.ts` (action) |
| "Покажи карточку клуба" | Entity UI | `entities/club/ui/` | `ClubCard.tsx` |
| "Получи клубы из БД" | Entity API | `entities/club/api/` | `service.ts`, `actions.ts` |
| "Добавь список клубов" | Widget | `widgets/club-list/ui/` + `model/` | `ClubList.tsx`, `use-clubs.ts` |
| "Создай кнопку/инпут" | UI Primitive | `shared/ui/button/` | `Button.tsx` |
| "Добавь форму создания клуба" | Feature | `features/create-club/ui/` + `api/` + `model/` | `CreateClubForm.tsx`, `create-club.ts`, `schemas.ts` |
| "Добавь поиск клубов" | Feature | `features/search-clubs/ui/` + `model/` | `SearchInput.tsx`, `use-search.ts` |
| "Покажи отзывы о клубе" | Widget | `widgets/club-reviews/ui/` | `ClubReviews.tsx` |
| "Добавь утилиту форматирования" | Shared Util | `shared/lib/utils/` | `format.ts` |

---

## 2. Правила для Claude Code

> **ВАЖНО:** Перед созданием любого кода - проверить на дубликаты и спросить пользователя

### ⚠️ АДАПТАЦИЯ FSD ДЛЯ NEXT.JS APP ROUTER

**КРИТИЧЕСКИ ВАЖНО:** Слой `pages/` переименован в `views/` чтобы избежать конфликта с Next.js Pages Router.

**Правильные импорты страниц:**
```typescript
// ✅ ПРАВИЛЬНО (прямой импорт из ui/)
import { HomePage } from "@/views/home/ui/HomePage";
```

**Public API (`index.ts`):**
- ✅ `widgets/{widget-name}/index.ts`
- ✅ `features/{feature-name}/index.ts`
- ✅ `entities/{entity-name}/index.ts`
- ✅ `shared/{category}/{name}/index.ts`
- ✅ `views/{view-name}/index.ts` — теперь разрешено (переименовали pages → views)

---

### Перед созданием компонента/функции:

1. **Сканировать проект на дубликаты** (использовать Grep/Glob):
   ```
   - Ищу похожий функционал: "favorite", "like", "toggle"...
   - Проверяю entities/, features/, shared/
   ```

2. **Если найден похожий код:**
   - Сообщить пользователю: "Нашёл похожий компонент X в Y. Переиспользовать или создать новый?"
   - Показать найденный код
   - Дождаться решения пользователя

3. **Если компонент может быть переиспользуемым:**
   - Спросить: "Этот компонент может использоваться в других местах. Положить в `feature/` или сразу в `shared/`?"
   - Объяснить разницу (feature = уникален для фичи, shared = используется везде)

4. **Если видишь возможность для улучшения архитектуры:**
   - Компонент используется в 2+ местах → предложить вынести в `shared/`
   - Дублирующийся код → предложить рефакторинг
   - НЕ делать рефакторинг без явного согласия пользователя

### 5. Quality Check
**Обязательно перед коммитом:**
- Запустить `npm run typecheck` — проверка TypeScript ошибок
- Запустить `npm run lint` (где доступно) — проверка ESLint ошибок
- Исправить ВСЕ ошибки

### 6. Commit Proposal
Claude предлагает commit message по стандарту.

### 7. Code Review & Deploy
Пользователь ревьюит код, коммитит изменения вручную, тестирует в соответствующем окружении.

## Стандарт коммитов

**Формат:** `<type>: <детальное описание с конкретикой>`

### Типы коммитов

**Для всех репозиториев:**
- `feature` — новая функциональность или фича
- `fix` — исправление багов
- `refactor` — рефакторинг кода без изменения поведения
- `chore` — техническая работа (dependencies, конфигурация, build scripts)
- `perf` — оптимизация производительности
- `docs` — только документация

**Специфичные типы:**
- `migration` — миграции БД и операции с данными (только playtennis-supabase)
- `style` — UI/визуальные изменения, НЕ code style (playtennis-app, playtennis.ru)
- `function` — новые функции/фичи в backend (альтернатива для playtennis-supabase)

### Примеры

```
feature: add match creation flow with club selection and NTRP filtering
fix: resolve keyboard dismissal issue on phone input screen
refactor: extract shared button styles into Button component
chore: update expo-router to v4.1.2
migration: add 2 tennis clubs (Balashiha Tennis Center, Tennis-self)
migration: delete 15 duplicate clubs by coordinates
style: implement design system with realistic shadows and depth
```


### При работе с кодом:

**✅ Делать:**
- Проверять существующий код перед созданием нового
- Задавать вопросы при неоднозначности (feature vs shared)
- Предлагать улучшения архитектуры
- Ждать подтверждения пользователя

**❌ НЕ делать:**
- Создавать дубликаты без проверки
- Самостоятельно решать про рефакторинг
- Перемещать код между слоями без согласия
- Предполагать где должен быть код - спросить

### Примеры вопросов:

```
"Нашёл компонент FavoriteButton в features/club-favorites/.
Хочешь переиспользовать его или создать новый для матчей?"

"Этот SearchInput может использоваться для поиска клубов и пользователей.
Положить в features/search-clubs/ или сразу в shared/ui/?"

"Вижу что ClubCard используется в 3 местах, но лежит в widgets/club-list/.
Вынести в shared/ui/ или оставить как есть?"
```

---

## 3. Структура папок

```
project/
├── app/                              # Next.js App Router
│   ├── (routes)/                     # Группа роутов
│   │   ├── clubs/
│   │   │   ├── page.tsx              # Wrapper → импортирует views/clubs-list
│   │   │   ├── [id]/
│   │   │   │   └── page.tsx          # Wrapper → импортирует views/club-detail
│   │   │   ├── loading.tsx
│   │   │   └── error.tsx
│   │   └── profile/
│   │       └── page.tsx
│   │
│   ├── api/                          # API routes (если нужны)
│   ├── providers/                    # React провайдеры (Auth, Theme)
│   ├── styles/
│   │   └── globals.css
│   └── layout.tsx
│
├── views/                            # FSD: Страницы (композиция виджетов)
│   ├── clubs-list/
│   │   ├── ui/
│   │   │   └── ClubsListPage.tsx
│   │   ├── model/
│   │   │   └── use-page.ts
│   │   └── index.ts
│   └── club-detail/
│       └── ui/
│           └── ClubDetailPage.tsx
│
├── widgets/                          # FSD: Композитные блоки UI
│   ├── club-list/
│   │   ├── ui/
│   │   │   ├── ClubList.tsx
│   │   │   └── ClubListSkeleton.tsx
│   │   ├── model/
│   │   │   └── use-clubs.ts
│   │   └── index.ts
│   └── club-filters/
│       ├── ui/
│       ├── model/
│       └── index.ts
│
├── features/                         # FSD: Действия пользователя
│   ├── add-club-to-favorites/
│   │   ├── ui/
│   │   │   └── FavoriteButton.tsx
│   │   ├── api/
│   │   │   ├── add-favorite.ts       # Server Action
│   │   │   └── remove-favorite.ts
│   │   ├── model/
│   │   │   └── use-favorite.ts
│   │   └── index.ts
│   ├── search-clubs/
│   │   ├── ui/
│   │   ├── model/
│   │   └── index.ts
│   └── create-club/
│       ├── ui/
│       ├── api/
│       ├── model/
│       │   └── schemas.ts            # Zod schemas
│       └── index.ts
│
├── entities/                         # FSD: Бизнес-сущности
│   ├── club/
│   │   ├── ui/
│   │   │   ├── ClubCard.tsx
│   │   │   └── ClubAvatar.tsx
│   │   ├── model/
│   │   │   ├── types.ts              # Domain types
│   │   │   └── schemas.ts
│   │   ├── api/
│   │   │   ├── service.ts            # Supabase calls (CRUD)
│   │   │   └── actions.ts            # Server Actions (queries)
│   │   ├── lib/
│   │   │   └── format-club.ts
│   │   └── index.ts
│   ├── user/
│   │   ├── ui/
│   │   ├── model/
│   │   ├── api/
│   │   └── index.ts
│   └── match/
│       ├── ui/
│       ├── model/
│       ├── api/
│       └── index.ts
│
└── shared/                           # FSD: Переиспользуемый код
    ├── ui/                           # UI примитивы (shadcn/ui)
    │   ├── button/
    │   │   ├── Button.tsx
    │   │   └── index.ts
    │   ├── card/
    │   ├── input/
    │   └── ...
    │
    ├── lib/
    │   ├── supabase/
    │   │   ├── client.ts             # Browser client
    │   │   ├── server.ts             # Server client
    │   │   ├── database.types.ts     # Auto-generated
    │   │   └── middleware.ts
    │   └── utils/
    │       ├── cn.ts
    │       └── format.ts
    │
    ├── api/
    │   ├── base-service.ts
    │   └── handle-error.ts
    │
    ├── config/
    │   ├── site.ts
    │   └── env.ts
    │
    └── hooks/
        ├── use-toast.ts
        └── use-media-query.ts
```

---

## 4. Правила размещения кода

### Новая страница (Page)
**Условие:** Пользователь просит создать новую страницу/роут

**Что создавать:**
1. `views/{page-name}/ui/{PageName}Page.tsx` - логика и композиция
2. `app/(routes)/{route}/page.tsx` - Next.js wrapper:
   ```typescript
   import { ClubsListPage } from '@/views/clubs-list'
   export default ClubsListPage
   ```
3. `app/(routes)/{route}/loading.tsx` - loading UI
4. `app/(routes)/{route}/error.tsx` - error boundary

**Страница импортирует:** widgets, features (композиция)

---

### Новая фича-действие (Feature)
**Условие:** Пользовательское действие (кнопка, форма, модал), которое изменяет данные

**Примеры:** добавить в избранное, лайк, шаринг, создание сущности, удаление

**Что создавать:**
1. `features/{feature-name}/ui/*.tsx` - UI компоненты
2. `features/{feature-name}/api/*.ts` - Server Actions для специфичной логики фичи
3. `features/{feature-name}/model/*.ts` - хуки, схемы валидации (если нужны)
4. `features/{feature-name}/index.ts` - public API

**Фича импортирует:** entities (UI компоненты, типы), shared (UI примитивы)

**Правило:** Если действие = базовый CRUD (create/update/delete entity) → может быть в `entities/{entity}/api/actions.ts` вместо features

---

### Новая сущность (Entity)
**Условие:** Новая бизнес-сущность с данными (Club, User, Match, Review)

**Что создавать:**
1. `entities/{entity}/model/types.ts` - domain types
2. `entities/{entity}/api/service.ts` - Supabase calls (CRUD):
   ```typescript
   export const clubsService = {
     getAll: async () => { ... },
     getById: async (id) => { ... },
     create: async (data) => { ... },
     update: async (id, data) => { ... },
     delete: async (id) => { ... },
   }
   ```
3. `entities/{entity}/api/actions.ts` - Server Actions (queries):
   ```typescript
   'use server'
   export async function getClubs() { ... }
   export async function createClub(formData) { ... }
   ```
4. `entities/{entity}/ui/*.tsx` - компоненты для отображения сущности (Card, Avatar, List)
5. `entities/{entity}/index.ts` - public API

**Entity UI правило:** Только пассивное отображение, без мутаций внутри

---

### Новый виджет (Widget)
**Условие:** Сложный композитный блок UI, который комбинирует entities и features

**Примеры:** список клубов, фильтры, header, sidebar, комментарии

**Что создавать:**
1. `widgets/{widget-name}/ui/*.tsx` - UI компоненты
2. `widgets/{widget-name}/model/*.ts` - логика виджета (загрузка данных, состояние)
3. `widgets/{widget-name}/index.ts` - public API

**Виджет импортирует:** entities (компоненты, API), features (компоненты)

**Отличие от Feature:**
- Widget = показ данных (ClubList)
- Feature = действие пользователя (AddToFavorites)

---

### UI примитив (Shared UI)
**Условие:** Базовый переиспользуемый компонент без бизнес-логики

**Примеры:** Button, Input, Card, Modal, Dropdown

**Что создавать:**
1. `shared/ui/{component}/Component.tsx`
2. `shared/ui/{component}/index.ts`

**Использовать:** shadcn/ui для генерации компонентов

---

### Утилита (Shared Lib)
**Условие:** Функция без привязки к домену

**Примеры:** cn(), formatDate(), debounce()

**Что создавать:**
1. `shared/lib/utils/{util-name}.ts`

---

## 5. Примеры типичных задач

### Пример 1: "Добавь страницу списка клубов"

**Создать файлы:**

```typescript
// views/clubs-list/ui/ClubsListPage.tsx
import { ClubList } from '@/widgets/club-list'

export function ClubsListPage() {
  return (
    <div className="container">
      <h1>Теннисные клубы</h1>
      <ClubList />
    </div>
  )
}
```

```typescript
// app/(routes)/clubs/page.tsx
import { ClubsListPage } from '@/views/clubs-list'

export const metadata = {
  title: 'Клубы',
}

export default ClubsListPage
```

---

### Пример 2: "Добавь entity Club с получением из БД"

**Создать файлы:**

```typescript
// entities/club/model/types.ts
import { Database } from '@/shared/lib/supabase/database.types'

type ClubRow = Database['public']['Tables']['clubs']['Row']

export type Club = {
  id: string
  name: string
  address: string
  city: string
  rating: number | null
}

export type ClubInput = Omit<Club, 'id'>
```

```typescript
// entities/club/api/service.ts
import { createClient } from '@/shared/lib/supabase/client'
import type { Club } from '../model/types'

export const clubsService = {
  getAll: async (): Promise<Club[]> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .order('name')

    if (error) throw error
    return data
  },

  getById: async (id: string): Promise<Club | null> => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from('clubs')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data
  }
}
```

```typescript
// entities/club/api/actions.ts
'use server'

import { clubsService } from './service'

export async function getClubs() {
  return await clubsService.getAll()
}

export async function getClubById(id: string) {
  return await clubsService.getById(id)
}
```

```typescript
// entities/club/ui/ClubCard.tsx
import type { Club } from '../model/types'
import { Card } from '@/shared/ui/card'

type Props = { club: Club }

export function ClubCard({ club }: Props) {
  return (
    <Card>
      <h3>{club.name}</h3>
      <p className="text-sm text-gray-600">{club.address}</p>
      {club.rating && <div>★ {club.rating}</div>}
    </Card>
  )
}
```

---

### Пример 3: "Добавь кнопку добавления клуба в избранное"

**Создать файлы:**

```typescript
// features/add-club-to-favorites/ui/FavoriteButton.tsx
'use client'

import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import { addFavorite, removeFavorite } from '../api/favorite-actions'

type Props = {
  clubId: string
  initialFavorite?: boolean
}

export function FavoriteButton({ clubId, initialFavorite = false }: Props) {
  const [isFavorite, setIsFavorite] = useState(initialFavorite)
  const [isLoading, setIsLoading] = useState(false)

  const handleToggle = async () => {
    setIsLoading(true)
    try {
      if (isFavorite) {
        await removeFavorite(clubId)
      } else {
        await addFavorite(clubId)
      }
      setIsFavorite(!isFavorite)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={handleToggle}
      disabled={isLoading}
    >
      {isFavorite ? '★' : '☆'}
    </Button>
  )
}
```

```typescript
// features/add-club-to-favorites/api/favorite-actions.ts
'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addFavorite(clubId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('favorites')
    .insert({ club_id: clubId })

  if (error) throw error

  revalidatePath('/clubs')
}

export async function removeFavorite(clubId: string) {
  const supabase = createClient()

  const { error } = await supabase
    .from('favorites')
    .delete()
    .eq('club_id', clubId)

  if (error) throw error

  revalidatePath('/clubs')
}
```

---

### Пример 4: "Добавь виджет списка клубов"

**Создать файлы:**

```typescript
// widgets/club-list/ui/ClubList.tsx
'use client'

import { useClubs } from '../model/use-clubs'
import { ClubCard } from '@/entities/club'
import { FavoriteButton } from '@/features/add-club-to-favorites'
import { ClubListSkeleton } from './ClubListSkeleton'

export function ClubList() {
  const { clubs, isLoading, error } = useClubs()

  if (isLoading) return <ClubListSkeleton />
  if (error) return <div>Ошибка загрузки клубов</div>
  if (clubs.length === 0) return <div>Клубы не найдены</div>

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {clubs.map((club) => (
        <div key={club.id} className="relative">
          <ClubCard club={club} />
          <div className="absolute top-2 right-2">
            <FavoriteButton clubId={club.id} />
          </div>
        </div>
      ))}
    </div>
  )
}
```

```typescript
// widgets/club-list/model/use-clubs.ts
'use client'

import { useEffect, useState } from 'react'
import { getClubs } from '@/entities/club/api/actions'
import type { Club } from '@/entities/club/model/types'

export function useClubs() {
  const [clubs, setClubs] = useState<Club[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    getClubs()
      .then(setClubs)
      .catch(setError)
      .finally(() => setIsLoading(false))
  }, [])

  return { clubs, isLoading, error }
}
```

---

### Пример 5: "Добавь поиск клубов"

**Создать файлы:**

```typescript
// features/search-clubs/ui/SearchInput.tsx
'use client'

import { Input } from '@/shared/ui/input'
import { useSearch } from '../model/use-search'

type Props = {
  onSearch: (query: string) => void
}

export function SearchInput({ onSearch }: Props) {
  const { query, setQuery } = useSearch()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setQuery(value)
    onSearch(value)
  }

  return (
    <Input
      type="search"
      placeholder="Поиск клубов..."
      value={query}
      onChange={handleChange}
    />
  )
}
```

```typescript
// features/search-clubs/model/use-search.ts
'use client'

import { useState } from 'react'
import { useDebouncedCallback } from 'use-debounce'

export function useSearch() {
  const [query, setQuery] = useState('')

  const debouncedSetQuery = useDebouncedCallback(
    (value: string) => setQuery(value),
    300
  )

  return {
    query,
    setQuery: debouncedSetQuery,
  }
}
```

---

### Пример 6: "Добавь форму создания клуба"

**Создать файлы:**

```typescript
// features/create-club/model/schemas.ts
import { z } from 'zod'

export const createClubSchema = z.object({
  name: z.string().min(3, 'Минимум 3 символа'),
  address: z.string().min(5, 'Введите адрес'),
  city: z.string().min(2, 'Выберите город'),
})

export type CreateClubInput = z.infer<typeof createClubSchema>
```

```typescript
// features/create-club/ui/CreateClubForm.tsx
'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'
import { createClub } from '../api/create-club'
import { createClubSchema, type CreateClubInput } from '../model/schemas'

export function CreateClubForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<CreateClubInput>({
    resolver: zodResolver(createClubSchema)
  })

  const onSubmit = async (data: CreateClubInput) => {
    await createClub(data)
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <div>
        <Input {...register('name')} placeholder="Название клуба" />
        {errors.name && <p className="text-red-500">{errors.name.message}</p>}
      </div>

      <div>
        <Input {...register('address')} placeholder="Адрес" />
        {errors.address && <p className="text-red-500">{errors.address.message}</p>}
      </div>

      <div>
        <Input {...register('city')} placeholder="Город" />
        {errors.city && <p className="text-red-500">{errors.city.message}</p>}
      </div>

      <Button type="submit">Создать клуб</Button>
    </form>
  )
}
```

```typescript
// features/create-club/api/create-club.ts
'use server'

import { createClient } from '@/shared/lib/supabase/server'
import { createClubSchema, type CreateClubInput } from '../model/schemas'
import { revalidatePath } from 'next/cache'

export async function createClub(input: CreateClubInput) {
  // Валидация на сервере
  const validated = createClubSchema.parse(input)

  const supabase = createClient()

  const { data, error } = await supabase
    .from('clubs')
    .insert(validated)
    .select()
    .single()

  if (error) throw error

  revalidatePath('/clubs')

  return data
}
```

---

## 6. TypeScript Rules

### Строгая типизация

**✅ ВСЕГДА:**
- Использовать TypeScript strict mode
- Явно указывать типы параметров функций
- Явно указывать return types для функций
- Использовать Zod schemas для runtime валидации

**❌ НИКОГДА:**
- `any` - использовать `unknown` если тип неизвестен
- Type assertions (`as`) без крайней необходимости
- `@ts-ignore` - решать проблему типов правильно

### Примеры:

```typescript
// ❌ Плохо
function getClub(id: any): any {
  return clubsService.getById(id)
}

// ✅ Хорошо
async function getClub(id: string): Promise<Club | null> {
  return await clubsService.getById(id)
}
```

```typescript
// ❌ Плохо
const data = response.data as Club

// ✅ Хорошо
const data = ClubSchema.parse(response.data)
```

### Domain Types

**Расположение:** `entities/{entity}/model/types.ts`

**Связь с Supabase:**
```typescript
// entities/club/model/types.ts
import { Database } from '@/shared/lib/supabase/database.types'

// 1. Базовый тип из БД
type ClubRow = Database['public']['Tables']['clubs']['Row']

// 2. Domain model (можем расширять/трансформировать)
export type Club = {
  id: string
  name: string
  address: string
  city: string
  rating: number | null
  // computed fields
  displayName: string  // name + city
}

// 3. Input types для форм
export type ClubInput = Omit<Club, 'id' | 'displayName'>
export type ClubUpdate = Partial<ClubInput>

// 4. Маппер из БД в domain
export function mapClubRowToClub(row: ClubRow): Club {
  return {
    ...row,
    displayName: `${row.name} (${row.city})`
  }
}
```

---

## 7. Supabase Integration

### Auto-generated Types

**Расположение:** `shared/lib/supabase/database.types.ts`

**Генерация:**
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > shared/lib/supabase/database.types.ts
```

**Использование:** Только в `entities/{entity}/api/service.ts` и `entities/{entity}/model/types.ts`

### Supabase Clients

**Browser client:**
```typescript
// shared/lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**Server client:**
```typescript
// shared/lib/supabase/server.ts
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
      },
    }
  )
}
```

### Где использовать какой client

| Место | Client | Почему |
|-------|--------|--------|
| `entities/{entity}/api/service.ts` | Browser (`client.ts`) | Может вызываться из клиентских компонентов |
| `entities/{entity}/api/actions.ts` | Server (`server.ts`) | Server Actions всегда на сервере |
| `features/{feature}/api/*.ts` | Server (`server.ts`) | Server Actions всегда на сервере |
| Client components | Browser (`client.ts`) | Работает в браузере |

### Service vs Actions

**Service** (`entities/{entity}/api/service.ts`):
- Чистые функции для работы с Supabase
- Без 'use server'
- Могут вызываться откуда угодно
- CRUD операции

**Actions** (`entities/{entity}/api/actions.ts` + `features/{feature}/api/*.ts`):
- Server Actions с 'use server'
- Вызывают service
- Обрабатывают FormData
- Валидация + revalidatePath/redirect

**Пример:**

```typescript
// entities/club/api/service.ts
import { createClient } from '@/shared/lib/supabase/client'

export const clubsService = {
  getAll: async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from('clubs').select('*')
    if (error) throw error
    return data
  }
}
```

```typescript
// entities/club/api/actions.ts
'use server'

import { clubsService } from './service'
import { revalidatePath } from 'next/cache'

export async function getClubs() {
  return await clubsService.getAll()
}

export async function createClub(formData: FormData) {
  const name = formData.get('name') as string
  // валидация...
  const club = await clubsService.create({ name, ... })
  revalidatePath('/clubs')
  return club
}
```

---

## 8. Import Rules (FSD Layers)

### Правило импортов между слоями

Слой может импортировать только из слоёв **ниже** себя:

```
app (Layer 1)
  ↓ может импортировать
pages (Layer 2)
  ↓ может импортировать
widgets (Layer 3)
  ↓ может импортировать
features (Layer 4)
  ↓ может импортировать
entities (Layer 5)
  ↓ может импортировать
shared (Layer 6)
```

### Таблица разрешённых импортов

| Кто импортирует | Может импортировать из |
|----------------|----------------------|
| `app/` | `views/`, `providers/`, `shared/` |
| `views/` | `widgets/`, `features/`, `entities/`, `shared/` |
| `widgets/` | `features/`, `entities/`, `shared/` |
| `features/` | `entities/`, `shared/` |
| `entities/` | `shared/` |
| `shared/` | только `shared/` |

### ❌ Запрещённые импорты

```typescript
// ❌ features не может импортировать другие features
// features/add-favorite/ui/Button.tsx
import { SearchInput } from '@/features/search-clubs'  // WRONG!

// ❌ entities не может импортировать features
// entities/club/ui/ClubCard.tsx
import { FavoriteButton } from '@/features/add-favorite'  // WRONG!

// ❌ widgets не может импортировать pages
// widgets/club-list/ui/ClubList.tsx
import { ClubsPage } from '@/views/clubs-list'  // WRONG!
```

### ✅ Правильные импорты

```typescript
// ✅ pages импортирует widgets и features
// views/clubs-list/ui/ClubsListPage.tsx
import { ClubList } from '@/widgets/club-list'
import { SearchInput } from '@/features/search-clubs'

// ✅ widgets импортирует entities и features
// widgets/club-list/ui/ClubList.tsx
import { ClubCard } from '@/entities/club'
import { FavoriteButton } from '@/features/add-club-to-favorites'

// ✅ features импортирует entities
// features/add-favorite/ui/FavoriteButton.tsx
import type { Club } from '@/entities/club/model/types'
```

### Public API (index.ts)

Каждый слайс должен экспортировать public API через `index.ts`:

```typescript
// entities/club/index.ts
export { ClubCard, ClubAvatar } from './ui'
export { getClubs, getClubById } from './api/actions'
export { clubsService } from './api/service'
export type { Club, ClubInput } from './model/types'
```

**Импорт через public API:**
```typescript
// ✅ Хорошо
import { ClubCard, type Club } from '@/entities/club'

// ❌ Плохо (прямой импорт внутренних файлов)
import { ClubCard } from '@/entities/club/ui/ClubCard'
import type { Club } from '@/entities/club/model/types'
```

---

## 9. Naming Conventions

### Файлы

| Тип | Именование | Пример |
|-----|-----------|--------|
| Компоненты | PascalCase.tsx | `ClubCard.tsx` |
| Хуки | use-kebab-case.ts | `use-clubs.ts` |
| Утилиты | kebab-case.ts | `format-date.ts` |
| Types | types.ts | `types.ts` |
| Schemas | schemas.ts | `schemas.ts` |
| Services | service.ts | `service.ts` |
| Actions | actions.ts или {action}.ts | `actions.ts`, `create-club.ts` |
| Constants | UPPER_CASE.ts | `ROUTES.ts` |

### Папки

| Тип | Именование | Пример |
|-----|-----------|--------|
| Слайсы (entities, features, widgets, pages) | kebab-case | `club-favorites/`, `clubs-list/` |
| Внутренние папки | lowercase | `ui/`, `model/`, `api/`, `lib/` |

### Компоненты

```typescript
// ✅ Хорошо
export function ClubCard({ club }: ClubCardProps) { }
export function FavoriteButton({ clubId }: FavoriteButtonProps) { }

// ❌ Плохо
export const ClubCard = ({ club }: ClubCardProps) => { }  // стрелочная функция
export default function ClubCard() { }  // default export (кроме pages)
```

### Типы и интерфейсы

```typescript
// ✅ Хорошо
export type Club = { ... }
export type ClubCardProps = { club: Club }
export type CreateClubInput = { name: string }

// ❌ Плохо
export interface IClub { ... }  // префикс I не нужен
export type TClub = { ... }  // префикс T не нужен
```

### Функции и переменные

```typescript
// ✅ Хорошо
function getClubById(id: string) { }
const isClubFavorite = true
const handleClick = () => { }

// ❌ Плохо
function GetClubById(id: string) { }  // PascalCase для функций
const IsClubFavorite = true  // PascalCase для переменных
```

### Server Actions

```typescript
// ✅ Хорошо
export async function getClubs() { }
export async function createClub(formData: FormData) { }
export async function addClubToFavorites(clubId: string) { }

// ❌ Плохо
export async function fetchClubs() { }  // не fetch, а get
export async function addFavorite() { }  // неполное название
```

---

## 10. Workflow: Добавление новой фичи

### Checklist для Claude Code

Когда пользователь просит добавить фичу, следовать этому алгоритму:

#### Шаг 1: Определить тип
- [ ] Page (новая страница)?
- [ ] Feature (действие пользователя)?
- [ ] Entity (новая сущность)?
- [ ] Widget (композитный блок UI)?
- [ ] UI Primitive (базовый компонент)?

#### Шаг 2: Проверить дубликаты и зависимости
- [ ] **Сканировать на дубликаты** (Grep/Glob) - есть ли похожий функционал?
- [ ] Если найдено похожее → **спросить пользователя** переиспользовать или создать новое
- [ ] Если компонент переиспользуемый → **спросить** feature/ или shared/?
- [ ] Нужны ли новые entities? → создать сначала
- [ ] Нужны ли типы из БД? → проверить `database.types.ts`
- [ ] Переиспользуем существующие компоненты? → импортировать

#### Шаг 3: Создать структуру
- [ ] Создать папку слайса
- [ ] Создать внутренние папки (`ui/`, `api/`, `model/`)
- [ ] Создать `index.ts` для public API

#### Шаг 4: Написать код
- [ ] Типы в `model/types.ts` (если нужны)
- [ ] UI компоненты в `ui/`
- [ ] API в `api/` (service + actions)
- [ ] Логика в `model/` (хуки, schemas)

#### Шаг 5: Проверить
- [ ] Типы строгие (no `any`)
- [ ] Импорты соблюдают правила слоёв
- [ ] Public API экспортирован через `index.ts`
- [ ] Server Actions имеют 'use server'
- [ ] Client Components имеют 'use client' (если нужно)

#### Шаг 6: Интегрировать
- [ ] Импортировать в parent слой (page/widget)
- [ ] Проверить композицию
- [ ] Добавить в нужное место в UI

### Пример workflow: "Добавь избранное для клубов"

**Анализ:**
1. Тип: Feature (действие пользователя)
2. Зависимости: Entity `club` уже есть
3. Нужно: UI (кнопка) + API (add/remove actions)

**Создать:**
1. `features/add-club-to-favorites/ui/FavoriteButton.tsx` - кнопка
2. `features/add-club-to-favorites/api/favorite-actions.ts` - Server Actions
3. `features/add-club-to-favorites/model/use-favorite.ts` - хук для состояния
4. `features/add-club-to-favorites/index.ts` - public API

**Интегрировать:**
5. Импортировать `FavoriteButton` в `widgets/club-list/ui/ClubList.tsx`
6. Добавить кнопку рядом с `ClubCard`

---

## 11. Стратегия переиспользования

### Когда выносить в shared

**Правило:** Компонент/функция используется в **2+ местах** → вынести в `shared/`

**До переноса:**
```
features/club-favorites/ui/FavoriteButton.tsx  # Используется только здесь
```

**После переноса (когда понадобился в match-favorites):**
```
shared/ui/favorite-button/FavoriteButton.tsx  # Теперь переиспользуемый
features/club-favorites/                       # Обновить импорт
features/match-favorites/                      # Использует из shared
```

### Процесс переноса в shared

**Шаг 1: Спросить пользователя**
```
"Компонент FavoriteButton используется в 2 местах.
Вынести в shared/ui/ для переиспользования?"
```

**Шаг 2: Переместить файл (после согласия)**
```bash
features/club-favorites/ui/FavoriteButton.tsx
  ↓
shared/ui/favorite-button/FavoriteButton.tsx
```

**Шаг 3: Обновить импорты**
```typescript
// features/club-favorites/ui/SomeComponent.tsx
// Было:
import { FavoriteButton } from './FavoriteButton'

// Стало:
import { FavoriteButton } from '@/shared/ui/favorite-button'
```

**Шаг 4: Использовать в новом месте**
```typescript
// features/match-favorites/ui/MatchCard.tsx
import { FavoriteButton } from '@/shared/ui/favorite-button'
```

### Минимизация рефакторинга

**Что меняется:**
- ✅ Один файл перемещается
- ✅ Импорты обновляются в одной фиче

**Что НЕ меняется:**
- ✅ Публичный API компонента (props, типы)
- ✅ Логика компонента
- ✅ Другие фичи (не затронуты)

### Когда НЕ выносить в shared

**Оставить в feature, если:**
- Компонент используется только в одной фиче
- Компонент очень специфичен для бизнес-логики фичи
- Неясно, будет ли переиспользоваться в будущем

**В случае сомнений → спросить пользователя**

---

## 12. Когда НЕ следовать FSD

### Допустимые отступления

**1. Маленькие фичи**
Если фича = один компонент без логики, можно упростить:

```
// Вместо:
features/toggle-theme/
  ui/
    ThemeToggle.tsx
  index.ts

// Можно:
features/toggle-theme/
  ThemeToggle.tsx
  index.ts
```

**2. Shared utilities между features**
Если две features используют одну утилиту → вынести в `shared/lib/`:

```typescript
// shared/lib/favorites/is-favorite.ts
export function isFavorite(clubId: string, favorites: string[]) {
  return favorites.includes(clubId)
}
```

**3. Cross-cutting concerns**
Логирование, аналитика, мониторинг → в `shared/lib/`:

```typescript
// shared/lib/analytics/track-event.ts
export function trackEvent(event: string, data?: object) { }
```

**4. Очень простые проекты**
Если проект < 10 страниц, можно упростить структуру:
- Убрать `widgets/` → использовать только `features/` и `entities/`
- Убрать `views/` → писать страницы прямо в `app/`

---

## 13. FAQ

### Q: Где создавать общий тип, если он используется в нескольких entities?

**A:** В `shared/types/`:

```typescript
// shared/types/common.ts
export type Pagination = {
  page: number
  limit: number
  total: number
}

// entities/club/api/actions.ts
import type { Pagination } from '@/shared/types/common'

export async function getClubs(pagination: Pagination) { }
```

---

### Q: Куда положить кастомный хук, который используется в нескольких widgets?

**A:** В `shared/hooks/`:

```typescript
// shared/hooks/use-pagination.ts
export function usePagination() { }

// widgets/club-list/model/use-clubs.ts
import { usePagination } from '@/shared/hooks/use-pagination'
```

---

### Q: Feature нужен компонент из другой feature, что делать?

**A:** Запрещено напрямую. Варианты:
1. Вынести общий компонент в `shared/ui/`
2. Передать через props из parent слоя (widget/page)
3. Пересмотреть архитектуру - может это не feature, а entity?

---

### Q: Где хранить константы роутов?

**A:** В `shared/config/routes.ts`:

```typescript
// shared/config/routes.ts
export const ROUTES = {
  CLUBS: '/clubs',
  CLUB_DETAIL: (id: string) => `/clubs/${id}`,
  PROFILE: '/profile',
} as const
```

---

### Q: Куда положить глобальный state (если нужен)?

**A:** В `app/providers/`:

```typescript
// app/providers/FavoritesProvider.tsx
'use client'

import { createContext, useContext, useState } from 'react'

const FavoritesContext = createContext<string[]>([])

export function FavoritesProvider({ children }) {
  const [favorites, setFavorites] = useState<string[]>([])

  return (
    <FavoritesContext.Provider value={favorites}>
      {children}
    </FavoritesContext.Provider>
  )
}

export const useFavoritesContext = () => useContext(FavoritesContext)
```

---

### Q: Как переиспользовать Server Action между features?

**A:** Если action = базовый CRUD → в `entities/{entity}/api/actions.ts`

Если action специфичен, но нужен в двух features → создать отдельный feature или вынести в `shared/api/`.

---

## 14. Чеклист перед коммитом

- [ ] Все типы явные (no `any`)
- [ ] Импорты соблюдают правила слоёв
- [ ] Public API экспортирован через `index.ts`
- [ ] Server Actions имеют `'use server'`
- [ ] Client Components имеют `'use client'` (если используют hooks/events)
- [ ] Нет unused imports
- [ ] Zod schemas для форм и валидации
- [ ] Error handling добавлен
- [ ] Loading states обработаны
- [ ] Запустить `npm run typecheck`
- [ ] Запустить `npm run lint` (если есть)

---

## Заключение

Эта архитектура создана для **аддитивной разработки через Claude Code**:

✅ **Новая фича = новая папка** (изолированная разработка)
✅ **Проверка дубликатов** (Claude сканирует перед созданием)
✅ **Консультация с пользователем** (вопросы при неоднозначности)
✅ **Минимальный рефакторинг** при переиспользовании (только обновление импортов)
✅ **Чёткие правила** (меньше вопросов от Claude)
✅ **Масштабируемость** (от 5 до 50+ страниц)
✅ **TypeScript-first** (строгая типизация)
✅ **Supabase-friendly** (service layer + Server Actions)

Следуй Quick Decision Matrix → создавай правильную структуру → пиши код. 🎯
