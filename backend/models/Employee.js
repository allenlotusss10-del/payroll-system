const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: { type: String, required: true, unique: true },
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  phone: { type: String, required: true },
  department: {
    type: String,
    required: true,
    enum: ['Engineering', 'HR', 'Finance', 'Marketing', 'Sales', 'Operations', 'Design'],
  },
  designation: { type: String, required: true },
  basicSalary: { type: Number, required: true, min: 0 },
  joinDate: { type: Date, required: true },
  status: { type: String, enum: ['Active', 'Inactive'], default: 'Active' },
  bankAccount: { type: String },
  panNumber: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('Employee', employeeSchema);
