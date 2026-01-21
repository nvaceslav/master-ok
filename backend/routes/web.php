<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\SpaController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ProfileController;

// API маршруты - они должны быть ДО SPA маршрутов
Route::prefix('api')->group(function () {
    // Аутентификация
    Route::post('/auth/register/send-code', [AuthController::class, 'sendRegisterCode']);
    Route::post('/auth/register/verify', [AuthController::class, 'verifyRegister']);
    Route::post('/auth/login/send-code', [AuthController::class, 'sendLoginCode']);
    Route::post('/auth/login/verify', [AuthController::class, 'verifyLogin']);
    Route::post('/auth/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/auth/me', [AuthController::class, 'getMe'])->middleware('auth:sanctum');
    
    // Заявки
    Route::apiResource('requests', RequestController::class);
    Route::post('/requests/{id}/respond', [RequestController::class, 'respond'])->middleware('auth:sanctum');
    Route::post('/requests/{id}/select-master', [RequestController::class, 'selectMaster'])->middleware('auth:sanctum');
    Route::post('/requests/{id}/complete', [RequestController::class, 'complete'])->middleware('auth:sanctum');
    Route::post('/requests/{id}/photos', [RequestController::class, 'uploadPhotos'])->middleware('auth:sanctum');
    
    // Чаты
    Route::get('/chats', [ChatController::class, 'index'])->middleware('auth:sanctum');
    Route::get('/chats/{id}', [ChatController::class, 'show'])->middleware('auth:sanctum');
    Route::post('/chats/{id}/messages', [ChatController::class, 'sendMessage'])->middleware('auth:sanctum');
    Route::get('/chats/unread-count', [ChatController::class, 'unreadCount'])->middleware('auth:sanctum');
    
    // Профиль
    Route::post('/profile/upload-avatar', [ProfileController::class, 'uploadAvatar'])->middleware('auth:sanctum');
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar'])->middleware('auth:sanctum');
    Route::put('/profile', [ProfileController::class, 'update'])->middleware('auth:sanctum');
});

// SPA маршруты - все остальные запросы отдаем React приложению
Route::get('/', [SpaController::class, 'index']);
Route::get('/auth', [SpaController::class, 'catchAll']);
Route::get('/dashboard', [SpaController::class, 'catchAll']);
Route::get('/requests', [SpaController::class, 'catchAll']);
Route::get('/chats', [SpaController::class, 'catchAll']);
Route::get('/demo', [SpaController::class, 'catchAll']);

// Ловим все остальные маршруты для React Router
Route::get('/{any}', [SpaController::class, 'catchAll'])->where('any', '.*');