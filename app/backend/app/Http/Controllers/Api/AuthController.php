<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Validator;
use Illuminate\Support\Str;
use Illuminate\Validation\Rule;
use Illuminate\Support\Facades\Auth;
use App\Facades\Sms;

class AuthController extends Controller
{
    /**
     * Отправка SMS с кодом для регистрации
     */
    public function sendRegisterCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+7[0-9]{10}$/|unique:users,phone',
            'role' => ['required', 'string', Rule::in(['client', 'master'])],
        ], [
            'phone.required' => 'Номер телефона обязателен',
            'phone.regex' => 'Номер телефона должен быть в формате +7XXXXXXXXXX',
            'phone.unique' => 'Пользователь с таким номером уже зарегистрирован',
            'role.required' => 'Роль обязательна',
            'role.in' => 'Роль должна быть client или master',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Отправляем SMS (использует ваш SmsService который всегда генерирует 1111)
        $result = Sms::sendVerificationCode($request->phone);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить SMS. Попробуйте позже.'
            ], 500);
        }

        // Сохраняем роль в кэш для верификации
        Cache::put('register_role:' . $request->phone, $request->role, now()->addMinutes(10));

        return response()->json([
            'success' => true,
            'message' => 'Код отправлен на номер телефона',
            'phone' => $request->phone,
            // Для разработки показываем код
            'debug_code' => '1111' // Всегда 1111
        ]);
    }

    /**
     * Подтверждение регистрации с кодом
     */
    public function verifyRegister(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+7[0-9]{10}$/',
            'code' => 'required|string|size:4',
            'name' => 'required|string|min:2|max:100',
            'city' => 'nullable|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Проверяем код через ваш SmsService (который всегда принимает 1111)
        if (!Sms::verifyCode($request->phone, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный код подтверждения. Используйте код 1111'
            ], 400);
        }

        // Получаем роль из кэша
        $role = Cache::get('register_role:' . $request->phone, 'client');
        Cache::forget('register_role:' . $request->phone);

        // Очищаем код
        Sms::clearCode($request->phone);

        // Создаем пользователя
        $user = User::create([
            'phone' => $request->phone,
            'name' => $request->name,
            'email' => $request->phone . '@masterok.app',
            'role' => $role,
            'city' => $request->city,
            'password' => Hash::make(Str::random(12)), // Генерируем случайный пароль
        ]);

        // Создаем токен Sanctum
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Регистрация успешна',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
            ],
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Отправка SMS для входа
     */
    public function sendLoginCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+7[0-9]{10}$/|exists:users,phone',
        ], [
            'phone.exists' => 'Пользователь с таким номером не найден'
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Отправляем SMS (использует ваш SmsService который всегда генерирует 1111)
        $result = Sms::sendVerificationCode($request->phone);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить SMS. Попробуйте позже.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Код отправлен на номер телефона',
            'phone' => $request->phone,
            // Для разработки показываем код
            'debug_code' => '1111' // Всегда 1111
        ]);
    }

    /**
     * Вход с кодом подтверждения
     */
    public function verifyLogin(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+7[0-9]{10}$/|exists:users,phone',
            'code' => 'required|string|size:4',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Проверяем код через ваш SmsService (который всегда принимает 1111)
        if (!Sms::verifyCode($request->phone, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный код подтверждения. Используйте код 1111'
            ], 400);
        }

        // Находим пользователя
        $user = User::where('phone', $request->phone)->first();

        if (!$user) {
            return response()->json([
                'success' => false,
                'message' => 'Пользователь не найден'
            ], 404);
        }

        // Очищаем код
        Sms::clearCode($request->phone);

        // Создаем токен Sanctum (удаляем старые токены)
        $user->tokens()->delete();
        $token = $user->createToken('auth_token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Вход выполнен успешно',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'phone' => $user->phone,
                'role' => $user->role,
                'avatar' => $user->avatar,
                'city' => $user->city,
                'rating' => $user->rating,
                'completed_orders' => $user->completed_orders,
            ],
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }

    /**
     * Повторная отправка SMS кода
     */
    public function resendCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|regex:/^\+7[0-9]{10}$/',
            'type' => 'required|string|in:register,login',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Проверяем, существует ли пользователь
        if ($request->type === 'register') {
            $userExists = User::where('phone', $request->phone)->exists();
            if ($userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Пользователь с таким номером уже зарегистрирован'
                ], 400);
            }
        } else { // login
            $userExists = User::where('phone', $request->phone)->exists();
            if (!$userExists) {
                return response()->json([
                    'success' => false,
                    'message' => 'Пользователь с таким номером не найден'
                ], 404);
            }
        }

        // Отправляем SMS
        $result = Sms::sendVerificationCode($request->phone);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить SMS. Попробуйте позже.'
            ], 500);
        }

        return response()->json([
            'success' => true,
            'message' => 'Новый код отправлен',
            'phone' => $request->phone,
            // Для разработки
            'debug_code' => '1111' // Всегда 1111
        ]);
    }

    /**
     * Выход из системы
     */
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'success' => true,
            'message' => 'Вы успешно вышли из системы'
        ]);
    }

    /**
     * Получение информации о текущем пользователе
     */
    public function me(Request $request)
    {
        $user = $request->user();
        
        // Для мастера добавляем специализации
        $userData = [
            'id' => $user->id,
            'name' => $user->name,
            'phone' => $user->phone,
            'role' => $user->role,
            'avatar' => $user->avatar,
            'city' => $user->city,
            'about' => $user->about,
            'rating' => $user->rating,
            'completed_orders' => $user->completed_orders,
        ];

        if ($user->isMaster()) {
            $userData['specializations'] = $user->specializations;
        }

        return response()->json([
            'success' => true,
            'user' => $userData
        ]);
    }

    /**
     * Отправка SMS кода для регистрации (НОВЫЙ метод из задания)
     */
    public function sendRegistrationCode(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string|unique:users,phone|regex:/^\+7[0-9]{10}$/',
            'role' => 'required|in:client,master,admin',
        ], [
            'phone.unique' => 'Этот номер телефона уже зарегистрирован',
            'phone.regex' => 'Номер телефона должен быть в формате +79998887766',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Отправляем SMS
        $result = Sms::sendVerificationCode($request->phone);

        if (!$result['success']) {
            return response()->json([
                'success' => false,
                'message' => 'Не удалось отправить SMS. Попробуйте позже.'
            ], 500);
        }

        // Сохраняем роль в кэш для верификации
        Cache::put('register_role:' . $request->phone, $request->role, now()->addMinutes(10));

        return response()->json([
            'success' => true,
            'message' => 'Код отправлен на номер телефона',
            'phone' => $request->phone,
            'debug_code' => '1111' // Всегда 1111
        ]);
    }

    /**
     * Подтверждение регистрации (НОВЫЙ метод из задания)
     */
    public function verifyRegistration(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'phone' => 'required|string',
            'code' => 'required|string|size:4',
            'name' => 'required|string|min:2|max:100',
            'city' => 'required|string|max:100',
        ]);

        if ($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        // Проверяем код (ваш SmsService всегда принимает 1111)
        if (!Sms::verifyCode($request->phone, $request->code)) {
            return response()->json([
                'success' => false,
                'message' => 'Неверный код подтверждения. Используйте код 1111'
            ], 400);
        }

        // Получаем роль из кэша
        $role = Cache::get('register_role:' . $request->phone, $request->input('role', 'client'));
        Cache::forget('register_role:' . $request->phone);

        // Очищаем код
        Sms::clearCode($request->phone);

        // Создаем пользователя
        $user = User::create([
            'phone' => $request->phone,
            'name' => $request->name,
            'role' => $role,
            'city' => $request->city,
            'email' => $request->phone . '@masterok.app',
            'password' => Hash::make(uniqid()),
        ]);

        // Создаем токен
        $token = $user->createToken('auth-token')->plainTextToken;

        return response()->json([
            'success' => true,
            'message' => 'Регистрация успешна',
            'user' => $user,
            'token' => $token,
            'token_type' => 'Bearer'
        ]);
    }
}