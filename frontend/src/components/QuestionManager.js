import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const QuestionManager = () => {
  return (
    <Routes>
      <Route path="/" element={<QuestionList />} />
      <Route path="/new" element={<QuestionForm />} />
      <Route path="/edit/:id" element={<QuestionForm />} />
    </Routes>
  );
};

const QuestionList = () => {
  const { user, API } = useContext(AuthContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

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
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (questionId) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus soal ini?')) {
      return;
    }

    try {
      const response = await fetch(`${API}/questions/${questionId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        toast.success('Soal berhasil dihapus');
        fetchQuestions();
      } else {
        toast.error('Gagal menghapus soal');
      }
    } catch (error) {
      toast.error('Gagal menghapus soal');
    }
  };

  const getQuestionTypeLabel = (type) => {
    switch (type) {
      case 'multiple_choice': return 'Pilihan Ganda';
      case 'essay': return 'Esai';
      case 'true_false': return 'Benar/Salah';
      default: return type;
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Memuat soal...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c' }}>
          Kelola Soal
        </h1>
        <Link to="/admin/questions/new" className="btn btn-primary">
          + Tambah Soal Baru
        </Link>
      </div>

      {questions.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Belum ada soal</h3>
          <p style={{ color: '#9ca3af', marginBottom: '24px' }}>
            Mulai dengan membuat soal pertama Anda.
          </p>
          <Link to="/admin/questions/new" className="btn btn-primary">
            Buat Soal Pertama
          </Link>
        </div>
      ) : (
        <div className="card">
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Soal</th>
                  <th>Tipe</th>
                  <th>Poin</th>
                  <th>Dibuat</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((question) => (
                  <tr key={question.id}>
                    <td>
                      <div style={{ maxWidth: '400px' }}>
                        <div style={{ fontWeight: '500', marginBottom: '4px' }}>
                          {question.question_text.length > 100 
                            ? `${question.question_text.substring(0, 100)}...`
                            : question.question_text
                          }
                        </div>
                        {question.image_url && (
                          <span style={{ fontSize: '12px', color: '#10b981' }}>📷 Dengan gambar</span>
                        )}
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '4px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '500',
                        backgroundColor: '#e0e7ff',
                        color: '#3730a3'
                      }}>
                        {getQuestionTypeLabel(question.question_type)}
                      </span>
                    </td>
                    <td>{question.points}</td>
                    <td style={{ fontSize: '14px', color: '#64748b' }}>
                      {new Date(question.created_at).toLocaleDateString('id-ID')}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <Link
                          to={`/admin/questions/edit/${question.id}`}
                          className="btn btn-secondary"
                          style={{ 
                            padding: '6px 12px', 
                            fontSize: '12px',
                            textDecoration: 'none'
                          }}
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDelete(question.id)}
                          className="btn btn-danger"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Hapus
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

const QuestionForm = () => {
  const { user, API } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    question_text: '',
    question_type: 'multiple_choice',
    options: [
      { id: '1', text: '', is_correct: false },
      { id: '2', text: '', is_correct: false }
    ],
    correct_answer: '',
    points: 1,
    image_url: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!formData.question_text.trim()) {
      toast.error('Teks soal tidak boleh kosong');
      setLoading(false);
      return;
    }

    if (formData.question_type === 'multiple_choice') {
      const validOptions = formData.options.filter(opt => opt.text.trim());
      if (validOptions.length < 2) {
        toast.error('Minimal harus ada 2 pilihan untuk soal pilihan ganda');
        setLoading(false);
        return;
      }
      const correctOptions = formData.options.filter(opt => opt.is_correct);
      if (correctOptions.length !== 1) {
        toast.error('Harus ada tepat 1 jawaban yang benar untuk soal pilihan ganda');
        setLoading(false);
        return;
      }
    }

    if (formData.question_type === 'true_false') {
      const correctOptions = formData.options.filter(opt => opt.is_correct);
      if (correctOptions.length !== 1) {
        toast.error('Harus ada tepat 1 jawaban yang benar untuk soal benar/salah');
        setLoading(false);
        return;
      }
    }

    try {
      const payload = {
        question_text: formData.question_text,
        question_type: formData.question_type,
        options: formData.question_type === 'essay' ? [] : formData.options.filter(opt => opt.text.trim()),
        correct_answer: formData.question_type === 'essay' ? formData.correct_answer : null,
        points: parseInt(formData.points),
        image_url: formData.image_url || null
      };

      const response = await fetch(`${API}/questions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        toast.success('Soal berhasil dibuat');
        // Reset form
        setFormData({
          question_text: '',
          question_type: 'multiple_choice',
          options: [
            { id: '1', text: '', is_correct: false },
            { id: '2', text: '', is_correct: false }
          ],
          correct_answer: '',
          points: 1,
          image_url: ''
        });
      } else {
        const error = await response.json();
        toast.error(error.detail || 'Gagal membuat soal');
      }
    } catch (error) {
      toast.error('Gagal membuat soal');
    } finally {
      setLoading(false);
    }
  };

  const handleQuestionTypeChange = (type) => {
    if (type === 'true_false') {
      setFormData({
        ...formData,
        question_type: type,
        options: [
          { id: '1', text: 'Benar', is_correct: false },
          { id: '2', text: 'Salah', is_correct: false }
        ]
      });
    } else if (type === 'essay') {
      setFormData({
        ...formData,
        question_type: type,
        options: []
      });
    } else {
      setFormData({
        ...formData,
        question_type: type,
        options: [
          { id: '1', text: '', is_correct: false },
          { id: '2', text: '', is_correct: false }
        ]
      });
    }
  };

  const addOption = () => {
    const newId = (formData.options.length + 1).toString();
    setFormData({
      ...formData,
      options: [...formData.options, { id: newId, text: '', is_correct: false }]
    });
  };

  const removeOption = (index) => {
    if (formData.options.length <= 2) {
      toast.error('Minimal harus ada 2 pilihan');
      return;
    }
    const newOptions = formData.options.filter((_, i) => i !== index);
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  const updateOption = (index, field, value) => {
    const newOptions = [...formData.options];
    newOptions[index] = { ...newOptions[index], [field]: value };
    
    // For radio button behavior - only one correct answer
    if (field === 'is_correct' && value === true) {
      newOptions.forEach((opt, i) => {
        if (i !== index) {
          opt.is_correct = false;
        }
      });
    }
    
    setFormData({
      ...formData,
      options: newOptions
    });
  };

  return (
    <div className="fade-in">
      <div style={{ marginBottom: '32px' }}>
        <Link 
          to="/admin/questions" 
          style={{ 
            color: '#667eea', 
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '16px'
          }}
        >
          ← Kembali ke Daftar Soal
        </Link>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c' }}>
          Buat Soal Baru
        </h1>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit} className="form">
          <div className="form-group">
            <label className="form-label">Teks Soal *</label>
            <textarea
              className="textarea"
              value={formData.question_text}
              onChange={(e) => setFormData({ ...formData, question_text: e.target.value })}
              placeholder="Masukkan teks soal..."
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Tipe Soal *</label>
              <select
                className="select"
                value={formData.question_type}
                onChange={(e) => handleQuestionTypeChange(e.target.value)}
              >
                <option value="multiple_choice">Pilihan Ganda</option>
                <option value="true_false">Benar/Salah</option>
                <option value="essay">Esai</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Poin</label>
              <input
                type="number"
                className="form-input"
                value={formData.points}
                onChange={(e) => setFormData({ ...formData, points: e.target.value })}
                min="1"
                max="100"
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">URL Gambar (Opsional)</label>
            <input
              type="url"
              className="form-input"
              value={formData.image_url}
              onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </div>

          {/* Options for Multiple Choice and True/False */}
          {(formData.question_type === 'multiple_choice' || formData.question_type === 'true_false') && (
            <div className="form-group">
              <label className="form-label">Pilihan Jawaban *</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {formData.options.map((option, index) => (
                  <div key={option.id} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <input
                      type="radio"
                      name="correct_answer"
                      checked={option.is_correct}
                      onChange={() => updateOption(index, 'is_correct', true)}
                      style={{ transform: 'scale(1.2)' }}
                    />
                    <input
                      type="text"
                      className="form-input"
                      value={option.text}
                      onChange={(e) => updateOption(index, 'text', e.target.value)}
                      placeholder={`Pilihan ${index + 1}`}
                      required
                      disabled={formData.question_type === 'true_false'}
                      style={{ flex: 1 }}
                    />
                    {formData.question_type === 'multiple_choice' && formData.options.length > 2 && (
                      <button
                        type="button"
                        onClick={() => removeOption(index)}
                        className="btn btn-danger"
                        style={{ padding: '8px 12px', fontSize: '12px' }}
                      >
                        Hapus
                      </button>
                    )}
                  </div>
                ))}
              </div>
              
              {formData.question_type === 'multiple_choice' && (
                <button
                  type="button"
                  onClick={addOption}
                  className="btn btn-secondary"
                  style={{ marginTop: '12px' }}
                >
                  + Tambah Pilihan
                </button>
              )}
            </div>
          )}

          {/* Answer for Essay */}
          {formData.question_type === 'essay' && (
            <div className="form-group">
              <label className="form-label">Jawaban yang Diharapkan (Opsional)</label>
              <textarea
                className="textarea"
                value={formData.correct_answer}
                onChange={(e) => setFormData({ ...formData, correct_answer: e.target.value })}
                placeholder="Masukkan jawaban yang diharapkan untuk referensi penilaian..."
              />
            </div>
          )}

          <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end', marginTop: '32px' }}>
            <Link to="/admin/questions" className="btn btn-secondary">
              Batal
            </Link>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
            >
              {loading ? 'Menyimpan...' : 'Simpan Soal'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default QuestionManager;