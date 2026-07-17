import axios from '@/api/axios';

export async function getAllEditors() {
  const response = await axios.get('/users/editors');
  return response.data;
}
