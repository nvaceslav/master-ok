<?php

namespace App\Events;

use App\Models\Message;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class NewMessage implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $message;
    public $chatId;
    public $senderId;

    public function __construct(Message $message)
    {
        $this->message = $message->load('user');
        $this->chatId = $message->chat_id;
        $this->senderId = $message->user_id;
        
        // Не отправляем полный объект пользователя для безопасности
        $this->message->user->makeHidden(['phone', 'email', 'created_at', 'updated_at']);
    }

    public function broadcastOn()
    {
        // Приватный канал для чата
        return new PrivateChannel('chat.' . $this->chatId);
    }

    public function broadcastAs()
    {
        return 'new.message';
    }

    public function broadcastWith()
    {
        return [
            'message' => $this->message,
            'chat_id' => $this->chatId,
            'sender_id' => $this->senderId,
            'timestamp' => now()->toISOString(),
        ];
    }
}