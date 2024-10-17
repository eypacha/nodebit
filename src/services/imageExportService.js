import html2canvas from "html2canvas";
import piexif from "piexifjs";
import { downloadFile, dataURItoBlob } from "../utils/fileUtils";

export async function exportImage(store) {
  if (!store.isDragging) return;

  const stringData = generateStringData(store);
  const { minLeft, minTop, maxBottom, maxRight } = calculateNodeBounds(
    store,
    20
  );

  const canvas = await html2canvas(document.getElementById("canvas"), {
    x: minLeft,
    y: minTop,
    width: maxRight - minLeft,
    height: maxBottom - minTop,
    backgroundColor: "#17111f",
    onclone: (clonedDocument) => {
      applyCloneStyles(clonedDocument);
      replaceTextAreasWithDivs(clonedDocument);
    },
  });

  let imageData = canvas.toDataURL("image/jpeg");
  let exifObj = {"0th":{}, "Exif":{}, "GPS":{}, "Interop":{}, "1st":{}, "thumbnail":null};
  
  exifObj["0th"][piexif.ImageIFD.Software] = "nodebit";
  exifObj["Exif"][piexif.ExifIFD.UserComment] = stringData;
  
  let exifBytes = piexif.dump(exifObj);
  let newImageData = piexif.insert(exifBytes, imageData);
  
  downloadFile(dataURItoBlob(newImageData), "bytebeat.jpg", "image/jpeg");
}

function calculateNodeBounds(store, margin = 0) {
  return store.nodes
    .filter(
      (node) =>
        !["play", "stop", "reset", "import", "export", "exportImg"].includes(
          node.type
        )
    )
    .reduce(
      (acc, node) => {
        acc.minLeft = Math.min(acc.minLeft, node.x - margin);
        acc.minTop = Math.min(acc.minTop, node.y - margin);
        acc.maxBottom = Math.max(acc.maxBottom, node.y + node.h + margin);
        acc.maxRight = Math.max(acc.maxRight, node.x + node.w + margin);
        return acc;
      },
      {
        minLeft: Infinity,
        minTop: Infinity,
        maxBottom: -Infinity,
        maxRight: -Infinity,
      }
    );
}

function applyCloneStyles(clonedDocument) {
  const style = clonedDocument.createElement("style");
  style.textContent = `
  * {
   box-shadow: none !important;
  }
  .node-play,
  .node-stop,
  .node-reset,
  .node-export,
  .node-exportImg,
  .node-import,
  textarea {
    display:none
  }
  .node-exp .textareaDiv {
    color: white;
  }
  .node-operator .textareaDiv {
    color: cyan;
    text-align: center;
  }
  .node-number {
    padding: 0 !important;
  }
  .node-number .textareaDiv {
    color: yellow;
    text-align: right;
  }
  .textareaDiv {
    padding: 8px 0.5em 13px;
    width: 100% !important;
    height: 100% !important;
    font-size: 13px;
    overflow: hidden;
  }
`;
  clonedDocument.head.appendChild(style);
}

function replaceTextAreasWithDivs(clonedDocument) {
  Array.from(clonedDocument.querySelectorAll("textarea")).forEach(
    (textArea) => {
      const div = clonedDocument.createElement("div");
      div.innerText = textArea.value;
      div.classList.add("textareaDiv");
      textArea.parentElement.append(div);
    }
  );
}

function generateStringData(store) {
  const data = {
    expressions: store.expressions,
    nodes: store.nodes,
    connections: store.connections,
  };
  return JSON.stringify(data, null, 0);
}
