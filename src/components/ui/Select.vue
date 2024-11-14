<template>
  <div
    class="select"
    @click="toggleSelect"
    @blur="closeSelect"
    tabindex="0"
    role="combobox"
    :aria-expanded="isSelectOpen.toString()"
    aria-haspopup="listbox"
    :aria-activedescendant="selectedOptionId"
    :aria-label="ariaLabel"
  >
    <div class="selected">{{ getLabel(selectedValue) }}</div>
    <div v-if="isSelectOpen" class="options">
      <option
        v-for="option in options"
        :key="option.name"
        :class="{ selected: option.name === selectedValue }"
        @click.stop="updateValue(option.name)"
        role="option"
        :aria-selected="option.name === selectedValue ? 'true' : 'false'"
      >
        {{ option.label }}
      </option>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, defineProps, defineEmits, nextTick } from "vue";

const props = defineProps({
  options: {
    type: Array,
    required: true,
  },
  selectedValue: {
    type: [String, Number],
    required: true,
  },
  ariaLabel: {
    type: String,
    default: "Select an option",
  },
});

const emit = defineEmits(["update:selected"]);

const isSelectOpen = ref(false);

const selectedOptionId = computed(() => {
  const selectedOption = props.options.find(
    (option) => option.name === props.selectedValue
  );
  return selectedOption ? `option-${selectedOption.name}` : null;
});

const toggleSelect = () => {
  isSelectOpen.value = !isSelectOpen.value;
  if (isSelectOpen.value) {
    nextTick(() => {
      const firstOption = document.querySelector(".options .option");
      if (firstOption) firstOption.focus();
    });
  }
};

const closeSelect = () => {
  isSelectOpen.value = false;
};

const getLabel = (value) => {
  const option = props.options.find((item) => item.name === value);
  return option ? option.label : "";
};

const updateValue = (value) => {
  emit("update:selected", value);
  isSelectOpen.value = false;
};
</script>

<style lang="scss" scoped>
.select {
  width: 100px;
  background: var(--color-background);
  padding: 5px 20px 5px 10px;
  font-size: 12px;
  border: var(--color-command) 1px solid;
  cursor: pointer;
  box-shadow: inset black 0px 2px 2px;
  border-radius: 0;
  color: yellow;
  white-space: pre;
  appearance: none;
  outline: none;
  font-family: var(--main-font);
  position: relative;
  width: min-content;
  min-width: 65px;
  text-align: right;

  &:after {
    content: "▼";
    color: var(--color-t);
    position: absolute;
    top: 0;
    right: 0;
    height: 100%;
    display: bock;
    padding-top: 3px;
    width: 25px;
    text-align: center;
    pointer-events: none;
  }

  .options {
    background: var(--color-background);
    position: absolute;
    left: 0;
    bottom: 0;
    transform: translateY(100%);
    outline: var(--color-command) 1px solid;
    width: 100%;
    color: var(--color-text);
    display: block;
    padding-block: 4px;
    box-shadow: black 0px 2px 2px;

    option {
      padding: 4px 18px 4px 10px;
      text-align: right;

      &:hover {
        background: rgba(0, 0, 0, 0.5);
      }
      &.selected {
        color: yellow;
      }
    }
  }
}
</style>
