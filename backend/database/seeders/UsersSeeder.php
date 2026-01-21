<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UsersSeeder extends Seeder
{
    public function run()
    {
        // Администратор
        User::create([
            'name' => 'Администратор',
            'email' => 'admin@masterok.ru',
            'password' => Hash::make('password'),
            'phone' => '+79130000000',
            'role' => 'admin',
            'city' => 'Барнаул',
        ]);
        
        // Клиенты
        $clients = [
            [
                'name' => 'Иван Петров',
                'email' => 'client1@test.ru',
                'phone' => '+79131111111',
                'city' => 'Барнаул',
            ],
            [
                'name' => 'Мария Сидорова',
                'email' => 'client2@test.ru',
                'phone' => '+79132222222',
                'city' => 'Новоалтайск',
            ],
            [
                'name' => 'Алексей Иванов',
                'email' => 'client3@test.ru',
                'phone' => '+79133333333',
                'city' => 'Научный городок',
            ],
        ];
        
        foreach ($clients as $client) {
            User::create(array_merge($client, [
                'password' => Hash::make('password'),
                'role' => 'client',
            ]));
        }
        
        // Мастера
        $masters = [
            [
                'name' => 'Михаил Ремонтов',
                'email' => 'master1@test.ru',
                'phone' => '+79134444444',
                'role' => 'master',
                'city' => 'Барнаул',
                'about' => 'Опыт работы 10 лет. Специализируюсь на ремонте холодильников и стиральных машин.',
                'specializations' => ['refrigerator', 'washing_machine'],
                'rating' => 4.8,
                'completed_orders' => 150,
            ],
            [
                'name' => 'Сергей Мастерович',
                'email' => 'master2@test.ru',
                'phone' => '+79135555555',
                'role' => 'master',
                'city' => 'Новоалтайск',
                'about' => 'Ремонтирую телевизоры и компьютеры. Быстро и качественно.',
                'specializations' => ['tv', 'computer'],
                'rating' => 4.5,
                'completed_orders' => 85,
            ],
            [
                'name' => 'Андрей Техников',
                'email' => 'master3@test.ru',
                'phone' => '+79136666666',
                'role' => 'master',
                'city' => 'Барнаул',
                'about' => 'Ремонт всей бытовой техники. Гарантия на работы.',
                'specializations' => ['oven', 'dishwasher', 'washing_machine'],
                'rating' => 4.9,
                'completed_orders' => 210,
            ],
        ];
        
        foreach ($masters as $master) {
            User::create(array_merge($master, [
                'password' => Hash::make('password'),
            ]));
        }
    }
}