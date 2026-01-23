<?php

namespace App\Services;

use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;

class SmsService
{
    /**
     * ВСЕГДА возвращаем код 1111
     */
    public function sendVerificationCode($phone, $code = null)
    {
        $fixedCode = '1111'; // ← Фиксированный код
        
        Log::info('📱 SMS Service: Код для ' . $phone . ' = ' . $fixedCode);
        
        // Сохраняем в кэш
        $key = 'sms_code_' . preg_replace('/[^0-9]/', '', $phone);
        Cache::put($key, $fixedCode, now()->addMinutes(60));
        
        // Для отладки в JSON ответе
        $debugCode = env('APP_DEBUG', false) ? $fixedCode : null;
        
        return [
            'success' => true,
            'code' => $fixedCode,
            'debug_code' => $debugCode,
            'message' => 'Код отправлен (всегда 1111)'
        ];
    }
    
    /**
     * Проверяем код: всегда принимаем 1111
     */
    public function verifyCode($phone, $code)
    {
        Log::info('🔐 Проверка кода для ' . $phone . ': ' . $code);
        
        // ВСЕГДА принимаем 1111
        if (trim($code) === '1111') {
            Log::info('✅ Код 1111 принят!');
            return true;
        }
        
        // На всякий случай проверяем кэш
        $key = 'sms_code_' . preg_replace('/[^0-9]/', '', $phone);
        $cachedCode = Cache::get($key);
        
        $result = $cachedCode === $code;
        
        if (!$result) {
            Log::warning('❌ Неверный код для ' . $phone . 
                        ': получен ' . $code . 
                        ', ожидался в кэше: ' . ($cachedCode ?? 'отсутствует'));
        }
        
        return $result;
    }
    
    /**
     * Всегда можно отправить снова
     */
    public function canSendAgain($phone)
    {
        return true; // Отключаем ограничение по времени
    }
    
    /**
     * Очистка кода
     */
    public function clearCode($phone)
    {
        $key = 'sms_code_' . preg_replace('/[^0-9]/', '', $phone);
        Cache::forget($key);
        Log::info('🗑️ Код очищен для ' . $phone);
    }
    
    /**
     * Всегда генерируем 1111
     */
    public function generateCode()
    {
        return '1111';
    }
}