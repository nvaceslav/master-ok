<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Facades\Storage;

class Request extends Model
{
    use HasFactory, SoftDeletes;

    protected $fillable = [
        'client_id',
        'title',
        'description',
        'type',
        'brand',
        'model',
        'photos',
        'address',
        'district',
        'budget',
        'status',
        'selected_master_id',
        'selected_at',
        'completed_at',
    ];

    protected $casts = [
        'photos' => 'array',
        'budget' => 'decimal:2',
        'selected_at' => 'datetime',
        'completed_at' => 'datetime',
    ];

    protected $appends = ['photos_urls', 'photos_thumbnails_urls'];

    /**
     * Получить URL всех фото
     */
    public function getPhotosUrlsAttribute()
    {
        if (!$this->photos || empty($this->photos)) {
            return [];
        }
        
        return array_map(function($photo) {
            return Storage::url($photo);
        }, $this->photos);
    }

    /**
     * Получить URL миниатюр всех фото
     */
    public function getPhotosThumbnailsUrlsAttribute()
    {
        if (!$this->photos || empty($this->photos)) {
            return [];
        }
        
        return array_map(function($photo) {
            $fileName = basename($photo);
            return Storage::url('requests/photos/thumbnails/' . $fileName);
        }, $this->photos);
    }

    // Связи
    
    public function client()
    {
        return $this->belongsTo(User::class, 'client_id');
    }
    
    public function selectedMaster()
    {
        return $this->belongsTo(User::class, 'selected_master_id');
    }
    
    public function responses()
    {
        return $this->hasMany(Response::class);
    }
    
    public function chat()
    {
        return $this->hasOne(Chat::class);
    }
    
    public function review()
    {
        return $this->hasOne(Review::class);
    }
    
    // Активные отклики
    public function activeResponses()
    {
        return $this->responses()->whereIn('status', ['pending', 'accepted']);
    }
    
    // Принятые отклики
    public function acceptedResponse()
    {
        return $this->responses()->where('status', 'accepted')->first();
    }
}