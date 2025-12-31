import { http } from '../request/request';

export const getLeaveList = () => {
  return http.get('/leave');
}
