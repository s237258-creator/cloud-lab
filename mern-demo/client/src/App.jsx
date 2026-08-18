import React, { useState, useEffect } from 'react';
import './App.css'; 

function App() {
  const [students, setStudents] = useState([]);
  const [error, setError] = useState("");

  const [studentId, setStudentId] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  
  // --- HÀM LẤY DANH SÁCH (GET) ---
  const fetchStudents = async () => {
    try {
      setError("");
      const response = await fetch("/api/students"); 
      
      if (!response.ok) {
        throw new Error("Không thể lấy danh sách sinh viên");
      }
      
      const data = await response.json();
      setStudents(data);
    } catch (err) {
      setError("Lỗi khi tải danh sách sinh viên: " + err.message);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, []);

  // --- HÀM THÊM SINH VIÊN (POST) ---
  const handleSubmit = async (e) => {
    e.preventDefault(); 
    
    const newStudent = { studentId, name, email };

    try {
      // ĐÃ SỬA LẠI THÀNH ĐƯỜNG DẪN TƯƠNG ĐỐI "/api/students"
      const response = await fetch("/api/students", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newStudent),
      });

      if (response.ok) {
        alert("Thêm sinh viên thành công!");
        setStudentId("");
        setName("");
        setEmail("");
        
        // CÂU LỆNH LOAD LẠI DỮ LIỆU SAU KHI THÊM
        fetchStudents(); 
      } else {
        alert("Thêm sinh viên thất bại!");
      }
    } catch (err) {
      console.error("Lỗi khi gửi dữ liệu: ", err);
    }
  };

  // --- HÀM XÓA SINH VIÊN (DELETE) ---
  const handleDelete = async (id) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa sinh viên này?")) {
      try {
        const response = await fetch(`/api/students/${id}`, {
          method: "DELETE"
        });

        if (response.ok) {
          alert("Xóa thành công!");
          
          // CÂU LỆNH LOAD LẠI DỮ LIỆU SAU KHI XÓA
          fetchStudents(); 
        } else {
          alert("Xóa thất bại!");
        }
      } catch (err) {
        console.error("Lỗi khi xóa: ", err);
      }
    }
  };

  return (
    <div className="App">
      <h2>Danh sách sinh viên</h2>
      
      {error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : (
        <table border="1" cellPadding="10" style={{ width: "100%", textAlign: "left" }}>
          <thead>
            <tr>
              <th>Mã sinh viên</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Hành động</th> {/* Thêm cột Hành động */}
            </tr>
          </thead>
          <tbody>
            {students.length > 0 ? (
              students.map((student) => (
                <tr key={student._id}>
                  <td>{student.studentId}</td>
                  <td>{student.name}</td>
                  <td>{student.email}</td>
                  <td>
                    {/* Nút Xóa gọi hàm handleDelete và truyền _id của sinh viên */}
                    <button onClick={() => handleDelete(student._id)} style={{ color: "white", backgroundColor: "red" }}>
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" style={{ textAlign: "center" }}>Chưa có dữ liệu sinh viên</td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      <hr />

      <h2>Thêm Sinh viên mới</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "10px" }}>
          <label>MSSV: </label>
          <input type="text" value={studentId} onChange={(e) => setStudentId(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Họ tên: </label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div style={{ marginBottom: "10px" }}>
          <label>Email: </label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <button type="submit" style={{ backgroundColor: "green", color: "white" }}>Thêm sinh viên</button>
      </form>
    </div>
  );
}

export default App;