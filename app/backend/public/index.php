<?php
// backend/public/index.php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

$uri = $_SERVER['REQUEST_URI'];

// Если это статический файл (CSS, JS, изображения) - отдаем как есть
if (preg_match('/\.(css|js|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/', $uri)) {
    $file = __DIR__ . $uri;
    if (file_exists($file)) {
        $mime_types = [
            'css' => 'text/css',
            'js' => 'application/javascript',
            'png' => 'image/png',
            'jpg' => 'image/jpeg',
            'jpeg' => 'image/jpeg',
            'gif' => 'image/gif',
            'ico' => 'image/x-icon',
            'svg' => 'image/svg+xml',
            'woff' => 'font/woff',
            'woff2' => 'font/woff2',
            'ttf' => 'font/ttf',
            'eot' => 'application/vnd.ms-fontobject',
        ];
        
        $ext = pathinfo($file, PATHINFO_EXTENSION);
        if (isset($mime_types[$ext])) {
            header('Content-Type: ' . $mime_types[$ext]);
        }
        
        readfile($file);
        exit;
    }
}

// Если это API запрос - обрабатываем через Laravel
if (strpos($uri, '/api/') === 0 || strpos($uri, '/broadcasting/') === 0 || 
    strpos($uri, '/sanctum/') === 0 || strpos($uri, '/vendor/') === 0) {
    
    require __DIR__.'/../vendor/autoload.php';
    $app = require_once __DIR__.'/../bootstrap/app.php';
    $kernel = $app->make(Kernel::class);
    $response = $kernel->handle($request = Request::capture());
    $response->send();
    $kernel->terminate($request, $response);
    
} else {
    // Для всех остальных маршрутов отдаём React SPA
    readfile(__DIR__.'/index.html');
}