<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class NotificationController extends Controller
{
    /**
     * Получить уведомления пользователя
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        // TODO: Реализовать реальные уведомления
        // Пока вернем заглушку
        $notifications = [
            [
                'id' => 1,
                'type' => 'new_response',
                'title' => 'Новый отклик на вашу заявку',
                'message' => 'Мастер Иван откликнулся на вашу заявку "Ремонт холодильника"',
                'data' => ['request_id' => 1],
                'read' => false,
                'created_at' => now()->subMinutes(30)
            ],
            [
                'id' => 2,
                'type' => 'request_accepted',
                'title' => 'Ваш отклик принят',
                'message' => 'Клиент Петр выбрал вас для выполнения заказа',
                'data' => ['request_id' => 2],
                'read' => true,
                'created_at' => now()->subHours(2)
            ]
        ];
        
        // Фильтр по статусу
        if ($request->has('unread_only') && $request->unread_only) {
            $notifications = array_filter($notifications, function($notification) {
                return !$notification['read'];
            });
        }
        
        return response()->json([
            'success' => true,
            'data' => array_values($notifications),
            'unread_count' => count(array_filter($notifications, function($n) {
                return !$n['read'];
            }))
        ]);
    }
    
    /**
     * Пометить уведомление как прочитанное
     */
    public function markAsRead($id)
    {
        // TODO: Реализовать реальное обновление
        return response()->json([
            'success' => true,
            'message' => 'Уведомление прочитано'
        ]);
    }
    
    /**
     * Пометить все уведомления как прочитанные
     */
    public function markAllAsRead()
    {
        // TODO: Реализовать реальное обновление
        return response()->json([
            'success' => true,
            'message' => 'Все уведомления прочитаны'
        ]);
    }
}