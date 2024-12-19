import { getDataSet } from './functions.js';
import { tagRegex } from '../../utils/utils.js';

export const isValidTag = (tag) => {
  // Tag should be in the format 0000 or ,0000 or (0000,0000) or 0000,0000
  return Object.keys(tagRegex).some((regex) => tagRegex[regex].test(tag));
};

export const isValidDicomFile = (file) => {
  try {
    getDataSet(file, {});
    return [true, null];
  } catch (e) {
    return [false, e];
  }
};
