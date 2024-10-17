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

export function simplifyExpression(expression) {
  // Precedencia de operadores (valores corregidos)
  const precedence = {
    "!": 7,
    "&": 6,
    "^": 5,
    "|": 4,
    "**": 3,
    "*": 2, "/": 2, "%": 2,
    "+": 1, "-": 1,
    "<<": 0, ">>": 0,
  };

  // Funciones matemáticas que requieren paréntesis
  const mathFunctions = ['sin', 'cos', 'tan', 'floor', 'ceil', 'abs', 'log', 'sqrt'];

  // Función para eliminar paréntesis innecesarios
    function removeUnnecessaryParentheses(expr) {
    let tokens = expr.split(/([()+\-*/|&^><!% ]|<<|>>|\*\*)/).filter(Boolean).map(t => t.trim());
    let stack = [];
    let result = "";
    let currentOp = null;

    for (let i = 0; i < tokens.length; i++) {
      let token = tokens[i];

      if (token === "(") {
        stack.push({ result, currentOp });
        result = "";
        currentOp = null;
      } else if (token === ")") {
        let { result: prevResult, currentOp: prevOp } = stack.pop();
        let innerExpr = result;
        result = prevResult;

        // Evaluar si el paréntesis es parte de una función matemática
        if (prevOp && mathFunctions.includes(prevOp)) {
          result += "(" + innerExpr + ")";  // Mantener paréntesis en funciones matemáticas
        } else if (innerExpr.split(/([+\-*/|&^><!%])/).length === 1) {
          result += innerExpr;  // No se necesita paréntesis si solo hay un término
        } else if (currentOp && precedence[currentOp] < precedence[prevOp]) {
          result += "(" + innerExpr + ")";  // Mantener si es necesario por precedencia
        } else {
          result += innerExpr;  // Eliminar paréntesis innecesario
        }

        currentOp = prevOp;
      } else if (mathFunctions.includes(token)) {
        result += token;
        currentOp = token;  // Marcar que es una función matemática
      } else if (precedence[token] !== undefined) {
        currentOp = token;
        result += token;
      } else {
        result += token;
      }
    }

    return result;
  }

  return removeUnnecessaryParentheses(expression);
}