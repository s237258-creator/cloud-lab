const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Student = require("./models/Student");

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Câu 36: GET danh sách sinh viên
app.get("/api/students", async (req, res) => {
  try {
    const students = await Student.find();

    res.json(students);
  } catch (error) {
    console.error("Lỗi GET students:", error);

    res.status(500).json({
      message: "Lỗi khi lấy danh sách sinh viên",
      error: error.message,
    });
  }
});
// Câu 37: POST - Thêm sinh viên
app.post("/api/students", async (req, res) => {
  try {
    const { studentId, name, email } = req.body;

    const student = await Student.create({
      studentId,
      name,
      email,
    });

    res.status(201).json(student);
  } catch (error) {
    console.error("Lỗi POST students:", error);

    res.status(400).json({
      message: "Lỗi khi thêm sinh viên",
      error: error.message,
    });
  }
});
// Câu 38: PUT - Cập nhật sinh viên
app.put("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
       returnDocument: "after",
        runValidators: true,
      }
    );

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên",
      });
    }

    res.json(student);
  } catch (error) {
    console.error("Lỗi PUT students:", error);

    res.status(400).json({
      message: "Lỗi khi cập nhật sinh viên",
      error: error.message,
    });
  }
});
// Câu 39: DELETE - Xóa sinh viên
app.delete("/api/students/:id", async (req, res) => {
  try {
    const student = await Student.findByIdAndDelete(req.params.id);

    if (!student) {
      return res.status(404).json({
        message: "Không tìm thấy sinh viên",
      });
    }

    res.json({
      message: "Xóa sinh viên thành công",
      student,
    });
  } catch (error) {
    console.error("Lỗi DELETE students:", error);

    res.status(400).json({
      message: "Lỗi khi xóa sinh viên",
      error: error.message,
    });
  }
});

// Kết nối MongoDB Atlas
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Kết nối MongoDB Atlas thành công!");

    app.listen(PORT, () => {
      console.log(`Server đang chạy tại http://localhost:${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Lỗi kết nối MongoDB Atlas:", error.message);
  });