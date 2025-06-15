const express = require('express');
const AuditLog = require('../models/AuditLog');

const router = express.Router();

router.get('/', async (req, res) => {
  const { filterUser, filterAction, page } = req.query;
  const limit = 10;

  try {
    const totalPages = await AuditLog.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      {
        $match: {
          'user.email': { $regex: filterUser, $options: 'i' },
          action: { $regex: filterAction, $options: 'i' },
        }
      },
      { $count: 'total' }
    ]);

    const logs = await AuditLog.aggregate([
      { $lookup: { from: 'users', localField: 'userId', foreignField: '_id', as: 'user' } },
      {
        $match: {
          'user.email': { $regex: filterUser, $options: 'i' },
          action: { $regex: filterAction, $options: 'i' },
        }
      },
      { $sort: { timestamp: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $set: { user: '$user.email' } }
    ]);

    return res.json({ logs, totalPages: Math.ceil((totalPages[0]?.total || 0) / limit) });
  } catch (err) {
    console.log(err);
    return res.status(404).json(err);
  }

})

module.exports = router;