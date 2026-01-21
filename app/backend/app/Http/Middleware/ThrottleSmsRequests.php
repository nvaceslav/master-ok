// app/Http/Middleware/ThrottleSmsRequests.php
<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;

class ThrottleSmsRequests
{
    public function handle(Request $request, Closure $next, $maxAttempts = 5, $decayMinutes = 60)
    {
        $key = 'sms_attempts_' . $request->ip();
        
        $attempts = Cache::get($key, 0);
        
        if ($attempts >= $maxAttempts) {
            return response()->json([
                'success' => false,
                'message' => 'Слишком много запросов. Попробуйте через час.'
            ], 429);
        }
        
        Cache::put($key, $attempts + 1, now()->addMinutes($decayMinutes));
        
        return $next($request);
    }
}