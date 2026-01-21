<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Storage;

class Message extends Model
{
    use HasFactory;

    protected $fillable = [
        'chat_id',
        'user_id',
        'text',
        'image',
        'is_read',
        'read_at',
    ];

    protected $casts = [
        'is_read' => 'boolean',
        'read_at' => 'datetime',
    ];

    // Добавляем аксессоры для URL изображений
    protected $appends = ['image_url', 'image_thumbnail_url'];

    /**
     * Получить URL изображения
     */
    public function getImageUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }
        
        return Storage::url($this->image);
    }

    /**
     * Получить URL миниатюры изображения
     */
    public function getImageThumbnailUrlAttribute()
    {
        if (!$this->image) {
            return null;
        }
        
        $fileName = basename($this->image);
        return Storage::url('chats/images/thumbnails/' . $fileName);
    }

    // Связи
    
    public function chat()
    {
        return $this->belongsTo(Chat::class);
    }
    
    public function user()
    {
        return $this->belongsTo(User::class);
    }
    
    // Scope для непрочитанных сообщений
    public function scopeUnread($query)
    {
        return $query->where('is_read', false);
    }
}