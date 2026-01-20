import http from '../utils/http';

export const detail = async () => {
  return await http.get('/user/detail')
}

export const approvalDetail = async (id) => {
  return await http.get('/leave/application-details/' + id)
}

export const getLeaveList = async () => {
  let res = await http.get('/leave/applications')
  res.forEach(item => {
    item.startDate = item.startDate.split('T')[0];
    item.endDate = item.endDate.split('T')[0];
  })
  return res
}

export const pendingApprovals = async () => {
  let res = await http.get('/leave/pending-approvals')
  res.forEach(item => {
    item.startDate = item.startDate.split('T')[0];
    item.endDate = item.endDate.split('T')[0];
  })
  return res
}

export const getDepartmentList = async () => {
  return await http.get('/user/department-list')
}

export const applicationDetails = async (id) => {
  let res = await http.get(`/leave/application-details/${id}`)
  res.startDate = res.startDate.split('T')[0];
  res.endDate = res.endDate.split('T')[0];
  return res;
}

export const register = async (params) => {
  return await http.post('/user/register', params)
}

export const apply = async (params) => {
  return await http.post('/leave/apply', params)
}

export const approve = async (params) => {
  return await http.post('/leave/approve', params)
}
