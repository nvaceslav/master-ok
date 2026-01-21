<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Cache;
use App\Events\UserOnlineStatus;

class TrackOnlineStatus
{
    public function handle(Request $request, Closure $next)
    {
        if (Auth::check()) {
            $user = Auth::user();
            $key = 'user-online-' . $user->id;
            $expiresAt = now()->addMinutes(5);
            
            // Кэшируем онлайн статус на 5 минут
            Cache::put($key, true, $expiresAt);
            
            // Отправляем событие о том, что пользователь онлайн
            broadcast(new UserOnlineStatus($user->id, true));
            
            // Обновляем время последней активности
            $user->update(['last_seen_at' => now()]);
        }
        
        return $next($request);
    }
    
    public function terminate($request, $response)
    {
        // При завершении запроса можно обновить статус
        // или оставить как есть - кэш истечет через 5 минут неактивности
    }
}