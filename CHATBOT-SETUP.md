# Chatbot Setup dengan Ollama

Panduan setup chatbot yang terintegrasi dengan Ollama untuk membantu user menemukan folder dan memahami permissions.

## 🎯 Fitur Chatbot

1. **Mencari folder** berdasarkan nama
2. **Memberi tahu folder yang tidak accessible** - Jika user bertanya tentang folder yang tidak bisa diakses, chatbot akan:
   - Memberi tahu bahwa folder tersebut ada
   - Memberi tahu role mana yang punya akses
   - Menyarankan untuk menghubungi admin untuk request permission
3. **Menjawab dalam Bahasa Indonesia**
4. **Fallback response** jika Ollama tidak tersedia

## 📋 Prerequisites

1. **Ollama sudah terinstall dan berjalan**
   ```bash
   # Install Ollama (jika belum)
   # https://ollama.ai/
   
   # Pull model (contoh: llama2)
   ollama pull llama2
   
   # Pastikan Ollama berjalan
   # Default: http://localhost:11434
   ```

2. **Model sudah di-download**
   - Default: `llama2`
   - Bisa diganti di `.env`: `OLLAMA_MODEL=your-model`

## ⚙️ Setup

### 1. Install Dependencies

```bash
npm install axios
```

### 2. Update Environment Variables

Edit `.env` file:

```env
# Ollama Configuration
OLLAMA_URL=http://localhost:11434
OLLAMA_MODEL=llama2
```

**Model yang bisa digunakan:**
- `llama2` (default)
- `llama3`
- `mistral`
- `codellama`
- atau model lain yang sudah di-pull

### 3. Restart Server

```bash
npm run start:dev
```

## 🔌 API Endpoints

### 1. Chat dengan Bot

```http
POST /api/chatbot/chat
Authorization: Bearer <token>
Content-Type: application/json

{
  "message": "dimana folder ijasah?"
}
```

**Response:**
```json
{
  "response": "Folder 'ijasah' ada di sistem, namun Anda tidak memiliki akses ke folder tersebut. Folder ini dapat diakses oleh role 'dosen'. Silakan hubungi admin untuk meminta permission akses ke folder ini.",
  "timestamp": "2024-01-26T18:00:00.000Z"
}
```

### 2. Search Folders

```http
POST /api/chatbot/search
Authorization: Bearer <token>
Content-Type: application/json

{
  "query": "ijasah"
}
```

**Response:**
```json
{
  "query": "ijasah",
  "results": [
    {
      "id": "folder-uuid",
      "name": "Ijasah",
      "accessible": false,
      "roles_with_access": ["dosen"],
      "needs_admin_permission": true
    }
  ],
  "count": 1
}
```

## 📝 Contoh Penggunaan

### Scenario 1: User wd1 bertanya tentang folder ijasah

**Request:**
```bash
POST /api/chatbot/chat
{
  "message": "dimana folder ijasah?"
}
```

**Response (dari chatbot):**
```
Folder "ijasah" ada di sistem repository. Namun, Anda (sebagai wd1) tidak memiliki akses ke folder tersebut saat ini.

Folder ini dapat diakses oleh role: dosen

Untuk mendapatkan akses ke folder ini, silakan hubungi admin untuk meminta permission. Admin dapat memberikan permission dengan:
1. Assign permission ke role wd1
2. Atau assign permission langsung ke user Anda

Apakah ada yang bisa saya bantu lagi?
```

### Scenario 2: User bertanya folder yang accessible

**Request:**
```bash
POST /api/chatbot/chat
{
  "message": "folder apa saja yang bisa saya akses?"
}
```

**Response:**
```
Berdasarkan akses Anda, berikut folder yang dapat Anda akses:

1. Folder "Internal" - Anda memiliki akses penuh
2. Folder "Documents" - Anda memiliki akses read dan create

Apakah ada folder spesifik yang ingin Anda cari?
```

### Scenario 3: Folder tidak ditemukan

**Request:**
```bash
POST /api/chatbot/chat
{
  "message": "dimana folder rahasia?"
}
```

**Response:**
```
Saya tidak menemukan folder dengan nama "rahasia" di sistem.

Folder yang tersedia di sistem:
- Internal
- Ijasah (akses: dosen)
- Documents
- Reports

Apakah maksud Anda salah satu folder di atas?
```

## 🔧 Konfigurasi Ollama

### Menggunakan Model Berbeda

Edit `.env`:
```env
OLLAMA_MODEL=mistral
# atau
OLLAMA_MODEL=llama3
```

### Menggunakan Ollama di Server Lain

```env
OLLAMA_URL=http://192.168.1.100:11434
```

### Timeout Configuration

Default timeout: 30 detik. Untuk mengubah, edit `chatbot.service.ts`:
```typescript
timeout: 60000, // 60 seconds
```

## 🐛 Troubleshooting

### Error: Connection refused

**Penyebab:** Ollama tidak berjalan

**Solusi:**
```bash
# Check Ollama status
curl http://localhost:11434/api/tags

# Start Ollama (jika belum)
ollama serve
```

### Error: Model not found

**Penyebab:** Model belum di-pull

**Solusi:**
```bash
# Pull model
ollama pull llama2

# Atau model lain
ollama pull mistral
```

### Response terlalu lambat

**Solusi:**
1. Gunakan model yang lebih kecil
2. Increase timeout di service
3. Gunakan Ollama dengan GPU (jika tersedia)

### Fallback Response

Jika Ollama tidak tersedia, chatbot akan memberikan fallback response yang masih informatif.

## 💡 Tips

1. **Gunakan model yang sesuai** - Model kecil lebih cepat, model besar lebih akurat
2. **Test dengan berbagai pertanyaan** - Pastikan chatbot memahami konteks
3. **Monitor response time** - Adjust timeout jika perlu
4. **Update system prompt** - Sesuaikan dengan kebutuhan sistem Anda

## 📚 System Prompt

System prompt sudah dikonfigurasi untuk:
- Memberi tahu folder yang tidak accessible
- Memberi tahu role yang punya akses
- Menyarankan untuk hubungi admin
- Merespons dalam Bahasa Indonesia

Untuk mengubah behavior, edit `buildSystemPrompt()` di `chatbot.service.ts`.

## 🚀 Production Considerations

1. **Rate Limiting** - Tambahkan rate limiting untuk prevent abuse
2. **Caching** - Cache folder context untuk performa lebih baik
3. **Monitoring** - Monitor Ollama API calls
4. **Error Handling** - Improve error handling untuk edge cases
5. **Logging** - Log semua chat interactions untuk debugging

---

**Chatbot siap digunakan! 🎉**

