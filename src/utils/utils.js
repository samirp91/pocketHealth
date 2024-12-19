export const tagRegex = Object.freeze({
  GROUP: /^[0-9A-Fa-f]{4}$/,
  ELEMENT: /^,[0-9A-Fa-f]{4}$/,
  GROUP_AND_ELEMENT: /^\(?[0-9A-Fa-f]{4},[0-9A-Fa-f]{4}\)?$/,
  DICOM_PARSER: /^x[0-9A-Fa-f]{8}$/,
});

export const isASCII = (str) => {
  return /^[\x00-\x7F]*$/.test(str);
};
