import { fileURLToPath } from 'url';
import path from 'path';

const getFileNumber = (relativePath: string) => {
  const fileName = path.basename(fileURLToPath(relativePath));

  const fileNumber = fileName.split('-')[0];

  return fileNumber;
};

export {
  getFileNumber,
};
