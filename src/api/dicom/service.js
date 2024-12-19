import {
  getDataSet,
  getStudyInstanceUID,
  getSopInstanceUID,
  getElementsByTag,
  getImage,
} from './functions.js';
import { uploadFile, getFile } from '../../../storage/storage.js';

const uploadDicom = async (req) => {
  try {
    const { file } = req;
    const dataSet = getDataSet(file);
    const studyInstanceUID = getStudyInstanceUID(dataSet);
    if (!studyInstanceUID) {
      throw new Error('Study Instance UID is missing');
    }
    const sopInstanceUID = getSopInstanceUID(dataSet);
    if (!sopInstanceUID) {
      throw new Error('SOP Instance UID is missing');
    }
    const foldername = studyInstanceUID;
    const filename = sopInstanceUID;
    await uploadFile(file, foldername, filename);
    const response = {
      studyInstanceUID,
      sopInstanceUID,
    };
    return [200, response];
  } catch (error) {
    return [500, { error: error.message }];
  }
};

const getDicomByTag = async (req) => {
  try {
    const { studyInstanceUID, sopInstanceUID } = req.params;
    const { tag: tagString } = req.query;

    const fileName = `${studyInstanceUID}/${sopInstanceUID}`;
    const file = {
      buffer: await getFile(fileName), // Gets file buffer from MinIO storage
    };

    const dataSet = await getDataSet(file);
    const elements = getElementsByTag(dataSet, tagString);

    if (!elements.length) {
      return [404, { error: 'Tag(s) not found' }];
    }
    return [200, elements];

    // return [200, elements];
  } catch (error) {
    return [500, { error: error.message }];
  }
};

const getDicomPng = async (req, res) => {
  try {
    const { studyInstanceUID, sopInstanceUID } = req.params;
    const fileName = `${studyInstanceUID}/${sopInstanceUID}`;
    const file = {
      buffer: await getFile(fileName), // Gets file buffer from MinIO storage
    };

    const pngBuffer = await getImage(file);
    if (!pngBuffer) {
      return [400, null];
    }
    return [200, pngBuffer];
  } catch (error) {
    return [500, { error: error.message }];
  }
};

export default { uploadDicom, getDicomByTag, getDicomPng };
