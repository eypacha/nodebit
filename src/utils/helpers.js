export function bezierPath(x1, y1, x2, y2, threshold = 5) {
  if (Math.abs(x1 - x2) < threshold || Math.abs(y1 - y2) < threshold) {
    return `M ${x1} ${y1} L ${x2} ${y2}`;
  }
  return `M ${x1} ${y1} C ${x1} ${y1 * 1.2}, ${x2} ${y2 * 0.8}, ${x2} ${y2}`;
}

export function generateUniqueId() {
  return "id-" + Date.now() + "-" + Math.floor(Math.random() * 1000);
}

export function getMousePosition(event, canvasRect = {left: 0, top:0 }) {
    const { clientX, clientY } = event;
    const { left, top } = canvasRect;
    return { x: clientX - left, y: clientY - top };
  }

export function getNodeType(content) {
  
    if (content === "") {
        return "empty";
    }
    
    if (["out", "switch"].includes(content)) {
        return content;
    }
    
    if (!isNaN(parseFloat(content)) && isFinite(content)) {
        return "number";
    }
    
    if (["+","*","|","^","&"].includes(content)) {
        return "conmut";
    }
    
    return "exp";
}