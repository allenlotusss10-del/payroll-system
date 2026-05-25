const Payroll = require('../models/Payroll');
const Employee = require('../models/Employee');

// Auto-calculate salary components
const calculateSalary = (basicSalary) => {
  const hra = Math.round(basicSalary * 0.40);          // 40% of basic
  const da = Math.round(basicSalary * 0.10);           // 10% of basic
  const medicalAllowance = 1500;                        // Fixed
  const otherAllowances = Math.round(basicSalary * 0.05); // 5%

  const grossSalary = basicSalary + hra + da + medicalAllowance + otherAllowances;

  const pf = Math.round(basicSalary * 0.12);           // 12% PF
  const tax = grossSalary > 50000 ? Math.round(grossSalary * 0.10) : 0; // 10% if > 50k
  const otherDeductions = 0;

  const totalDeductions = pf + tax + otherDeductions;
  const netSalary = grossSalary - totalDeductions;

  return { hra, da, medicalAllowance, otherAllowances, grossSalary, pf, tax, otherDeductions, totalDeductions, netSalary };
};

// GET /api/payroll
const getPayrolls = async (req, res) => {
  try {
    const { month, year, status, employee } = req.query;
    let filter = {};
    if (month) filter.month = Number(month);
    if (year) filter.year = Number(year);
    if (status) filter.status = status;
    if (employee) filter.employee = employee;

    const payrolls = await Payroll.find(filter)
      .populate('employee', 'name employeeId department designation')
      .sort({ year: -1, month: -1 });

    res.json(payrolls);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/payroll/generate
const generatePayroll = async (req, res) => {
  try {
    const { employeeId, month, year, otherAllowances, otherDeductions, remarks } = req.body;

    if (!employeeId || !month || !year)
      return res.status(400).json({ message: 'Employee, month, and year are required' });

    const employee = await Employee.findById(employeeId);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    if (employee.status === 'Inactive')
      return res.status(400).json({ message: 'Cannot generate payroll for inactive employee' });

    // Check for duplicate
    const existing = await Payroll.findOne({ employee: employeeId, month: Number(month), year: Number(year) });
    if (existing)
      return res.status(400).json({ message: `Payroll already generated for ${employee.name} for this month` });

    const calculated = calculateSalary(employee.basicSalary);

    // Allow override for other allowances/deductions
    const extraAllowances = Number(otherAllowances || 0);
    const extraDeductions = Number(otherDeductions || 0);

    const grossSalary = calculated.grossSalary + extraAllowances;
    const totalDeductions = calculated.totalDeductions + extraDeductions;
    const netSalary = grossSalary - totalDeductions;

    const payroll = await Payroll.create({
      employee: employeeId,
      month: Number(month),
      year: Number(year),
      basicSalary: employee.basicSalary,
      hra: calculated.hra,
      da: calculated.da,
      medicalAllowance: calculated.medicalAllowance,
      otherAllowances: calculated.otherAllowances + extraAllowances,
      pf: calculated.pf,
      tax: calculated.tax,
      otherDeductions: extraDeductions,
      grossSalary,
      totalDeductions,
      netSalary,
      remarks,
    });

    await payroll.populate('employee', 'name employeeId department designation');
    res.status(201).json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// PATCH /api/payroll/:id/pay
const markAsPaid = async (req, res) => {
  try {
    const payroll = await Payroll.findByIdAndUpdate(
      req.params.id,
      { status: 'Paid', paidAt: new Date() },
      { new: true }
    ).populate('employee', 'name employeeId department designation');

    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    res.json(payroll);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/payroll/:id
const deletePayroll = async (req, res) => {
  try {
    const payroll = await Payroll.findById(req.params.id);
    if (!payroll) return res.status(404).json({ message: 'Payroll record not found' });
    if (payroll.status === 'Paid')
      return res.status(400).json({ message: 'Cannot delete a paid payroll record' });
    await payroll.deleteOne();
    res.json({ message: 'Payroll record deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getPayrolls, generatePayroll, markAsPaid, deletePayroll };
