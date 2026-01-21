<?php

namespace App\Http\Controllers\Api;

use App\Events\RequestUpdated;
use App\Http\Controllers\Controller;
use App\Models\Request;
use App\Models\Response;
use App\Models\Chat;
use Illuminate\Http\Request as HttpRequest;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\Auth;
use Intervention\Image\Facades\Image;

class RequestController extends Controller
{
    /**
     * Получить список заявок с фильтрами
     */
    public function index(HttpRequest $httpRequest)
    {
        $user = Auth::user();
        $query = Request::with(['client', 'selectedMaster', 'responses.master']);
        
        // Разные фильтры для клиента и мастера
        if ($user->isClient()) {
            // Клиент видит только свои заявки
            $query->where('client_id', $user->id);
        } elseif ($user->isMaster()) {
            // Мастер видит доступные для него заявки
            $query->where('status', 'new')
                  ->orWhere('status', 'searching')
                  ->whereDoesntHave('responses', function($q) use ($user) {
                      $q->where('master_id', $user->id);
                  });
            
            // Фильтр по специализациям
            if ($user->specializations) {
                $query->whereIn('type', $user->specializations);
            }
        }
        
        // Фильтры
        if ($httpRequest->has('type')) {
            $query->where('type', $httpRequest->type);
        }
        
        if ($httpRequest->has('district')) {
            $query->where('district', $httpRequest->district);
        }
        
        if ($httpRequest->has('status')) {
            $query->where('status', $httpRequest->status);
        }
        
        if ($httpRequest->has('min_budget')) {
            $query->where('budget', '>=', $httpRequest->min_budget);
        }
        
        if ($httpRequest->has('max_budget')) {
            $query->where('budget', '<=', $httpRequest->max_budget);
        }
        
        // Сортировка
        $sort = $httpRequest->get('sort', 'created_at');
        $order = $httpRequest->get('order', 'desc');
        $query->orderBy($sort, $order);
        
        // Пагинация
        $perPage = $httpRequest->get('per_page', 15);
        $requests = $query->paginate($perPage);
        
        return response()->json([
            'success' => true,
            'data' => $requests,
            'total' => $requests->total(),
            'current_page' => $requests->currentPage()
        ]);
    }
    
    /**
     * Создать новую заявку с фото
     */
    public function store(HttpRequest $httpRequest)
    {
        $user = Auth::user();
        
        if (!$user->isClient()) {
            return response()->json([
                'success' => false,
                'message' => 'Только клиенты могут создавать заявки'
            ], 403);
        }
        
        $validator = Validator::make($httpRequest->all(), [
            'title' => 'required|string|min:5|max:200',
            'description' => 'required|string|min:10|max:1000',
            'type' => 'required|in:washing_machine,refrigerator,oven,dishwasher,tv,computer,other',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'photos' => 'nullable|array|max:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'address' => 'required|string|max:255',
            'district' => 'required|in:Центральный,Железнодорожный,Индустриальный,Ленинский,Октябрьский,Южный,Научный городок,Новоалтайск',
            'budget' => 'nullable|numeric|min:0|max:100000',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        $data['client_id'] = $user->id;
        $data['status'] = 'new';
        
        // Обработка фото
        $photoPaths = [];
        if ($httpRequest->hasFile('photos')) {
            foreach ($httpRequest->file('photos') as $index => $photo) {
                $fileName = "request_new_" . time() . "_{$index}." . $photo->getClientOriginalExtension();
                $path = $photo->storeAs('requests/photos', $fileName, 'public');
                $photoPaths[] = $path;
                
                // Создаем миниатюру
                $this->createRequestPhotoThumbnail($photo, $fileName);
            }
        }
        
        $data['photos'] = $photoPaths;
        
        $request = Request::create($data);
        
        // Уведомление мастеров
        $this->notifyMastersAboutNewRequest($request);
        
        // Отправляем событие о новой заявке
        broadcast(new RequestUpdated($request));
        
        return response()->json([
            'success' => true,
            'message' => 'Заявка успешно создана',
            'data' => $request->load('client')
        ], 201);
    }
    
    /**
     * Получить детали заявки
     */
    public function show($id)
    {
        $user = Auth::user();
        $request = Request::with([
            'client',
            'selectedMaster',
            'responses.master',
            'chat' => function($q) use ($user) {
                $q->with(['messages' => function($mq) {
                    $mq->latest()->limit(20);
                }]);
            }
        ])->find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка доступа
        if (!$this->canAccessRequest($user, $request)) {
            return response()->json([
                'success' => false,
                'message' => 'Доступ запрещен'
            ], 403);
        }
        
        return response()->json([
            'success' => true,
            'data' => $request
        ]);
    }
    
    /**
     * Обновить существующую заявку с возможностью загрузки фото
     */
    public function update(HttpRequest $httpRequest, $id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для обновления заявки'
            ], 403);
        }
        
        // Нельзя обновлять, если уже выбран мастер
        if ($request->status === 'in_progress' || $request->selected_master_id) {
            return response()->json([
                'success' => false,
                'message' => 'Нельзя обновлять заявку, так как уже выбран мастер'
            ], 400);
        }
        
        $validator = Validator::make($httpRequest->all(), [
            'title' => 'sometimes|string|min:5|max:200',
            'description' => 'sometimes|string|min:10|max:1000',
            'type' => 'sometimes|in:washing_machine,refrigerator,oven,dishwasher,tv,computer,other',
            'brand' => 'nullable|string|max:100',
            'model' => 'nullable|string|max:100',
            'photos' => 'sometimes|array|max:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
            'address' => 'sometimes|string|max:255',
            'district' => 'sometimes|in:Центральный,Железнодорожный,Индустриальный,Ленинский,Октябрьский,Южный,Научный городок,Новоалтайск',
            'budget' => 'nullable|numeric|min:0|max:100000',
            'status' => 'sometimes|in:new,searching,in_progress,completed,cancelled',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $data = $validator->validated();
        
        // Обработка новых фото
        if ($httpRequest->hasFile('photos')) {
            $existingPhotos = $request->photos ?: [];
            $newPhotos = [];
            
            foreach ($httpRequest->file('photos') as $index => $photo) {
                $fileName = "request_{$id}_update_" . time() . "_{$index}." . $photo->getClientOriginalExtension();
                $path = $photo->storeAs('requests/photos', $fileName, 'public');
                $newPhotos[] = $path;
                
                // Создаем миниатюру
                $this->createRequestPhotoThumbnail($photo, $fileName);
            }
            
            $data['photos'] = array_merge($existingPhotos, $newPhotos);
        }
        
        $request->update($data);
        
        return response()->json([
            'success' => true,
            'message' => 'Заявка обновлена',
            'data' => $request->load('client')
        ]);
    }
    
    /**
     * Удалить заявку
     */
    public function destroy($id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для удаления заявки'
            ], 403);
        }
        
        // Удаление связанных фото
        if ($request->photos) {
            foreach ($request->photos as $photo) {
                $fileName = basename($photo);
                Storage::disk('public')->delete($photo);
                Storage::disk('public')->delete('requests/photos/thumbnails/' . $fileName);
            }
        }
        
        $request->delete();
        
        return response()->json([
            'success' => true,
            'message' => 'Заявка удалена'
        ]);
    }
    
    /**
     * Откликнуться на заявку
     */
    public function respond(HttpRequest $httpRequest, $id)
    {
        $user = Auth::user();
        
        if (!$user->isMaster()) {
            return response()->json([
                'success' => false,
                'message' => 'Только мастера могут откликаться на заявки'
            ], 403);
        }
        
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка статуса заявки
        if ($request->status !== 'new' && $request->status !== 'searching') {
            return response()->json([
                'success' => false,
                'message' => 'На эту заявку нельзя откликнуться'
            ], 400);
        }
        
        // Проверка, не откликался ли уже
        $existingResponse = Response::where('master_id', $user->id)
            ->where('request_id', $id)
            ->exists();
            
        if ($existingResponse) {
            return response()->json([
                'success' => false,
                'message' => 'Вы уже откликались на эту заявку'
            ], 400);
        }
        
        $validator = Validator::make($httpRequest->all(), [
            'message' => 'required|string|min:5|max:500',
            'price' => 'required|numeric|min:0|max:100000',
            'estimated_time' => 'nullable|integer|min:1|max:480', // в минутах, до 8 часов
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $response = Response::create([
            'master_id' => $user->id,
            'request_id' => $id,
            'message' => $httpRequest->message,
            'price' => $httpRequest->price,
            'estimated_time' => $httpRequest->estimated_time,
            'status' => 'pending'
        ]);
        
        // Обновляем статус заявки
        $request->update(['status' => 'searching']);
        
        // Уведомление клиента
        $this->notifyClientAboutResponse($request, $response);
        
        return response()->json([
            'success' => true,
            'message' => 'Отклик отправлен',
            'data' => $response->load('master')
        ], 201);
    }
    
    /**
     * Выбрать мастера для заявки
     */
    public function selectMaster(HttpRequest $httpRequest, $id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Только клиент может выбрать мастера'
            ], 403);
        }
        
        $validator = Validator::make($httpRequest->all(), [
            'response_id' => 'required|exists:responses,id'
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $response = Response::find($httpRequest->response_id);
        
        // Проверка, что отклик принадлежит этой заявке
        if ($response->request_id != $id) {
            return response()->json([
                'success' => false,
                'message' => 'Отклик не принадлежит этой заявке'
            ], 400);
        }
        
        // Обновляем все отклики
        Response::where('request_id', $id)
            ->where('id', '!=', $response->id)
            ->update(['status' => 'rejected']);
        
        $response->update(['status' => 'accepted']);
        
        // Обновляем заявку
        $request->update([
            'selected_master_id' => $response->master_id,
            'status' => 'in_progress',
            'selected_at' => now()
        ]);
        
        // Создаем чат
        $chat = Chat::create([
            'request_id' => $id,
            'client_id' => $request->client_id,
            'master_id' => $response->master_id,
            'status' => 'active'
        ]);
        
        // Отправляем автоматическое сообщение
        $chat->messages()->create([
            'user_id' => $request->client_id,
            'text' => "Я выбрал вас для выполнения заказа. Давайте обсудим детали."
        ]);
        
        // Отправляем событие об обновлении заявки
        broadcast(new RequestUpdated($request));
        
        return response()->json([
            'success' => true,
            'message' => 'Мастер выбран',
            'data' => [
                'request' => $request->load('selectedMaster'),
                'chat' => $chat
            ]
        ]);
    }
    
    /**
     * Завершить заявку
     */
    public function complete($id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && 
            $request->selected_master_id !== $user->id && 
            !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для завершения заявки'
            ], 403);
        }
        
        $request->update([
            'status' => 'completed',
            'completed_at' => now()
        ]);
        
        // Обновляем статистику мастера
        if ($request->selected_master_id) {
            $master = \App\Models\User::find($request->selected_master_id);
            $master->increment('completed_orders');
        }
        
        return response()->json([
            'success' => true,
            'message' => 'Заявка завершена'
        ]);
    }
    
    /**
     * Отменить заявку
     */
    public function cancel($id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && !$user->isAdmin()) {
            return response()->json([
                'success' => false,
                'message' => 'Только клиент может отменить заявку'
            ], 403);
        }
        
        // Нельзя отменить, если уже в работе
        if ($request->status === 'in_progress') {
            return response()->json([
                'success' => false,
                'message' => 'Нельзя отменить заявку, так как работа уже начата'
            ], 400);
        }
        
        $request->update(['status' => 'cancelled']);
        
        // Отклоняем все отклики
        Response::where('request_id', $id)->update(['status' => 'cancelled']);
        
        return response()->json([
            'success' => true,
            'message' => 'Заявка отменена'
        ]);
    }
    
    /**
     * Загрузить дополнительные фото к заявке
     */
    public function uploadPhotos(HttpRequest $httpRequest, $id)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && 
            $request->selected_master_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для загрузки фото'
            ], 403);
        }
        
        $validator = Validator::make($httpRequest->all(), [
            'photos' => 'required|array|max:5',
            'photos.*' => 'image|mimes:jpeg,png,jpg,gif,webp|max:5120',
        ], [
            'photos.required' => 'Необходимо загрузить хотя бы одно фото',
            'photos.max' => 'Максимальное количество фото: 5',
            'photos.*.image' => 'Каждый файл должен быть изображением',
            'photos.*.max' => 'Максимальный размер каждого файла 5MB',
        ]);
        
        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }
        
        $existingPhotos = $request->photos ?: [];
        $newPhotos = [];
        
        foreach ($httpRequest->file('photos') as $index => $photo) {
            // Создаем уникальное имя файла
            $fileName = "request_{$id}_" . time() . "_{$index}." . $photo->getClientOriginalExtension();
            
            // Сохраняем оригинал
            $path = $photo->storeAs('requests/photos', $fileName, 'public');
            $newPhotos[] = $path;
            
            // Создаем миниатюру
            $this->createRequestPhotoThumbnail($photo, $fileName);
        }
        
        $allPhotos = array_merge($existingPhotos, $newPhotos);
        $request->update(['photos' => $allPhotos]);
        
        // Возвращаем URL всех фото
        $photoUrls = array_map(function($photo) {
            return [
                'original' => Storage::url($photo),
                'thumbnail' => Storage::url('requests/photos/thumbnails/' . basename($photo))
            ];
        }, $allPhotos);
        
        return response()->json([
            'success' => true,
            'message' => 'Фото загружены',
            'data' => [
                'photos' => $allPhotos,
                'urls' => $photoUrls,
                'count' => count($allPhotos)
            ]
        ]);
    }
    
    /**
     * Удалить фото из заявки
     */
    public function deletePhoto($id, $photoIndex)
    {
        $user = Auth::user();
        $request = Request::find($id);
        
        if (!$request) {
            return response()->json([
                'success' => false,
                'message' => 'Заявка не найдена'
            ], 404);
        }
        
        // Проверка прав
        if ($request->client_id !== $user->id && 
            $request->selected_master_id !== $user->id) {
            return response()->json([
                'success' => false,
                'message' => 'Нет прав для удаления фото'
            ], 403);
        }
        
        $photos = $request->photos ?: [];
        
        if (!isset($photos[$photoIndex])) {
            return response()->json([
                'success' => false,
                'message' => 'Фото не найдено'
            ], 404);
        }
        
        $photoToDelete = $photos[$photoIndex];
        $fileName = basename($photoToDelete);
        
        // Удаляем файлы
        Storage::disk('public')->delete($photoToDelete);
        Storage::disk('public')->delete('requests/photos/thumbnails/' . $fileName);
        
        // Удаляем из массива
        array_splice($photos, $photoIndex, 1);
        
        $request->update(['photos' => $photos]);
        
        return response()->json([
            'success' => true,
            'message' => 'Фото удалено',
            'remaining_photos' => count($photos)
        ]);
    }
    
    /**
     * Статистика по заявкам
     */
    public function statistics()
    {
        $user = Auth::user();
        $stats = [];
        
        if ($user->isClient()) {
            $stats = [
                'total' => Request::where('client_id', $user->id)->count(),
                'active' => Request::where('client_id', $user->id)
                    ->whereIn('status', ['new', 'searching', 'in_progress'])
                    ->count(),
                'completed' => Request::where('client_id', $user->id)
                    ->where('status', 'completed')
                    ->count(),
                'cancelled' => Request::where('client_id', $user->id)
                    ->where('status', 'cancelled')
                    ->count(),
            ];
        } elseif ($user->isMaster()) {
            $stats = [
                'total_responses' => Response::where('master_id', $user->id)->count(),
                'accepted_responses' => Response::where('master_id', $user->id)
                    ->where('status', 'accepted')
                    ->count(),
                'completed_orders' => $user->completed_orders,
                'active_requests' => Request::where('selected_master_id', $user->id)
                    ->where('status', 'in_progress')
                    ->count(),
            ];
        }
        
        return response()->json([
            'success' => true,
            'data' => $stats
        ]);
    }
    
    /**
     * Вспомогательные методы
     */
    private function canAccessRequest($user, $request)
    {
        if ($user->isAdmin()) {
            return true;
        }
        
        if ($user->isClient() && $request->client_id === $user->id) {
            return true;
        }
        
        if ($user->isMaster()) {
            // Мастер может видеть заявку, если он откликался или выбран
            $responded = Response::where('master_id', $user->id)
                ->where('request_id', $request->id)
                ->exists();
                
            return $responded || $request->selected_master_id === $user->id;
        }
        
        return false;
    }
    
    /**
     * Создание миниатюры для фото заявки
     */
    private function createRequestPhotoThumbnail($file, $fileName)
    {
        $img = Image::make($file->getRealPath());
        
        // Ресайзим до 400x300 для миниатюр
        $img->resize(400, 300, function ($constraint) {
            $constraint->aspectRatio();
            $constraint->upsize();
        });
        
        // Создаем папку для миниатюр, если её нет
        Storage::disk('public')->makeDirectory('requests/photos/thumbnails');
        
        // Сохраняем миниатюру
        $img->save(storage_path('app/public/requests/photos/thumbnails/' . $fileName));
    }
    
    /**
     * Добавление водяного знака (опционально)
     */
    private function addWatermark($file, $fileName)
    {
        $img = Image::make($file->getRealPath());
        
        // Добавляем водяной знак
        $img->text('MasterOK', $img->width() - 10, $img->height() - 10, 
            function($font) {
                $font->file(public_path('fonts/arial.ttf')); // Нужен шрифт
                $font->size(24);
                $font->color('#ffffff');
                $font->align('right');
                $font->valign('bottom');
            });
        
        // Создаем папку для водяных знаков, если её нет
        Storage::disk('public')->makeDirectory('requests/photos/watermarked');
        
        // Сохраняем с водяным знаком
        $img->save(storage_path('app/public/requests/photos/watermarked/' . $fileName));
    }
    
    private function notifyMastersAboutNewRequest($request)
    {
        // TODO: Реализовать уведомление мастеров через WebSocket/Push
        \Log::info("Новая заявка #{$request->id}: {$request->title}");
    }
    
    private function notifyClientAboutResponse($request, $response)
    {
        // TODO: Реализовать уведомление клиента
        \Log::info("Новый отклик на заявку #{$request->id} от мастера #{$response->master_id}");
    }
}