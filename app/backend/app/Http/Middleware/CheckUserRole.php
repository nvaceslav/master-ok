<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class CheckUserRole
{
    public function handle(Request $request, Closure $next, ...$roles)
    {
        $user = $request->user();
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Не авторизован'
            ], 401);
        }
        
        if (!in_array($user->role, $roles)) {
            return response()->json([
                'success' => false,
                'message' => 'Недостаточно прав'
            ], 403);
        }
        
        return $next($request);
    }
}