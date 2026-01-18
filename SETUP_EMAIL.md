# Configuração de E-mails (EmailJS)

Para que o site envie e-mails de confirmação automaticamente, usamos o serviço gratuito **EmailJS**.

## Passo 1: Criar Conta

1. Acesse [emailjs.com](https://www.emailjs.com/) e crie uma conta gratuita ("Sign Up Free").

## Passo 2: Adicionar Serviço de E-mail

1. No painel, clique em **"Email Services"** > **"Add New Service"**.
2. Escolha **Gmail** (ou outro provedor que preferir).
3. Clique em **"Connect Account"** e faça login.
4. Clique em **"Create Service"**.
5. Copie o **Service ID** (ex: `service_xyz123`).

## Passo 3: Criar Modelo de E-mail

1. Clique em **"Email Templates"** > **"Create New Template"**.
2. No assunto, coloque: `Confirmação de Reserva - {{apartment_name}}`
3. No corpo do e-mail, use este modelo:

```text
Olá {{to_name}},

Sua reserva foi confirmada com sucesso!

🏠 Apartamento: {{apartment_name}}
📅 Entrada: {{start_date}}
📅 Saída: {{end_date}}

Observações: {{notes}}

Aproveite a estadia!
```

4. Clique em **"Save"**.
5. Copie o **Template ID** (ex: `template_abc456`).

## Passo 4: Pegar a Chave Pública

1. Clique no seu nome no canto superior direito > **"Account"**.
2. Copie a **Public Key** (ex: `user_123456789`).

## Passo 5: Configurar no Netlify

Adicione essas 3 chaves nas variáveis de ambiente do Netlify (igual fez com o Firebase):

| Chave | Valor (Exemplo) |
|---|---|
| `VITE_EMAILJS_SERVICE_ID` | service_xyz123 |
| `VITE_EMAILJS_TEMPLATE_ID` | template_abc456 |
| `VITE_EMAILJS_PUBLIC_KEY` | user_123456789 |

Pronto! O site enviará e-mails automaticamente.
