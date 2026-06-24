# Деплой ai-assistant-platform — пошаговая инструкция для Олега

> Приложение разворачивается как отдельный PM2-процесс на порту **3100** рядом с optisphere (порт 3000).
> Поддомен: **app.optisphere.tech** — легко заменяется (3 места в nginx-конфиге, 1 в APP_BASE_URL).

---

## 0. Предусловия (уже есть на VPS для optisphere)

- Node.js 20+
- npm (идёт с Node)
- PM2 (`npm list -g pm2`)
- nginx
- certbot + python3-certbot-nginx

Проверь:

```bash
node -v        # должно быть v20.x или выше
pm2 -v
nginx -v
certbot --version
```

---

## 1. DNS — добавить A-запись в reg.ru

В панели **reg.ru → DNS-записи** для домена `optisphere.tech`:

| Тип | Имя       | Значение        | TTL  |
|-----|-----------|-----------------|------|
| A   | app       | <IP вашего VPS> | 3600 |

Дождись propagation (обычно 5–30 минут). Проверь:

```bash
dig +short app.optisphere.tech
# должен вернуть IP VPS
```

---

## 2. Клонирование репозитория на сервер

Подключись по SSH и выполни:

```bash
cd /var/www
git clone https://github.com/<your-org>/ai-assistant-platform.git
cd ai-assistant-platform
```

Если репо приватное — используй deploy key или Personal Access Token.

---

## 3. Создать `.env.local` с реальными секретами

`.env.local` **не коммитится** — создай его прямо на сервере:

```bash
nano /var/www/ai-assistant-platform/.env.local
```

Содержимое (замени плейсхолдеры реальными значениями):

```dotenv
# Обязательно в проде — без этого сессии небезопасны
SESSION_SECRET=<output of: openssl rand -hex 32>

# Claude API
ANTHROPIC_API_KEY=<your Anthropic key>

# Если Anthropic недоступен напрямую с VPS — прокси (необязательно)
# ANTHROPIC_BASE_URL=https://your-proxy-url

# Telegram
TELEGRAM_BOT_TOKEN=<token from @BotFather>
TELEGRAM_BOT_USERNAME=<bot_username without @>
TELEGRAM_WEBHOOK_SECRET=<output of: openssl rand -hex 32>

# SQLite путь (по умолчанию ./data/app.db — подходит)
# DB_PATH=

# Базовый URL — ОБЯЗАТЕЛЬНО установить точным поддоменом
APP_BASE_URL=https://app.optisphere.tech

# Демо-аккаунт (demo@example.com / demo1234) — ТОЛЬКО для тестирования
# Убери или закомменти в реальном проде
# SEED_DEMO=1
# NEXT_PUBLIC_SHOW_DEMO=1
```

Сгенерировать секреты прямо на сервере:

```bash
echo "SESSION_SECRET=$(openssl rand -hex 32)"
echo "TELEGRAM_WEBHOOK_SECRET=$(openssl rand -hex 32)"
```

Скопируй вывод в соответствующие строки `.env.local`.

---

## 4. Установка зависимостей и сборка

```bash
cd /var/www/ai-assistant-platform

# npm ci пересоберёт better-sqlite3 нативно под Linux
npm ci

# Сборка Next.js
npm run build
```

Сборка занимает 1–3 минуты. В конце должно появиться сообщение `✓ Compiled successfully`.

---

## 5. Запустить через PM2

```bash
cd /var/www/ai-assistant-platform

# Первый запуск
pm2 startOrRestart ecosystem.config.js
pm2 save

# Проверить что процесс поднялся
pm2 status
pm2 logs ai-assistant-platform --lines 50
```

Процесс слушает на `127.0.0.1:3100`. Проверь локально:

```bash
curl -s http://127.0.0.1:3100 | head -5
# должен вернуть HTML главной страницы
```

### Автозапуск после перезагрузки сервера

Если PM2 startup ещё не настроен (для optisphere уже должен быть):

```bash
pm2 startup systemd
# выполни команду, которую PM2 выведет (начинается с sudo env ...)
pm2 save
```

---

## 6. nginx — подключить конфиг

```bash
# Скопировать конфиг
sudo cp /var/www/ai-assistant-platform/deploy/nginx-app.optisphere.tech.conf \
        /etc/nginx/sites-available/app.optisphere.tech

# Активировать
sudo ln -s /etc/nginx/sites-available/app.optisphere.tech \
           /etc/nginx/sites-enabled/

# Проверить синтаксис
sudo nginx -t

# Если OK — перезагрузить
sudo systemctl reload nginx
```

---

## 7. SSL через Let's Encrypt

```bash
sudo certbot --nginx -d app.optisphere.tech
```

Certbot автоматически:
- Получит сертификат
- Перепишет nginx-конфиг (добавит SSL-директивы)
- Настроит HTTP→HTTPS редирект

После завершения проверь автообновление:

```bash
sudo systemctl list-timers | grep certbot
# или
sudo certbot renew --dry-run
```

---

## 8. Зарегистрировать Telegram webhook

После того как сайт поднят по HTTPS:

```bash
cd /var/www/ai-assistant-platform

# Экспортируй нужные переменные из .env.local
export $(grep -v '^#' .env.local | grep -E 'TELEGRAM_BOT_TOKEN|APP_BASE_URL|TELEGRAM_WEBHOOK_SECRET' | xargs)

node scripts/set-telegram-webhook.mjs
```

Ожидаемый вывод:
```
Webhook set successfully: https://app.optisphere.tech/api/telegram/webhook
secret_token: configured
Webhook was set
```

---

## 9. Проверка

```bash
# 1. PM2 процессы
pm2 status
# → ai-assistant-platform   online

# 2. Сайт доступен
curl -I https://app.optisphere.tech
# → HTTP/2 200

# 3. Логи — нет ERROR в первую минуту
pm2 logs ai-assistant-platform --lines 100

# 4. optisphere не затронут
pm2 status
curl -I https://optisphere.tech
```

Открой в браузере:
- `https://app.optisphere.tech` — главная/лендинг платформы
- `https://app.optisphere.tech/login` — вход
- `https://app.optisphere.tech/signup` — регистрация

Если включён демо-режим (`SEED_DEMO=1`): войди как `demo@example.com` / `demo1234`.

---

## 10. Деплой обновлений

В дальнейшем для обновления достаточно:

```bash
cd /var/www/ai-assistant-platform
bash deploy.sh
```

Скрипт: `git pull → npm ci → npm run build → pm2 startOrRestart → pm2 save`.

---

## 11. Заметки по безопасности и compliance

### 152-ФЗ / 242-ФЗ
- SQLite база данных (`./data/app.db`) хранится на VPS, физически находящемся в РФ — соответствует требованию локализации.
- До публичного запуска: подать уведомление в Роскомнадзор (`pd.rkn.gov.ru`).
- Страницы `/privacy`, `/terms`, `/offer` должны содержать реквизиты оператора ПД (ИНН, ОГРН, адрес). Данные предоставляет Олег.

### SESSION_SECRET
Обязателен в `.env.local`. Без него приложение упадёт на старте в production (`NODE_ENV=production`).

### Бэкап SQLite

Добавить в cron:

```bash
sudo crontab -e
# добавить строку:
0 3 * * * cp /var/www/ai-assistant-platform/data/app.db /var/backups/ai-assistant-platform/app-$(date +\%Y-\%m-\%d).db
```

Создать директорию заранее:
```bash
sudo mkdir -p /var/backups/ai-assistant-platform
sudo chown deploy:deploy /var/backups/ai-assistant-platform
```

---

## Что нужно от Олега

- [ ] Добавить A-запись `app` в DNS reg.ru (шаг 1)
- [ ] Заполнить `.env.local` реальными секретами: `ANTHROPIC_API_KEY`, `TELEGRAM_BOT_TOKEN`, `TELEGRAM_BOT_USERNAME` (шаг 3)
- [ ] Для compliance: ИП/ООО, ИНН, ОГРН(ИП), юр.адрес, email для обращений по ПД — чтобы заполнить страницы `/privacy` и `/offer`
- [ ] Выбрать: показывать демо-вход (`SEED_DEMO=1`) или нет

---

## Изменить поддомен

Если нужен другой поддомен вместо `app.optisphere.tech`:

1. `deploy/nginx-app.optisphere.tech.conf` — переименовать файл и заменить `app.optisphere.tech` (3 вхождения в server_name и ssl_certificate путях)
2. `.env.local` на сервере: `APP_BASE_URL=https://новый.домен`
3. Перерегистрировать Telegram webhook (шаг 8)
