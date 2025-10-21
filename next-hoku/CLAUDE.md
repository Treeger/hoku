# Project Instructions

## Architecture
**ВАЖНО:** Перед началом любой задачи ВСЕГДА читай файл `ARCHITECTURE.md` в корне проекта.

---

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

### Правила
- Коммиты на английском языке
- Описание должно быть конкретным, НЕ общим ("add feature X" вместо "add new feature")
- Коммиты должны быть небольшими и атомарными
- Один коммит = одна логическая единица изменений

---

## Рабочий процесс (Development Workflow)

### 1. Task Definition
Пользователь описывает задачу/фичу для реализации.

### 2. Planning & Discussion
- Обсудить подход
- Уточнить требования
- Выявить варианты реализации
- Обсудить trade-offs
- Согласовать решение

**Важно:** НЕ начинать кодить без обсуждения и согласования подхода.

### 3. Implementation
Реализовать фичу в текущем репозитории согласно плану.

### 4. Cross-Repository Changes
Если нужны изменения в других репозиториях:
- **Предоставить prompt** с описанием того, что нужно сделать в другом репо
- **НЕ включать детали реализации** — только high-level описание требований
- Пользователь применит prompt к нужному репо отдельно

**Пример:**
```
Для playtennis-supabase:
Нужно добавить новую таблицу `match_ratings` с полями:
- match_id (FK к matches)
- user_id (FK к profiles)
- rating (integer 1-5)
- comment (text, optional)
Создать RLS policies для authenticated users.
```

### 5. Quality Check
**Обязательно перед коммитом:**
- Запустить `npm run typecheck` — проверка TypeScript ошибок
- Запустить `npm run lint` (где доступно) — проверка ESLint ошибок
- Исправить ВСЕ ошибки

### 6. Commit Proposal
Claude предлагает commit message по стандарту выше.

### 7. Code Review & Deploy
Пользователь ревьюит код, коммитит изменения вручную, тестирует в соответствующем окружении.

---