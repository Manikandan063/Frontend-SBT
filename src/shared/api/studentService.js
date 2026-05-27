import api from './axios';

export const getMyChildren = async () => {
  // Assuming there's an endpoint that returns the parent's children
  // Or we fetch all students filtered by the logged-in parent's ID
  const response = await api.get('/students');
  return response.data.data;
};

export const getStudentDetails = async (id) => {
  const response = await api.get(`/students/${id}`);
  return response.data.data;
};

export const uploadStudentPhoto = async (id, photoFile) => {
  const formData = new FormData();
  formData.append('photo', photoFile);
  const response = await api.post(`/students/${id}/upload-photo`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data.data;
};
