# CalBot Mini App — Документация для Claude

## Структура файлов

```
tg-app/
├── index.html          — Точка входа. HTML-скелет приложения.
├── css/
│   └── style.css       — Все стили. Поддержка тёмной темы через CSS-переменные.
├── js/
│   ├── data.js         — Данные и вспомогательные функции.
│   └── app.js          — Логика приложения: рендеринг, анимация, события.
└── CLAUDE.md           — Этот файл.
```

---

## Что за что отвечает

### index.html
- HTML-структура: шапка, кольцо, плитки КБЖУ, контейнер для блоков еды, кнопка
- Подключает Telegram Web App SDK (`telegram-web-app.js`)
- Подключает `data.js` и `app.js` в правильном порядке

### css/style.css
- Все стили приложения
- CSS-переменные темы: `--bg`, `--text`, `--hint`, `--btn` — берутся из Telegram SDK
- При открытии в браузере используют запасные значения (светлая тема)
- Анимация появления карточек: `fadeSlideUp`
- Анимация SVG-кольца: CSS `transition` на `stroke-dashoffset`

### js/data.js
- `CONFIG.BOT_USERNAME` — username бота (без @). **Заменить на реальный!**
- `MOCK_DATA` — тестовые данные дневника (пользователь, норма, приёмы пищи)
- `formatTodayRu()` — возвращает строку "Суббота, 12 апреля"
- `calcTotals(meals)` — считает сумму КБЖУ по всем приёмам
- `mealCalories(meal)` — считает ккал одного приёма

### js/app.js
- `RING_CIRCUMFERENCE = 408.41` — длина SVG-окружности (2π × 65)
- `renderRing(eaten, target)` — заполняет текст внутри кольца и статус под ним
- `animateRing(eaten, target)` — плавно рисует дугу, меняет цвет (зелёный/оранжевый/красный)
- `renderKBJU(totals)` — заполняет плитки Белки/Жиры/Углеводы
- `renderMeals(meals)` — генерирует HTML-блоки для каждого приёма пищи
- `openBot()` — открывает чат с ботом через Telegram deeplink или t.me
- `escapeHtml(str)` — защита от XSS

---

## Навигация между экранами

В v1 экран один — скролл. Переходов нет.

Для v2 (история по дням) планируется:
- Добавить навигацию стрелками в шапку
- Хранить выбранную дату в переменной
- Загружать данные за эту дату из API

---

## Где менять данные

### Сменить тестовые данные (еда, калории)
→ `js/data.js`, объект `MOCK_DATA.meals`

### Сменить норму калорий
→ `js/data.js`, `MOCK_DATA.user.targetCalories`

### Сменить username бота
→ `js/data.js`, `CONFIG.BOT_USERNAME`

### Изменить порядок приёмов пищи
→ `js/app.js`, массив `order` в функции `renderMeals`

### Изменить цвета кольца
→ `css/style.css`, переменные `--ring-green`, `--ring-orange`, `--ring-red`

### Изменить цвета плиток КБЖУ
→ `css/style.css`, переменные `--protein-fg`, `--fat-fg`, `--carbs-fg`

---

## Как подключить реальные данные из API бота

Когда будет готов эндпоинт `/api/diary`:

1. В `app.js` заменить `MOCK_DATA` на fetch-запрос:
```javascript
const response = await fetch(`https://calbot.onrender.com/api/diary?user_id=${userId}&date=${today}`);
const data = await response.json();
```

2. Получить `user_id` из Telegram SDK:
```javascript
const userId = tg.initDataUnsafe?.user?.id;
```

3. Обернуть всё в `async/await`

---

## Деплой

- Хостинг: Vercel (статический сайт, бесплатно)
- Репозиторий: `callories-training` на GitHub
- Папка для деплоя: `tg-app/`
- После деплоя зарегистрировать URL в BotFather → /newapp

---

## Telegram Web App переменные темы

Список всех CSS-переменных которые Telegram передаёт в приложение:
```
--tg-theme-bg-color               фон приложения
--tg-theme-secondary-bg-color     фон карточек
--tg-theme-text-color             основной текст
--tg-theme-hint-color             серый/вспомогательный текст
--tg-theme-link-color             ссылки
--tg-theme-button-color           цвет кнопок
--tg-theme-button-text-color      текст на кнопках
```
