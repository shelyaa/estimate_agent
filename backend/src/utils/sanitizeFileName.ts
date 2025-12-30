export const SanitizeFileName = (fileName: string) => {
  if (!fileName) throw new Error('File name is empty!');

  const cleanedName = fileName
    .toLowerCase()
    .replace(/\s+/g, '_')
    .replace(/[\s\u200B-\u200D\uFEFF\/\?%*:|"<>\\/]+/g, '');

  if (!cleanedName) throw new Error('Invalid file name!');
  return cleanedName;
}
