import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const ExamManager = () => {
  return (
    <Routes>
      <Route path="/" element={<ExamList />} />
      <Route path="/new" element={<ExamForm />} />
      <Route path="/edit/:id" element={<ExamForm />} />
    </Routes>
  );
};

const ExamList = () => {
  const { user, API } = useContext(AuthContext);
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      const response = await fetch(`${API}/exams`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setExams(data);
      }
    } catch (error) {
      toast.error('Gagal memuat ujian');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (examId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus ujian ini?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/exams/${examId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        toast.success('Ujian berhasil dihapus');
        fetchExams();
      } else {
        toast.error('Gagal menghapus ujian');
      }
    } catch (error) {
      toast.error('Gagal menghapus ujian');
    }
  };

  const updateExamStatus = async (examId, status) => {
    try {
      const response = await fetch(`${API}/exams/${examId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        toast.success(`Status ujian berhasil diubah ke ${status === 'active' ? 'Aktif' : 'Draft'}`);
        fetchExams();
      } else {
        toast.error('Gagal mengubah status ujian');
      }
    } catch (error) {
      toast.error('Gagal mengubah status ujian');
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active': return 'Aktif';
      case 'draft': return 'Draft';
      case 'completed': return 'Selesai';
      default: return status;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return '#10b981';
      case 'draft': return '#f59e0b';
      case 'completed': return '#6b7280';
      default: return '#6b7280';
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Tidak terbatas';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID');
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Memuat ujian...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c' }}>
          Kelola Ujian
        </h1>
        <Link to="/admin/exams/new" className="btn btn-primary">
          + Buat Ujian Baru
        </Link>
      </div>

      {exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Belum ada ujian</h3>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Mulai dengan membuat ujian pertama Anda.
          </p>
          <Link to="/admin/exams/new" className="btn btn-primary">
            Buat Ujian Pertama
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {exams.map((exam) => (
            <div key={exam.id} className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <div>
                  <h3 className="card-title" style={{ marginBottom: '8px' }}>
                    {exam.title}
                  </h3>
                  <div
                    style={{
                      display: 'inline-block',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontSize: '12px',
                      fontWeight: '600',
                      color: 'white',
                      backgroundColor: getStatusColor(exam.status)
                    }}
                  >
                    {getStatusLabel(exam.status)}
                  </div>
                </div>
                <div style={{ textAlign: 'right', color: '#64748b', fontSize: '14px' }}>
                  <div>Durasi: {exam.duration_minutes} menit</div>
                  <div>Soal: {exam.questions.length}</div>
                </div>
              </div>

              <p style={{ color: '#64748b', marginBottom: '16px' }}>
                {exam.description}
              </p>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '14px', color: '#64748b', marginBottom: '20px' }}>
                <div>
                  <div>Mulai: {formatDateTime(exam.start_time)}</div>
                  <div>Berakhir: {formatDateTime(exam.end_time)}</div>
                </div>
                <div>
                  <div>Acak Soal: {exam.shuffle_questions ? 'Ya' : 'Tidak'}</div>
                  <div>Acak Pilihan: {exam.shuffle_options ? 'Ya' : 'Tidak'}</div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                <Link
                  to={`/admin/exams/edit/${exam.id}`}
                  className="btn btn-secondary"
                  style={{ textDecoration: 'none' }}
                >
                  Edit
                </Link>
                
                {exam.status === 'draft' ? (
                  <button
                    onClick={() => updateExamStatus(exam.id, 'active')}
                    className="btn btn-primary"
                  >
                    Aktifkan
                  </button>
                ) : (
                  <button
                    onClick={() => updateExamStatus(exam.id, 'draft')}
                    className="btn btn-secondary"
                  >
                    Non-aktifkan
                  </button>
                )}
                
                <button
                  onClick={() => handleDelete(exam.id)}
                  className="btn btn-danger"
                >
                  Hapus
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ExamForm = () => {
  const { user, API } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    questions: [],
    duration_minutes: 60,
    start_time: '',
    end_time: '',
    shuffle_questions: false,
    shuffle_options: false
  });

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await fetch(`${API}/questions`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const data = await response.json();
      if (response.ok) {
        setQuestions(data);
      }
    } catch (error) {
      toast.error('Gagal memuat soal');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.title.trim()) {
      toast.error('Judul ujian tidak boleh kosong');
      setLoading(false);
      return;
    }

    if (formData.questions.length === 0) {
      toast.error('Pilih minimal 1 soal untuk ujian');
      setLoading(false);
      return;
    }

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        questions: formData.questions,
        duration_minutes: parseInt(formData.duration_minutes),
        start_time: formData.start_time || null,
        end_time: formData.end_time || null,
        shuffle_questions: formData.shuffle_questions,
        shuffle_options: formData.shuffle_options
      };

      const response = await fetch(`${API}/exams`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Ujian berhasil dibuat');
        // Reset form
        setFormData({
          title: '',
          description: '',
          questions: [],
          duration_minutes: 60,
          start_time: '',
          end_time: '',
          shuffle_questions: false,
          shuffle_options: false
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Gagal membuat ujian');
      }
    } catch (error) {
      toast.error('Gagal membuat ujian');
    } finally {
      setLoading(false);
    }
  };

  const toggleQuestion = (questionId) => {
    const isSelected = formData.questions.includes(questionId);
    if (isSelected) {
      setFormData({
        ...formData,
        questions: formData.questions.filter(id => id !== questionId)
      });
    } else {
      setFormData({
        ...formData,
        questions: [...formData.questions, questionId]
      });
    }
  };

  const selectAllQuestions = () => {
    setFormData({
      ...formData,
      questions: questions.map(q => q.id)
    });
  };

  const deselectAllQuestions = () => {
    setFormData({
      ...formData,
      questions: []
    });
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice': return 'Pilihan Ganda';
      case 'essay': return 'Esai';
      case 'true_false': return 'Benar/Salah';
      default: return type;
    }
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/admin/exams" 
          style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          ← Kembali ke Daftar Ujian
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c' }}>
          Buat Ujian Baru
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Judul Ujian *</label>
            <input
              type="text"
              className="form-input"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Masukkan judul ujian..."
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea
              className="textarea"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Masukkan deskripsi ujian..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Durasi (menit) *</label>
              <input
                type="number"
                className="form-input"
                value={formData.duration_minutes}
                onChange={(e) => setFormData({ ...formData, duration_minutes: e.target.value })}
                min="1"
                max="480"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Waktu Mulai (Opsional)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.start_time}
                onChange={(e) => setFormData({ ...formData, start_time: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Waktu Berakhir (Opsional)</label>
              <input
                type="datetime-local"
                className="form-input"
                value={formData.end_time}
                onChange={(e) => setFormData({ ...formData, end_time: e.target.value })}
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.shuffle_questions}
                  onChange={(e) => setFormData({ ...formData, shuffle_questions: e.target.checked })}
                />
                Acak urutan soal
              </label>
            </div>

            <div className="form-group">
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={formData.shuffle_options}
                  onChange={(e) => setFormData({ ...formData, shuffle_options: e.target.checked })}
                />
                Acak pilihan jawaban
              </label>
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <label className="form-label">Pilih Soal * ({formData.questions.length} dipilih)</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={selectAllQuestions}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Pilih Semua
                </button>
                <button
                  type="button"
                  onClick={deselectAllQuestions}
                  className="btn btn-secondary"
                  style={{ padding: '6px 12px', fontSize: '12px' }}
                >
                  Batal Pilih
                </button>
              </div>
            </div>

            {questions.length === 0 ? (
              <div style={{ padding: '20px', textAlign: 'center', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                <p style={{ color: '#64748b', marginBottom: '16px' }}>Belum ada soal tersedia</p>
                <Link to="/admin/questions/new" className="btn btn-primary">
                  Buat Soal Terlebih Dahulu
                </Link>
              </div>
            ) : (
              <div style={{ maxHeight: '400px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                {questions.map((question) => (
                  <div
                    key={question.id}
                    style={{
                      padding: '16px',
                      borderBottom: '1px solid #e2e8f0',
                      cursor: 'pointer',
                      backgroundColor: formData.questions.includes(question.id) ? '#f0f9ff' : 'white'
                    }}
                    onClick={() => toggleQuestion(question.id)}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                      <input
                        type="checkbox"
                        checked={formData.questions.includes(question.id)}
                        onChange={() => toggleQuestion(question.id)}
                        style={{ marginTop: '4px', transform: 'scale(1.2)' }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {question.question_text.length > 120 
                            ? `${question.question_text.substring(0, 120)}...`
                            : question.question_text
                          }
                        </div>
                        <div style={{ display: 'flex', gap: '12px', fontSize: '12px', color: '#64748b' }}>
                          <span style={{
                            padding: '2px 6px',
                            borderRadius: '8px',
                            backgroundColor: '#e0e7ff',
                            color: '#3730a3'
                          }}>
                            {getQuestionTypeLabel(question.question_type)}
                          </span>
                          <span>{question.points} poin</span>
                          {question.image_url && (
                            <span style={{ color: '#10b981' }}>📷 Dengan gambar</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <Link to="/admin/exams" className="btn btn-secondary">
              Batal
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Ujian'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ExamManager;