<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\File;

class SpaController extends Controller
{
    /**
     * Отдаем SPA приложение
     */
    public function index()
    {
        $path = public_path('index.html');
        
        if (!File::exists($path)) {
            abort(404, 'SPA не найдено. Сначала соберите фронтенд.');
        }
        
        return File::get($path);
    }
    
    /**
     * Обработка всех маршрутов для React Router
     */
    public function catchAll()
    {
        return $this->index();
    }
}