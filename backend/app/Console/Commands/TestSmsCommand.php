<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Facades\Sms;

class TestSmsCommand extends Command
{
    protected $signature = 'sms:test {phone}';
    protected $description = 'Тестирование отправки SMS';

    public function handle()
    {
        $phone = $this->argument('phone');
        
        $this->info("Отправка тестового SMS на номер: {$phone}");
        
        $result = Sms::sendVerificationCode($phone);
        
        if ($result['success']) {
            $this->info("✅ SMS успешно отправлен");
            
            if (isset($result['code'])) {
                $this->info("📱 Код: " . $result['code']);
            }
        } else {
            $this->error("❌ Ошибка отправки: " . ($result['error'] ?? 'Неизвестная ошибка'));
        }
        
        return 0;
    }
}