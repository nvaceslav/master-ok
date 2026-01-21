<?php

return [
    // ... существующие настройки ...

    'stateful' => explode(',', env('SANCTUM_STATEFUL_DOMAINS', 
        'localhost,localhost:3000,127.0.0.1,127.0.0.1:8000,::1'
    )),

    'middleware' => [
        'encrypt_cookies' => App\Http\Middleware\EncryptCookies::class,
    ],
];