<?php
// deploy.php - скрипт для деплоя фронтенда

$frontendBuildPath = __DIR__ . '/frontend/build';
$backendPublicPath = __DIR__ . '/backend/public';

echo "🚀 Начинаем деплой фронтенда...\n";

// Проверяем, существует ли папка сборки
if (!is_dir($frontendBuildPath)) {
    echo "❌ Ошибка: Папка frontend/build не существует!\n";
    echo "📦 Сначала выполните сборку React: cd frontend && npm run build\n";
    exit(1);
}

echo "🧹 Очищаем папку public...\n";
if (is_dir($backendPublicPath)) {
    rmdir_recursive($backendPublicPath);
}

echo "📤 Копируем файлы...\n";
copy_recursive($frontendBuildPath, $backendPublicPath);

echo "✅ Деплой завершен!\n";

// Функции
function rmdir_recursive($dir) {
    if (!is_dir($dir)) return;
    $files = array_diff(scandir($dir), ['.', '..']);
    foreach ($files as $file) {
        $path = $dir . '/' . $file;
        is_dir($path) ? rmdir_recursive($path) : unlink($path);
    }
    rmdir($dir);
}

function copy_recursive($src, $dst) {
    if (!is_dir($src)) return false;
    if (!is_dir($dst)) mkdir($dst, 0755, true);
    
    $files = array_diff(scandir($src), ['.', '..']);
    foreach ($files as $file) {
        $srcPath = $src . '/' . $file;
        $dstPath = $dst . '/' . $file;
        is_dir($srcPath) ? copy_recursive($srcPath, $dstPath) : copy($srcPath, $dstPath);
    }
    return true;
}
?>