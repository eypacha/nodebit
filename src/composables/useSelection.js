// useSelection.js
import { ref, computed } from "vue";
import { useMouse } from "@vueuse/core";
import { useStudioStore } from "@/stores/studio";

export function useSelection(canvasRef) {
  const store = useStudioStore();
  const preSelectedNodes = ref([]);
  const selectionBox = ref(null);
  const { x: mouseX, y: mouseY } = useMouse();

  const canvasRect = computed(() => {
    return canvasRef.value?.getBoundingClientRect() ?? { left: 0, top: 0 };
  });

  const mousePosition = computed(() => ({
    x: mouseX.value - canvasRect.value.left,
    y: mouseY.value - canvasRect.value.top,
  }));

  const selectionBoxVisibility = computed(() => {
    return (
      selectionBox.value &&
      (selectionBox.value.width > 4 || selectionBox.value.height > 4)
    );
  });

  function startMouseSelection() {
    preSelectedNodes.value = [...store.selectedNodes];
    const { x, y } = mousePosition.value;
    selectionBox.value = {
      startX: x,
      startY: y,
      left: x,
      top: y,
      width: 0,
      height: 0,
    };
  }

  function trackMousePosition(event) {
    if (event.buttons != 1 || !selectionBox.value) return;

    const { startX, startY } = selectionBox.value;
    const { x, y } = mousePosition.value;

    selectionBox.value = {
      startX,
      startY,
      left: Math.min(x, startX),
      top: Math.min(y, startY),
      width: Math.abs(x - startX),
      height: Math.abs(y - startY),
    };

    mouseSelectNodes();
  }

  function mouseSelectNodes() {
    const newSelectedNodes = store.nodes

      .filter((node) => {
        const nodeRight = node.x + node.w;
        const nodeBottom = node.y + node.h;
        const selectionRight =
          selectionBox.value.left + selectionBox.value.width;
        const selectionBottom =
          selectionBox.value.top + selectionBox.value.height;
        return (
          node.x < selectionRight &&
          nodeRight > selectionBox.value.left &&
          node.y < selectionBottom &&
          nodeBottom > selectionBox.value.top
        );
      })
      .map((node) => node.id);

    // Invertir la selección
    store.selectedNodes = store.nodes
      .filter((node) => {
        const isSelectedBefore = preSelectedNodes.value.includes(node.id);
        const isSelectedNow = newSelectedNodes.includes(node.id);

        return (
          (isSelectedBefore && !isSelectedNow) ||
          (!isSelectedBefore && isSelectedNow)
        );
      })
      .map((node) => node.id);
  }

  function handleCanvasClick(shiftKey) {
    if (!selectionBox.value || selectionBox.value.width < 2)
      store.deselectAll();
    selectionBox.value = null;
  }

  return {
    selectionBox,
    selectionBoxVisibility,
    startMouseSelection,
    trackMousePosition,
    handleCanvasClick,
    mousePosition,
  };
}
