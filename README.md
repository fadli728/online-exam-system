# 📚 Website Ujian Online

Sistem ujian online lengkap dengan fitur authentication, manajemen soal, dan anti-cheat untuk institusi pendidikan.

## 🚀 Fitur Utama

### 🔐 Authentication System
- login terpisah untuk Admin (guru) dan Siswa
- JWT token authentication yang aman
- Role-based access control

### 👨‍🏫 Panel Admin
- Dashboard dengan statistik real-time
- Kelola Soal: Pilihan ganda, Benar/Salah, Esai
- Support gambar, diagram, tabel, dan persamaan
- Kelola Ujian: Buat, edit, aktivasi ujian
- Monitor hasil ujian siswa

### 🎓 Panel Siswa
- Dashboard dengan daftar ujian tersedia
- Interface ujian dengan timer countdown
- Auto-save jawaban real-time
- Progress tracking

### 🔒 Keamanan & Anti-Cheat
- Deteksi tab switching dengan warning
- Fullscreen mode enforcement
- Disable right-click dan keyboard shortcuts
- Auto-submit ketika waktu habis

### ⚙️ Fitur Ujian Advanced
- Timer dengan visual countdown
- Acak urutan soal dan pilihan jawaban
- Penjadwalan ujian (waktu mulai/berakhir)
- Auto-scoring untuk objektif
- Support multiple question types

## 🛠️ Tech Stack

- **Backend**: FastAPI + Python
- **Frontend**: React 19 + Tailwind CSS
- **Database**: MongoDB
- **Authentication**: JWT tokens
- **UI Components**: Shadcn/ui
- **Styling**: Modern glass-morphism design

## 📦 Installation

### Backend Setup
```bash
cd backend
pip install -r requirements.txt
uvicorn server:app --reload --host 0.0.0.0 --port 8001
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

### Environment Variables
Create `.env` files:

**Backend (.env):**
```
MONGO_URL=mongodb://localhost:27017
DB_NAME=online_exam_db
SECRET_KEY=your-secret-key-here
CORS_ORIGINS=http://localhost:3000
```

**Frontend (.env):**
```
REACT_APP_BACKEND_URL=http://localhost:8001
```

## 🚀 Usage

1. **Admin Flow:**
   - Register/Login sebagai admin
   - Buat soal-soal ujian
   - Buat dan aktivasi ujian
   - Monitor hasil siswa

2. **Student Flow:**
   - Register/Login sebagai siswa
   - Lihat ujian yang tersedia
   - Kerjakan ujian dengan timer
   - Lihat hasil ujian

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register user baru
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user info

### Questions (Admin only)
- `GET /api/questions` - Get all questions
- `POST /api/questions` - Create new question
- `PUT /api/questions/{id}` - Update question
- `DELETE /api/questions/{id}` - Delete question

### Exams
- `GET /api/exams` - Get exams (filtered by role)
- `POST /api/exams` - Create exam (admin only)
- `PUT /api/exams/{id}` - Update exam (admin only)
- `POST /api/exams/{id}/start` - Start exam attempt
- `POST /api/exams/{id}/submit` - Submit answer
- `POST /api/exams/{id}/finish` - Finish exam

## 🎨 UI Features

- Modern glass-morphism design
- Responsive layout
- Indonesian language interface
- Loading states dan smooth animations
- Toast notifications
- Real-time timer countdown

## 🔒 Security Features

- JWT token authentication
- Password hashing dengan bcrypt
- CORS protection
- Input validation
- SQL injection prevention
- XSS protection

## 📱 Browser Compatibility

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 🤝 Contributing

1. Fork the repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## 📄 License

MIT License

## 🆘 Support

Untuk pertanyaan atau bantuan, silakan buat issue di repository ini.

---

**Dibuat dengan ❤️ menggunakan FastAPI + React**
