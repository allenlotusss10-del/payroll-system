const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
  employee: { type: mongoose.Schema.Types.ObjectId, ref: 'Employee', required: true },
  month: { type: Number, required: true, min: 1, max: 12 },  // 1=Jan, 12=Dec
  year: { type: Number, required: true },
  basicSalary: { type: Number, required: true },
  hra: { type: Number, default: 0 },          // House Rent Allowance
  da: { type: Number, default: 0 },           // Dearness Allowance
  medicalAllowance: { type: Number, default: 0 },
  otherAllowances: { type: Number, default: 0 },
  pf: { type: Number, default: 0 },           // Provident Fund (deduction)
  tax: { type: Number, default: 0 },          // Income Tax (deduction)
  otherDeductions: { type: Number, default: 0 },
  grossSalary: { type: Number, required: true },
  totalDeductions: { type: Number, required: true },
  netSalary: { type: Number, required: true },
  status: { type: String, enum: ['Pending', 'Paid'], default: 'Pending' },
  paidAt: { type: Date },
  remarks: { type: String },
}, { timestamps: true });

// Prevent duplicate payroll for same employee/month/year
payrollSchema.index({ employee: 1, month: 1, year: 1 }, { unique: true });

module.exports = mongoose.model('Payroll', payrollSchema);
