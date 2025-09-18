import React, { useState, useContext, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { AuthContext } from '../App';
import { toast } from 'sonner';

const ExamPage = () => {
  const { examId } = useParams();
  const navigate = useNavigate();
  const { user, API } = useContext(AuthContext);
  const [exam, setExam] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [loading, setLoading] = useState(true);
  const [attempt, setAttempt] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    initializeExam();
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [examId]);

  useEffect(() => {
    // Anti-cheat: Detect tab switching
    const handleVisibilityChange = () => {
      if (document.hidden && attempt && !attempt.is_submitted) {
        toast.warning('⚠️ Peringatan: Jangan berpindah tab selama ujian!');
        // Log suspicious activity
        console.log('Tab switching detected during exam');
      }
    };

    // Anti-cheat: Prevent right-click
    const handleContextMenu = (e) => {
      e.preventDefault();
      toast.warning('Klik kanan dinonaktifkan selama ujian');
    };

    // Anti-cheat: Prevent common keyboard shortcuts
    const handleKeyDown = (e) => {
      // Prevent F12, Ctrl+Shift+I, Ctrl+U, etc.
      if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && e.key === 'I') ||
        (e.ctrlKey && e.key === 'u') ||
        (e.ctrlKey && e.shiftKey && e.key === 'J')
      ) {
        e.preventDefault();
        toast.warning('Shortcut keyboard dinonaktifkan selama ujian');
      }
    };

    // Add event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange);
    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('keydown', handleKeyDown);

    // Request fullscreen
    if (document.documentElement.requestFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {
        toast.warning('Disarankan menggunakan mode layar penuh');
      });
    }

    return () => {
      // Cleanup
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('keydown', handleKeyDown);
      
      // Exit fullscreen
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, [attempt]);

  const initializeExam = async () => {
    try {
      // Get exam details
      const examResponse = await fetch(`${API}/exams/${examId}`, {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const examData = await examResponse.json();
      
      if (!examResponse.ok) {
        throw new Error(examData.detail || 'Gagal memuat ujian');
      }

      setExam(examData);

      // Get questions
      const questionsPromises = examData.questions.map(questionId =>
        fetch(`${API}/questions/${questionId}`, {
          headers: {
            'Authorization': `Bearer ${user.token}`
          }
        }).then(res => res.json())
      );
      
      const questionsData = await Promise.all(questionsPromises);
      let examQuestions = questionsData;

      // Shuffle questions if enabled
      if (examData.shuffle_questions) {
        examQuestions = shuffleArray([...examQuestions]);
      }

      // Shuffle options if enabled
      if (examData.shuffle_options) {
        examQuestions = examQuestions.map(q => ({
          ...q,
          options: q.options ? shuffleArray([...q.options]) : []
        }));
      }

      setQuestions(examQuestions);

      // Start exam attempt
      const attemptResponse = await fetch(`${API}/exams/${examId}/start`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      const attemptData = await attemptResponse.json();
      
      if (!attemptResponse.ok) {
        throw new Error(attemptData.detail || 'Gagal memulai ujian');
      }

      setAttempt(attemptData);
      startTimeRef.current = new Date(attemptData.start_time);

      // Initialize timer
      const duration = examData.duration_minutes * 60; // Convert to seconds
      setTimeLeft(duration);
      
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

    } catch (error) {
      toast.error(error.message);
      navigate('/student');
    } finally {
      setLoading(false);
    }
  };

  const shuffleArray = (array) => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const handleAnswerChange = async (questionId, answer) => {
    const newAnswers = { ...answers, [questionId]: answer };
    setAnswers(newAnswers);

    // Auto-save answer
    try {
      await fetch(`${API}/exams/${examId}/submit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify({
          question_id: questionId,
          answer: answer
        })
      });
    } catch (error) {
      console.error('Failed to save answer:', error);
    }
  };

  const handleAutoSubmit = async () => {
    if (isSubmitting) return;
    
    setIsSubmitting(true);
    try {
      await fetch(`${API}/exams/${examId}/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });
      
      toast.success('Ujian telah berakhir dan dikumpulkan otomatis');
      navigate('/student');
    } catch (error) {
      toast.error('Gagal mengumpulkan ujian');
    }
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;
    
    if (!window.confirm('Apakah Anda yakin ingin mengumpulkan ujian ini?')) {
      return;
    }

    setIsSubmitting(true);
    
    try {
      const response = await fetch(`${API}/exams/${examId}/finish`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const result = await response.json();
        toast.success(`Ujian berhasil dikumpulkan! Skor: ${result.score?.toFixed(1) || 0}/100`);
        navigate('/student');
      } else {
        throw new Error('Gagal mengumpulkan ujian');
      }
    } catch (error) {
      toast.error(error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  const getTimeColor = () => {
    if (timeLeft <= 300) return '#ef4444'; // Red for last 5 minutes
    if (timeLeft <= 600) return '#f59e0b'; // Orange for last 10 minutes
    return '#10b981'; // Green
  };

  if (loading) {
    return (
      <div className="exam-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-white mx-auto"></div>
          <p style={{ marginTop: '16px' }}>Memuat ujian...</p>
        </div>
      </div>
    );
  }

  if (!exam || questions.length === 0) {
    return (
      <div className="exam-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ textAlign: 'center', color: 'white' }}>
          <h2>Ujian tidak ditemukan</h2>
          <button onClick={() => navigate('/student')} className="btn btn-primary" style={{ marginTop: '16px' }}>
            Kembali
          </button>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentQuestionIndex];

  return (
    <div className="exam-container">
      {/* Header with timer */}
      <div className="exam-header">
        <div>
          <h2 style={{ color: '#1a202c', marginBottom: '4px' }}>{exam.title}</h2>
          <p style={{ color: '#64748b', margin: 0 }}>
            Siswa: {user.full_name}
          </p>
        </div>
        <div className="exam-timer" style={{ color: getTimeColor() }}>
          ⏰ {formatTime(timeLeft)}
        </div>
      </div>

      {/* Question */}
      <div className="question-card">
        <div className="question-number">
          Soal {currentQuestionIndex + 1} dari {questions.length}
        </div>
        
        <div className="question-text">
          {currentQuestion.question_text}
        </div>

        {/* Image if available */}
        {currentQuestion.image_url && (
          <div style={{ marginBottom: '24px' }}>
            <img 
              src={currentQuestion.image_url} 
              alt="Question image"
              style={{ 
                maxWidth: '100%', 
                height: 'auto',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            />
          </div>
        )}

        {/* Answer options */}
        {currentQuestion.question_type === 'multiple_choice' && (
          <div className="options-list">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`option ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                />
                {option.text}
              </div>
            ))}
          </div>
        )}

        {currentQuestion.question_type === 'true_false' && (
          <div className="options-list">
            {currentQuestion.options.map((option) => (
              <div
                key={option.id}
                className={`option ${answers[currentQuestion.id] === option.id ? 'selected' : ''}`}
                onClick={() => handleAnswerChange(currentQuestion.id, option.id)}
              >
                <input
                  type="radio"
                  name={`question-${currentQuestion.id}`}
                  value={option.id}
                  checked={answers[currentQuestion.id] === option.id}
                  onChange={() => handleAnswerChange(currentQuestion.id, option.id)}
                />
                {option.text}
              </div>
            ))}
          </div>
        )}

        {currentQuestion.question_type === 'essay' && (
          <div>
            <textarea
              className="textarea"
              value={answers[currentQuestion.id] || ''}
              onChange={(e) => handleAnswerChange(currentQuestion.id, e.target.value)}
              placeholder="Tulis jawaban Anda di sini..."
              style={{ minHeight: '150px' }}
            />
          </div>
        )}

        {/* Navigation */}
        <div className="exam-navigation">
          <div className="question-progress">
            Progress: {Object.keys(answers).length} dari {questions.length} soal dijawab
          </div>
          
          <div style={{ display: 'flex', gap: '12px' }}>
            {currentQuestionIndex > 0 && (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                className="btn btn-secondary"
              >
                ← Sebelumnya
              </button>
            )}
            
            {currentQuestionIndex < questions.length - 1 ? (
              <button
                onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                className="btn btn-primary"
              >
                Selanjutnya →
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                className="btn btn-primary"
                disabled={isSubmitting}
                style={{ backgroundColor: '#10b981' }}
              >
                {isSubmitting ? 'Mengumpulkan...' : 'Kumpulkan Ujian'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Question navigator */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(20px)',
        borderRadius: '16px',
        padding: '20px',
        display: 'flex',
        flexWrap: 'wrap',
        gap: '8px',
        justifyContent: 'center'
      }}>
        {questions.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentQuestionIndex(index)}
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '8px',
              border: '2px solid',
              background: answers[questions[index].id] ? '#10b981' : 'white',
              borderColor: currentQuestionIndex === index ? '#667eea' : (answers[questions[index].id] ? '#10b981' : '#e2e8f0'),
              color: answers[questions[index].id] ? 'white' : (currentQuestionIndex === index ? '#667eea' : '#64748b'),
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: '500',
              transition: 'all 0.2s ease'
            }}
          >
            {index + 1}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ExamPage;