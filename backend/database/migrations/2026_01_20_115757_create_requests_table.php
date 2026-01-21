<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('client_id')->constrained('users')->onDelete('cascade');
            $table->string('title');
            $table->text('description');
            $table->enum('type', ['washing_machine', 'refrigerator', 'oven', 
                                 'dishwasher', 'tv', 'computer', 'other']);
            $table->string('brand')->nullable();
            $table->string('model')->nullable();
            $table->json('photos')->nullable(); // JSON массив путей к фото
            $table->string('address');
            $table->enum('district', [
                'Центральный', 'Железнодорожный', 'Индустриальный', 'Ленинский',
                'Октябрьский', 'Южный', 'Научный городок', 'Новоалтайск'
            ]);
            $table->decimal('budget', 10, 2)->nullable();
            $table->enum('status', ['new', 'searching', 'in_progress', 
                                   'completed', 'cancelled'])->default('new');
            $table->foreignId('selected_master_id')->nullable()->constrained('users');
            $table->timestamp('selected_at')->nullable();
            $table->timestamp('completed_at')->nullable();
            $table->timestamps();
            $table->softDeletes(); // Мягкое удаление
            
            $table->index('status');
            $table->index('district');
            $table->index('type');
        });
    }

    public function down()
    {
        Schema::dropIfExists('requests');
    }
};