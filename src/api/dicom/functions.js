import dicomParser from 'dicom-parser';
import fs from 'fs';
import dcmjs from 'dcmjs-imaging';
import sharp from 'sharp';

import { tagRegex, isASCII } from '../../utils/utils.js';
import { TAG_DICT } from '../../utils/dictionary.js';
import { uids } from '../../utils/uids.js';

const { DicomImage, NativePixelDecoder } = dcmjs;

export const getDataSet = (file, options = {}) => {
  try {
    if (!file.buffer) {
      file.buffer = fs.readFileSync(file.path);
    }
    const { buffer } = file;
    const byteArray = new Uint8Array(buffer);

    // Parse the byte array to get a DataSet object that has the parsed contents
    const dataSet = dicomParser.parseDicom(byteArray, options);
    return dataSet;
  } catch (error) {
    // throw new Error(error);
    console.error(`Error processing DICOM file: ${error.message}`);
    return null;
  }
};

export const getImage = async (file) => {
  const dataSet = getDataSet(file);

  const pixelDataElement = dataSet.elements.x7fe00010;
  // access a string element
  if (!pixelDataElement) {
    throw new Error('No pixel data found in DICOM file');
  }

  const { buffer } = file;

  await NativePixelDecoder.initializeAsync();

  const image = new DicomImage(
    buffer.buffer.slice(
      buffer.byteOffset,
      buffer.byteOffset + buffer.byteLength,
      buffer.byteOffset + buffer.byteLength,
    ),
  );

  // Render image.
  const renderingResult = image.render();

  if (!renderingResult || !renderingResult.pixels) {
    throw new Error('Failed to render DICOM image');
  }

  const pngBuffer = await sharp(renderingResult.pixels, {
    raw: {
      width: renderingResult.width,
      height: renderingResult.height,
      channels: 4,
    },
  })
    .png()
    .toBuffer();
  return pngBuffer;
};

export const getStudyInstanceUID = (dataSet) => {
  return dataSet.string('x0020000d');
};

export const getSopInstanceUID = (dataSet) => {
  return dataSet.string('x00080018');
};

const groupMatchFn = (elementTag, tag) => {
  return elementTag.startsWith(tag);
};

const elementMatchFn = (elementTag, tag) => {
  return elementTag.endsWith(tag);
};

const groupAndElementMatchFn = (elementTag, tag) => {
  return elementTag === tag;
};

const matchFn = (tag) => {
  if (tagRegex.GROUP.test(tag)) {
    const modifiedTag = `x${tag}`;
    const matcher = (elementTag) =>
      groupMatchFn(elementTag, modifiedTag.toLowerCase());
    return matcher;
  }
  if (tagRegex.ELEMENT.test(tag)) {
    const modifiedTag = tag.replace(',', '');
    const matcher = (elementTag) =>
      elementMatchFn(elementTag, modifiedTag.toLowerCase());
    return matcher;
  }
  if (tagRegex.GROUP_AND_ELEMENT.test(tag)) {
    // replace whitespace from tag

    const modifiedTag = `x${tag
      .replace('(', '')
      .replace(')', '')
      .replace(',', '')}`;
    const matcher = (elementTag) =>
      groupAndElementMatchFn(elementTag, modifiedTag.toLowerCase());
    return matcher;
  }
  if (tagRegex.DICOM_PARSER.test(tag)) {
    const matcher = () => true;
    return matcher;
  }
};

const convertTag = (tag) => `(${tag.substring(1, 5)},${tag.substring(5)})`;

const getValue = (dataSet, element) => {
  if (element.items) {
    return {
      items: element.items.map((item) =>
        getElementsByTag(item.dataSet, item.tag),
      ),
    };
  }
  const value = dataSet.string(element.tag);
  let convertedValue = value;
  if (isASCII(value)) {
    const uid = uids[value];
    if (uid) {
      convertedValue = `${value} [ ${uid} ]`;
    }
  }
  return convertedValue;
};

const getData = (dataSet, element) => {
  const convertedTag = convertTag(element.tag);
  const name = TAG_DICT[convertedTag]?.name;
  if (!name) return null;

  const value = getValue(dataSet, element);
  const isString = typeof value === 'string';
  const key = typeof value === 'string' ? 'value' : 'items';
  const convertedValue = isString ? value : value.items;
  return {
    name,
    tag: convertedTag,
    [key]: convertedValue,
  };
};

export const getElementsByTag = (dataSet, tag) => {
  const matcher = matchFn(tag);
  if (!matcher) throw new Error('Invalid tag');

  return Object.keys(dataSet.elements)
    .filter(matcher)
    .map((key) => getData(dataSet, dataSet.elements[key]))
    .filter(Boolean);
};
