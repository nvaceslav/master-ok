<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('responses', function (Blueprint $table) {
            $table->id();
            $table->foreignId('master_id')->constrained('users')->onDelete('cascade');
            $table->foreignId('request_id')->constrained('requests')->onDelete('cascade');
            $table->text('message');
            $table->decimal('price', 10, 2);
            $table->enum('status', ['pending', 'accepted', 'rejected', 'cancelled'])->default('pending');
            $table->integer('estimated_time')->nullable(); // В минутах
            $table->timestamps();
            
            // Уникальность: мастер может откликнуться на заявку только один раз
            $table->unique(['master_id', 'request_id']);
            
            $table->index('status');
        });
    }

    public function down()
    {
        Schema::dropIfExists('responses');
    }
};