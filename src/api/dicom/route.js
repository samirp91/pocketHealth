import express from 'express';
import multer from 'multer';
import DicomController from './controller.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/' });

// Upload DICOM file
router.post('/upload', upload.single('file'), DicomController.uploadDicom);

// Get DICOM attribute by tag
router.get('/:studyInstanceUID/:sopInstanceUID', DicomController.getDicomByTag);

// Get PNG version of DICOM
router.get(
  '/:studyInstanceUID/:sopInstanceUID/image',
  DicomController.getDicomPng,
);

export default router;
