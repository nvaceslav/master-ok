<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Chat extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'client_id',
        'master_id',
        'status',
        'last_message_at',
    ];

    protected $casts = [
        'last_message_at' => 'datetime',
    ];

    // Связи
    
    public function request()
    {
        return $this->belongsTo(Request::class);
    }
    
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
    
    public function master()
    {
        return $this->belongsTo(User::class, 'master_id');
    }
    
    public function messages()
    {
        return $this->hasMany(Message::class)->latest();
    }
    
    public function unreadMessagesCount($userId)
    {
        return $this->messages()
            ->where('user_id', '!=', $userId)
            ->where('is_read', false)
            ->count();
    }
    
    // Последнее сообщение
    public function lastMessage()
    {
        return $this->hasOne(Message::class)->latestOfMany();
    }
}