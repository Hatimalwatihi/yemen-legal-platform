# بناء APK في Termux

> ملاحظة: حجم ملفات المصدر لا يحدد قوة التطبيق. لا تقم بتضخيم المشروع إلى 100–200MB بملفات وهمية؛ ذلك يبطئ البناء ولا يزيد الأمان.

## المتطلبات
- Termux حديث
- Node.js 20+
- Java 17+
- Android SDK / Build Tools / Platform Tools
- Git اختياري

## أول تشغيل
```bash
pkg update
pkg install nodejs-lts openjdk-17 git unzip
npm install
```

## إعداد الأمان
انسخ `.env.example` إلى `.env` وعدّل:
- `BOOTSTRAP_ADMIN_USERNAME`
- `BOOTSTRAP_ADMIN_PASSWORD` (12 حرفاً على الأقل، والأفضل 20+)
- `LEGAL_INVITE_CODE` (رمز عشوائي طويل)
- `GEMINI_API_KEY` عند استخدام خدمات الذكاء الاصطناعي

لا ترفع `.env` إلى GitHub.

## إنشاء مشروع Android أول مرة
```bash
npm run android:add
```

## بناء ومزامنة APK
```bash
npm run android:build
```

الناتج المتوقع:
`android/app/build/outputs/apk/debug/app-debug.apk`

## إذا كان مجلد android موجوداً بالفعل
```bash
npm run build
npx cap sync android
cd android
./gradlew assembleDebug
```

## تشغيل الخادم
```bash
npm run dev
```

الواجهة نفسها يمكن تغليفها داخل Capacitor. خدمات `/api/*` يجب أن تكون متاحة من الخادم عند استخدام المزامنة السحابية والذكاء الاصطناعي؛ التطبيق لا يضع مفاتيح Gemini السرية داخل APK.
