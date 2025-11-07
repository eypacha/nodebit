<template>
  <div
    class="context-menu"
    :style="{ left: position.x + 'px', top: position.y + 'px' }"
    @click.stop
  >
    <ul>
      <li
        v-for="option in options"
        :key="option.id"
        @click="handleOptionClick(option)"
        @mouseenter="handleMouseEnter(option, $event)"
        @mouseleave="handleMouseLeave"
        :class="{ 
          'has-submenu': option.submenu,
          'disabled': option.disabled === true
        }"
      >
        <span class="menu-label">{{ option.label }}</span>
        <span v-if="option.shortcut" class="shortcut">{{ option.shortcut }}</span>
        <span v-if="option.submenu" class="arrow">▶</span>
      </li>
    </ul>
    <!-- Submenu -->
    <div
      v-if="showSubmenu && activeSubmenu"
      class="context-menu submenu"
      :style="{ left: submenuPosition.x + 'px', top: submenuPosition.y + 'px' }"
      @click.stop
      @mouseenter="handleSubmenuEnter"
      @mouseleave="handleSubmenuLeave"
    >
      <ul>
        <li
          v-for="subOption in activeSubmenu"
          :key="subOption.id"
          @click="handleSubOptionClick(subOption)"
          @mouseenter="handleSubOptionMouseEnter(subOption, $event)"
          @mouseleave="handleSubOptionMouseLeave"
          :class="{ 'has-submenu': subOption.submenu }"
        >
          {{ subOption.label }}
          <span v-if="subOption.submenu" class="arrow">▶</span>
        </li>
      </ul>
      
      <!-- Sub-submenu (tercer nivel) -->
      <div
        v-if="showSubSubmenu && activeSubSubmenu"
        class="context-menu submenu sub-submenu"
        :style="{ left: subSubmenuPosition.x + 'px', top: subSubmenuPosition.y + 'px' }"
        @click.stop
        @mouseenter="handleSubSubmenuEnter"
        @mouseleave="handleSubSubmenuLeave"
      >
        <ul>
          <li
            v-for="subSubOption in activeSubSubmenu"
            :key="subSubOption.id"
            @click="handleSubSubOptionClick(subSubOption)"
          >
            {{ subSubOption.label }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref } from 'vue';

const props = defineProps({
  position: {
    type: Object,
    required: true,
  },
  options: {
    type: Array,
    required: true,
  },
});

const emit = defineEmits(['option-selected', 'close']);

const showSubmenu = ref(false);
const activeSubmenu = ref(null);
const submenuPosition = ref({ x: 0, y: 0 });

const showSubSubmenu = ref(false);
const activeSubSubmenu = ref(null);
const subSubmenuPosition = ref({ x: 0, y: 0 });

let hideSubmenuTimeout = null;
let hideSubSubmenuTimeout = null;

function handleOptionClick(option) {
  // No hacer nada si está deshabilitada
  if (option.disabled === true) {
    return;
  }
  
  if (option.submenu) {
    // No hacer nada si tiene submenu, se maneja con mouseenter
    return;
  }
  emit('option-selected', option);
  emit('close');
}

function handleSubOptionClick(subOption) {
  if (subOption.submenu) {
    // No hacer nada si tiene submenu, se maneja con mouseenter
    return;
  }
  emit('option-selected', subOption);
  emit('close');
}

function handleSubSubOptionClick(subSubOption) {
  emit('option-selected', subSubOption);
  emit('close');
}

function handleSubOptionMouseEnter(subOption, event) {
  // Cancelar cualquier timeout pendiente del sub-submenu
  if (hideSubSubmenuTimeout) {
    clearTimeout(hideSubSubmenuTimeout);
    hideSubSubmenuTimeout = null;
  }
  
  if (subOption.submenu) {
    const rect = event.target.getBoundingClientRect();
    subSubmenuPosition.value = {
      x: rect.width - 2,
      y: 0
    };
    activeSubSubmenu.value = subOption.submenu;
    showSubSubmenu.value = true;
  } else {
    // Si no tiene submenu, ocultar cualquier sub-submenu activo
    showSubSubmenu.value = false;
    activeSubSubmenu.value = null;
  }
}

function handleSubOptionMouseLeave() {
  if (!hideSubSubmenuTimeout) {
    hideSubSubmenuTimeout = setTimeout(() => {
      showSubSubmenu.value = false;
      activeSubSubmenu.value = null;
      hideSubSubmenuTimeout = null;
    }, 150);
  }
}

function handleSubSubmenuEnter() {
  if (hideSubSubmenuTimeout) {
    clearTimeout(hideSubSubmenuTimeout);
    hideSubSubmenuTimeout = null;
  }
}

function handleSubSubmenuLeave() {
  handleSubOptionMouseLeave();
}

function handleMouseEnter(option, event) {
  // Cancelar cualquier timeout pendiente
  if (hideSubmenuTimeout) {
    clearTimeout(hideSubmenuTimeout);
    hideSubmenuTimeout = null;
  }
  
  if (option.submenu) {
    const rect = event.target.getBoundingClientRect();
    submenuPosition.value = {
      x: rect.width - 2, // Posición relativa al elemento padre
      y: 0
    };
    activeSubmenu.value = option.submenu;
    showSubmenu.value = true;
  }
}

function handleMouseLeave() {
  // Solo programar el cierre si no hay un timeout ya programado
  if (!hideSubmenuTimeout) {
    hideSubmenuTimeout = setTimeout(() => {
      showSubmenu.value = false;
      activeSubmenu.value = null;
      hideSubmenuTimeout = null;
    }, 150);
  }
}

function handleSubmenuEnter() {
  // Cancelar el cierre cuando entramos al submenu
  if (hideSubmenuTimeout) {
    clearTimeout(hideSubmenuTimeout);
    hideSubmenuTimeout = null;
  }
}

function handleSubmenuLeave() {
  // Programar el cierre cuando salimos del submenu
  handleMouseLeave();
}
</script>

<style scoped>
.context-menu {
  position: absolute;
  background: var(--color-background);
  border: 1px solid var(--color-border);
  box-shadow: black 0px 2px 8px;
  z-index: 1000;
  min-width: 150px;
  color: var(--color-t);
}

.submenu {
  z-index: 1001;
}

.sub-submenu {
  z-index: 1002;
}

ul {
  list-style: none;
  margin: 0;
  padding: 0;
}

li {
  padding: 8px 12px;
  cursor: pointer;
  color: var(--color-t);
  font-size: 14px;
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.menu-label {
  flex: 1;
}

.shortcut {
  font-size: 11px;
  color: var(--color-text-muted, #888);
  opacity: 0.7;
}

li:last-child {
  border-bottom: none;
}

li:hover {
  background: var(--color-background-soft);
}

li.disabled {
  opacity: 0.2;
  cursor: not-allowed;
}

li.disabled:hover {
  background: transparent;
}

.has-submenu {
  padding-right: 24px;
}

.arrow {
  font-size: 10px;
  color: var(--color-text-muted, #999);
}
</style>