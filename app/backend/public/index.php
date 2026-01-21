<?php
// backend/public/index.php

use Illuminate\Contracts\Http\Kernel;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

// Определяем, API ли это или SPA маршрут
$uri = $_SERVER['REQUEST_URI'];

// Если это API запрос - обрабатываем через Laravel
if (strpos($uri, '/api/') === 0 || strpos($uri, '/broadcasting/') === 0 || 
    strpos($uri, '/sanctum/') === 0 || strpos($uri, '/vendor/') === 0) {
    
    // Стандартный Laravel обработчик
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
?>