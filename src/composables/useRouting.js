// useRouting.js
import { ref } from "vue";
import { useStudioStore } from "@/stores/studio";
import { generateUniqueId } from "@/utils/helpers";

export function useRouting(mousePosition) {
  const store = useStudioStore();
  const mode = ref("default");
  const pathData = ref({});

  function handleStartPath(nodeId, socket) {
    mode.value = "routing";
    store.connecting.value = { nodeId, socket };
    const { x, y } = mousePosition.value;
    pathData.value = { x1: x, y1: y, x2: x, y2: y };
    document.addEventListener("mouseup", handleCancelPath);
    document.addEventListener("mousemove", drawPath);
  }

  function drawPath() {
    if (mode.value !== "routing") return;
    const { x, y } = mousePosition.value;
    pathData.value.x2 = x;
    pathData.value.y2 = y;
  }

  function handleFinishPath(nodeId, socket) {
    if (mode.value !== "routing") return;

    const inputNode = store.find("nodes", "id", nodeId);

    const isConnectionActive =
      inputNode.type == "conmut" ||
      (inputNode.type == "switch"
        ? !store.connections.some(
            (conn) => conn.input.id === nodeId && conn.active
          )
        : !store.connections.some(
            (conn) =>
              conn.input.id === nodeId &&
              conn.input.socket === socket &&
              conn.active
          ));

    const newConnection = {
      id: generateUniqueId(),
      output: {
        id: store.connecting.value.nodeId,
        socket: store.connecting.value.socket,
      },
      input: { id: nodeId, socket: socket },
      active: isConnectionActive,
    };

    if (inputNode.type == "switch" && newConnection.active == true) {
      inputNode.activeSocket = newConnection.input.socket;
    }

    if (!store.connectionExists(newConnection)) {
      store.connections.push(newConnection);
      inputNode.lastSocketConnected = store.getMaxConnectedInputSocket(nodeId);
      store.evaluateBytebeat();
    }

    handleCancelPath();
  }

  function handleCancelPath() {
    mode.value = "default";
    document.removeEventListener("mouseup", handleCancelPath);
    document.removeEventListener("mousemove", drawPath);
  }

  return {
    mode,
    pathData,
    handleStartPath,
    handleFinishPath,
    handleCancelPath,
  };
}
