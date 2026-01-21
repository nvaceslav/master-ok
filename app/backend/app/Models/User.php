<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'email',
        'password',
        'phone',
        'role',
        'avatar',
        'city',
        'about',
        'rating',
        'completed_orders',
        'specializations',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
        'specializations' => 'array',
        'rating' => 'decimal:2',
    ];

    // Добавляем аксессоры для URL изображений
    protected $appends = ['avatar_url', 'avatar_thumbnail_url'];

    /**
     * Получить URL аватарки
     */
    public function getAvatarUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }
        
        return Storage::url($this->avatar);
    }

    /**
     * Получить URL миниатюры аватарки
     */
    public function getAvatarThumbnailUrlAttribute()
    {
        if (!$this->avatar) {
            return null;
        }
        
        $fileName = basename($this->avatar);
        return Storage::url('avatars/thumbnails/' . $fileName);
    }

    // Связи
    
    // Клиентские заявки
    public function clientRequests()
    {
        return $this->hasMany(Request::class, 'client_id');
    }
    
    // Мастерские отклики
    public function masterResponses()
    {
        return $this->hasMany(Response::class, 'master_id');
    }
    
    // Заявки, где выбран мастером
    public function masterRequests()
    {
        return $this->hasMany(Request::class, 'selected_master_id');
    }
    
    // Чаты, где пользователь - клиент
    public function clientChats()
    {
        return $this->hasMany(Chat::class, 'client_id');
    }
    
    // Чаты, где пользователь - мастер
    public function masterChats()
    {
        return $this->hasMany(Chat::class, 'master_id');
    }
    
    // Сообщения пользователя
    public function messages()
    {
        return $this->hasMany(Message::class);
    }
    
    // Отзывы как клиента
    public function clientReviews()
    {
        return $this->hasMany(Review::class, 'client_id');
    }
    
    // Отзывы как мастера
    public function masterReviews()
    {
        return $this->hasMany(Review::class, 'master_id');
    }
    
    // Scope для фильтрации по роли
    public function scopeMasters($query)
    {
        return $query->where('role', 'master');
    }
    
    public function scopeClients($query)
    {
        return $query->where('role', 'client');
    }
    
    // Вспомогательные методы
    public function isMaster()
    {
        return $this->role === 'master';
    }
    
    public function isClient()
    {
        return $this->role === 'client';
    }
    
    public function isAdmin()
    {
        return $this->role === 'admin';
    }
}