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
        <span v-if="option.submenu" class="arrow">{{ submenuToLeft ? '◀' : '▶' }}</span>
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
          v-for="(subOption, index) in activeSubmenu"
          :key="subOption.id"
          @click="handleSubOptionClick(subOption)"
          @mouseenter="handleSubOptionMouseEnter(subOption, $event)"
          @mouseleave="handleSubOptionMouseLeave"
          :class="{ 'has-submenu': subOption.submenu }"
        >
          {{ subOption.label }}
          <span v-if="subOption.submenu" class="arrow">{{ subSubmenuToLeft ? '◀' : '▶' }}</span>
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
            v-for="(subSubOption, subIndex) in activeSubSubmenu"
            :key="subSubOption.id"
            @click="handleSubSubOptionClick(subSubOption)"
            @mouseenter="handleSubSubOptionMouseEnter(subSubOption, $event)"
            @mouseleave="handleSubSubOptionMouseLeave"
            :class="{ 'has-submenu': subSubOption.submenu }"
          >
            {{ subSubOption.label }}
            <span v-if="subSubOption.submenu" class="arrow">{{ subSubSubmenuToLeft ? '◀' : '▶' }}</span>
          </li>
        </ul>
        
        <!-- Sub-sub-submenu (cuarto nivel) -->
        <div
          v-if="showSubSubSubmenu && activeSubSubSubmenu"
          class="context-menu submenu sub-sub-submenu"
          :style="{ left: subSubSubmenuPosition.x + 'px', top: subSubSubmenuPosition.y + 'px' }"
          @click.stop
          @mouseenter="handleSubSubSubmenuEnter"
          @mouseleave="handleSubSubSubmenuLeave"
        >
          <ul>
            <li
              v-for="subSubSubOption in activeSubSubSubmenu"
              :key="subSubSubOption.id"
              @click="handleSubSubSubOptionClick(subSubSubOption)"
            >
              {{ subSubSubOption.label }}
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits, ref, nextTick } from 'vue';

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
const submenuToLeft = ref(false);

const showSubSubmenu = ref(false);
const activeSubSubmenu = ref(null);
const subSubmenuPosition = ref({ x: 0, y: 0 });
const subSubmenuToLeft = ref(false);

const showSubSubSubmenu = ref(false);
const activeSubSubSubmenu = ref(null);
const subSubSubmenuPosition = ref({ x: 0, y: 0 });
const subSubSubmenuToLeft = ref(false);

let hideSubmenuTimeout = null;
let hideSubSubmenuTimeout = null;
let hideSubSubSubmenuTimeout = null;

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
  if (subSubOption.submenu) {
    // No hacer nada si tiene submenu, se maneja con mouseenter
    return;
  }
  emit('option-selected', subSubOption);
  emit('close');
}

function handleSubSubOptionMouseEnter(subSubOption, event) {
  // Cancelar cualquier timeout pendiente del sub-sub-submenu
  if (hideSubSubSubmenuTimeout) {
    clearTimeout(hideSubSubSubmenuTimeout);
    hideSubSubSubmenuTimeout = null;
  }
  
  if (subSubOption.submenu) {
    const rect = event.target.getBoundingClientRect();
    const subSubmenuRect = event.target.closest('.sub-submenu').getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    activeSubSubSubmenu.value = subSubOption.submenu;
    showSubSubSubmenu.value = true;
    
    // Usar nextTick para obtener las dimensiones después de que se renderice
    nextTick(() => {
      const subSubSubmenuElement = document.querySelector('.context-menu.sub-sub-submenu');
      if (subSubSubmenuElement) {
        const subSubSubmenuWidth = subSubSubmenuElement.offsetWidth;
        
        // Verificar si el sub-sub-submenu se saldría por la derecha de la pantalla
        const spaceOnRight = windowWidth - rect.right;
        const wouldOverflow = spaceOnRight < subSubSubmenuWidth;
        
        subSubSubmenuToLeft.value = wouldOverflow;
        
        subSubSubmenuPosition.value = {
          x: wouldOverflow ? -subSubSubmenuWidth : subSubmenuRect.width,
          y: rect.top - subSubmenuRect.top
        };
      }
    });
  } else {
    showSubSubSubmenu.value = false;
    activeSubSubSubmenu.value = null;
  }
}

function handleSubSubOptionMouseLeave() {
  // Programar el cierre del sub-sub-submenu
  if (!hideSubSubSubmenuTimeout) {
    hideSubSubSubmenuTimeout = setTimeout(() => {
      showSubSubSubmenu.value = false;
      activeSubSubSubmenu.value = null;
      subSubSubmenuToLeft.value = false;
      hideSubSubSubmenuTimeout = null;
    }, 150);
  }
}

function handleSubSubSubmenuEnter() {
  // Cancelar el cierre cuando entramos al sub-sub-submenu
  if (hideSubSubSubmenuTimeout) {
    clearTimeout(hideSubSubSubmenuTimeout);
    hideSubSubSubmenuTimeout = null;
  }
}

function handleSubSubSubmenuLeave() {
  handleSubSubOptionMouseLeave();
}

function handleSubSubSubOptionClick(subSubSubOption) {
  emit('option-selected', subSubSubOption);
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
    const submenuRect = event.target.closest('.submenu').getBoundingClientRect();
    const windowWidth = window.innerWidth;
    
    activeSubSubmenu.value = subOption.submenu;
    showSubSubmenu.value = true;
    
    // Usar nextTick para obtener las dimensiones después de que se renderice
    nextTick(() => {
      const subSubmenuElement = document.querySelector('.context-menu.sub-submenu');
      if (subSubmenuElement) {
        const subSubmenuWidth = subSubmenuElement.offsetWidth;
        
        // Verificar si el sub-submenu se saldría por la derecha de la pantalla
        const spaceOnRight = windowWidth - rect.right;
        const wouldOverflow = spaceOnRight < subSubmenuWidth;
        
        subSubmenuToLeft.value = wouldOverflow;
        
        subSubmenuPosition.value = {
          x: wouldOverflow ? -subSubmenuWidth : submenuRect.width,
          y: rect.top - submenuRect.top
        };
      }
    });
  } else {
    showSubSubmenu.value = false;
    activeSubSubmenu.value = null;
  }
}

function handleSubOptionMouseLeave() {
  if (!hideSubSubmenuTimeout) {
    hideSubSubmenuTimeout = setTimeout(() => {
      showSubSubmenu.value = false;
      activeSubSubmenu.value = null;
      subSubmenuToLeft.value = false;
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
    const windowWidth = window.innerWidth;
    
    activeSubmenu.value = option.submenu;
    showSubmenu.value = true;
    
    // Usar nextTick para obtener las dimensiones después de que se renderice
    nextTick(() => {
      const submenuElement = document.querySelector('.context-menu.submenu');
      if (submenuElement) {
        const submenuWidth = submenuElement.offsetWidth;
        
        // Verificar si el submenu se saldría por la derecha de la pantalla
        const spaceOnRight = windowWidth - rect.right;
        const wouldOverflow = spaceOnRight < submenuWidth;
        
        submenuToLeft.value = wouldOverflow;
        
        submenuPosition.value = {
          x: wouldOverflow ? -submenuWidth : rect.width,
          y: 0
        };
      }
    });
  }
}

function handleMouseLeave() {
  // Solo programar el cierre si no hay un timeout ya programado
  if (!hideSubmenuTimeout) {
    hideSubmenuTimeout = setTimeout(() => {
      showSubmenu.value = false;
      activeSubmenu.value = null;
      submenuToLeft.value = false;
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
  width: max-content;
  color: var(--color-t);
}

.submenu {
  z-index: 1001;
}

.sub-submenu {
  z-index: 1002;
}

.sub-sub-submenu {
  z-index: 1003;
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
  white-space: nowrap;
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