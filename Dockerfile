# Используем официальный Node.js образ
FROM node:20-alpine

# Устанавливаем рабочую директорию
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем исходный код проекта
COPY . .

# Собираем приложение (если используется TypeScript)
RUN npm run build

# Открываем порт
EXPOSE 3000

# Запускаем NestJS
CMD ["node", "dist/main.js"]
