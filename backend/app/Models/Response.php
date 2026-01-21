<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Response extends Model
{
    use HasFactory;

    protected $fillable = [
        'master_id',
        'request_id',
        'message',
        'price',
        'status',
        'estimated_time',
    ];

    protected $casts = [
        'price' => 'decimal:2',
    ];

    // Связи
    
    public function master()
    {
        return $this->belongsTo(User::class, 'master_id');
    }
    
    public function request()
    {
        return $this->belongsTo(Request::class);
    }
    
    // Scope для принятых откликов
    public function scopeAccepted($query)
    {
        return $query->where('status', 'accepted');
    }
    
    public function scopePending($query)
    {
        return $query->where('status', 'pending');
    }
}