export const strToNum = (str: string): number => {
  const isFloat = str.indexOf('.') !== -1;
  return isFloat ? parseFloat(str) : parseInt(str, 10);
}
