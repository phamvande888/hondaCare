// utils/validators.js
// check email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// check Vietnamese phone number format
const isValidVietnamesePhoneNumber = (phoneNumber) => {
  const vnPhoneRegex =
    /^(0|\+84)(3[2-9]|5[2689]|7[06-9]|8[1-689]|9[0-9]|87)[0-9]{7}$/;
  return vnPhoneRegex.test(phoneNumber);
};

// check for missing fields in request body
const checkMissingFields = (body, requiredFields) => {
  return requiredFields.filter(
    (field) => !body[field] || body[field].toString().trim() === ""
  );
};

module.exports = {
  isValidEmail,
  isValidVietnamesePhoneNumber,
  checkMissingFields,
};
