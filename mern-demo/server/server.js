const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error('LỖI: Biến MONGO_URI chưa được khai báo!');
} else {
  mongoose.connect(MONGO_URI)
    .then(() => console.log('MongoDB connected successfully!'))
    .catch((err) => console.error('Lỗi kết nối MongoDB Atlas:', err));
}

const studentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  studentId: { type: String },
  studentCode: { type: String },
  code: { type: String },
  email: { type: String }
}, { timestamps: true, strict: false });

const Student = mongoose.model('Student', studentSchema);

app.get('/', (req, res) => res.status(200).send('Backend đang hoạt động!'));
app.get('/health', (req, res) => res.status(200).json({ status: 'OK' }));

// 1. GET: Lấy danh sách
app.get('/api/students', async (req, res) => {
  try {
    const students = await Student.find().sort({ createdAt: -1 });
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ message: 'Lỗi server khi lấy danh sách', error: error.message });
  }
});

// 2. POST: Thêm mới
app.post('/api/students', async (req, res) => {
  try {
    const { name, studentId, studentCode, code, email } = req.body;
    const finalCode = studentId || studentCode || code;

    if (!name || !finalCode) {
      return res.status(400).json({ message: 'Vui lòng điền đầy đủ Tên và Mã sinh viên' });
    }

    const newStudent = new Student({
      name,
      studentId: finalCode,
      studentCode: finalCode,
      code: finalCode,
      email: email || ''
    });

    await newStudent.save();
    return res.status(201).json(newStudent);
  } catch (error) {
    return res.status(400).json({ message: 'Không thể thêm sinh viên', error: error.message });
  }
});

// 3. PUT: Cập nhật sinh viên theo ID
app.put('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { name, studentId, email } = req.body;

    const updatedStudent = await Student.findByIdAndUpdate(
      id,
      {
        name,
        studentId,
        studentCode: studentId,
        code: studentId,
        email
      },
      { new: true }
    );

    if (!updatedStudent) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên' });
    }

    return res.status(200).json(updatedStudent);
  } catch (error) {
    return res.status(400).json({ message: 'Cập nhật thất bại', error: error.message });
  }
});

// 4. DELETE: Xóa sinh viên theo ID
app.delete('/api/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const deletedStudent = await Student.findByIdAndDelete(id);

    if (!deletedStudent) {
      return res.status(404).json({ message: 'Không tìm thấy sinh viên để xóa' });
    }

    return res.status(200).json({ message: 'Xóa sinh viên thành công' });
  } catch (error) {
    return res.status(400).json({ message: 'Xóa thất bại', error: error.message });
  }
});

const PORT = Number(process.env.PORT) || 10000;
app.listen(PORT, '0.0.0.0', () => console.log(`Server running on port ${PORT}`));