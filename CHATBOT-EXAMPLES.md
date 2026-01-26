# Chatbot Examples - Campus Repository

Contoh penggunaan chatbot untuk berbagai skenario.

## 🎯 Skenario: WD1 mencari folder Ijasah

### Request
```bash
POST /api/chatbot/chat
Authorization: Bearer <token-wd1>
Content-Type: application/json

{
  "message": "dimana folder ijasah?"
}
```

### Expected Response
```
Folder "ijasah" ada di sistem repository kampus. Namun, Anda (sebagai wd1) tidak memiliki akses ke folder tersebut saat ini.

Folder ini dapat diakses oleh role: dosen

Untuk mendapatkan akses ke folder ini, silakan hubungi admin untuk meminta permission. Admin dapat memberikan permission dengan cara:
1. Assign permission ke role wd1
2. Atau assign permission langsung ke user Anda

Apakah ada yang bisa saya bantu lagi?
```

## 📋 Contoh Pertanyaan Lain

### 1. Mencari folder yang accessible

**Pertanyaan:**
```json
{
  "message": "folder apa saja yang bisa saya akses?"
}
```

**Response:**
```
Berdasarkan akses Anda sebagai wd1, berikut folder yang dapat Anda akses:

1. Folder "Internal" - Anda memiliki akses penuh (read, create, update, delete)
2. Folder "Documents" - Anda memiliki akses read dan create

Apakah ada folder spesifik yang ingin Anda cari?
```

### 2. Mencari folder yang tidak ada

**Pertanyaan:**
```json
{
  "message": "dimana folder rahasia?"
}
```

**Response:**
```
Saya tidak menemukan folder dengan nama "rahasia" di sistem repository.

Folder yang tersedia di sistem:
- Internal (akses: wd1, admin)
- Ijasah (akses: dosen)
- Documents (akses: wd1, tendik)
- Reports (akses: wd2)

Apakah maksud Anda salah satu folder di atas?
```

### 3. Mencari folder berdasarkan role

**Pertanyaan:**
```json
{
  "message": "folder apa saja yang bisa diakses role dosen?"
}
```

**Response:**
```
Berikut folder yang dapat diakses oleh role dosen:

1. Folder "Ijasah" - Role dosen memiliki akses penuh
2. Folder "Documents" - Role dosen memiliki akses read dan create

Jika Anda ingin mengakses folder yang dimiliki role dosen, silakan hubungi admin untuk meminta permission.
```

### 4. Request permission

**Pertanyaan:**
```json
{
  "message": "saya ingin akses ke folder ijasah"
}
```

**Response:**
```
Saya memahami Anda ingin mengakses folder "ijasah". Saat ini folder tersebut hanya dapat diakses oleh role dosen.

Untuk mendapatkan akses, silakan:
1. Hubungi admin melalui sistem
2. Admin akan assign permission ke role wd1 atau langsung ke user Anda
3. Setelah permission diberikan, folder akan muncul di tree folder Anda

Apakah ada yang bisa saya bantu lagi?
```

## 🔍 Search Endpoint

### Search Folders

**Request:**
```bash
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
      "id": "folder-uuid-123",
      "name": "Ijasah",
      "accessible": false,
      "roles_with_access": ["dosen"],
      "needs_admin_permission": true
    }
  ],
  "count": 1
}
```

## 💡 Tips Penggunaan

1. **Gunakan Bahasa Indonesia** - Chatbot dioptimalkan untuk Bahasa Indonesia
2. **Pertanyaan spesifik** - Semakin spesifik pertanyaan, semakin akurat jawaban
3. **Gunakan search endpoint** - Untuk mendapatkan data terstruktur
4. **Combine dengan chat** - Gunakan search untuk data, chat untuk penjelasan

## 🎨 Frontend Integration

### React Example

```typescript
// hooks/useChatbot.ts
import { useState } from 'react';
import { apiClient } from '../api/client';

export function useChatbot() {
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Array<{role: string, content: string}>>([]);

  const sendMessage = async (message: string) => {
    setLoading(true);
    try {
      const response = await apiClient.chat(message);
      setMessages(prev => [
        ...prev,
        { role: 'user', content: message },
        { role: 'assistant', content: response.response }
      ]);
      return response;
    } catch (error) {
      console.error('Chat error:', error);
    } finally {
      setLoading(false);
    }
  };

  return { messages, loading, sendMessage };
}
```

### API Client Method

```typescript
// api/client.ts
async chat(message: string) {
  return this.request<{
    response: string;
    timestamp: string;
  }>('/chatbot/chat', {
    method: 'POST',
    body: JSON.stringify({ message }),
  });
}

async searchFolders(query: string) {
  return this.request<{
    query: string;
    results: Array<{
      id: string;
      name: string;
      accessible: boolean;
      roles_with_access: string[];
      needs_admin_permission: boolean;
    }>;
    count: number;
  }>('/chatbot/search', {
    method: 'POST',
    body: JSON.stringify({ query }),
  });
}
```

---

**Chatbot siap digunakan untuk membantu user menemukan folder! 🚀**

