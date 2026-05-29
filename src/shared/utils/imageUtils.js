export const getStudentImageUrl = (profilePhoto, name = 'Student') => {
  if (!profilePhoto) {
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=88B04B&color=fff`;
  }
  
  if (profilePhoto.startsWith('http')) {
    return profilePhoto;
  }
  
  // If it starts with /uploads or anything else (broken on Render)
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=88B04B&color=fff`;
};

export const handleImageError = (e, name = 'Student') => {
  e.target.onerror = null; // Prevent infinite loops
  e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=88B04B&color=fff`;
};
