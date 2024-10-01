export const nodes = [
    { id: 1, type: "exp", content: "t", w: 60, h: 41, x: 275, y: 100 },
    { id: 4, type: "exp", content: "t * 3", w: 60, h: 41, x: 350, y: 100 },
    { id: 6, type: "exp", content: "t * 4", w: 60, h: 41, x: 425, y: 100 },
    { id: 7, type: "exp", content: "t * t", w: 60, h: 41, x: 500, y: 100 },
    { id: 10, type: "switch", content: "switch", activeSocket: 0, w: 72, h: 50, x: 375, y: 200},
    { id: 0, type: "exp", content: "t >> 4", w: 60, h: 41, x: 150, y: 200 },
    { id: 5, type: "exp", content: "t >> 5", w: 60, h: 41, x: 250, y: 200 },
    { id: 2, type: "exp", content: "& 64", w: 60, h: 41, x: 300, y: 400 },
    { id: 3, type: "conmut", content: "|", w: 60, h: 41, x: 250, y: 300 },
    { id: 9, type: "out", content: "out", w: 60, h: 41, x: 250, y: 550 },
    { id: 8, type: "exp", content: "t +", w: 60, h: 41, x: 525, y: 20 },
  ]

  export const connections = [
    { id: 0, output: { id: 0, socket: 0 }, input: { id: 3, socket: 0 }, active: true },
    { id: 1, output: { id: 1, socket: 0 }, input: { id: 10, socket: 0 }, active: true },
    { id: 2, output: { id: 4, socket: 0 }, input: { id: 10, socket: 1 }, active: false },
    { id: 3, output: { id: 6, socket: 0 }, input: { id: 10, socket: 2 }, active: false },
    { id: 4, output: { id: 7, socket: 0 }, input: { id: 10, socket: 3 }, active: false },
    { id: 5, output: { id: 10, socket: 0 }, input: { id: 3, socket: 0 }, active: true },
    { id: 6, output: { id: 5, socket: 0 }, input: { id: 3, socket: 0 }, active: true },
    { id: 7, output: { id: 3, socket: 0 }, input: { id: 2, socket: 0 }, active: true },
    { id: 8, output: { id: 2, socket: 0 }, input: { id: 9, socket: 0 }, active: true },
    { id: 9, output: { id: 8, socket: 0 }, input: { id: 7, socket: 0 }, active: true },
  ]