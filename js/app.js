/* ============================================================
   app.js — Логика приложения CalBot Mini App

   Порядок инициализации:
   1. Telegram.WebApp.ready() — сообщаем Telegram что приложение загрузилось
   2. Применяем тему Telegram
   3. Рендерим дату, кольцо, КБЖУ, блоки приёмов пищи
   4. Анимируем кольцо после небольшой задержки
   ============================================================ */

/* -----------------------------------------------------------
   Константа: длина окружности SVG-кольца (2 * π * 65)
   r = 65 — радиус кольца в viewBox 160x160
   ----------------------------------------------------------- */
const RING_CIRCUMFERENCE = 408.41;

/* -----------------------------------------------------------
   Инициализация Telegram Web App SDK
   ----------------------------------------------------------- */
const tg = window.Telegram?.WebApp;

if (tg) {
  // Сообщаем Telegram что приложение готово к показу
  tg.ready();
  // Разворачиваем на весь экран
  tg.expand();
}

/* -----------------------------------------------------------
   Запуск приложения после загрузки DOM
   ----------------------------------------------------------- */
document.addEventListener('DOMContentLoaded', () => {
  // Устанавливаем дату в шапке
  document.getElementById('headerDate').textContent = formatTodayRu();

  // Считаем итоги
  const totals = calcTotals(MOCK_DATA.meals);
  const target = MOCK_DATA.user.targetCalories;

  // Рендерим все секции
  renderRing(totals.calories, target);
  renderKBJU(totals);
  renderMeals(MOCK_DATA.meals);

  // Кольцо анимируем с небольшой задержкой — выглядит эффектно
  setTimeout(() => animateRing(totals.calories, target), 200);
});

/* -----------------------------------------------------------
   renderRing — заполняет центральный текст кольца
   и устанавливает начальный цвет (анимация — отдельно)
   ----------------------------------------------------------- */
function renderRing(eaten, target) {
  // Текст в центре кольца
  document.getElementById('ringCalories').textContent = eaten.toLocaleString('ru');
  document.getElementById('ringTarget').textContent   = target.toLocaleString('ru');

  // Текст статуса под кольцом
  const statusEl = document.getElementById('ringStatus');
  const diff = target - eaten;
  if (diff > 0) {
    statusEl.textContent = `Осталось: ${diff.toLocaleString('ru')} ккал`;
    statusEl.className = 'ring__status';
  } else if (diff === 0) {
    statusEl.textContent = 'Норма выполнена точно! 🎉';
    statusEl.className = 'ring__status ok';
  } else {
    statusEl.textContent = `Перебор на ${Math.abs(diff).toLocaleString('ru')} ккал`;
    statusEl.className = 'ring__status over';
  }
}

/* -----------------------------------------------------------
   animateRing — плавно заполняет SVG-дугу
   и задаёт цвет в зависимости от прогресса
   ----------------------------------------------------------- */
function animateRing(eaten, target) {
  const fillEl = document.getElementById('ringFill');
  if (!fillEl) return;

  const progress = Math.min(eaten / target, 1); // Не больше 100% для дуги
  const offset   = RING_CIRCUMFERENCE * (1 - progress);

  // Выбираем цвет
  let color;
  if (eaten > target) {
    color = getComputedStyle(document.documentElement)
      .getPropertyValue('--ring-red').trim() || '#FF3B30';
  } else if (progress >= 0.8) {
    color = getComputedStyle(document.documentElement)
      .getPropertyValue('--ring-orange').trim() || '#FF9500';
  } else {
    color = getComputedStyle(document.documentElement)
      .getPropertyValue('--ring-green').trim() || '#34C759';
  }

  // Применяем — CSS transition обеспечит плавность
  fillEl.style.strokeDashoffset = offset;
  fillEl.style.stroke = color;
}

/* -----------------------------------------------------------
   renderKBJU — заполняет плитки Белки / Жиры / Углеводы
   ----------------------------------------------------------- */
function renderKBJU(totals) {
  document.getElementById('totalProtein').textContent = totals.protein;
  document.getElementById('totalFat').textContent     = totals.fat;
  document.getElementById('totalCarbs').textContent   = totals.carbs;
}

/* -----------------------------------------------------------
   renderMeals — создаёт HTML-блоки для каждого приёма пищи
   Порядок отображения: Завтрак → Обед → Ужин → Перекус
   ----------------------------------------------------------- */
function renderMeals(meals) {
  const container = document.getElementById('mealsContainer');
  if (!container) return;

  // Задаём порядок отображения
  const order = ['breakfast', 'lunch', 'dinner', 'snack'];

  order.forEach(key => {
    const meal = meals[key];
    if (!meal) return;

    const kcal = mealCalories(meal);
    const hasEntries = meal.entries.length > 0;

    // Формируем список блюд или пустое состояние
    let itemsHTML = '';
    if (hasEntries) {
      itemsHTML = meal.entries
        .map(entry => `<div class="meal-item">${escapeHtml(entry.name)}</div>`)
        .join('');
    } else {
      itemsHTML = `<div class="meal-empty">Ещё не добавлено</div>`;
    }

    // Калории в заголовке
    const kcalHTML = hasEntries
      ? `<span class="meal-block__kcal">${kcal} ккал</span>`
      : `<span class="meal-block__kcal meal-block__kcal--empty">—</span>`;

    // Собираем блок
    const blockHTML = `
      <div class="meal-block">
        <div class="meal-block__header">
          <div class="meal-block__title">
            <span class="meal-block__icon">${meal.icon}</span>
            <span>${meal.name}</span>
          </div>
          ${kcalHTML}
        </div>
        <div class="meal-block__list">${itemsHTML}</div>
      </div>
    `;

    container.insertAdjacentHTML('beforeend', blockHTML);
  });
}

/* -----------------------------------------------------------
   openBot — открывает чат с ботом при нажатии кнопки
   Использует Telegram deeplink если доступен SDK,
   иначе открывает t.me-ссылку в браузере.
   ----------------------------------------------------------- */
function openBot() {
  const username = CONFIG.BOT_USERNAME;
  const url = `https://t.me/${username}`;

  if (tg) {
    tg.openTelegramLink(url);
  } else {
    window.open(url, '_blank');
  }

  // Визуальная обратная связь при тапе
  const btn = document.getElementById('addBtn');
  if (btn) {
    btn.style.opacity = '0.7';
    setTimeout(() => { btn.style.opacity = ''; }, 200);
  }
}

/* -----------------------------------------------------------
   escapeHtml — защита от XSS при вставке данных в HTML
   ----------------------------------------------------------- */
function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
