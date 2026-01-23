<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Http\Request;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\RequestController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\ReviewController;
use App\Http\Controllers\Api\NotificationController;

// ПУБЛИЧНЫЕ МАРШРУТЫ АУТЕНТИФИКАЦИИ (без авторизации)
Route::prefix('auth')->group(function () {
    // =========== СУЩЕСТВУЮЩИЕ МАРШРУТЫ (для совместимости) ===========
    Route::post('/send-login-code', [AuthController::class, 'sendLoginCode']);
    Route::post('/send-register-code', [AuthController::class, 'sendRegisterCode']);
    Route::post('/verify-login', [AuthController::class, 'verifyLogin']);
    Route::post('/verify-register', [AuthController::class, 'verifyRegister']);
    
    // =========== НОВЫЕ МАРШРУТЫ ДЛЯ ФРОНТЕНДА ===========
    // То же самое, но с другим URL (что ожидает фронтенд)
    Route::post('/login/send-code', [AuthController::class, 'sendLoginCode']);
    Route::post('/login/verify', [AuthController::class, 'verifyLogin']);
    Route::post('/register/send-code', [AuthController::class, 'sendRegisterCode']);
    Route::post('/register/verify', [AuthController::class, 'verifyRegister']);
    
    // =========== ДОПОЛНИТЕЛЬНЫЕ МЕТОДЫ ИЗ AuthController ===========
    // У тебя есть эти методы в AuthController - подключим их тоже
    Route::post('/register/send-code-alt', [AuthController::class, 'sendRegistrationCode']);
    Route::post('/register/verify-alt', [AuthController::class, 'verifyRegistration']);
    
    // Повторная отправка кода
    Route::post('/resend-code', [AuthController::class, 'resendCode']);
    
    // Выход
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
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

Route::get('/reviews/master/{masterId}', [ReviewController::class, 'index']);

// ЗАЩИЩЕННЫЕ МАРШРУТЫ (требуют авторизации)
Route::middleware('auth:sanctum')->group(function () {
    // Профиль пользователя
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/profile', [ProfileController::class, 'update']);
    Route::post('/profile/avatar', [ProfileController::class, 'updateAvatar']);
    
    // Заявки
    Route::prefix('requests')->group(function () {
        Route::get('/', [RequestController::class, 'index']);
        Route::post('/', [RequestController::class, 'store']);
        Route::get('/statistics', [RequestController::class, 'statistics']);
        Route::get('/{id}', [RequestController::class, 'show']);
        Route::put('/{id}', [RequestController::class, 'update']);
        Route::delete('/{id}', [RequestController::class, 'destroy']);
        
        // Действия с заявками
        Route::post('/{id}/respond', [RequestController::class, 'respond']);
        Route::post('/{id}/select-master', [RequestController::class, 'selectMaster']);
        Route::post('/{id}/complete', [RequestController::class, 'complete']);
        Route::post('/{id}/cancel', [RequestController::class, 'cancel']);
        
        // Фото
        Route::post('/{id}/photos', [RequestController::class, 'uploadPhotos']);
        Route::delete('/{id}/photos/{photoIndex}', [RequestController::class, 'deletePhoto']);
    });
    
    // Чаты
    Route::prefix('chats')->group(function () {
        Route::get('/', [ChatController::class, 'index']);
        Route::get('/unread-count', [ChatController::class, 'unreadCount']);
        Route::get('/{id}', [ChatController::class, 'show']);
        Route::post('/{id}/close', [ChatController::class, 'closeChat']);
        
        // Сообщения
        Route::post('/{id}/messages', [ChatController::class, 'sendMessage']);
        Route::delete('/{chatId}/messages/{messageId}', [ChatController::class, 'deleteMessage']);
    });

    // Тестовое событие
    Route::post('/test-broadcast', function () {
        broadcast(new \App\Events\TestEvent('Тестовое сообщение с сервера!'));
        return response()->json(['success' => true]);
    });
    
    // Отзывы
    Route::prefix('reviews')->group(function () {
        Route::get('/', [ReviewController::class, 'index']);
        Route::post('/', [ReviewController::class, 'store']);
        Route::put('/{id}/reply', [ReviewController::class, 'reply']);
        Route::delete('/{id}', [ReviewController::class, 'destroy']);
    });
    
    // Уведомления
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