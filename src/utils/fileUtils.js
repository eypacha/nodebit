export function downloadFile(content, fileName, contentType) {
    const blob = new Blob([content], { type: contentType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = fileName;
    link.click();
    URL.revokeObjectURL(link.href);
  }  
  
  export function dataURItoBlob(dataURI) {
    let byteString = atob(dataURI.split(',')[1]);
    let mimeString = dataURI.split(',')[0].split(':')[1].split(';')[0];
    let ab = new ArrayBuffer(byteString.length);
    let ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    return new Blob([ab], {type: mimeString});
  }