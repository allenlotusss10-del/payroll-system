const Employee = require('../models/Employee');
const Payroll = require('../models/Payroll');

// GET /api/dashboard/stats
const getStats = async (req, res) => {
  try {
    const totalEmployees = await Employee.countDocuments();
    const activeEmployees = await Employee.countDocuments({ status: 'Active' });
    const inactiveEmployees = totalEmployees - activeEmployees;

    // Current month payroll summary
    const now = new Date();
    const currentMonth = now.getMonth() + 1;
    const currentYear = now.getFullYear();

    const payrollThisMonth = await Payroll.find({ month: currentMonth, year: currentYear });
    const totalPayrollAmount = payrollThisMonth.reduce((sum, p) => sum + p.netSalary, 0);
    const paidCount = payrollThisMonth.filter(p => p.status === 'Paid').length;
    const pendingCount = payrollThisMonth.filter(p => p.status === 'Pending').length;

    // Department breakdown
    const deptBreakdown = await Employee.aggregate([
      { $group: { _id: '$department', count: { $sum: 1 }, totalSalary: { $sum: '$basicSalary' } } },
      { $sort: { count: -1 } },
    ]);

    // Recent payrolls (last 5)
    const recentPayrolls = await Payroll.find()
      .populate('employee', 'name employeeId department')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      totalEmployees,
      activeEmployees,
      inactiveEmployees,
      currentMonth: { month: currentMonth, year: currentYear },
      payrollThisMonth: payrollThisMonth.length,
      totalPayrollAmount: Math.round(totalPayrollAmount),
      paidCount,
      pendingCount,
      deptBreakdown,
      recentPayrolls,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getStats };
