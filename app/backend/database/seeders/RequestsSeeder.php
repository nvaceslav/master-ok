<?php

namespace Database\Seeders;

use App\Models\Request;
use App\Models\Response;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Database\Seeder;

class RequestsSeeder extends Seeder
{
    public function run()
    {
        // Заявка 1: Новая
        $request1 = Request::create([
            'client_id' => 2, // Мария Сидорова
            'title' => 'Ремонт холодильника LG',
            'description' => 'Холодильник не морозит, слышен гул. Модель LG GA-B459SLQR',
            'type' => 'refrigerator',
            'brand' => 'LG',
            'model' => 'GA-B459SLQR',
            'address' => 'ул. Ленина, 123, кв. 45',
            'district' => 'Центральный',
            'budget' => 3000,
            'status' => 'new',
        ]);
        
        // Заявка 2: В поиске мастера
        $request2 = Request::create([
            'client_id' => 3, // Алексей Иванов
            'title' => 'Почистить стиральную машину',
            'description' => 'Машина плохо отжимает, сильный шум при отжиме',
            'type' => 'washing_machine',
            'brand' => 'Indesit',
            'model' => 'IWSC 5105',
            'address' => 'пр. Космонавтов, 67, кв. 12',
            'district' => 'Ленинский',
            'budget' => 2000,
            'status' => 'searching',
        ]);
        
        // Отклики на вторую заявку
        Response::create([
            'master_id' => 4, // Михаил Ремонтов
            'request_id' => $request2->id,
            'message' => 'Здравствуйте! Займусь вашей стиральной машиной. Опыт 10 лет.',
            'price' => 1800,
            'estimated_time' => 120,
            'status' => 'pending',
        ]);
        
        Response::create([
            'master_id' => 6, // Андрей Техников
            'request_id' => $request2->id,
            'message' => 'Могу приехать сегодня после 18:00. Гарантия 3 месяца.',
            'price' => 2200,
            'estimated_time' => 90,
            'status' => 'pending',
        ]);
        
        // Заявка 3: В работе
        $request3 = Request::create([
            'client_id' => 2, // Мария Сидорова
            'title' => 'Ремонт духового шкафа',
            'description' => 'Не включается духовка, не греется',
            'type' => 'oven',
            'brand' => 'Bosch',
            'model' => 'HMG72NS220',
            'address' => 'ул. Промышленная, 45, кв. 3',
            'district' => 'Индустриальный',
            'budget' => 4000,
            'status' => 'in_progress',
            'selected_master_id' => 5, // Сергей Мастерович
            'selected_at' => now()->subDays(1),
        ]);
        
        // Чат для третьей заявки
        $chat3 = Chat::create([
            'request_id' => $request3->id,
            'client_id' => 2,
            'master_id' => 5,
            'status' => 'active',
            'last_message_at' => now(),
        ]);
        
        // Сообщения в чате
        Message::create([
            'chat_id' => $chat3->id,
            'user_id' => 2, // Клиент
            'text' => 'Здравствуйте! Когда сможете приехать?',
            'is_read' => true,
            'read_at' => now()->subHours(2),
        ]);
        
        Message::create([
            'chat_id' => $chat3->id,
            'user_id' => 5, // Мастер
            'text' => 'Добрый день! Могу сегодня после 14:00. Подойдет?',
            'is_read' => true,
            'read_at' => now()->subHours(1),
        ]);
        
        // Заявка 4: Завершенная
        $request4 = Request::create([
            'client_id' => 3, // Алексей Иванов
            'title' => 'Ремонт телевизора Samsung',
            'description' => 'Нет изображения, только звук',
            'type' => 'tv',
            'brand' => 'Samsung',
            'model' => 'UE43NU7090U',
            'address' => 'ул. Матросова, 89, кв. 7',
            'district' => 'Октябрьский',
            'budget' => 3500,
            'status' => 'completed',
            'selected_master_id' => 5, // Сергей Мастерович
            'selected_at' => now()->subDays(5),
            'completed_at' => now()->subDays(4),
        ]);
    }
}