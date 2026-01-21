<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Validator;
use Intervention\Image\Facades\Image;

class ProfileController extends Controller
{
    /**
     * Обновление профиля пользователя
     */
    public function update(Request $request)
    {
        $user = $request->user();
        
        $validator = Validator::make($request->all(), [
            'name' => 'sometimes|string|min:2|max:100',
            'city' => 'sometimes|string|max:100',
            'about' => 'sometimes|string|max:1000',
            'specializations' => 'sometimes|array',
            'specializations.*' => 'string|in:washing_machine,refrigerator,oven,dishwasher,tv,computer,other',
        ], [
            'specializations.*.in' => 'Недопустимая специализация'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Обновляем данные
        $user->fill($validator->validated());
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Профиль обновлен',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'city' => $user->city,
                'about' => $user->about,
                'rating' => $user->rating,
                'completed_orders' => $user->completed_orders,
                'specializations' => $user->specializations,
            ]
        ]);
    }

    /**
     * Загрузка аватарки
     */
    public function uploadAvatar(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'avatar' => 'required|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'avatar.required' => 'Изображение обязательно',
            'avatar.image' => 'Файл должен быть изображением',
            'avatar.mimes' => 'Допустимые форматы: jpeg, png, jpg, gif, webp',
            'avatar.max' => 'Максимальный размер файла 5MB',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $user = $request->user();
        
        // Удаляем старую аватарку, если есть
        if ($user->avatar) {
            Storage::disk('public')->delete($user->avatar);
            
            // Удаляем миниатюру
            $oldFileName = basename($user->avatar);
            Storage::disk('public')->delete('avatars/thumbnails/' . $oldFileName);
        }

        // Создаем уникальное имя файла
        $fileName = time() . '_' . uniqid() . '.' . $request->file('avatar')->getClientOriginalExtension();
        
        // Сохраняем оригинал
        $path = $request->file('avatar')->storeAs('avatars', $fileName, 'public');
        
        // Создаем миниатюру 150x150
        $this->createThumbnail($request->file('avatar'), $fileName);
        
        // Обновляем запись пользователя
        $user->avatar = $path;
        $user->save();

        return response()->json([
            'success' => true,
            'message' => 'Аватар успешно обновлен',
            'avatar_url' => Storage::url($path),
            'avatar_thumbnail_url' => Storage::url('avatars/thumbnails/' . $fileName)
        ]);
    }

    /**
     * Создание миниатюры аватарки
     */
    private function createThumbnail($file, $fileName)
    {
        $img = Image::make($file->getRealPath());
        
        // Ресайзим до 150x150 с сохранением пропорций
        $img->resize(150, 150, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Создаем папку для миниатюр, если её нет
        Storage::disk('public')->makeDirectory('avatars/thumbnails');
        
        // Сохраняем миниатюру
        $img->save(storage_path('app/public/avatars/thumbnails/' . $fileName));
    }

    /**
     * Удаление аватарки
     */
    public function deleteAvatar(Request $request)
    {
        $user = $request->user();
        
        if ($user->avatar) {
            // Удаляем оригинал
            Storage::disk('public')->delete($user->avatar);
            
            // Удаляем миниатюру
            $fileName = basename($user->avatar);
            Storage::disk('public')->delete('avatars/thumbnails/' . $fileName);
            
            $user->avatar = null;
            $user->save();
        }

        return response()->json([
            'success' => true,
            'message' => 'Аватар удален'
        ]);
    }

    /**
     * Получение профиля пользователя по ID
     */
    public function show($id)
    {
        $user = User::find($id);
        
        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не найден'
            ], 404);
        }

        // Для мастера показываем больше информации
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'role' => $user->role,
            'avatar' => $user->avatar ? Storage::url($user->avatar) : null,
            'city' => $user->city,
            'about' => $user->about,
            'rating' => $user->rating,
            'completed_orders' => $user->completed_orders,
            'created_at' => $user->created_at->format('d.m.Y'),
        ];

        if ($user->isMaster()) {
            $userData['specializations'] = $user->specializations;
        }

        return response()->json([
            'success' => true,
            'user' => $userData
        ]);
    }
}