const Employee = require('../models/Employee');

// GET /api/employees
const getEmployees = async (req, res) => {
  try {
    const { department, status, search } = req.query;
    let filter = {};

    if (department) filter.department = department;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { employeeId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 });
    res.json(employees);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// GET /api/employees/:id
const getEmployeeById = async (req, res) => {
  try {
    const employee = await Employee.findById(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// POST /api/employees
const createEmployee = async (req, res) => {
  try {
    const { name, email, phone, department, designation, basicSalary, joinDate, bankAccount, panNumber } = req.body;

    if (!name || !email || !phone || !department || !designation || !basicSalary || !joinDate)
      return res.status(400).json({ message: 'Please fill all required fields' });

    // Auto-generate employee ID
    const count = await Employee.countDocuments();
    const employeeId = `EMP${String(count + 1).padStart(4, '0')}`;

    const employee = await Employee.create({
      employeeId,
      name, email, phone, department, designation,
      basicSalary: Number(basicSalary),
      joinDate,
      bankAccount,
      panNumber,
    });

    res.status(201).json(employee);
  } catch (error) {
    if (error.code === 11000)
      return res.status(400).json({ message: 'Employee with this email already exists' });
    res.status(500).json({ message: error.message });
  }
};

// PUT /api/employees/:id
const updateEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json(employee);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// DELETE /api/employees/:id
const deleteEmployee = async (req, res) => {
  try {
    const employee = await Employee.findByIdAndDelete(req.params.id);
    if (!employee) return res.status(404).json({ message: 'Employee not found' });
    res.json({ message: 'Employee removed successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getEmployees, getEmployeeById, createEmployee, updateEmployee, deleteEmployee };
