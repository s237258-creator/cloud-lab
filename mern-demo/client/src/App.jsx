import { useState, useEffect } from 'react';

function App() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // States form Thêm
  const [studentCode, setStudentCode] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');

  // States form Chỉnh sửa
  const [editingId, setEditingId] = useState(null);
  const [editStudentCode, setEditStudentCode] = useState('');
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');

  const fetchStudents = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/students');
      if (!response.ok) throw new Error('Không thể tải danh sách sinh viên');
      const data = await response.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // Xử lý Thêm
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!studentCode || !name) {
      alert('Vui lòng nhập MSSV và Họ tên!');
      return;
    }

    try {
      const response = await fetch('/api/students', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          studentId: studentCode,
          studentCode,
          code: studentCode,
          name, 
          email 
        })
      });

      const resData = await response.json();
      if (response.ok) {
        setStudentCode('');
        setName('');
        setEmail('');
        fetchStudents();
      } else {
        alert(resData.message || 'Lỗi khi thêm');
      }
    } catch (err) {
      alert('Lỗi kết nối: ' + err.message);
    }
  };

  // Kích hoạt chế độ Sửa
  const handleStartEdit = (student) => {
    setEditingId(student._id);
    setEditStudentCode(student.studentId || student.studentCode || student.code || '');
    setEditName(student.name || '');
    setEditEmail(student.email || '');
  };

  // Lưu Chỉnh sửa
  const handleSaveEdit = async (id) => {
    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          studentId: editStudentCode,
          name: editName,
          email: editEmail
        })
      });

      if (response.ok) {
        setEditingId(null);
        fetchStudents();
      } else {
        alert('Cập nhật thất bại');
      }
    } catch (err) {
      alert('Lỗi khi cập nhật sinh viên');
    }
  };

  // Xử lý Xóa
  const handleDelete = async (id) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa sinh viên này?')) return;

    try {
      const response = await fetch(`/api/students/${id}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        fetchStudents();
      } else {
        alert('Xóa thất bại');
      }
    } catch (err) {
      alert('Lỗi kết nối khi xóa');
    }
  };

  return (
    <div style={{ padding: '30px', fontFamily: 'Arial, sans-serif', maxWidth: '950px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', color: '#333' }}>QUẢN LÝ SINH VIÊN (FULL CRUD)</h2>

      {/* Form Thêm Mới */}
      <form onSubmit={handleSubmit} style={{ marginBottom: '25px', display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        <input
          type="text"
          placeholder="MSSV *"
          value={studentCode}
          onChange={(e) => setStudentCode(e.target.value)}
          style={{ padding: '10px', flex: '1', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="text"
          placeholder="Họ và tên *"
          value={name}
          onChange={(e) => setName(e.target.value)}
          style={{ padding: '10px', flex: '1.5', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ padding: '10px', flex: '1.5', borderRadius: '4px', border: '1px solid #ccc' }}
        />
        <button 
          type="submit" 
          style={{ padding: '10px 20px', cursor: 'pointer', background: '#28a745', color: 'white', border: 'none', borderRadius: '4px', fontWeight: 'bold' }}
        >
          Thêm
        </button>
      </form>

      {loading && <p style={{ textAlign: 'center' }}>Đang tải dữ liệu...</p>}
      {error && <p style={{ color: 'red', textAlign: 'center' }}>Lỗi: {error}</p>}

      {/* Bảng Danh Sách */}
      {!loading && !error && (
        <table border="1" cellPadding="10" cellSpacing="0" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead style={{ background: '#f8f9fa' }}>
            <tr>
              <th style={{ width: '50px', textAlign: 'center' }}>STT</th>
              <th style={{ width: '120px' }}>MSSV</th>
              <th>Họ và Tên</th>
              <th>Email</th>
              <th style={{ width: '140px', textAlign: 'center' }}>Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {Array.isArray(students) && students.length > 0 ? (
              students.map((student, index) => {
                const isEditing = editingId === student._id;
                const mssvVal = student.studentId || student.studentCode || student.code || 'Chưa cập nhật';

                return (
                  <tr key={student._id || index}>
                    <td style={{ textAlign: 'center' }}>{index + 1}</td>
                    
                    {isEditing ? (
                      <>
                        <td>
                          <input 
                            value={editStudentCode} 
                            onChange={(e) => setEditStudentCode(e.target.value)}
                            style={{ width: '90%', padding: '4px' }}
                          />
                        </td>
                        <td>
                          <input 
                            value={editName} 
                            onChange={(e) => setEditName(e.target.value)}
                            style={{ width: '90%', padding: '4px' }}
                          />
                        </td>
                        <td>
                          <input 
                            value={editEmail} 
                            onChange={(e) => setEditEmail(e.target.value)}
                            style={{ width: '90%', padding: '4px' }}
                          />
                        </td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleSaveEdit(student._id)}
                            style={{ marginRight: '5px', background: '#007bff', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Lưu
                          </button>
                          <button 
                            onClick={() => setEditingId(null)}
                            style={{ background: '#6c757d', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Hủy
                          </button>
                        </td>
                      </>
                    ) : (
                      <>
                        <td>{mssvVal}</td>
                        <td>{student.name || 'N/A'}</td>
                        <td>{student.email || 'Chưa cập nhật'}</td>
                        <td style={{ textAlign: 'center' }}>
                          <button 
                            onClick={() => handleStartEdit(student)}
                            style={{ marginRight: '5px', background: '#ffc107', color: '#000', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Sửa
                          </button>
                          <button 
                            onClick={() => handleDelete(student._id)}
                            style={{ background: '#dc3545', color: '#fff', border: 'none', padding: '5px 8px', borderRadius: '3px', cursor: 'pointer' }}
                          >
                            Xóa
                          </button>
                        </td>
                      </>
                    )}
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>Chưa có sinh viên nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;