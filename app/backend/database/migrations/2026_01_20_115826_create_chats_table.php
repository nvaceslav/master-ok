<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('chats', function (Blueprint $table) {
            $table->id();
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->foreignId('client_id')->constrained('users');
            $table->foreignId('master_id')->constrained('users');
            $table->enum('status', ['active', 'closed'])->default('active');
            $table->timestamp('last_message_at')->nullable();
            $table->timestamps();
            
            // Один чат на одну заявку
            $table->unique('request_id');
            
            $table->index('last_message_at');
        });
    }

    public function down()
    {
        Schema::dropIfExists('chats');
    }
};