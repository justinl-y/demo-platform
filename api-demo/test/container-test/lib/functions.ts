const getFileNumber = (fileName: string) => {
  const fileNumber = fileName.split('-')[0];

  return fileNumber;
};

export {
  getFileNumber,
};
