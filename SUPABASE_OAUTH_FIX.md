# Исправление проблемы с Google OAuth в Supabase

## Проблема
При входе через Google вас перенаправляет на `http://localhost:3000` вместо вашего продакшн домена `https://legalhelper.onrender.com`.

## Решение

### 1. Обновите переменные окружения

В файле `env.local` замените placeholder значения на реальные из вашего Supabase проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=https://ваш-проект-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=ваш-anon-key
SUPABASE_SERVICE_ROLE_KEY=ваш-service-role-key
```

**Как найти Project ID:**
1. Зайдите в [Supabase Dashboard](https://supabase.com/dashboard)
2. Выберите ваш проект
3. В Settings > API найдите "Project URL"
4. Project ID - это часть между `https://` и `.supabase.co`
   
Например: `https://dahtsaeccqzfjroifqrb.supabase.co` → Project ID = `dahtsaeccqzfjroifqrb`

### 2. Настройте Supabase Dashboard

1. **Зайдите в ваш Supabase проект**: https://supabase.com/dashboard
2. **Перейдите в Authentication > Settings**
3. **Обновите Site URL**:
   - Установите: `https://legalhelper.onrender.com`
4. **Обновите Redirect URLs**:
   - Добавьте: `https://legalhelper.onrender.com/**`
   - Добавьте: `https://legalhelper.onrender.com/dashboard`
   - Добавьте: `https://legalhelper.onrender.com/auth/callback`

### 3. Настройте Google OAuth Provider

1. **В Supabase Dashboard перейдите в Authentication > Providers**
2. **Найдите Google и нажмите Configure**
3. **Обновите Authorized redirect URIs в Google Console**:
   - Зайдите в [Google Cloud Console](https://console.cloud.google.com)
   - Перейдите в APIs & Services > Credentials
   - Найдите ваш OAuth 2.0 Client ID
   - В разделе "Authorized redirect URIs" добавьте:
     ```
     https://ваш-проект-id.supabase.co/auth/v1/callback
     ```
     **Пример реального URL:**
     ```
     https://dahtsaeccqzfjroifqrb.supabase.co/auth/v1/callback
     ```
   - Удалите или закомментируйте localhost URIs для продакшна

### 4. Проверьте настройки в коде

Код уже обновлен для правильного определения продакшн среды:

```typescript
const isProduction = typeof window !== 'undefined' && 
  (window.location.hostname === 'legalhelper.onrender.com' || 
   window.location.hostname.includes('legalhelper'))

const redirectUrl = isProduction 
  ? 'https://legalhelper.onrender.com/dashboard'
  : `${window.location.origin}/dashboard`
```

### 5. Развертывание изменений

1. **Обновите переменные окружения на Render.com**:
   - Зайдите в настройки вашего сервиса на Render
   - Добавьте те же переменные окружения что и в `env.local`

2. **Пересоберите приложение**:
   - Render автоматически пересоберет при push в git
   - Или нажмите "Manual Deploy" в панели Render

### 6. Проверка

После выполнения всех шагов:
1. Зайдите на https://legalhelper.onrender.com
2. Нажмите "Войти через Google"
3. Вас должно перенаправить на ваш домен, а не на localhost

## Важные замечания

- **Безопасность**: Никогда не добавляйте реальные ключи в git репозиторий
- **Среды**: Используйте разные Supabase проекты для разработки и продакшна
- **Тестирование**: Сначала протестируйте на staging среде если она есть

## Если проблема остается

1. Проверьте Network tab в браузере на предмет ошибок
2. Проверьте логи в Supabase Dashboard
3. Убедитесь что все переменные окружения установлены правильно
4. Очистите кэш браузера и cookie 