export const APP_BASE_URL = process.env.REACT_APP_BASE_API_URL;
export const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

export const pageSize = 18;
