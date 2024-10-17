import { computed } from 'vue';
import { useStudioStore } from "@/stores/studio";

export function useFilterStyle() {

  const store = useStudioStore();

  const computedStyle = computed(() => {
    let filter = '';

    if (store.theme.darkMode === false) {
      filter += 'invert(1) ';
    }

    if (store.theme.greyscale === true) {
      filter += 'grayscale(1) ';
    }

    if (store.theme.hueRotation) {
      filter += `hue-rotate(${store.theme.hueRotation}deg) `;
    }

    return `filter: ${filter.trim()};`;
  });

  return { computedStyle };
}
