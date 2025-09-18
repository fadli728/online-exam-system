import React, { useState, useContext, useEffect } from 'react';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const ResultsManager = () => {
  const { user, API } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch exams
      const examsResponse = await fetch(`${API}/exams`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const examsData = await examsResponse.json();
      if (examsResponse.ok) {
        setExams(examsData);
      }

      // Note: In a real implementation, you would have an endpoint to fetch all exam attempts
      // For now, we'll show a placeholder since the backend doesn't have this endpoint yet
      setResults([]);
      
    } catch (error) {
      toast.error('Gagal memuat data hasil ujian');
    } finally {
      setLoading(false);
    }
  };

  const formatDateTime = (dateStr) => {
    if (!dateStr) return '-';
    const date = new Date(dateStr);
    return date.toLocaleString('id-ID');
  };

  const getScoreColor = (score) => {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const filteredResults = selectedExam === 'all' 
    ? results 
    : results.filter(result => result.exam_id === selectedExam);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px' }}>
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
        <p style={{ marginTop: '16px', color: '#64748b' }}>Memuat hasil ujian...</p>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: '700', color: '#1a202c' }}>
          Hasil Ujian
        </h1>
        
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <select
            className="select"
            value={selectedExam}
            onChange={(e) => setSelectedExam(e.target.value)}
            style={{ minWidth: '200px' }}
          >
            <option value="all">Semua Ujian</option>
            {exams.map((exam) => (
              <option key={exam.id} value={exam.id}>
                {exam.title}
              </option>
            ))}
          </select>
          
          <button className="btn btn-primary">
            📊 Export Excel
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
        gap: '24px',
        marginBottom: '32px'
      }}>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {filteredResults.length}
          </h3>
          <p style={{ opacity: 0.9 }}>Total Pengerjaan</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {filteredResults.filter(r => r.score >= 70).length}
          </h3>
          <p style={{ opacity: 0.9 }}>Lulus (≥70)</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {filteredResults.length > 0 
              ? (filteredResults.reduce((sum, r) => sum + (r.score || 0), 0) / filteredResults.length).toFixed(1)
              : '0'
            }
          </h3>
          <p style={{ opacity: 0.9 }}>Rata-rata</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '8px' }}>
            {filteredResults.length > 0 
              ? Math.max(...filteredResults.map(r => r.score || 0)).toFixed(1)
              : '0'
            }
          </h3>
          <p style={{ opacity: 0.9 }}>Skor Tertinggi</p>
        </div>
      </div>

      {/* Results Table */}
      <div className="card">
        {filteredResults.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px' }}>
            <h3 style={{ color: '#64748b', marginBottom: '16px' }}>Belum ada hasil ujian</h3>
            <p style={{ color: '#9ca3af' }}>
              Hasil ujian akan muncul setelah siswa menyelesaikan ujian.
            </p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Nama Siswa</th>
                  <th>Ujian</th>
                  <th>Skor</th>
                  <th>Status</th>
                  <th>Waktu Mulai</th>
                  <th>Waktu Selesai</th>
                  <th>Durasi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredResults.map((result) => {
                  const duration = result.end_time && result.start_time 
                    ? Math.round((new Date(result.end_time) - new Date(result.start_time)) / 1000 / 60)
                    : null;
                    
                  return (
                    <tr key={result.id}>
                      <td style={{ fontWeight: '500' }}>
                        {result.student_name}
                      </td>
                      <td>
                        {exams.find(e => e.id === result.exam_id)?.title || 'Unknown'}
                      </td>
                      <td>
                        <span style={{
                          fontWeight: '600',
                          color: getScoreColor(result.score || 0)
                        }}>
                          {(result.score || 0).toFixed(1)}
                        </span>
                      </td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '12px',
                          fontSize: '12px',
                          fontWeight: '500',
                          backgroundColor: result.is_submitted ? '#dcfce7' : '#fef3c7',
                          color: result.is_submitted ? '#166534' : '#92400e'
                        }}>
                          {result.is_submitted ? 'Selesai' : 'Dalam Progress'}
                        </span>
                      </td>
                      <td style={{ fontSize: '14px', color: '#64748b' }}>
                        {formatDateTime(result.start_time)}
                      </td>
                      <td style={{ fontSize: '14px', color: '#64748b' }}>
                        {formatDateTime(result.end_time)}
                      </td>
                      <td style={{ fontSize: '14px', color: '#64748b' }}>
                        {duration ? `${duration} menit` : '-'}
                      </td>
                      <td>
                        <button
                          className="btn btn-secondary"
                          style={{ padding: '6px 12px', fontSize: '12px' }}
                        >
                          Detail
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Placeholder for future features */}
      <div className="card" style={{ marginTop: '24px' }}>
        <h3 className="card-title">Fitur Akan Datang</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px' }}>
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#1a202c', marginBottom: '8px', fontSize: '16px' }}>📊 Analisis Statistik</h4>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Grafik performa siswa, distribusi skor, dan analisis soal
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#1a202c', marginBottom: '8px', fontSize: '16px' }}>📄 Export Laporan</h4>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Export hasil ke Excel dan PDF dengan format yang dapat disesuaikan
            </p>
          </div>
          
          <div style={{ padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
            <h4 style={{ color: '#1a202c', marginBottom: '8px', fontSize: '16px' }}>🔍 Review Jawaban</h4>
            <p style={{ color: '#64748b', fontSize: '14px' }}>
              Lihat jawaban detail siswa dan berikan feedback
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResultsManager;