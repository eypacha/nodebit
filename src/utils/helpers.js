export function bezierPath(x1, y1, x2, y2, threshold = 5) {
  if (Math.abs(x1 - x2) < threshold || Math.abs(y1 - y2) < threshold) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} C ${x1} ${y1 * 1.2}, ${x2} ${y2 * 0.8}, ${x2} ${y2}`;
}

export function generateUniqueId() {
  return parseInt(Date.now() + "" + Math.floor(Math.random() * 1000));
}

export function getMousePosition(event, canvasRect = {left: 0, top:0 }) {
    const { clientX, clientY } = event;
    const { left, top } = canvasRect;
    return { x: clientX - left, y: clientY - top };
  }

export function downloadFile(content, fileName, contentType) {
  const blob = new Blob([content], { type: contentType });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(link.href); // Limpiar el objeto URL después de usarlo
}

export function copyToClipboard(text) {
  if (navigator.clipboard) {
    navigator.clipboard.writeText(text)
      .then(() => {
        console.log('Texto copiado al portapapeles');
      })
      .catch(err => {
        console.error('Error al copiar el texto: ', err);
      });
  } else {

    const textArea = document.createElement("textarea");
    textArea.value = text;
    document.body.appendChild(textArea);
    textArea.select();
    try {
      document.execCommand('copy');
      console.log('Texto copiado al portapapeles');
    } catch (err) {
      console.error('Error al copiar el texto: ', err);
    }
    document.body.removeChild(textArea);
  }
}

export function trimParens(s) {
  if (s.startsWith('(') && s.endsWith(')')) {
      return s.slice(1, -1);
  }
  return s;
}