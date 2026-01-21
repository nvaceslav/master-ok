<?php

return [
    'default' => env('SMS_DRIVER', 'smsc'),
    
    'debug' => env('SMS_DEBUG', false),
    'debug_code' => env('SMS_DEBUG_CODE', '1234'),
    
    'code_length' => env('SMS_CODE_LENGTH', 4),
    'code_lifetime' => env('SMS_CODE_LIFETIME', 5), // минут
    
    'drivers' => [
        'smsc' => [
            'login' => env('SMSC_LOGIN'),
            'password' => env('SMSC_PASSWORD'),
            'sender' => env('SMSC_SENDER', 'MasterOK'),
            'url' => 'https://smsc.ru/sys/send.php',
        ],
        
        'smsru' => [
            'api_id' => env('SMSRU_API_ID'),
            'sender' => env('SMS_SENDER', 'MasterOK'),
            'url' => 'https://sms.ru/sms/send',
        ],
        
        'log' => [
            // Для логирования без отправки
        ],
    ],
];