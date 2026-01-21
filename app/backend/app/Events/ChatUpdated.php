<?php

namespace App\Events;

use App\Models\Chat;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ChatUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $chat;
    public $userId;

    public function __construct(Chat $chat, $userId = null)
    {
        $this->chat = $chat->load(['client', 'master', 'lastMessage']);
        $this->userId = $userId;
    }

    public function broadcastOn()
    {
        // Отправляем обновление обоим участникам чата
        return [
            new PrivateChannel('user.' . $this->chat->client_id),
            new PrivateChannel('user.' . $this->chat->master_id),
        ];
    }

    public function broadcastAs()
    {
        return 'chat.updated';
    }

    public function broadcastWith()
    {
        return [
            'chat' => [
                'id' => $this->chat->id,
                'status' => $this->chat->status,
                'last_message_at' => $this->chat->last_message_at,
                'last_message' => $this->chat->lastMessage,
                'unread_count' => $this->chat->messages()
                    ->where('user_id', '!=', $this->userId)
                    ->where('is_read', false)
                    ->count(),
            ],
        ];
    }
}