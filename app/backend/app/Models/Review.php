<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Review extends Model
{
    use HasFactory;

    protected $fillable = [
        'request_id',
        'client_id',
        'master_id',
        'rating',
        'comment',
        'master_comment',
        'tags',
    ];

    protected $casts = [
        'tags' => 'array',
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
}