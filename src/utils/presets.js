export const presets = [
  
  {"expressions":["((t >> 4) | (64 & ((t * 3) | t))) * .999","((t >> 4) | (64 & ((t * 3) | t))) * .999"],"nodes":[{"id":0,"type":"play","content":"play","w":60,"h":60,"x":20,"y":20},{"id":1,"type":"out","content":"out","w":60,"h":41,"x":413,"y":640,"lastSocketConnected":1},{"id":2,"type":"switch","content":"switch","w":72,"h":41,"x":91,"y":154,"activeSocket":0,"lastSocketConnected":3},{"id":4,"type":"exp","content":"t >> 5","w":68,"h":41,"x":191,"y":27},{"id":5,"type":"exp","content":"t >> 6","w":72,"h":41,"x":279,"y":27},{"id":1727973842626556,"type":"conmut","content":"|","w":60,"h":40,"x":52,"y":248,"lastSocketConnected":0},{"id":1727973979592558,"type":"exp","content":"t >> 4","w":65,"h":41,"x":111,"y":28},{"id":1727974012786513,"type":"operator","content":"|","w":60,"h":41,"x":262,"y":111,"lastSocketConnected":1},{"id":1727974063794431,"type":"operator","content":"*","w":60,"h":41,"x":83,"y":341,"lastSocketConnected":1},{"id":1727974073125341,"type":"number","content":".999","w":60,"h":41,"x":139,"y":238},{"id":1727974113947907,"type":"exp","content":"t * 3","w":60,"h":41,"x":371,"y":29},{"id":1727974156652604,"type":"time","content":"t","w":60,"h":41,"x":460,"y":26},{"id":1727974184724181,"type":"number","content":"64","w":60,"h":41,"x":356,"y":92},{"id":1727974189352573,"type":"operator","content":"&","w":60,"h":41,"x":356,"y":168,"lastSocketConnected":1},{"id":1727974219342965,"type":"conmut","content":"|","w":60,"h":40,"x":443,"y":118,"lastSocketConnected":0},{"id":1727974286986857,"type":"export","content":"export","w":60,"h":40,"x":20,"y":98},{"id":1727974293361982,"type":"comment","content":"// nodebit v0.0001\n\nCtrl + Click          -> Create new empty node\nAlt + Click           -> Delete node or path\nClick                 -> Select a node\nDouble click          -> Edit node \nShigt + Enter         -> New line\nEnter                 -> Evaluate node\nDel / Backspace       -> Delete selected path or node\nT hover a path        -> Toggle ghost connection\n1,2,3,4....           -> Change paths in selected swicth node\n\nNODE_TYPES\nAutodetect type when the node is evaluated\n\nt                     -> Time variable\n14, .5, 0xFF, 0b1010  -> Number\n+ - * / %             -> Operators\n! & | ^ >> <<         -> Logic and bytewise operatros\n+[] &[] |[]...        -> Array operators\nplay                  -> Play/pause button\nswitch                -> Switch between paths with number keys\nexport                -> Download bytebeat in json file\n((t >> 10) & 42       -> Expression (default)","w":479,"h":386,"x":508,"y":318},{"id":1727977028750237,"type":"exp","content":"t>>6^t&t>>9^t>>12|(t<<(t>>6)%4^-t&-t>>13)%128^-t>>1","w":201,"h":71,"x":234,"y":247},{"id":1727977085622517,"type":"switch","content":"switch","w":157,"h":41,"x":177,"y":555,"activeSocket":1,"lastSocketConnected":7},{"id":1727977186152467,"type":"exp","content":"(t>>10^t>>11)%5*((t>>14&3^t>>15&1)+1)*t%99+((3+(t>>14&3)-(t>>16&1))/3*t%99&64)","w":172,"h":86,"x":469,"y":202},{"id":1727977221709184,"type":"exp","content":"(32*sin((x=t/[1,1,1,2,1.5,1.5,w=1.25+(0.75-1.25*(t>>16&1))*(t>>15&1),w][t>>12&7])/441*65)>>(x/2&16))+128","w":185,"h":116,"x":552,"y":28},{"id":1727977280262580,"type":"exp","content":"t>>(t%32?4:3)|(t%128?t>>3:t>>3|t>>9)","w":142,"h":71,"x":181,"y":336},{"id":1727977325667778,"type":"exp","content":"t*(42&t>>10)","w":112,"h":41,"x":373,"y":349},{"id":1727977401170580,"type":"exp","content":"t^60|t*.97&127|t>>4","w":168,"h":41,"x":320,"y":433},{"id":1727977448022438,"type":"exp","content":"t*5&(t>>7)|t*3&(t*4>>10)","w":126,"h":71,"x":23,"y":412}],"connections":[{"id":3,"output":{"id":4,"socket":0},"input":{"id":2,"socket":1},"active":false},{"id":4,"output":{"id":5,"socket":0},"input":{"id":2,"socket":2},"active":false},{"id":1727973993714667,"output":{"id":1727973979592558,"socket":0},"input":{"id":2,"socket":0},"active":true},{"id":172797403003648,"output":{"id":1727973979592558,"socket":0},"input":{"id":1727974012786513,"socket":0},"active":true},{"id":1727974031904191,"output":{"id":4,"socket":0},"input":{"id":1727974012786513,"socket":1},"active":true},{"id":1727974037326802,"output":{"id":1727974012786513,"socket":0},"input":{"id":2,"socket":3},"active":false},{"id":1727974053781224,"output":{"id":2,"socket":0},"input":{"id":1727973842626556,"socket":0},"active":true},{"id":172797409387713,"output":{"id":1727974073125341,"socket":0},"input":{"id":1727974063794431,"socket":1},"active":true},{"id":172797410649226,"output":{"id":1727973842626556,"socket":0},"input":{"id":1727974063794431,"socket":0},"active":true},{"id":1727974201494388,"output":{"id":1727974184724181,"socket":0},"input":{"id":1727974189352573,"socket":0},"active":true},{"id":1727974251391679,"output":{"id":1727974219342965,"socket":0},"input":{"id":1727974189352573,"socket":1},"active":true},{"id":1727974255029671,"output":{"id":1727974113947907,"socket":0},"input":{"id":1727974219342965,"socket":0},"active":true},{"id":1727974267441650,"output":{"id":1727974189352573,"socket":0},"input":{"id":1727973842626556,"socket":0},"active":true},{"id":1727974274222956,"output":{"id":1727974156652604,"socket":0},"input":{"id":1727974219342965,"socket":0},"active":true},{"id":1727977129946307,"output":{"id":1727974063794431,"socket":0},"input":{"id":1727977085622517,"socket":0},"active":true},{"id":1727977134244741,"output":{"id":1727977085622517,"socket":0},"input":{"id":1,"socket":0},"active":true},{"id":172797713706417,"output":{"id":1727977085622517,"socket":0},"input":{"id":1,"socket":1},"active":true},{"id":1727977150249983,"output":{"id":1727977028750237,"socket":0},"input":{"id":1727977085622517,"socket":1},"active":false},{"id":1727977204707606,"output":{"id":1727977186152467,"socket":0},"input":{"id":1727977085622517,"socket":2},"active":false},{"id":1727977229269912,"output":{"id":1727977221709184,"socket":0},"input":{"id":1727977085622517,"socket":3},"active":false},{"id":1727977295854689,"output":{"id":1727977280262580,"socket":0},"input":{"id":1727977085622517,"socket":4},"active":false},{"id":1727977335410197,"output":{"id":1727977325667778,"socket":0},"input":{"id":1727977085622517,"socket":5},"active":false},{"id":1727977422702497,"output":{"id":1727977401170580,"socket":0},"input":{"id":1727977085622517,"socket":6},"active":false},{"id":172797747854778,"output":{"id":1727977448022438,"socket":0},"input":{"id":1727977085622517,"socket":7},"active":false}]},
  {
    nodes: [
      { id: 0, type: "play", content: "play", w: 60, h: 60, x: 20, y: 20 },
      { id: 1, type: "out", content: "out", w: 60, h: 41, x: 250, y: 450 },
      { id: 2, type: "exp", content: "t", w: 60, h: 41, x: 275, y: 100 },
    ],
    connections: [
      {
        id: 0,
        output: { id: 2, socket: 0 },
        input: { id: 1, socket: 0 },
        active: true,
      },
      {
        id: 1,
        output: { id: 2, socket: 0 },
        input: { id: 1, socket: 1 },
        active: true,
      },
    ],
  },
  {
    nodes: [
      { id: 1, type: "exp", content: "t", w: 60, h: 41, x: 275, y: 100 },
      { id: 4, type: "exp", content: "t * 3", w: 60, h: 41, x: 350, y: 100 },
      { id: 6, type: "exp", content: "t * 4", w: 60, h: 41, x: 425, y: 100 },
      { id: 7, type: "exp", content: "t * t", w: 60, h: 41, x: 500, y: 100 },
      {
        id: 10,
        type: "switch",
        content: "switch",
        activeSocket: 0,
        w: 72,
        h: 50,
        x: 375,
        y: 200,
      },
      { id: 0, type: "exp", content: "t >> 4", w: 60, h: 41, x: 150, y: 200 },
      { id: 5, type: "exp", content: "t >> 5", w: 60, h: 41, x: 250, y: 200 },
      { id: 2, type: "exp", content: "& 64", w: 60, h: 41, x: 300, y: 400 },
      { id: 3, type: "conmut", content: "|", w: 60, h: 41, x: 250, y: 300 },
      { id: 9, type: "out", content: "out", w: 60, h: 41, x: 250, y: 550 },
      { id: 8, type: "exp", content: "t +", w: 60, h: 41, x: 525, y: 20 },
    ],
    connections: [
      {
        id: 0,
        output: { id: 0, socket: 0 },
        input: { id: 3, socket: 0 },
        active: true,
      },
      {
        id: 1,
        output: { id: 1, socket: 0 },
        input: { id: 10, socket: 0 },
        active: true,
      },
      {
        id: 2,
        output: { id: 4, socket: 0 },
        input: { id: 10, socket: 1 },
        active: false,
      },
      {
        id: 3,
        output: { id: 6, socket: 0 },
        input: { id: 10, socket: 2 },
        active: false,
      },
      {
        id: 4,
        output: { id: 7, socket: 0 },
        input: { id: 10, socket: 3 },
        active: false,
      },
      {
        id: 5,
        output: { id: 10, socket: 0 },
        input: { id: 3, socket: 0 },
        active: true,
      },
      {
        id: 6,
        output: { id: 5, socket: 0 },
        input: { id: 3, socket: 0 },
        active: true,
      },
      {
        id: 7,
        output: { id: 3, socket: 0 },
        input: { id: 2, socket: 0 },
        active: true,
      },
      {
        id: 8,
        output: { id: 2, socket: 0 },
        input: { id: 9, socket: 0 },
        active: true,
      },
      {
        id: 9,
        output: { id: 8, socket: 0 },
        input: { id: 7, socket: 0 },
        active: true,
      },
    ],
  },
];
