export const CONTEXT_MENU_OPTIONS = [
  { 
    id: 1, 
    label: 'New', 
    shortcut: 'Ctrl+Click',
    submenu: [
      {
        id: 'node-empty',
        label: 'Empty',
        nodeType: 'empty',
        content: ''
      },
      {
        id: 'node-number',
        label: 'Number',
        nodeType: 'number',
        content: '0'
      },
      {
        id: 'node-time',
        label: 'Time (t)',
        nodeType: 'time',
        content: 't'
      },
      {
        id: 'node-operators',
        label: 'Operators',
        submenu: [
          {
            id: 'node-operator-add',
            label: 'Addition',
            nodeType: 'operator',
            content: '+'
          },
          {
            id: 'node-operator-subtract',
            label: 'Subtraction',
            nodeType: 'operator',
            content: '-'
          },
          {
            id: 'node-operator-multiply',
            label: 'Multiplication',
            nodeType: 'operator',
            content: '*'
          },
          {
            id: 'node-operator-divide',
            label: 'Division',
            nodeType: 'operator',
            content: '/'
          },
          {
            id: 'node-operator-modulo',
            label: 'Modulo',
            nodeType: 'operator',
            content: '%'
          }
        ]
      },
      {
        id: 'node-binary-operators',
        label: 'Bitwise Operators',
        submenu: [
          {
            id: 'node-operator-and',
            label: 'AND',
            nodeType: 'operator',
            content: '&'
          },
          {
            id: 'node-operator-or',
            label: 'OR',
            nodeType: 'operator',
            content: '|'
          },
          {
            id: 'node-operator-xor',
            label: 'XOR',
            nodeType: 'operator',
            content: '^'
          },
          {
            id: 'node-operator-shift-left',
            label: 'Left Shift',
            nodeType: 'operator',
            content: '<<'
          },
          {
            id: 'node-operator-shift-right',
            label: 'Right Shift',
            nodeType: 'operator',
            content: '>>'
          },
          {
            id: 'node-operator-not',
            label: 'NOT',
            nodeType: 'negation',
            content: '!'
          }
        ]
      },
      {
        id: 'node-control-audio',
        label: 'Control & Audio',
        submenu: [
          {
            id: 'node-out',
            label: 'Output',
            nodeType: 'out',
            content: 'out'
          },
          {
            id: 'node-play',
            label: 'Play',
            nodeType: 'play',
            content: 'play'
          },
          {
            id: 'node-stop',
            label: 'Stop',
            nodeType: 'stop',
            content: 'stop'
          },
          {
            id: 'node-reset',
            label: 'Reset',
            nodeType: 'reset',
            content: 'reset'
          }
        ]
      },
      {
        id: 'node-ui',
        label: 'UI',
        submenu: [
          {
            id: 'node-visualizer',
            label: 'Visualizer',
            nodeType: 'visualizer',
            content: 'visualizer'
          },
          {
            id: 'node-switch',
            label: 'Switch',
            nodeType: 'switch',
            content: 'switch'
          },
          {
            id: 'node-range',
            label: 'Range',
            nodeType: 'range',
            content: 'range'
          },
          {
            id: 'node-toggle',
            label: 'Toggle',
            nodeType: 'toggle',
            content: 'toggle'
          },
          {
            id: 'node-mouse',
            label: 'Mouse',
            nodeType: 'mouse',
            content: 'mouse'
          },
          {
            id: 'node-theme',
            label: 'Theme',
            nodeType: 'theme',
            content: 'theme'
          },
          {
            id: 'node-settings',
            label: 'Settings',
            nodeType: 'settings',
            content: 'settings'
          }
        ]
      },
      {
        id: 'node-functions',
        label: 'Functions',
        submenu: [
          {
            id: 'node-functions-trigonometric',
            label: 'Trigonometric',
            submenu: [
              {
                id: 'node-sin',
                label: 'Sine',
                nodeType: 'function',
                content: 'sin'
              },
              {
                id: 'node-cos',
                label: 'Cosine',
                nodeType: 'function',
                content: 'cos'
              },
              {
                id: 'node-tan',
                label: 'Tangent',
                nodeType: 'function',
                content: 'tan'
              },
              {
                id: 'node-asin',
                label: 'Arc Sine',
                nodeType: 'function',
                content: 'asin'
              },
              {
                id: 'node-acos',
                label: 'Arc Cosine',
                nodeType: 'function',
                content: 'acos'
              },
              {
                id: 'node-atan',
                label: 'Arc Tangent',
                nodeType: 'function',
                content: 'atan'
              },
              {
                id: 'node-sinh',
                label: 'Hyperbolic Sine',
                nodeType: 'function',
                content: 'sinh'
              },
              {
                id: 'node-tanh',
                label: 'Hyperbolic Tangent',
                nodeType: 'function',
                content: 'tanh'
              }
            ]
          },
          {
            id: 'node-functions-rounding',
            label: 'Rounding',
            submenu: [
              {
                id: 'node-floor',
                label: 'Floor',
                nodeType: 'function',
                content: 'floor'
              },
              {
                id: 'node-ceil',
                label: 'Ceiling',
                nodeType: 'function',
                content: 'ceil'
              },
              {
                id: 'node-round',
                label: 'Round',
                nodeType: 'function',
                content: 'round'
              },
              {
                id: 'node-trunc',
                label: 'Truncate',
                nodeType: 'function',
                content: 'trunc'
              },
              {
                id: 'node-sign',
                label: 'Sign',
                nodeType: 'function',
                content: 'sign'
              }
            ]
          },
          {
            id: 'node-functions-logarithmic',
            label: 'Logarithmic',
            submenu: [
              {
                id: 'node-log',
                label: 'Natural Logarithm',
                nodeType: 'function',
                content: 'log'
              },
              {
                id: 'node-log2',
                label: 'Base-2 Logarithm',
                nodeType: 'function',
                content: 'log2'
              },
              {
                id: 'node-log10',
                label: 'Base-10 Logarithm',
                nodeType: 'function',
                content: 'log10'
              },
              {
                id: 'node-exp',
                label: 'Exponential',
                nodeType: 'function',
                content: 'exp'
              }
            ]
          },
          {
            id: 'node-functions-basic',
            label: 'Basic',
            submenu: [
              {
                id: 'node-abs',
                label: 'Absolute Value',
                nodeType: 'function',
                content: 'abs'
              },
              {
                id: 'node-sqrt',
                label: 'Square Root',
                nodeType: 'function',
                content: 'sqrt'
              },
              {
                id: 'node-cbrt',
                label: 'Cube Root',
                nodeType: 'function',
                content: 'cbrt'
              },
              {
                id: 'node-random',
                label: 'Random',
                nodeType: 'function',
                content: 'random'
              }
            ]
          },
          {
            id: 'node-functions-two-param',
            label: 'Two Parameter',
            submenu: [
              {
                id: 'node-pow',
                label: 'Power',
                nodeType: 'function2',
                content: 'pow'
              },
              {
                id: 'node-max',
                label: 'Maximum',
                nodeType: 'function2',
                content: 'max'
              },
              {
                id: 'node-min',
                label: 'Minimum',
                nodeType: 'function2',
                content: 'min'
              },
              {
                id: 'node-hypot',
                label: 'Hypotenuse',
                nodeType: 'function2',
                content: 'hypot'
              }
            ]
          }
        ]
      },
      {
        id: 'node-help',
        label: 'Help',
        nodeType: 'help',
        content: 'help'
      }
    ]
  },
  {
    id: 2,
    label: 'Copy',
    shortcut: 'Ctrl+C',
    action: 'copy'
  },
  {
    id: 3,
    label: 'Paste',
    shortcut: 'Ctrl+V',
    action: 'paste'
  }
];