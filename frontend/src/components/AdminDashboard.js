import React, { useState, useContext, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthContext } from '../App';
import QuestionManager from './QuestionManager';
import ExamManager from './ExamManager';
import ResultsManager from './ResultsManager';
import { toast } from 'sonner';

const AdminDashboard = () => {
  const { user, logout } = useContext(AuthContext);
  const location = useLocation();
  const [stats, setStats] = useState({
    totalQuestions: 0,
    totalExams: 0,
    totalStudents: 0,
    activeExams: 0
  });

  const navItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/questions', label: 'Kelola Soal' },
    { path: '/admin/exams', label: 'Kelola Ujian' },
    { path: '/admin/results', label: 'Hasil Ujian' }
  ];

  const isActive = (path, exact = false) => {
    if (exact) {
      return location.pathname === path;
    }
    return location.pathname.startsWith(path);
  };

  const handleLogout = () => {
    logout();
    toast.success('Logout berhasil');
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <nav className="dashboard-nav">
          <div className="dashboard-logo">
            📚 Sistem Ujian Online
          </div>
          <div className="nav-menu">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`nav-link ${isActive(item.path, item.exact) ? 'active' : ''}`}
              >
                {item.label}
              </Link>
            ))}
          </div>
          <div className="user-menu">
            <span className="user-info">
              Admin: {user.full_name}
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
          <Route path="/" element={<AdminHome stats={stats} />} />
          <Route path="/questions/*" element={<QuestionManager />} />
          <Route path="/exams/*" element={<ExamManager />} />
          <Route path="/results/*" element={<ResultsManager />} />
        </Routes>
      </main>
    </div>
  );
};

const AdminHome = ({ stats }) => {
  return (
    <div className="fade-in">
      <h1 style={{ fontSize: '2rem', fontWeight: '700', marginBottom: '32px', color: '#1a202c' }}>
        Dashboard Admin
      </h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '24px',
        marginBottom: '40px'
      }}>
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
            {stats.totalQuestions}
          </h3>
          <p style={{ opacity: 0.9 }}>Total Soal</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
            {stats.totalExams}
          </h3>
          <p style={{ opacity: 0.9 }}>Total Ujian</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
            {stats.activeExams}
          </h3>
          <p style={{ opacity: 0.9 }}>Ujian Aktif</p>
        </div>
        
        <div className="card" style={{ textAlign: 'center', background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', color: 'white' }}>
          <h3 style={{ fontSize: '2.5rem', fontWeight: '700', marginBottom: '8px' }}>
            {stats.totalStudents}
          </h3>
          <p style={{ opacity: 0.9 }}>Total Siswa</p>
        </div>
      </div>

      <div className="card">
        <h2 className="card-title">Selamat Datang!</h2>
        <p style={{ color: '#64748b', marginBottom: '24px' }}>
          Kelola sistem ujian online Anda dengan mudah. Anda dapat membuat soal, mengatur ujian, 
          dan memantau hasil siswa dari dashboard ini.
        </p>
        
        <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
          <Link to="/admin/questions" className="btn btn-primary">
            Kelola Soal
          </Link>
          <Link to="/admin/exams" className="btn btn-primary">
            Buat Ujian Baru
          </Link>
          <Link to="/admin/results" className="btn btn-secondary">
            Lihat Hasil
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;