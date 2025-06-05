// utils/validators.js

// check email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// check Vietnamese phone number format
const isValidVietnamesePhoneNumber = (phoneNumber) => {
  const vnPhoneRegex =
    /^(0|\+84)(3[2-9]|5[6|8|9]|7[0|6-9]|8[1-6|8|9]|9[0-9])[0-9]{7}$/;
  return vnPhoneRegex.test(phoneNumber);
};

module.exports = {
  isValidEmail,
  isValidVietnamesePhoneNumber,
};
