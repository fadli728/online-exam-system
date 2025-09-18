import React, { useState, useContext } from 'react';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const LoginPage = () => {
  const { login, API } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    role: 'student'
  });
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let endpoint = isLogin ? '/auth/login' : '/auth/register';
      let payload = isLogin ? 
        { username: formData.username, password: formData.password } :
        { 
          username: formData.username, 
          password: formData.password, 
          email: formData.email || `${formData.username}@test.com`,
          role: formData.role,
          full_name: formData.full_name || formData.username
        };

      const response = await fetch(`${API}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (response.ok) {
        if (isLogin) {
          login(data.user, data.access_token);
          toast.success('Login berhasil!');
        } else {
          toast.success('Registrasi berhasil! Silakan login.');
          setIsLogin(true);
        }
      } else {
        toast.error(data.detail || 'Terjadi kesalahan');
      }
    } catch (error) {
      toast.error('Gagal terhubung ke server');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="login-container">
      <div className="login-card fade-in">
        <div className="login-title">
          {isLogin ? 'Masuk' : 'Daftar'}
        </div>
        <div className="login-subtitle">
          {isLogin ? 'Masuk ke sistem ujian online' : 'Buat akun baru'}
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Nama Pengguna</label>
            <input
              type="text"
              name="username"
              className="form-input"
              value={formData.username}
              onChange={handleChange}
              required
              placeholder="Masukkan nama pengguna"
            />
          </div>

          {!isLogin && (
            <>
              <div className="form-group">
                <label className="form-label">Nama Lengkap</label>
                <input
                  type="text"
                  name="full_name"
                  className="form-input"
                  value={formData.full_name || ''}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan nama lengkap"
                />
              </div>

              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  className="form-input"
                  value={formData.email || ''}
                  onChange={handleChange}
                  required
                  placeholder="Masukkan email"
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              name="password"
              className="form-input"
              value={formData.password}
              onChange={handleChange}
              required
              placeholder="Masukkan password"
            />
          </div>

          {!isLogin && (
            <div className="form-group">
              <label className="form-label">Role</label>
              <div className="role-selector">
                <div
                  className={`role-option ${formData.role === 'student' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'student' })}
                >
                  Siswa
                </div>
                <div
                  className={`role-option ${formData.role === 'admin' ? 'active' : ''}`}
                  onClick={() => setFormData({ ...formData, role: 'admin' })}
                >
                  Admin
                </div>
              </div>
            </div>
          )}

          <button
            type="submit"
            className="login-button"
            disabled={loading}
          >
            {loading ? 'Memproses...' : (isLogin ? 'Masuk' : 'Daftar')}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <button
            type="button"
            onClick={() => setIsLogin(!isLogin)}
            style={{
              background: 'none',
              border: 'none',
              color: '#667eea',
              cursor: 'pointer',
              textDecoration: 'underline'
            }}
          >
            {isLogin ? 'Belum punya akun? Daftar' : 'Sudah punya akun? Masuk'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;