export const validateName = (name) => {
  if (!name || name.trim().length < 2) {
    return "Name must be at least 2 characters long.";
  }
  const nameRegex = /^[A-Za-z\s]+$/;
  if (!nameRegex.test(name)) {
    return "Name should only contain letters and spaces.";
  }
  return null; // Valid
};

export const validateEmail = (email) => {
  if (!email || email.trim() === '') {
    return "Email address is required.";
  }
  if (!email.includes('@')) {
    return "Email must contain '@'.";
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return "Please enter a valid email address.";
  }
  return null; // Valid
};

export const validatePhone = (phone) => {
  if (!phone || phone.trim() === '') {
    return "Phone number is required.";
  }
  const phoneRegex = /^\+?[\d\s-]{10,15}$/;
  if (!phoneRegex.test(phone)) {
    return "Please enter a valid phone number (10-15 digits).";
  }
  return null; // Valid
};
