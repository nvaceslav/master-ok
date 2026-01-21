<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('reviews', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('master_id')->constrained('users');
            $table->integer('rating')->check('rating >= 1 AND rating <= 5');
            $table->text('comment')->nullable();
            $table->text('master_comment')->nullable(); // Ответ мастера
            $table->json('tags')->nullable(); // ["аккуратный", "вежливый", "быстро"]
            $table->timestamps();
            
            // Один отзыв на одну заявку
            $table->unique('request_id');
            
            $table->index('master_id');
            $table->index('rating');
        });
    }

    public function down()
    {
        Schema::dropIfExists('reviews');
    }
};