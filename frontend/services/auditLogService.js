// services/auditLogService.jsx
import axios from "axios";

export const getAuditLogs = async (filter, page) => {
  try {
    const res = await axios.get(`/api/audit?filterUser=${filter.userId}&filterAction=${filter.actionType}&page=${page}`);
    return res.data;
  } catch(err) {
    throw err;
  }
}

export const fetchSystemStats = async () => {
  try {
    const res = await axios.get('/api/admin/systemStats');
    return res;
  } catch(err) {
    throw err;
  }
}