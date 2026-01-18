# Guia de Configuração do Firebase - Reserva Praia

Este guia explica como configurar o Firebase para o seu sistema de reservas, garantindo sincronização em tempo real e segurança.

## Passo 1: Criar Projeto no Firebase

1. Acesse [console.firebase.google.com](https://console.firebase.google.com/)
2. Clique em **"Adicionar projeto"**
3. Dê o nome **"Reserva Praia"** (ou outro de sua preferência)
4. Desative o Google Analytics (não é necessário para este projeto)
5. Clique em **"Criar projeto"**

## Passo 2: Configurar Autenticação (Login Seguro)

1. No menu lateral esquerdo, clique em **"Criação"** > **"Authentication"**
2. Clique em **"Vamos começar"**
3. Na aba **"Sign-in method"**, selecione **"E-mail/senha"**
4. Ative a opção **"E-mail/senha"** e clique em **"Salvar"**
5. Vá na aba **"Users"** e clique em **"Adicionar usuário"**
6. Crie o usuário administrador (ex: `admin@reservapraia.com` e uma senha forte)

## Passo 3: Criar Banco de Dados (Firestore)

1. No menu lateral, clique em **"Criação"** > **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o local **"nam5 (us-central)"** ou **"sao1 (South America)"** (se disponível)
4. Escolha iniciar no **"modo de produção"**
5. Clique em **"Criar"**

## Passo 4: Configurar Regras de Segurança

1. Na aba **"Regras"** do Firestore, apague tudo e cole o seguinte código:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    function isAuthenticated() {
      return request.auth != null;
    }

    match /reservations/{reservationId} {
      allow read: if true;
      allow create: if true;
      allow update, delete: if isAuthenticated();
    }

    match /settings/{settingId} {
      allow read: if true;
      allow write: if isAuthenticated();
    }

    match /users/{userId} {
      allow read, write: if isAuthenticated();
    }
  }
}
```
2. Clique em **"Publicar"**

## Passo 5: Conectar ao Site (Netlify)

Já criei o arquivo `.env` no projeto com as chaves que você me passou! Isso fará o site funcionar no seu computador localmente.

**Para funcionar na internet (Netlify), você precisa adicionar essas mesmas chaves lá:**

1. Vá no painel do **Netlify** do seu site.
2. Clique em **"Site configuration"** > **"Environment variables"**.
3. Adicione as seguintes variáveis (são as mesmas que coloquei no arquivo `.env`):

| Chave (Key) | Valor (Value) |
|---|---|
| `VITE_FIREBASE_API_KEY` | AIzaSyAJkBjbQfFJNGb4CISl5ghpBGdTbP1YGgo |
| `VITE_FIREBASE_AUTH_DOMAIN` | reserva-praia.firebaseapp.com |
| `VITE_FIREBASE_PROJECT_ID` | reserva-praia |
| `VITE_FIREBASE_STORAGE_BUCKET` | reserva-praia.firebasestorage.app |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | 1003380063809 |
| `VITE_FIREBASE_APP_ID` | 1:1003380063809:web:410ed09192b1067c23d0c0 |

## Passo 6: Publicar

Após configurar as variáveis no Netlify, faça um novo deploy do site. O sistema passará a usar o Firebase automaticamente!
