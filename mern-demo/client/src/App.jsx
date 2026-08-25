import { useCallback, useEffect, useState } from 'react';
import './App.css';

// Khai báo đường dẫn Backend trực tiếp cổng 5000
const API_BASE_URL = 'http://localhost:5000';

const parseResponse = async (response) => {
  const body = await response.text();
  if (!body) return {};

  try {
    return JSON.parse(body);
  } catch {
    throw new Error(`API trả về dữ liệu không hợp lệ (${response.status}).`);
  }
};

function App() {
  const [formData, setFormData] = useState({ studentId: '', name: '', email: '' });
  const [students, setStudents] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData((current) => ({ ...current, [e.target.name]: e.target.value }));
  };

  const fetchStudents = useCallback(async () => {
    const response = await fetch(`${API_BASE_URL}/api/students`);
    const result = await parseResponse(response);
    if (!response.ok) throw new Error(result.error || result.message || 'Không thể tải danh sách sinh viên.');
    return Array.isArray(result) ? result : [];
  }, []);

  const loadStudents = async () => {
    setLoading(true);
    try {
      setStudents(await fetchStudents());
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let cancelled = false;
    fetchStudents()
      .then((data) => {
        if (!cancelled) {
          setStudents(data);
          setError('');
        }
      })
      .catch((requestError) => {
        if (!cancelled) setError(requestError.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [fetchStudents]);

  const resetForm = () => {
    setFormData({ studentId: '', name: '', email: '' });
    setEditingId(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');

    try {
      const endpoint = editingId 
        ? `${API_BASE_URL}/api/students/${editingId}` 
        : `${API_BASE_URL}/api/students`;
      const response = await fetch(endpoint, {
        method: editingId ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const result = await parseResponse(response);
      if (!response.ok) throw new Error(result.error || result.message || 'Có lỗi xảy ra.');
      resetForm();
      await loadStudents();
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (student) => {
    setEditingId(student._id);
    setFormData({ studentId: student.studentId, name: student.name, email: student.email });
    setError('');
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc muốn xóa sinh viên này?')) return;
    try {
      const response = await fetch(`${API_BASE_URL}/api/students/${id}`, { method: 'DELETE' });
      const result = await parseResponse(response);
      if (!response.ok) throw new Error(result.message || 'Không thể xóa sinh viên.');
      setStudents((current) => current.filter((student) => student._id !== id));
      if (editingId === id) resetForm();
      setError('');
    } catch (requestError) {
      setError(requestError.message);
    }
  };

  return (
    <main className="container">
      <header className="page-header">
        <h1>Quản lý sinh viên</h1>
      </header>

      <section className="panel">
        <div className="section-heading">
          <h2>{editingId ? 'Chỉnh sửa sinh viên' : 'Thêm sinh viên'}</h2>
          {editingId && <button className="button button-quiet" type="button" onClick={resetForm}>Hủy</button>}
        </div>
        <form className="student-form" onSubmit={handleSubmit}>
          <label>MSSV<input name="studentId" value={formData.studentId} onChange={handleChange} placeholder="VD: SV001" required /></label>
          <label>Họ tên<input name="name" value={formData.name} onChange={handleChange} placeholder="Nguyễn Văn A" required /></label>
          <label>Email<input name="email" type="email" value={formData.email} onChange={handleChange} placeholder="sinhvien@example.com" required /></label>
          <button className="button button-primary" type="submit" disabled={submitting}>{submitting ? 'Đang lưu...' : editingId ? 'Lưu thay đổi' : 'Thêm sinh viên'}</button>
        </form>
      </section>

      {error && <p className="message error" role="alert">{error}</p>}

      <section className="student-section">
        <div className="section-heading">
          <h2>Danh sách sinh viên</h2>
        </div>

        {loading ? (
          <p className="message">Đang tải dữ liệu...</p>
        ) : students.length === 0 ? (
          <p className="message">Chưa có sinh viên nào.</p>
        ) : (
          <div className="student-list">
            {students.map((student) => (
              <article className="student-item" key={student._id}>
                <div className="student-info">
                  <strong>{student.name}</strong>
                  <span>MSSV: {student.studentId}</span>
                  <span>Email: {student.email}</span>
                </div>
                <div className="actions">
                  <button className="button button-quiet" type="button" onClick={() => handleEdit(student)}>Sửa</button>
                  <button className="button button-danger" type="button" onClick={() => handleDelete(student._id)}>Xóa</button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

export default App;