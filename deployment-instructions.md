# 📋 Manual Deployment ke GitHub - Website Ujian Online

## 🔄 Langkah-langkah Manual Deployment

### 1. **Persiapkan GitHub Repository**

1. Buka [GitHub.com](https://github.com) dan login
2. Klik tombol **"New repository"** (hijau)
3. Beri nama repository: `online-exam-system` atau nama yang Anda inginkan
4. Pilih **Public** atau **Private** sesuai kebutuhan
5. **JANGAN** centang "Add a README file" karena kita akan upload manual
6. Klik **"Create repository"**

### 2. **Download File dari Platform Emergent**

Anda perlu menyalin semua file berikut secara manual:

#### **Backend Files:**
```
📁 backend/
├── server.py (COPY dari /app/backend/server.py)
├── requirements.txt (COPY dari /app/backend/requirements.txt)
└── .env.example (buat manual, lihat contoh di bawah)
```

#### **Frontend Files:**
```
📁 frontend/
├── 📁 public/ (copy semua isi dari /app/frontend/public/)
├── 📁 src/
│   ├── 📁 components/
│   │   ├── 📁 ui/ (copy semua .jsx files dari /app/frontend/src/components/ui/)
│   │   ├── AdminDashboard.js
│   │   ├── ExamManager.js
│   │   ├── ExamPage.js
│   │   ├── LoginPage.js
│   │   ├── QuestionManager.js
│   │   ├── ResultsManager.js
│   │   └── StudentDashboard.js
│   ├── 📁 hooks/
│   │   └── use-toast.js
│   ├── 📁 lib/
│   │   └── utils.js
│   ├── App.js
│   ├── App.css
│   ├── index.js
│   └── index.css
├── package.json
├── tailwind.config.js
├── postcss.config.js
├── jsconfig.json
├── craco.config.js
└── components.json
```

#### **Root Files:**
```
📁 online-exam-system/
├── README.md (sudah ada)
└── deployment-instructions.md (file ini)
```

### 3. **Cara Copy File dari Platform ke Komputer**

Untuk setiap file yang perlu dicopy:

1. **Buka file di platform Emergent** (contoh: `/app/backend/server.py`)
2. **Select All** (Ctrl+A) dan **Copy** (Ctrl+C) semua isi file
3. **Buat file baru** di komputer dengan nama yang sama
4. **Paste** (Ctrl+V) isi file ke file baru
5. **Save** file dengan ekstensi yang benar (.js, .py, .css, dll)

### 4. **Setup Local Git Repository**

Buka Command Prompt/Terminal di folder tempat Anda menyimpan files:

```bash
# Inisialisasi Git repository
git init

# Tambahkan semua file
git add .

# Commit pertama
git commit -m "Initial commit: Online Exam System with FastAPI + React"

# Hubungkan ke GitHub repository (ganti URL dengan repository Anda)
git remote add origin https://github.com/USERNAME/online-exam-system.git

# Push ke GitHub
git push -u origin main
```

### 5. **Buat File Environment (.env.example)**

Buat file `.env.example` di folder `backend/`:

```env
# MongoDB Configuration
MONGO_URL=mongodb://localhost:27017
DB_NAME=online_exam_db

# Security
SECRET_KEY=your-secret-key-here-change-in-production

# CORS Settings
CORS_ORIGINS=http://localhost:3000,https://yourdomain.com
```

Buat file `.env.example` di folder `frontend/`:

```env
# Backend URL
REACT_APP_BACKEND_URL=http://localhost:8001
```

### 6. **Upload ke GitHub via Web Interface** (Alternatif)

Jika tidak familiar dengan Git command line:

1. **Buka GitHub repository** yang sudah dibuat
2. **Klik "uploading an existing file"**
3. **Drag & drop** atau pilih semua file
4. **Write commit message**: "Add online exam system files"
5. **Commit changes**

### 7. **Struktur Folder Akhir di GitHub**

```
online-exam-system/
├── README.md
├── deployment-instructions.md
├── backend/
│   ├── server.py
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── public/
    │   └── [public files]
    ├── src/
    │   ├── components/
    │   │   ├── ui/
    │   │   │   └── [all shadcn components]
    │   │   ├── AdminDashboard.js
    │   │   ├── ExamManager.js
    │   │   ├── ExamPage.js
    │   │   ├── LoginPage.js
    │   │   ├── QuestionManager.js
    │   │   ├── ResultsManager.js
    │   │   └── StudentDashboard.js
    │   ├── hooks/
    │   │   └── use-toast.js
    │   ├── lib/
    │   │   └── utils.js
    │   ├── App.js
    │   ├── App.css
    │   ├── index.js
    │   └── index.css
    ├── package.json
    ├── tailwind.config.js
    ├── postcss.config.js
    ├── jsconfig.json
    ├── craco.config.js
    └── components.json
```

## 🚀 Setelah Upload ke GitHub

### **Untuk Menjalankan Locally:**

1. **Clone repository:**
```bash
git clone https://github.com/USERNAME/online-exam-system.git
cd online-exam-system
```

2. **Setup Backend:**
```bash
cd backend
pip install -r requirements.txt
cp .env.example .env
# Edit .env file dengan settings yang benar
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

3. **Setup Frontend:**
```bash
cd frontend
npm install
cp .env.example .env
# Edit .env file dengan REACT_APP_BACKEND_URL yang benar
npm start
```

### **Untuk Deploy ke Hosting:**

- **Vercel/Netlify**: Untuk frontend
- **Railway/Heroku**: Untuk backend
- **MongoDB Atlas**: Untuk database

## ✅ Checklist File yang Harus Ada

- [ ] README.md (dengan dokumentasi lengkap)
- [ ] backend/server.py (FastAPI application)
- [ ] backend/requirements.txt (Python dependencies)
- [ ] backend/.env.example (Environment variables template)
- [ ] frontend/package.json (Node.js dependencies)
- [ ] frontend/src/App.js (Main React component)
- [ ] frontend/src/App.css (Main styling)
- [ ] Semua React components (9 files)
- [ ] Semua Shadcn UI components (30+ files)
- [ ] Configuration files (tailwind, postcss, craco, etc.)

## 🆘 Troubleshooting

**Jika Git command tidak dikenali:**
- Install Git dari [git-scm.com](https://git-scm.com/)

**Jika ada error saat push:**
- Pastikan sudah login ke GitHub account
- Cek apakah repository URL sudah benar

**Jika file terlalu besar:**
- Upload file satu per satu atau per folder
- Gunakan GitHub Desktop untuk interface yang lebih mudah

---

**Selamat! Website ujian online Anda sekarang sudah tersimpan di GitHub! 🎉**