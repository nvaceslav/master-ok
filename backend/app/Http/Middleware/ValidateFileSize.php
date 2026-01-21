<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;

class ValidateFileSize
{
    public function handle(Request $request, Closure $next)
    {
        $maxSize = config('app.upload_max_size', 5120) * 1024; // Конвертируем в KB
        
        if ($request->hasFile('avatar')) {
            if ($request->file('avatar')->getSize() > $maxSize) {
                return response()->json([
                    'success' => false,
                    'message' => 'Размер файла аватара превышает допустимый'
                ], 422);
            }
        }
        
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                if ($photo->getSize() > $maxSize) {
                    return response()->json([
                        'success' => false,
                        'message' => 'Размер одного из файлов превышает допустимый'
                    ], 422);
                }
            }
        }
        
        if ($request->hasFile('image')) {
            if ($request->file('image')->getSize() > $maxSize) {
                return response()->json([
                    'success' => false,
                    'message' => 'Размер файла изображения превышает допустимый'
                ], 422);
            }
        }
        
        return $next($request);
    }
}