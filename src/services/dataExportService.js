import { downloadFile } from '../utils/fileUtils';

export function exportData(store) {
  if (!store.isDragging) return;
  const stringData = generateStringData(store);
  downloadFile(stringData, "bytebeat.json", "application/json");
}

function generateStringData(store) {
  const data = {
    expressions: store.expressions,
    nodes: store.nodes,
    connections: store.connections,
  };
  return JSON.stringify(data, null, 0);
}