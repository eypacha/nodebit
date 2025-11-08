const NODE_TYPES = {
  empty: {
    name: 'Empty',
    description: 'A blank node, starting point for creating other nodes.',
    inputs: 0,
    outputs: 0,
    editable: true,
    pattern: (content) => content === '',
  },
  out: {
  name: 'Eval',
  description: 'Final eval node for generating audio signals.',
  inputs: 2,
  outputs: 1,
  editable: false,
  audioOutput: true,
  pattern: (content) => content === 'eval',
  },
  play: {
    name: 'Play',
    description: 'Plays and pauses the evaluated expression.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'play',
  },

  stop: {
    name: 'Stop',
    description: 'Stop an reset the t variable',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'stop',
  },

  reset: {
    name: 'Reset',
    description: 'Reset the t variable',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'reset',
  },

  help: {
    name: 'Help',
    description: 'Displays help information about a specific node.',
    inputs: 1,
    outputs: 0,
    minWidth: 350,
    minHeight: 200,
    editable: false,
    pattern: (content) => content === 'help',
  },

  theme: {
    name: 'Theme',
    description: 'Change between, style themes',
    inputs: 0,
    outputs: 0,
    minWidth: 230,
    minHeight: 190,
    editable: false,
    resizable: false,
    pattern: (content) => content === 'theme',
  },

  manual: {
    name: 'Manual',
    description: 'Displays the user manual.',
    inputs: 0,
    outputs: 0,
    editable: true,
    minWidth: 579,
    minHeight: 500,
    content: "// nodebit v0.001\n\nCtrl + Click          -> Create new empty node\nClick                 -> Select a node\nDouble click          -> Edit node \nShift + Enter         -> New line\nEnter                 -> Evaluate node\nDel / Backspace       -> Delete selected path or node\n1,2,3,4....           -> Change paths in selected switch node\n\nNODE_TYPES\nAutodetect type when the node is evaluated\n\nplay                  -> Play/pause playback button\nstop                  -> Stop playback button\nreset                 -> Reset time variable\neval                  -> Main eval to evaluate\n\nt                     -> Time variable (click get the value)\n14, .5, 0xFF, 0b1010  -> Number\n+ - * / %             -> Operators\n! & | ^ >> <<         -> Logic and bytewise operatros\n+[] &[] |[]...        -> Array operators\nsin, cos, tan, sqr    -> All JavaScript Math functions\n((t >> 10) & 42       -> Expression (default node)\n\nexport                -> Export byte to JSON\nexportimg             -> Export byte as image (you can import it too)\nimport                -> Import JSON or image file\n\nvisualizer / visual   -> Visualizer\nswitch                -> Selects between multiple inputs\nmouse                 -> Get mouse (X,Y) position\n\neval                  -> Evaluated expressions\nhelp                  -> Displays help about a specific node\nmanual                -> Displays this message\n\ntheme                 -> Theme settings",
    pattern: (content) => content === 'manual',
  },

  evaluated: {
    name: 'Evaluated expression',
    description: 'Displays the results of evaluated expressions.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content == 'evaluated',
  },

  mouse: {
    name: 'Mouse',
    description: 'Captures and outputs the X, Y position of the mouse.',
    inputs: 0,
    outputs: 2,
    editable: false,
    pattern: (content) => content == 'mouse',
  },

  function: {
    name: 'Single-Argument Function',
    description: 'Mathematical functions with one argument.',
    inputs: 1,
    outputs: 1,
    editable: false,
    pattern: (content) => ['asb', 'acos', 'acosh', 'asin', 'asinh', 'atan', 'atan2', 'atanh', 'cbrt', 'ceil', 'cos', 'exp', 'floor', 'log', 'log10', 'log1p', 'log2', 'random', 'round', 'sign', 'sin', 'sinh', 'sqrt', 'tan', 'tanh', 'trunc'].includes(content),
    descriptions: {
      asb: {
        name: 'Absolute Value',
        description: 'Returns the absolute value of a number.',
        example: 'abs(x)',
      },
      acos: {
        name: 'Arc Cosine',
        description: 'Returns the arccosine of a number (in radians).',
        example: 'acos(x)',
      },
      acosh: {
        name: 'Inverse Hyperbolic Cosine',
        description: 'Returns the inverse hyperbolic cosine of a number.',
        example: 'acosh(x)',
      },
      asin: {
        name: 'Arc Sine',
        description: 'Returns the arcsine of a number (in radians).',
        example: 'asin(x)',
      },
      asinh: {
        name: 'Inverse Hyperbolic Sine',
        description: 'Returns the inverse hyperbolic sine of a number.',
        example: 'asinh(x)',
      },
      atan: {
        name: 'Arc Tangent',
        description: 'Returns the arctangent of a number (in radians).',
        example: 'atan(x)',
      },
      atan2: {
        name: 'Arc Tangent 2',
        description: 'Returns the arctangent of the quotient of its arguments.',
        example: 'atan2(y, x)',
      },
      atanh: {
        name: 'Inverse Hyperbolic Tangent',
        description: 'Returns the inverse hyperbolic tangent of a number.',
        example: 'atanh(x)',
      },
      cbrt: {
        name: 'Cube Root',
        description: 'Returns the cube root of a number.',
        example: 'cbrt(x)',
      },
      ceil: {
        name: 'Ceiling',
        description: 'Returns the smallest integer greater than or equal to a number.',
        example: 'ceil(x)',
      },
      cos: {
        name: 'Cosine',
        description: 'Returns the cosine of an angle (in radians).',
        example: 'cos(x)',
      },
      exp: {
        name: 'Exponential',
        description: 'Returns Euler’s number (e) raised to the power of a number.',
        example: 'exp(x)',
      },
      floor: {
        name: 'Floor',
        description: 'Returns the largest integer less than or equal to a number.',
        example: 'floor(x)',
      },
      log: {
        name: 'Natural Logarithm',
        description: 'Returns the natural logarithm (base e) of a number.',
        example: 'log(x)',
      },
      log10: {
        name: 'Logarithm Base 10',
        description: 'Returns the logarithm (base 10) of a number.',
        example: 'log10(x)',
      },
      log1p: {
        name: 'Natural Logarithm of 1 + x',
        description: 'Returns the natural logarithm of 1 plus a number.',
        example: 'log1p(x)',
      },
      log2: {
        name: 'Logarithm Base 2',
        description: 'Returns the logarithm (base 2) of a number.',
        example: 'log2(x)',
      },
      random: {
        name: 'Random Number',
        description: 'Returns a pseudo-random number between 0 and 1.',
        example: 'random()',
      },
      round: {
        name: 'Round',
        description: 'Rounds a number to the nearest integer.',
        example: 'round(x)',
      },
      sign: {
        name: 'Sign',
        description: 'Returns the sign of a number (-1, 0, or 1).',
        example: 'sign(x)',
      },
      sin: {
        name: 'Sine',
        description: 'Returns the sine of an angle (in radians).',
        example: 'sin(x)',
      },
      sinh: {
        name: 'Hyperbolic Sine',
        description: 'Returns the hyperbolic sine of a number.',
        example: 'sinh(x)',
      },
      sqrt: {
        name: 'Square Root',
        description: 'Returns the square root of a number.',
        example: 'sqrt(x)',
      },
      tan: {
        name: 'Tangent',
        description: 'Returns the tangent of an angle (in radians).',
        example: 'tan(x)',
      },
      tanh: {
        name: 'Hyperbolic Tangent',
        description: 'Returns the hyperbolic tangent of a number.',
        example: 'tanh(x)',
      },
      trunc: {
        name: 'Truncate',
        description: 'Returns the integer part of a number by removing any fractional digits.',
        example: 'trunc(x)',
      },
    },

  },

  function2: {
    name: 'Two-Argument Function',
    description: 'Mathematical functions that require two arguments',
    inputs: 2,
    outputs: 1,
    editable: false,
    pattern: (content) => ['pow', 'max', 'min', 'hypot'].includes(content),
    descriptions: {
      pow: {
        name: 'Power',
        description: 'Returns the base raised to the exponent power.',
        example: 'pow(base, exponent)',
      },
      max: {
        name: 'Maximum',
        description: 'Returns the larger of two numbers.',
        example: 'max(a, b)',
      },
      min: {
        name: 'Minimum',
        description: 'Returns the smaller of two numbers.',
        example: 'min(a, b)',
      },
      hypot: {
        name: 'Hypotenuse',
        description: 'Returns the square root of the sum of squares of its arguments (a² + b²).',
        example: 'hypot(x, y)',
      },
    }
  },

  errors: {
    name: 'Error node',
    description: 'Displays error messages.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content == 'errors',
  },

  operator: {
    name: 'Operator',
    description: 'Basic arithmetic and bitwise operators.',
    inputs: 2,
    outputs: 1,
    editable: true,
    pattern: (content) => ['+', '-', '*', '/', '|', '^', '&', '%', '>>', '<<'].includes(content),
    descriptions: {
      '+': {
        name: 'Addition',
        description: 'Adds two values together.',
        symbol: '+',
        example: 'a + b',
      },
      '-': {
        name: 'Subtraction',
        description: 'Subtracts the second value from the first.',
        symbol: '-',
        example: 'a - b',
      },
      '*': {
        name: 'Multiplication',
        description: 'Multiplies two values.',
        symbol: '*',
        example: 'a * b',
      },
      '/': {
        name: 'Division',
        description: 'Divides the first value by the second.',
        symbol: '/',
        example: 'a / b',
      },
      '|': {
        name: 'Bitwise OR',
        description: 'Performs a bitwise OR operation.',
        symbol: '|',
        example: 'a | b',
      },
      '^': {
        name: 'Bitwise XOR',
        description: 'Performs a bitwise XOR operation.',
        symbol: '^',
        example: 'a ^ b',
      },
      '&': {
        name: 'Bitwise AND',
        description: 'Performs a bitwise AND operation.',
        symbol: '&',
        example: 'a & b',
      },
      '%': {
        name: 'Modulus',
        description: 'Returns the remainder of division.',
        symbol: '%',
        example: 'a % b',
      },
      '>>': {
        name: 'Bitwise Right Shift',
        description: 'Shifts bits to the right.',
        symbol: '>>',
        example: 'a >> b',
      },
      '<<': {
        name: 'Bitwise Left Shift',
        description: 'Shifts bits to the left.',
        symbol: '<<',
        example: 'a << b',
      },
    }
  },

  negation: {
    name: 'Negation',
    description: 'Logical negation operator.',
    inputs: 1,
    outputs: 1,
    editable: true,
    pattern: (content) => content == '!',
  },

  conmut: {
    name: 'Array Operator',
    description: 'Operators that work on arrays.',
    inputs: 1,
    outputs: 1,
    editable: false,
    pattern: (content) => ['+[]', '*[]', '&[]', '|[]'].includes(content),
  },

  number: {
    name: 'Number',
    description: 'Represents a constant numeric value. Represents a numeric value that can be in various bases, including decimal, octal, binary, and hexadecimal.',
    inputs: 0,
    outputs: 1,
    minWidth: 110,
    editable: true,
    pattern: (content) => !isNaN(parseFloat(content)) && isFinite(content),
  },

  comment: {
    name: 'Comment',
    description: 'Adds a comment starting with //',
    inputs: 0,
    outputs: 0,
    editable: true,
    pattern: (content) => content.startsWith('//'),
  },

  toggle: {
    name: 'Toggle',
    description: 'Toggle between two connections. No connection evaluates as 0',
    inputs: 2,
    outputs: 1,
    editable: false,
    pattern: (content) => content === 'toggle',
  },

  // midi: {
  //   name: 'Midi',
  //   description: 'Midi',
  //   inputs: 0,
  //   outputs: 2,
  //   editable: false,
  //   pattern: (content) => content === 'midi',
  // },

  settings: {
    name: 'Audio settings',
    description: 'Audio settings',
    inputs: 0,
    outputs: 0,
    editable: false,
    minWidth: 230,
    minHeight: 190,
    pattern: (content) => content === 'settings',
  },

  range: {
    name: 'Range',
    description: 'Interpolates between both connections. Defaults to range of 0 and 1 if no connections are provided',
    inputs: 2,
    outputs: 1,
    minWidth: 160,
    minHeight: 64,
    editable: false,
    pattern: (content) => content === 'range',
  },

  switch: {
    name: 'Switch',
    description: 'Selects between multiple inputs, allowing you to choose one of up to 16 available inputs. When the node is active and selected, you can easily switch between inputs by pressing the number keys 1 to 0 (for the first 10 inputs) on your keyboard or by clicking on the corresponding label of the desired socket. This functionality enhances interactivity, making it convenient to change inputs dynamically during operations or evaluations.',
    inputs: 16,
    outputs: 1,
    editable: false,
    minWidth: 72,
    minHeight: 41,
    maxWidth: 315,
    pattern: (content) => content === 'switch',
  },

  time: {
    name: 'Time',
    description: 'Provides the current time variable.',
    inputs: 0,
    outputs: 1,
    minWidth: 90,
    editable: false,
    pattern: (content) => content === 't',
  },

  visualizer: {
    name: 'Visualizer',
    description: 'Provides the current time variable.',
    inputs: 0,
    outputs: 0,
    minWidth: 256,
    minHeight: 150,
    editable: false,
    pattern: (content) => ['visualizer', 'visual'].includes(content),
  },

  export: {
    name: 'Export',
    description: 'Exports bytebeat canvas as a JSON file.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'export',
  },

  exportImg: {
    name: 'ExportIMG',
    description: 'Exports bytebeat canvas as a JPG file.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'exportimg',
  },

  import: {
    name: 'Import',
    description: 'Import nodebite canvas from a JSON.',
    inputs: 0,
    outputs: 0,
    editable: false,
    pattern: (content) => content === 'import',
  },

  exp: {
    name: 'Expression',
    description: 'A node for writing mathematical and logical expressions.',
    inputs: 0,
    outputs: 1,
    minWidth: 60,
    editable: true,
    pattern: (content) => content === 'exp',
  },
};

function getNodeType(content) {
  for (const [type, config] of Object.entries(NODE_TYPES)) {
    if (config.pattern(content)) {
      return type;
    }
  }
  return 'exp'; // Por defecto, si no coincide con ningún patrón específico
}

export {
  NODE_TYPES,
  getNodeType
}