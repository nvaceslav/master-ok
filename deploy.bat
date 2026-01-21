@echo off
echo 🚀 Запуск деплоя МастерОК...

echo 🔨 Сборка фронтенда...
cd frontend
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Ошибка сборки фронтенда
    pause
    exit /b 1
)

echo 📂 Копирование файлов в backend/public...
xcopy /E /I /Y build ..\backend\public\
if %errorlevel% neq 0 (
    echo ❌ Ошибка копирования файлов
    pause
    exit /b 1
)

echo ✅ Деплой завершен!
echo 🌐 Приложение доступно по адресу: http://localhost:8000
echo 📁 Файлы размещены в: backend\public
pause