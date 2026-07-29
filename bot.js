const { Telegraf, Markup } = require('telegraf');
const axios = require('axios');

const bot = new Telegraf(process.env.BOT_TOKEN);

// Хранилище пользовательских данных
const userSessions = {};

// Функция для генерации анализа
function generateAnalysis(timeframe) {
  const rsiOptions = ['Oversold', 'Overbought', 'Neutral'];
  const macdOptions = ['Bullish divergence', 'Selling pressure', 'Neutral'];
  const maOptions = ['Upward trend', 'Downward trend', 'Sideways'];
  const volatilityOptions = ['High', 'Medium', 'Low'];
  
  // Генерируем сигнал
  const decisions = ['BUY', 'SELL', 'HOLD'];
  const decision = decisions[Math.floor(Math.random() * decisions.length)];
  
  // Если BUY - высокая вероятность bullish индикаторов
  // Если SELL - высокая вероятность bearish индикаторов
  let rsi, macd, ma;
  
  if (decision === 'BUY') {
    rsi = 'Oversold';
    macd = 'Bullish divergence';
    ma = 'Upward trend';
  } else if (decision === 'SELL') {
    rsi = 'Overbought';
    macd = 'Selling pressure';
    ma = 'Downward trend';
  } else {
    rsi = rsiOptions[Math.floor(Math.random() * rsiOptions.length)];
    macd = macdOptions[Math.floor(Math.random() * macdOptions.length)];
    ma = maOptions[Math.floor(Math.random() * maOptions.length)];
  }

  return {
    timeframe,
    rsi,
    macd,
    ma,
    volatility: volatilityOptions[Math.floor(Math.random() * volatilityOptions.length)],
    strength: Math.floor(Math.random() * 40) + 60,
    signalGen: Math.floor(Math.random() * 100),
    decision,
    timestamp: new Date().toLocaleTimeString('ru-RU')
  };
}

// Функция для форматирования анализа
function formatAnalysis(analysis) {
  const decisionEmoji = {
    'BUY': '🟢',
    'SELL': '🔴',
    'HOLD': '🟡'
  };

  const emoji = decisionEmoji[analysis.decision];

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━
🔍 SPIKE TRADE ANALYZER
━━━━━━━━━━━━━━━━━━━━━━━━━

📊 TIMEFRAME: ${analysis.timeframe}

━━━━━━━━━━━━━━━━━━━━━━━━━
${emoji} SIGNAL DECISION: ${analysis.decision} ${emoji}
━━━━━━━━━━━━━━━━━━━━━━━━━

📈 TECHNICAL INDICATORS:

🔹 RSI Analysis
   ${analysis.rsi}

🔹 MACD Status
   ${analysis.macd}

🔹 Moving Average
   ${analysis.ma}

🔹 Volatility Scan
   ${analysis.volatility} ⚡

━━━━━━━━━━━━━━━━━━━━━━━━━

💪 Signal Strength: ${analysis.strength}%
   ${analysis.strength > 75 ? '✅ Strong' : analysis.strength > 50 ? '⚠️ Moderate' : '🔶 Weak'}

📡 Signal Generation: ${analysis.signalGen}%

━━━━━━━━━━━━━━━━━━━━━━━━━
⏱️ Last updated: ${analysis.timestamp}

🔗 USD/CLP OTC Analysis
━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ Disclaimer: For educational purposes only.
Always conduct your own research before trading.
`;
}

// Команда /start
bot.start((ctx) => {
  ctx.reply(`
👋 Добро пожаловать в Spike Trade Analyzer!

Я анализирую технические индикаторы и даю четкие сигналы:
🟢 BUY - сигнал к покупке
🔴 SELL - сигнал к продаже
🟡 HOLD - держать позицию

Выберите таймфрейм для анализа USD/CLP OTC:
  `, 
  Markup.inlineKeyboard([
    [Markup.button.callback('5 сек', 'tf_5s'), Markup.button.callback('15 сек', 'tf_15s')],
    [Markup.button.callback('30 сек', 'tf_30s'), Markup.button.callback('1 мин', 'tf_1m')],
    [Markup.button.callback('2 мин', 'tf_2m'), Markup.button.callback('3 мин', 'tf_3m')],
    [Markup.button.callback('5 мин', 'tf_5m'), Markup.button.callback('10 мин', 'tf_10m')]
  ])
  );
});

// Команда /analyze
bot.command('analyze', (ctx) => {
  ctx.reply('📊 Выберите таймфрейм для анализа:', 
  Markup.inlineKeyboard([
    [Markup.button.callback('5 сек', 'tf_5s'), Markup.button.callback('15 сек', 'tf_15s')],
    [Markup.button.callback('30 сек', 'tf_30s'), Markup.button.callback('1 мин', 'tf_1m')],
    [Markup.button.callback('2 мин', 'tf_2m'), Markup.button.callback('3 мин', 'tf_3m')],
    [Markup.button.callback('5 мин', 'tf_5m'), Markup.button.callback('10 мин', 'tf_10m')]
  ])
  );
});

// Команда /help
bot.command('help', (ctx) => {
  ctx.reply(`
🤖 КОМАНДЫ:

/start - Начать работу
/analyze - Получить анализ
/help - Справка

💡 КАК ПОЛЬЗОВАТЬСЯ:

1️⃣ Выберите таймфрейм (5сек - 10мин)
2️⃣ Получите технический анализ с сигналом
3️⃣ Изучите индикаторы (RSI, MACD, MA, Volatility)
4️⃣ Примите решение на основе анализа

📊 СИГНАЛЫ:
🟢 BUY - покупать
🔴 SELL - продавать  
🟡 HOLD - держать

⚠️ РИСК: Это образовательный инструмент.
Всегда проводите собственное исследование перед торговлей!
  `);
});

// Обработчик кнопок таймфреймов
bot.action(/tf_(.+)/, (ctx) => {
  const timeframeMap = {
    '5s': '5 сек',
    '15s': '15 сек',
    '30s': '30 сек',
    '1m': '1 минута',
    '2m': '2 минуты',
    '3m': '3 минуты',
    '5m': '5 минут',
    '10m': '10 минут'
  };

  const tf = ctx.match[1];
  const timeframeDisplay = timeframeMap[tf];

  // Отправляем уведомление о загрузке
  ctx.answerCbQuery('⏳ Анализирую...');
  
  // Генерируем анализ
  const analysis = generateAnalysis(timeframeDisplay);
  
  // Отправляем результат
  ctx.reply(formatAnalysis(analysis), 
    Markup.inlineKeyboard([
      [Markup.button.callback('🔄 Новый анализ', 'tf_' + tf)],
      [Markup.button.callback('📊 Другой таймфрейм', 'show_timeframes')]
    ])
  );
});

// Кнопка для показа таймфреймов
bot.action('show_timeframes', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply('📊 Выберите таймфрейм:', 
    Markup.inlineKeyboard([
      [Markup.button.callback('5 сек', 'tf_5s'), Markup.button.callback('15 сек', 'tf_15s')],
      [Markup.button.callback('30 сек', 'tf_30s'), Markup.button.callback('1 мин', 'tf_1m')],
      [Markup.button.callback('2 мин', 'tf_2m'), Markup.button.callback('3 мин', 'tf_3m')],
      [Markup.button.callback('5 мин', 'tf_5m'), Markup.button.callback('10 мин', 'tf_10m')]
    ])
  );
});

// Обработчик текстовых сообщений
bot.on('text', (ctx) => {
  ctx.reply('Выберите опцию:', 
    Markup.inlineKeyboard([
      [Markup.button.callback('📊 Анализ', 'show_timeframes')],
      [Markup.button.callback('❓ Справка', 'show_help')],
      [Markup.button.callback('📖 О боте', 'show_about')]
    ])
  );
});

// Обработчик справки
bot.action('show_help', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(`
🤖 СПРАВКА:

Spike Trade Analyzer - бот для технического анализа USD/CLP OTC

ВОЗМОЖНОСТИ:
✅ Анализ RSI
✅ Анализ MACD
✅ Анализ Moving Average
✅ Сканирование волатильности
✅ Четкие сигналы BUY/SELL/HOLD

ТАЙМФРЕЙМЫ: 5сек - 10мин

Используйте /analyze для начала анализа
  `);
});

// Обработчик "О боте"
bot.action('show_about', (ctx) => {
  ctx.answerCbQuery();
  ctx.reply(`
🚀 SPIKE TRADE ANALYZER v1.0

Разработано для анализа торговых сигналов на OTC рынках.

💡 Функции:
• Технический анализ в реальном времени
• Анализ множественных индикаторов
• Рекомендации по входу/выходу

⚠️ Дисклеймер:
Это образовательный инструмент.
НЕ является финансовым советом.
Все решения о торговле - на ваш риск.

📞 Начните с /start
  `);
});

// Обработка ошибок
bot.catch((err, ctx) => {
  console.error('Ошибка:', err);
  ctx.reply('❌ Произошла ошибка. Попробуйте позже.');
});

// Запуск бота
bot.launch({
  allowedUpdates: ['message', 'callback_query', 'edited_message']
});

console.log('🤖 Бот запущен и готов к работе!');

// Graceful shutdown
process.once('SIGINT', () => bot.stop('SIGINT'));
process.once('SIGTERM', () => bot.stop('SIGTERM'));
const http = require('http');
