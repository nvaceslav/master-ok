<?php

namespace App\Providers;

use App\Services\SmsService;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register()
    {
        $this->app->singleton('sms-service', function () {
            return new SmsService();
        });
        
        $this->app->alias('sms-service', SmsService::class);
    }

    public function boot()
    {
        //
    }
}