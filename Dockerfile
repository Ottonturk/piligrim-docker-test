# Шаг 1: Базовый образ
FROM node:18

# Шаг 2: Установка рабочей директории
WORKDIR /app

# Шаг 3: Копируем package.json и устанавливаем зависимости
COPY package*.json ./
RUN npm install

# Шаг 4: Копируем остальной проект
COPY . .

# Шаг 4.1: Копируем SSL-сертификаты
COPY private.key certificate.crt ./

# Шаг 5: Устанавливаем переменные
ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}
ENV PORT=5001

# ✅ Шаг 6: Безопасная сборка React-фронта
#RUN [ -f "./node_modules/.bin/react-scripts" ] && npm run build || echo "⚠️ React-сборка пропущена"
# ✅ Шаг 6: Безопасная сборка React (если фронт есть)
RUN if [ -f "./node_modules/.bin/react-scripts" ]; then npm run build; else echo "⚠️ React build skipped"; fi

# Шаг 7: Пробрасываем порт
EXPOSE 5001

# Шаг 8: Запускаем сервер
CMD ["node", "server.js"]
