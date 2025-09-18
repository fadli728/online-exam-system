import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const { user, logout, API } = useContext(AuthContext);
  const location = useLocation();
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

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Tidak terbatas';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID');
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && now < start) return 'Belum Dimulai';
    if (end && now > end) return 'Berakhir';
    if (exam.status === 'active') return 'Aktif';
    return 'Draft';
  };

  const canTakeExam = (exam) => {
    const status = getExamStatus(exam);
    return status === 'Aktif';
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="dashboard-logo">
            📚 Sistem Ujian Online
          </div>
          <div className="nav-menu">
            <Link
              to="/student"
              className={`nav-link ${location.pathname === '/student' ? 'active' : ''}`}
            >
              Ujian Tersedia
            </Link>
            <Link
              to="/student/history"
              className={`nav-link ${location.pathname === '/student/history' ? 'active' : ''}`}
            >
              Riwayat Ujian
            </Link>
          </div>
          <div className="user-menu">
            <span className="user-info">
              Siswa: {user.full_name}
            </span>
            <button
              onClick={handleLogout}
              className="logout-button"
            >
              Logout
            </button>
          </div>
        </nav>
      </header>

      <main className="dashboard-content">
        <Routes>
          <Route path="/" element={<ExamList exams={exams} loading={loading} />} />
          <Route path="/history" element={<ExamHistory />} />
        </Routes>
      </main>
    </div>
  );
};

const ExamList = ({ exams, loading }) => {
  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Memuat ujian...</p>
      </div>
    );
  }

  const formatDateTime = (dateStr) => {
    if (!dateStr) return 'Tidak terbatas';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID');
  };

  const getExamStatus = (exam) => {
    const now = new Date();
    const start = exam.start_time ? new Date(exam.start_time) : null;
    const end = exam.end_time ? new Date(exam.end_time) : null;

    if (start && now < start) return 'Belum Dimulai';
    if (end && now > end) return 'Berakhir';
    if (exam.status === 'active') return 'Aktif';
    return 'Draft';
  };

  const canTakeExam = (exam) => {
    const status = getExamStatus(exam);
    return status === 'Aktif';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Aktif': return '#10b981';
      case 'Belum Dimulai': return '#f59e0b';
      case 'Berakhir': return '#ef4444';
      default: return '#6b7280';
    }
  };

  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#1a202c' }}>
        Ujian Tersedia
      </h1>

      {exams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
          <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Tidak ada ujian tersedia</h3>
          <p style={{ color: '#9ca3af' }}>Silakan hubungi admin untuk informasi lebih lanjut.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: '24px' }}>
          {exams.map((exam) => {
            const status = getExamStatus(exam);
            const statusColor = getStatusColor(status);
            
            return (
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
                        backgroundColor: statusColor
                      }}
                    >
                      {status}
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
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                  {canTakeExam(exam) ? (
                    <Link
                      to={`/exam/${exam.id}`}
                      className="btn btn-primary"
                      style={{ textDecoration: 'none' }}
                    >
                      Mulai Ujian
                    </Link>
                  ) : (
                    <button
                      className="btn btn-secondary"
                      disabled
                      style={{ opacity: 0.5, cursor: 'not-allowed' }}
                    >
                      {status === 'Belum Dimulai' ? 'Belum Waktunya' : 'Tidak Tersedia'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

const ExamHistory = () => {
  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#1a202c' }}>
        Riwayat Ujian
      </h1>
      
      <div className="card" style={{ textAlign: 'center', padding: '60px' }}>
        <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Fitur dalam pengembangan</h3>
        <p style={{ color: '#9ca3af' }}>Riwayat ujian akan segera tersedia.</p>
      </div>
    </div>
  );
};

export default StudentDashboard;