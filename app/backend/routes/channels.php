<?php

// use App\Models\Chat;
// use App\Models\User;
// use Illuminate\Support\Facades\Broadcast;

// Broadcast::channel('user.{id}', function ($user, $id) {
//     return (int) $user->id === (int) $id;
// });

// Broadcast::channel('chat.{chatId}', function ($user, $chatId) {
//     // Проверяем, является ли пользователь участником чата
//     return Chat::where('id', $chatId)
//         ->where(function($query) use ($user) {
//             $query->where('client_id', $user->id)
//                   ->orWhere('master_id', $user->id);
//         })
//         ->exists();
// });

// Broadcast::channel('user.status.{userId}', function ($user, $userId) {
//     // Только сам пользователь может подписываться на свой статус
//     return (int) $user->id === (int) $userId;
// });

// Broadcast::channel('requests', function ($user) {
//     // Все аутентифицированные пользователи (особенно мастера) могут слушать заявки
//     return $user !== null;
// });

// // Presence каналы для отслеживания онлайн пользователей
// Broadcast::channel('online-users', function ($user) {
//     if ($user) {
//         return [
//             'id' => $user->id,
//             'name' => $user->name,
//             'role' => $user->role,
//         ];
//     }
// });