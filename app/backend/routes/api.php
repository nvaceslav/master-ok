<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NotificationController;

// ============ ВАЖНО: ОТКЛЮЧАЕМ CSRF ДЛЯ ВСЕГО API ============
Route::middleware(['api'])->group(function () {
    
// ПУБЛИЧНЫЕ МАРШРУТЫ АУТЕНТИФИКАЦИИ (без авторизации)
Route::prefix('auth')->group(function () {
    // =========== СУЩЕСТВУЮЩИЕ МАРШРУТЫ (для совместимости) ===========
    Route::post('/send-login-code', [AuthController::class, 'sendLoginCode']);
    Route::post('/send-register-code', [AuthController::class, 'sendRegisterCode']);
    Route::post('/verify-login', [AuthController::class, 'verifyLogin']);
    Route::post('/verify-register', [AuthController::class, 'verifyRegister']);
    
    // =========== МАРШРУТЫ ИЗ WEB.PHP ===========
    Route::post('/register/send-code', [AuthController::class, 'sendRegisterCode']);
    Route::post('/register/verify', [AuthController::class, 'verifyRegister']);
    Route::post('/login/send-code', [AuthController::class, 'sendLoginCode']);
    Route::post('/login/verify', [AuthController::class, 'verifyLogin']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'getMe'])->middleware('auth:sanctum');
    
    // =========== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ИЗ AuthController ===========
    Route::post('/register/send-code-alt', [AuthController::class, 'sendRegistrationCode']);
    Route::post('/register/verify-alt', [AuthController::class, 'verifyRegistration']);
    
    // Повторная отправка кода
    Route::post('/resend-code', [AuthController::class, 'resendCode']);
});

// ПУБЛИЧНЫЕ МАРШРУТЫ
Route::get('/masters', function (Request $request) {
    $query = \App\Models\User::where('role', 'master')
        ->withCount('masterReviews')
        ->withAvg('masterReviews', 'rating');
    
    // Фильтры
    if ($request->has('city')) {
        $query->where('city', $request->city);
    }
    
    if ($request->has('specialization')) {
        $query->whereJsonContains('specializations', $request->specialization);
    }
    
    // Сортировка
    $sort = $request->get('sort', 'rating');
    $order = $request->get('order', 'desc');
    $query->orderBy($sort, $order);
    
    $masters = $query->paginate(12);
    
    return response()->json([
        'success' => true,
        'data' => $masters
    ]);
});

// ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют авторизации)
Route::middleware('auth:sanctum')->group(function () {
    // Профиль пользователя (маршруты из web.php и api.php)
    Route::get('/auth/me', [AuthController::class, 'getMe']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/upload-avatar', [ProfileController::class, 'uploadAvatar']);
    Route::delete('/profile/avatar', [ProfileController::class, 'deleteAvatar']);
    
    // Дополнительные маршруты профиля из api.php
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    
    // Заявки (маршруты из web.php)
    Route::apiResource('requests', RequestController::class);
    Route::post('/requests/{id}/respond', [RequestController::class, 'respond']);
    Route::post('/requests/{id}/select-master', [RequestController::class, 'selectMaster']);
    Route::post('/requests/{id}/complete', [RequestController::class, 'complete']);
    Route::post('/requests/{id}/photos', [RequestController::class, 'uploadPhotos']);
    
    // Дополнительные маршруты заявок из api.php
    Route::get('/requests/statistics', [RequestController::class, 'statistics']);
    Route::post('/requests/{id}/cancel', [RequestController::class, 'cancel']);
    Route::delete('/requests/{id}/photos/{photoIndex}', [RequestController::class, 'deletePhoto']);
    
    // Чаты (маршруты из web.php)
    Route::get('/chats', [ChatController::class, 'index']);
    Route::get('/chats/{id}', [ChatController::class, 'show']);
    Route::post('/chats/{id}/messages', [ChatController::class, 'sendMessage']);
    Route::get('/chats/unread-count', [ChatController::class, 'unreadCount']);
    
    // Дополнительные маршруты чатов из api.php
    Route::post('/chats/{id}/close', [ChatController::class, 'closeChat']);
    Route::delete('/chats/{chatId}/messages/{messageId}', [ChatController::class, 'deleteMessage']);
    
    // Отзывы (только из api.php)
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::post('/', [ReviewController::class, 'store']);
        Route::put('/{id}/reply', [ReviewController::class, 'reply']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
    });
    
    // Уведомления (только из api.php)
    Route::prefix('notifications')->group(function () {
        Route::get('/', [NotificationController::class, 'index']);
        Route::post('/{id}/read', [NotificationController::class, 'markAsRead']);
        Route::post('/mark-all-read', [NotificationController::class, 'markAllAsRead']);
    });
    
    // Административные маршруты
    Route::middleware('role:admin')->group(function () {
        Route::get('/admin/stats', function () {
            return response()->json([
                'success' => true,
                'data' => [
                    'total_users' => \App\Models\User::count(),
                    'total_requests' => \App\Models\Request::count(),
                    'active_requests' => \App\Models\Request::whereIn('status', ['new', 'searching', 'in_progress'])->count(),
                    'masters_count' => \App\Models\User::where('role', 'master')->count(),
                    'clients_count' => \App\Models\User::where('role', 'client')->count(),
                ]
            ]);
        });
    });
});

// Fallback для несуществующих API маршрутов
Route::fallback(function () {
    return response()->json([
        'success' => false,
        'message' => 'API маршрут не найден'
    ], 404);
});

}); // ← ЗАКРЫВАЕМ middleware group