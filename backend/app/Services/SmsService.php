<?php

namespace App\Services;

use GuzzleHttp\Client;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class SmsService
{
    protected $client;
    protected $config;
    protected $driver;

    public function __construct()
    {
        $this->client = new Client([
            'timeout' => 10,
            'connect_timeout' => 5,
        ]);
        
        $this->driver = config('sms.default');
        $this->config = config('sms.drivers.' . $this->driver);
    }

    /**
     * Отправка SMS с кодом
     */
    public function sendVerificationCode($phone, $code = null)
    {
        // Если включен режим отладки
        if (config('sms.debug')) {
            Log::info('SMS debug mode: Код для ' . $phone . ': ' . config('sms.debug_code'));
            return [
                'success' => true,
                'code' => config('sms.debug_code'),
                'debug' => true,
            ];
        }

        // Генерация кода, если не передан
        if (!$code) {
            $code = $this->generateCode();
        }

        // Форматирование телефона
        $formattedPhone = $this->formatPhone($phone);
        
        // Текст сообщения
        $message = "Ваш код для входа в MasterOK: " . $code;

        // Отправка через выбранный драйвер
        $result = $this->sendSms($formattedPhone, $message);

        if ($result['success']) {
            // Сохраняем код в кэш
            $this->storeCode($phone, $code);
            
            Log::info('SMS отправлен на ' . $phone . ', код: ' . $code);
        } else {
            Log::error('Ошибка отправки SMS на ' . $phone . ': ' . $result['error']);
        }

        return $result;
    }

    /**
     * Отправка SMS через SMSC.ru
     */
    protected function sendViaSmsc($phone, $message)
    {
        $params = [
            'login' => $this->config['login'],
            'psw' => $this->config['password'],
            'phones' => $phone,
            'mes' => $message,
            'sender' => $this->config['sender'],
            'fmt' => 3, // JSON ответ
            'charset' => 'utf-8',
        ];

        try {
            $response = $this->client->post($this->config['url'], [
                'form_params' => $params,
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => isset($data['id']) || isset($data['cnt']),
                'data' => $data,
                'error' => isset($data['error_code']) ? $data['error'] : null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Отправка SMS через SMS.ru
     */
    protected function sendViaSmsru($phone, $message)
    {
        $params = [
            'api_id' => $this->config['api_id'],
            'to' => $phone,
            'msg' => $message,
            'json' => 1,
            'from' => $this->config['sender'],
        ];

        try {
            $response = $this->client->post($this->config['url'], [
                'form_params' => $params,
            ]);

            $data = json_decode($response->getBody(), true);

            return [
                'success' => $data['status'] == 'OK',
                'data' => $data,
                'error' => $data['status'] != 'OK' ? $data['status_text'] : null,
            ];
        } catch (\Exception $e) {
            return [
                'success' => false,
                'error' => $e->getMessage(),
            ];
        }
    }

    /**
     * Отправка SMS через выбранный драйвер
     */
    protected function sendSms($phone, $message)
    {
        switch ($this->driver) {
            case 'smsc':
                return $this->sendViaSmsc($phone, $message);
                
            case 'smsru':
                return $this->sendViaSmsru($phone, $message);
                
            case 'log':
                Log::info('SMS (логирование): На номер ' . $phone . ': ' . $message);
                return [
                    'success' => true,
                    'data' => ['logged' => true],
                ];
                
            default:
                throw new \Exception('Неизвестный SMS драйвер: ' . $this->driver);
        }
    }

    /**
     * Генерация кода
     */
    public function generateCode()
    {
        $length = config('sms.code_length', 4);
        
        if (config('sms.debug')) {
            return config('sms.debug_code');
        }
        
        // Генерация цифрового кода
        $min = pow(10, $length - 1);
        $max = pow(10, $length) - 1;
        
        return rand($min, $max);
    }

    /**
     * Сохранение кода в кэш
     */
    protected function storeCode($phone, $code)
    {
        $key = 'sms_code_' . $this->normalizePhone($phone);
        $lifetime = config('sms.code_lifetime', 5);
        
        Cache::put($key, $code, now()->addMinutes($lifetime));
        
        // Также сохраняем время отправки
        Cache::put($key . '_time', now()->timestamp, now()->addMinutes($lifetime));
    }

    /**
     * Проверка кода
     */
    public function verifyCode($phone, $code)
    {
        if (config('sms.debug') && $code == config('sms.debug_code')) {
            return true;
        }

        $key = 'sms_code_' . $this->normalizePhone($phone);
        $storedCode = Cache::get($key);
        
        if (!$storedCode) {
            return false;
        }
        
        return $storedCode == $code;
    }

    /**
     * Удаление кода после успешной проверки
     */
    public function clearCode($phone)
    {
        $key = 'sms_code_' . $this->normalizePhone($phone);
        Cache::forget($key);
        Cache::forget($key . '_time');
    }

    /**
     * Проверка времени последней отправки
     */
    public function canSendAgain($phone)
    {
        $key = 'sms_code_' . $this->normalizePhone($phone) . '_time';
        $lastSent = Cache::get($key);
        
        if (!$lastSent) {
            return true;
        }
        
        // Минимальный интервал между отправками - 1 минута
        return (time() - $lastSent) > 60;
    }

    /**
     * Форматирование телефона
     */
    protected function formatPhone($phone)
    {
        // Убираем все нецифровые символы
        $phone = preg_replace('/[^0-9]/', '', $phone);
        
        // Если номер начинается с 8, заменяем на +7
        if (substr($phone, 0, 1) == '8') {
            $phone = '7' . substr($phone, 1);
        }
        
        return $phone;
    }

    /**
     * Нормализация телефона для ключа кэша
     */
    protected function normalizePhone($phone)
    {
        return preg_replace('/[^0-9]/', '', $phone);
    }
}