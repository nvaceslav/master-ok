<?php

namespace App\Events;

use App\Models\Request;
use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Broadcasting\PresenceChannel;
use Illuminate\Broadcasting\PrivateChannel;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class RequestUpdated implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public $request;

    public function __construct(Request $request)
    {
        $this->request = $request->load('client');
    }

    public function broadcastOn()
    {
        // Публичный канал для заявки (могут слушать все мастера)
        return new Channel('requests');
        
        // ИЛИ приватный канал для конкретной заявки
        // return new PrivateChannel('request.' . $this->request->id);
    }

    public function broadcastAs()
    {
        return 'request.updated';
    }

    public function broadcastWith()
    {
        return [
            'request' => [
                'id' => $this->request->id,
                'title' => $this->request->title,
                'status' => $this->request->status,
                'type' => $this->request->type,
                'district' => $this->request->district,
                'budget' => $this->request->budget,
                'client' => $this->request->client->only(['id', 'name']),
                'created_at' => $this->request->created_at,
            ],
        ];
    }
}