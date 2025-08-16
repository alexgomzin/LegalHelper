# Исправление названия приложения в Google OAuth

## Проблема
При входе через Google отображается техническое название "dahtsaeccqzfjroifqrb.supabase.co" вместо нормального названия приложения.

## Решение

### 1. Зайдите в Google Cloud Console
- Откройте [Google Cloud Console](https://console.cloud.google.com)
- Выберите ваш проект (тот же, где настроен OAuth)

### 2. Перейдите в OAuth consent screen
- В левом меню: **APIs & Services** → **OAuth consent screen**
- Или используйте поиск: "OAuth consent screen"

### 3. Настройте информацию о приложении

#### App Information:
- **App name**: `Legal Helper` (или любое другое название)
- **User support email**: ваш email адрес
- **App logo**: загрузите логотип (120x120px, формат PNG/JPG)

#### App domain:
- **Application home page**: `https://legalhelper.onrender.com`
- **Application privacy policy link**: `https://legalhelper.onrender.com/privacy-policy.html`
- **Application terms of service link**: `https://legalhelper.onrender.com/terms-of-service.html`

#### Authorized domains:
- Добавьте: `legalhelper.onrender.com`
- Добавьте: `supabase.co` (для callback URL)

#### Developer contact information:
- Ваш email адрес

### 4. Настройте Scopes (Разрешения)
Нажмите **Save and Continue**, затем **Add or Remove Scopes**:

Добавьте необходимые разрешения:
- `auth/userinfo.email` - доступ к email
- `auth/userinfo.profile` - доступ к профилю
- `openid` - OpenID Connect

### 5. Test users (если приложение в Testing mode)
- Добавьте email адреса пользователей для тестирования
- Включая ваш собственный email

### 6. Review и публикация
- Проверьте все настройки
- Если готовы к продакшну, подайте заявку на верификацию
- Для тестирования оставьте в режиме "Testing"

## Результат

### До:
```
Выберите аккаунт
для перехода в приложение "dahtsaeccqzfjroifqrb.supabase.co"
```

### После:
```
Выберите аккаунт
для перехода в приложение "Legal Helper"
```

## Дополнительные улучшения

### Добавьте логотип
- Размер: 120x120 пикселей
- Формат: PNG или JPG
- Загрузите в разделе "App logo"

### Настройте домены
- Убедитесь что `legalhelper.onrender.com` добавлен в Authorized domains
- Это повышает доверие пользователей

### Режимы публикации
- **Testing**: только указанные test users могут войти
- **In production**: все пользователи Google могут войти
- **Needs verification**: требуется проверка Google (для большинства scopes)

## Важно
- Изменения могут занять несколько минут для применения
- Очистите кэш браузера после изменений
- Протестируйте OAuth flow после обновления настроек 