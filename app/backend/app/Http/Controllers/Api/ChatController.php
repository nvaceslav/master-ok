<?php

namespace App\Http\Controllers\Api;

use App\Events\NewMessage;
use App\Events\ChatUpdated;
use App\Http\Controllers\Controller;
use App\Models\Chat;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Intervention\Image\Facades\Image;

class ChatController extends Controller
{
    /**
     * Получить список чатов пользователя
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        
        $query = Chat::with([
            'client',
            'master',
            'request',
            'lastMessage'
        ]);
        
        // Фильтрация по пользователю
        if ($user->isClient()) {
            $query->where('client_id', $user->id);
        } elseif ($user->isMaster()) {
            $query->where('master_id', $user->id);
        }
        
        // Фильтр по статусу
        if ($request->has('status')) {
            $query->where('status', $request->status);
        }
        
        // Сортировка по последнему сообщению
        $query->orderBy('last_message_at', 'desc');
        
        $chats = $query->paginate(20);
        
        // Добавляем количество непрочитанных сообщений
        foreach ($chats as $chat) {
            $chat->unread_count = $chat->unreadMessagesCount($user->id);
        }
        
        return response()->json([
            'success' => true,
            'data' => $chats
        ]);
    }
    
    /**
     * Получить чат с сообщениями
     */
    public function show($id)
    {
        $user = Auth::user();
        $chat = Chat::with(['client', 'master', 'request'])->find($id);
        
        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Чат не найден'
            ], 404);
        }
        
        // Проверка доступа
        if (!$this->canAccessChat($user, $chat)) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен'
            ], 403);
        }
        
        // Получаем сообщения
        $messages = Message::with('user')
            ->where('chat_id', $id)
            ->orderBy('created_at', 'desc')
            ->paginate(50);
        
        // Помечаем сообщения как прочитанные
        Message::where('chat_id', $id)
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        
        return response()->json([
            'success' => true,
            'data' => [
                'chat' => $chat,
                'messages' => $messages
            ]
        ]);
    }
    
    /**
     * Отправить сообщение в чат с возможностью прикрепления фото
     */
    public function sendMessage(Request $request, $id)
    {
        $user = Auth::user();
        $chat = Chat::find($id);
        
        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Чат не найден'
            ], 404);
        }
        
        // Проверка доступа
        if (!$this->canAccessChat($user, $chat)) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен'
            ], 403);
        }
        
        // Проверка статуса чата
        if ($chat->status === 'closed') {
            return response()->json([
                'success' => false,
                'message' => 'Чат закрыт'
            ], 400);
        }
        
        $validator = Validator::make($request->all(), [
            'text' => 'nullable|string|max:1000',
            'image' => 'nullable|image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'image.image' => 'Файл должен быть изображением',
            'image.max' => 'Максимальный размер файла 5MB',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        // Проверяем, что есть либо текст, либо изображение
        if (!$request->has('text') && !$request->hasFile('image')) {
            return response()->json([
                'success' => false,
                'message' => 'Сообщение должно содержать текст или изображение'
            ], 422);
        }
        
        $messageData = [
            'chat_id' => $id,
            'user_id' => $user->id,
            'text' => $request->text,
        ];
        
        // Загрузка изображения
        if ($request->hasFile('image')) {
            $fileName = 'chat_' . $id . '_' . time() . '_' . uniqid() . '.' . 
                       $request->file('image')->getClientOriginalExtension();
            
            // Сохраняем оригинал
            $path = $request->file('image')->storeAs('chats/images', $fileName, 'public');
            $messageData['image'] = $path;
            
            // Создаем миниатюру для чата
            $this->createChatImageThumbnail($request->file('image'), $fileName);
        }
        
        $message = Message::create($messageData);
        
        // Обновляем время последнего сообщения в чате
        $chat->update([
            'last_message_at' => now()
        ]);
        
        // Отправляем событие о новом сообщении
        broadcast(new NewMessage($message))->toOthers();
        
        // Отправляем событие об обновлении чата
        broadcast(new ChatUpdated($chat, $user->id));
        
        return response()->json([
            'success' => true,
            'message' => 'Сообщение отправлено',
            'data' => $message->load('user')
        ], 201);
    }
    
    /**
     * Закрыть чат
     */
    public function closeChat($id)
    {
        $user = Auth::user();
        $chat = Chat::find($id);
        
        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Чат не найден'
            ], 404);
        }
        
        // Проверка доступа (только участники чата)
        if ($chat->client_id !== $user->id && $chat->master_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для закрытия чата'
            ], 403);
        }
        
        $chat->update(['status' => 'closed']);
        
        return response()->json([
            'success' => true,
            'message' => 'Чат закрыт'
        ]);
    }
    
    /**
     * Получить количество непрочитанных сообщений
     */
    public function unreadCount()
    {
        $user = Auth::user();
        
        // Определяем, в каких чатах состоит пользователь
        $chatIds = Chat::where('client_id', $user->id)
            ->orWhere('master_id', $user->id)
            ->pluck('id');
        
        $unreadCount = Message::whereIn('chat_id', $chatIds)
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->count();
        
        return response()->json([
            'success' => true,
            'data' => [
                'unread_count' => $unreadCount
            ]
        ]);
    }
    
    /**
     * Удалить сообщение
     */
    public function deleteMessage($chatId, $messageId)
    {
        $user = Auth::user();
        $message = Message::find($messageId);
        
        if (!$message || $message->chat_id != $chatId) {
            return response()->json([
                'success' => false,
                'message' => 'Сообщение не найдено'
            ], 404);
        }
        
        // Проверка прав (только автор может удалить)
        if ($message->user_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для удаления сообщения'
            ], 403);
        }
        
        // Удаляем файл изображения, если есть
        if ($message->image) {
            // Удаляем оригинал
            \Storage::disk('public')->delete($message->image);
            
            // Удаляем миниатюру, если существует
            $fileName = pathinfo($message->image, PATHINFO_BASENAME);
            $thumbnailPath = 'chats/images/thumbnails/' . $fileName;
            if (\Storage::disk('public')->exists($thumbnailPath)) {
                \Storage::disk('public')->delete($thumbnailPath);
            }
        }
        
        $message->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Сообщение удалено'
        ]);
    }
    
    /**
     * Пометить сообщения как прочитанные
     */
    public function markAsRead($id)
    {
        $user = Auth::user();
        $chat = Chat::find($id);
        
        if (!$chat) {
            return response()->json([
                'success' => false,
                'message' => 'Чат не найден'
            ], 404);
        }
        
        // Проверка доступа
        if (!$this->canAccessChat($user, $chat)) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен'
            ], 403);
        }
        
        // Помечаем сообщения как прочитанные
        $chat->messages()
            ->where('user_id', '!=', $user->id)
            ->where('is_read', false)
            ->update([
                'is_read' => true,
                'read_at' => now()
            ]);
        
        // Отправляем событие об обновлении чата
        broadcast(new ChatUpdated($chat, $user->id));
        
        return response()->json([
            'success' => true,
            'message' => 'Сообщения отмечены как прочитанные'
        ]);
    }
    
    /**
     * Создание миниатюры для изображения в чате
     */
    private function createChatImageThumbnail($file, $fileName)
    {
        $img = Image::make($file->getRealPath());
        
        // Ресайзим до 400px по ширине
        $img->resize(400, null, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Создаем папку для миниатюр, если её нет
        Storage::disk('public')->makeDirectory('chats/images/thumbnails');
        
        // Сохраняем миниатюру
        $img->save(storage_path('app/public/chats/images/thumbnails/' . $fileName));
    }
    
    /**
     * Вспомогательные методы
     */
    private function canAccessChat($user, $chat)
    {
        if ($user->isAdmin()) {
            return true;
        }
        
        return $chat->client_id === $user->id || $chat->master_id === $user->id;
    }
}