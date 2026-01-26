# Chatbot Quick Start

Panduan cepat untuk menggunakan chatbot dengan Ollama.

## ⚡ Quick Setup

### 1. Install Ollama

```bash
# Download dari https://ollama.ai/
# Atau install via homebrew (Mac)
brew install ollama

# Start Ollama
ollama serve
```

### 2. Pull Model

```bash
# Pull model (pilih salah satu)
ollama pull llama2
# atau
ollama pull mistral
# atau
ollama pull llama3
```

### 3. Install Dependencies

```bash
npm install axios
```

### 4. Update .env

```env
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

### 5. Restart Server

```bash
npm run start:dev
```

## 🚀 Test Chatbot

### Via Postman

1. **Login dulu:**
   ```
   POST /api/auth/login
   Body: {"email": "wd1@example.com", "password": "password"}
   ```

2. **Chat dengan bot:**
   ```
   POST /api/chatbot/chat
   Authorization: Bearer <token>
   Body: {"message": "dimana folder ijasah?"}
   ```

### Via curl

```bash
# Login
TOKEN=$(curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"wd1@example.com","password":"password"}' \
  | jq -r '.access_token')

# Chat
curl -X POST http://localhost:3000/api/chatbot/chat \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"message":"dimana folder ijasah?"}'
```

## 📝 Contoh Skenario

### WD1 mencari folder Ijasah

**Request:**
```json
{
  "message": "dimana folder ijasah?"
}
```

**Response:**
```
Folder "ijasah" ada di sistem repository kampus. Namun, Anda (sebagai wd1) tidak memiliki akses ke folder tersebut saat ini.

Folder ini dapat diakses oleh role: dosen

Untuk mendapatkan akses, silakan hubungi admin untuk meminta permission. Admin dapat memberikan permission dengan cara:
1. Assign permission ke role wd1
2. Atau assign permission langsung ke user Anda
```

## ✅ Checklist

- [ ] Ollama terinstall dan berjalan
- [ ] Model sudah di-pull (llama2/mistral/etc)
- [ ] Dependencies terinstall (axios)
- [ ] .env sudah di-update (OLLAMA_URL, OLLAMA_MODEL)
- [ ] Server sudah restart
- [ ] Test dengan Postman/curl

## 🐛 Troubleshooting

**Ollama connection refused?**
```bash
# Check Ollama running
curl http://localhost:11434/api/tags

# Start Ollama
ollama serve
```

**Model not found?**
```bash
# Pull model
ollama pull llama2
```

**Response timeout?**
- Increase timeout di `chatbot.service.ts`
- Atau gunakan model yang lebih kecil

---

**Chatbot siap digunakan! 🎉**

