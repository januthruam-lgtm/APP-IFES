# Configurações e Permissões Manuais para Android (Capacitor 8)

Este arquivo documenta as linhas exatas e arquivos que devem ser configurados manualmente na pasta `android/`, conforme a Regra Geral 2 (não alterar diretamente `android/`).

---

## 1. Localização e Nomes do Aplicativo (`values-<idioma>/strings.xml`)
Para que o nome do aplicativo apareça traduzido na tela inicial do Android nos idiomas embutidos:

### Português (Padrão) - `android/app/src/main/res/values/strings.xml`
```xml
<resources>
    <string name="app_name">Brain Studio</string>
    <string name="title_activity_main">Brain Studio</string>
    <string name="package_name">com.brainstudio.ifes</string>
    <string name="custom_url_scheme">com.brainstudio.ifes</string>
</resources>
```

### Espanhol - `android/app/src/main/res/values-es/strings.xml`
```xml
<resources>
    <string name="app_name">Brain Studio</string>
    <string name="title_activity_main">Brain Studio</string>
</resources>
```

### Inglês - `android/app/src/main/res/values-en/strings.xml`
```xml
<resources>
    <string name="app_name">Brain Studio</string>
    <string name="title_activity_main">Brain Studio</string>
</resources>
```

---

## 2. Permissões de Upload de Arquivos e Câmera (`AndroidManifest.xml`)
No arquivo `android/app/src/main/AndroidManifest.xml`, dentro da tag `<manifest>`:

```xml
    <!-- Acesso a leitura de arquivos e mídia para envio de PDFs e anotações -->
    <uses-permission android:name="android.permission.READ_EXTERNAL_STORAGE" android:maxSdkVersion="32" />
    <uses-permission android:name="android.permission.READ_MEDIA_IMAGES" />
    <uses-permission android:name="android.permission.READ_MEDIA_DOCUMENTS" />
    
    <!-- Notificações no Android 13+ -->
    <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
```

E dentro da tag `<application>` para permitir WebChromeClient com seletor de arquivos:
```xml
    android:hardwareAccelerated="true"
    android:largeHeap="true"
```
