export function base64ToFile(base64String, filenamePrefix = "selfie") {
  const matches = base64String.match(/^data:(image\/\w+);base64,/);
  if (!matches) {
    throw new Error("Invalid base64 string");
  }

  const mimeType = matches[1]; 
  const extension = mimeType.split("/")[1];

  const byteString = atob(base64String.split(",")[1]);
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], { type: mimeType });
  const filename = `${filenamePrefix}.${extension}`;

  return new File([blob], filename, { type: mimeType });
}
