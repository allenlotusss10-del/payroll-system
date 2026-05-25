const express = require('express');
const router = express.Router();
const { getPayrolls, generatePayroll, markAsPaid, deletePayroll } = require('../controllers/payrollController');
const { protect } = require('../middleware/auth');

router.use(protect);

router.get('/', getPayrolls);
router.post('/generate', generatePayroll);
router.patch('/:id/pay', markAsPaid);
router.delete('/:id', deletePayroll);

module.exports = router;
