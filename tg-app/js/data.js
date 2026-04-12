/* ============================================================
   data.js — Данные приложения

   Сейчас здесь реалистичные тестовые данные.
   Когда будет подключён API бота — данные будут приходить
   с сервера, и этот файл будет использоваться как запасной вариант.

   Чтобы изменить тестовые данные — редактируй объект MOCK_DATA.
   ============================================================ */

/* -----------------------------------------------------------
   Настройки приложения
   BOT_USERNAME — @username вашего бота без символа @
   ----------------------------------------------------------- */
const CONFIG = {
  BOT_USERNAME: 'my_cbot',  // username бота без @
};

/* -----------------------------------------------------------
   Тестовые данные дневника
   Структура meals: каждый приём — массив записей о блюдах
   ----------------------------------------------------------- */
const MOCK_DATA = {
  user: {
    name: 'Анна',
    targetCalories: 1600,  // Дневная норма калорий
  },

  meals: {
    breakfast: {
      name: 'Завтрак',
      icon: '🌅',
      entries: [
        {
          name: 'Овсянка с бананом и мёдом',
          calories: 320,
          protein: 8,
          fat: 6,
          carbs: 58,
        },
      ],
    },
    lunch: {
      name: 'Обед',
      icon: '☀️',
      entries: [
        {
          name: 'Борщ со сметаной',
          calories: 380,
          protein: 12,
          fat: 14,
          carbs: 42,
        },
        {
          name: 'Хлеб ржаной, 2 куска',
          calories: 140,
          protein: 4,
          fat: 1,
          carbs: 28,
        },
      ],
    },
    snack: {
      name: 'Перекус',
      icon: '🍎',
      entries: [
        {
          name: 'Яблоко',
          calories: 80,
          protein: 0,
          fat: 0,
          carbs: 21,
        },
        {
          name: 'Кефир 1%, 200 мл',
          calories: 90,
          protein: 6,
          fat: 2,
          carbs: 10,
        },
      ],
    },
    dinner: {
      name: 'Ужин',
      icon: '🌙',
      entries: [], // Пустой — покажем "Ещё не добавлено"
    },
  },
};

/* -----------------------------------------------------------
   Вспомогательные функции для работы с датами
   ----------------------------------------------------------- */

// Возвращает строку вида "Суббота, 12 апреля"
function formatTodayRu() {
  const days = [
    'Воскресенье', 'Понедельник', 'Вторник', 'Среда',
    'Четверг', 'Пятница', 'Суббота',
  ];
  const months = [
    'января', 'февраля', 'марта', 'апреля', 'мая', 'июня',
    'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря',
  ];
  const now = new Date();
  const day = days[now.getDay()];
  const date = now.getDate();
  const month = months[now.getMonth()];
  return `${day}, ${date} ${month}`;
}

/* -----------------------------------------------------------
   Подсчёт итогов по всем приёмам пищи
   Возвращает { calories, protein, fat, carbs }
   ----------------------------------------------------------- */
function calcTotals(meals) {
  const totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  Object.values(meals).forEach(meal => {
    meal.entries.forEach(entry => {
      totals.calories += entry.calories || 0;
      totals.protein  += entry.protein  || 0;
      totals.fat      += entry.fat      || 0;
      totals.carbs    += entry.carbs    || 0;
    });
  });
  // Округляем до целых
  totals.protein = Math.round(totals.protein);
  totals.fat     = Math.round(totals.fat);
  totals.carbs   = Math.round(totals.carbs);
  return totals;
}

/* -----------------------------------------------------------
   Считает сумму калорий одного приёма пищи
   ----------------------------------------------------------- */
function mealCalories(meal) {
  return meal.entries.reduce((sum, e) => sum + (e.calories || 0), 0);
}
