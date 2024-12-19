import fs from 'fs';
import DicomService from './service.js';
import { isValidDicomFile, isValidTag } from './validators.js';

const uploadDicom = async (req, res) => {
  const { file } = req;
  try {
    if (!file) {
      return res.status(400).json({ error: 'No DICOM file uploaded' });
    }

    const [isValid, err] = isValidDicomFile(file);

    if (!isValid) {
      fs.unlinkSync(file.path);
      return res.status(400).json({ error: err.exception || err.message });
    }

    const [status, data] = await DicomService.uploadDicom(req);
    res.status(status).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDicomByTag = async (req, res) => {
  try {
    const { tag } = req.query;

    if (!tag) {
      return res.status(400).json({ error: 'Tag parameter is required' });
    }

    const isValid = isValidTag(tag);
    if (!isValid) {
      return res.status(400).json({
        error:
          'Invalid tag format. Tag format should be "0000" or ",0000" or "0000,0000" or "(0000,0000)"',
      });
    }

    const [status, data] = await DicomService.getDicomByTag(req);

    res.status(status).json({ data });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getDicomPng = async (req, res) => {
  try {
    const [status, data] = await DicomService.getDicomPng(req);

    if (status !== 200) {
      return res.status(status).json({ error: 'Image not found' });
    }

    res.setHeader('Content-Type', 'image/png');
    res.status(status).send(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export default { uploadDicom, getDicomByTag, getDicomPng };
