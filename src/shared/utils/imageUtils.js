export const getStudentImageUrl = (profilePhoto) => {
  const defaultAvatar = '/default-student.png';

  if (!profilePhoto) {
    return defaultAvatar;
  }
  
  if (profilePhoto.startsWith('http')) {
    return profilePhoto;
  }
  
  return defaultAvatar;
};

export const handleImageError = (e) => {
  e.target.onerror = null; // Prevent infinite loops
  e.target.src = '/default-student.png';
};
