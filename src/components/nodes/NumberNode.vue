<template>
  <input
    v-if="isEditing"
    v-model="editValue"
    @input="filterInput"
    @keypress.enter.prevent="handleEnter"
    @blur="handleBlur"
    ref="inputRef"
    class="number-input"
    type="text"
  />
  <div
    v-else
    class="number-display noselect"
    :class="base"
    @keypress="keyPress"
    tabindex="0"
    @dblclick="enableEdit"
  >
    <div ref="numberRef" class="number-content">
      <div class="increments">
        <button @dblclick.stop @mousedown="modifyValue(-1)">-</button>
        <button @dblclick.stop @mousedown="modifyValue(1)">+</button>
      </div>

      <button
        v-if="base === 'bin'" 
        v-for="(bit, index) in paddedNumber"
        :key="`bit-${index}`"
        @dblclick.stop
        @click="toggleBit(index)"
        class="bit-button"
      >
        {{ bit }}
      </button>

      <div
      v-else-if="base === 'hex'"
      v-for="(nibblePair, index) in nibblePairs"
      :key="`nibbles-${index}`"
      class="nibbles"
      :class="{edited: editedNimbleIndex == index}"
      @click="editNibblePair(index)"
      >

      {{ editedNimbleIndex === index && editedNimble ? editedNimble + '&nbsp;' : nibblePair[0] }}{{ editedNimbleIndex === index && editedNimble ? '' : nibblePair[1] }}

      </div>

      <div v-else class="just-formated">
        {{ formattedNumber }}</div>
      </div>
   
      <div class="controls">
        <button class="base" @dblclick.stop @click="cycleRepresentation" :disabled="!canCycle">
          {{ base }}
        </button>

        <div v-if="base === 'bidddn'" class="shifts">
          <button @click="invertBits">~</button>
          <button @click="shiftLeft">&lt;&lt;</button>
          <button @click="shiftRight">&gt;&gt;</button>
          <button @click="circularShiftLeft" class="csl">&lt;&lt;c</button>
          <button @click="circularShiftRight" class="csr">&gt;&gt;c</button>
        </div>
      <!-- <button @click="generateRandomBits" class="random">rnd</button> -->
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick } from "vue";
import { useStudioStore } from "@/stores/studio";

import "./NumberNode.scss";

const store = useStudioStore();
const props = defineProps({
  node: Object,
});

const isEditing = ref(false);
const editValue = ref("");
const inputRef = ref(null);
const numberRef = ref(null);
const editedNimbleIndex = ref(null);
const editedNimble = ref('');

const allowedCharacters = /[0-9a-fA-F+\-*/.xbo%><&|^]/;

const filterInput = (event) => {
  const input = event.target.value;
  // Filtrar los caracteres no permitidos
  if (!allowedCharacters.test(input[input.length - 1])) {
    event.target.value = input.slice(0, -1);
    editValue.value = event.target.value;
  }
};

const detectNumberFormat = (value) => {
  if (/^0[bB][01]+$/.test(value)) return "binary";
  if (/^0[xX][0-9A-Fa-f]+$/.test(value)) return "hexadecimal";
  if (/^0[oO][0-7]+$/.test(value)) return "octal";
  if (/^-?\d+$/.test(value)) return "decimal"; 
  if (/^-?\d*\.\d+$/.test(value)) return "float";
  return "invalid";
};

const numberFormat = computed(() => detectNumberFormat(props.node.content));

const base = computed(() => {
  switch (numberFormat.value) {
    case "binary":
      return "bin";
    case "hexadecimal":
      return "hex";
    case "octal":
      return "oct";
    case "decimal":
      return "dec";
    case "float":
      return "float";
    default:
      return "";
  }
});

// Function to pad binary number to 8, 16, or 32 bits
const paddedNumber = computed(() => {

  // Extrae el valor sin el prefijo "0b"
  const value = props.node.content.slice(2);

  const targetLength = Math.ceil(value.length / 8) * 8;

  return value.padStart(targetLength, "0").split("");
});

const nibblePairs = computed(() => {
  const pairs = [];
  for (let i = 0; i < paddedNumber.value.length; i += 2) {
    pairs.push(paddedNumber.value.slice(i, i + 2));
  }
  return pairs;
});

const editNibblePair = (index) => {
  editedNimbleIndex.value = index
}

const keyPress = (event) => {
  if (base.value !== 'hex' || editedNimbleIndex.value === null) return;

  const validKeys = '0123456789ABCDEF';
  const pressedKey = event.key.toUpperCase();

  if (validKeys.includes(pressedKey)) {
    const currentNibblePair = nibblePairs.value[editedNimbleIndex.value];

    if (editedNimble.value === '') {
      editedNimble.value = pressedKey; 
    } else {
      
      const secondNibbleIndex = editedNimbleIndex.value * 2 + 1;
      paddedNumber.value[secondNibbleIndex] = pressedKey;
      editedNimble.value = ''; 
      store.evaluateBytebeat();

      if (editedNimbleIndex.value === nibblePairs.value.length - 1) {

        editedNimbleIndex.value = null;
      } else {

        editedNimbleIndex.value++;
      }
    }
1
    const editedValue = paddedNumber.value.join('');
    props.node.content = "0x" + editedValue;
  }
}

const modifyValue = (operation) => {

  console.log('modify', operation)
  let currentValue = props.node.content;

  switch (numberFormat.value) {
    case "binary":
      // Elimina el prefijo "0b" y convierte a número, realiza la operación
      currentValue = parseInt(currentValue.slice(2), 2) + operation;
      // Convierte de nuevo a binario y añade el prefijo "0b"
      props.node.content = "0b" + currentValue.toString(2).padStart(paddedNumber.value.length, "0");
      break;
    case "hexadecimal":
      // Elimina el prefijo "0x" y convierte a número, realiza la operación
      currentValue = parseInt(currentValue.slice(2), 16) + operation;
      // Convierte de nuevo a hexadecimal y añade el prefijo "0x"
      props.node.content = "0x" + currentValue.toString(16).toUpperCase();
      break;
    case "octal":
      // Elimina el prefijo "0o" y convierte a número, realiza la operación
      currentValue = parseInt(currentValue.slice(2), 8) + operation;
      // Convierte de nuevo a octal y añade el prefijo "0o"
      props.node.content = "0o" + currentValue.toString(8);
      break;
    case "decimal":
      // Convierte a número, realiza la operación
      currentValue = parseInt(currentValue) + operation;
      // Actualiza el contenido directamente
      props.node.content = currentValue.toString();
      break;
    case "float":
      currentValue = parseFloat(props.node.content);
      const decimalPart = props.node.content.split(".")[1];

      if (decimalPart) {
        const leastSignificantDigitPosition = decimalPart.length;
        const modifyValue = 1 / Math.pow(10, leastSignificantDigitPosition);
        currentValue += modifyValue * operation; // Sumar o restar según el argumento
        props.node.content = currentValue.toFixed(leastSignificantDigitPosition);
      } else {
        props.node.content = (currentValue + operation).toString();
      }
      break;
  }
  store.evaluateBytebeat();
};

// Toggle bit when clicked
const toggleBit = (index) => {
  const bits = paddedNumber.value;
  // Flip the bit at the specified index
  bits[index] = bits[index] === "0" ? "1" : "0";

  // Update the node content with the new binary value
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

// Función para desplazar los bits hacia la izquierda
const shiftLeft = () => {
  const bits = paddedNumber.value;
  bits.push("0"); // Añadir un '0' al final
  bits.shift(); // Eliminar el bit más significativo
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

// Función para desplazar los bits hacia la derecha
const shiftRight = () => {
  const bits = paddedNumber.value;
  bits.unshift("0"); // Añadir un '0' al inicio
  bits.pop(); // Eliminar el bit menos significativo
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

const circularShiftLeft = () => {
  const bits = paddedNumber.value;
  const firstBit = bits.shift(); // Saca el primer bit
  bits.push(firstBit); // Lo agrega al final
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

const circularShiftRight = () => {
  const bits = paddedNumber.value;
  const lastBit = bits.pop(); // Saca el último bit
  bits.unshift(lastBit); // Lo agrega al inicio
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

const invertBits = () => {
  const bits = paddedNumber.value.map((bit) => (bit === "0" ? "1" : "0"));
  props.node.content = "0b" + bits.join("");
  store.evaluateBytebeat();
};

const generateRandomBits = () => {
  const size = paddedNumber.value.length;
  const randomBits = Array.from({ length: size }, () =>
    Math.random() > 0.5 ? "1" : "0"
  ).join("");
  props.node.content = "0b" + randomBits;
  store.evaluateBytebeat();
};

const canCycle = computed(() => {
  const currentValue = Number(props.node.content);
  return (
    Number.isInteger(currentValue) &&
    !isNaN(currentValue) &&
    isFinite(currentValue)
  );
});

const formattedNumber = computed(() => {
  switch (numberFormat.value) {
    case "binary":
      return props.node.content.slice(2);
    case "hexadecimal":
      return props.node.content.slice(2).toUpperCase();
    case "octal":
      return props.node.content.slice(2);
    case "decimal":
      // Remove leading zeros, but keep decimal point if present
      const num = props.node.content;
      if (num.startsWith(".")) {
        return num; // Return as is if it starts with a decimal point
      }
      const [intPart, fracPart] = num.split(".");
      const formattedInt = intPart.replace(/^-?0+/, "") || "0";
      if (fracPart === undefined) {
        return formattedInt;
      } else {
        return `${formattedInt}.${fracPart}`;
      }
    default:
      return props.node.content;
  }
});

const cycleRepresentation = () => {
  if (!canCycle.value) return;
  editedNimbleIndex.value = null

  const currentValue = Number(props.node.content);
  const formats = ["decimal", "binary", "hexadecimal"];
  const currentIndex = formats.indexOf(numberFormat.value);
  const nextFormat = formats[(currentIndex + 1) % formats.length];

  switch (nextFormat) {
    case "decimal":
      props.node.content = currentValue.toString();
      break;
    case "hexadecimal":
      props.node.content = "0x" + currentValue.toString(16);
      break;
    case "binary":
      props.node.content = "0b" + currentValue.toString(2);
      break;
    case "octal":
      props.node.content = "0o" + currentValue.toString(8);
      break;
  }

  updateWidth()
};

const updateWidth = () => {

  nextTick(()=> {
    const newWidth = numberRef.value.getBoundingClientRect().width;

    const w = newWidth;
    const x = props.node.x - (newWidth - props.node.w)
    store.updateNode(props.node.id, { w, x });
  })
 
}
const enableEdit = () => {
  editedNimbleIndex.value = null
  isEditing.value = true;
  editValue.value = props.node.content;
  nextTick(() => inputRef.value?.focus());
};

const handleEnter = () => {
  const newFormat = detectNumberFormat(editValue.value);
  if (newFormat !== "invalid") {
    props.node.content = editValue.value;
    isEditing.value = false;
    console.log("editado", props.node.content);
    updateWidth()
  } else {
    try {
      const result = eval(editValue.value);
      if (typeof result === "number" && !isNaN(result)) {
        props.node.content = result.toString();
        isEditing.value = false;
      } else {
        console.log("Error: Result is not a valid number");
      }
    } catch (error) {
      console.log("Error: Invalid expression");
    }
  }
};

const handleBlur = () => {
  isEditing.value = false;
};

watch(
  () => props.node.content,
  (newValue) => {
    if (!isEditing.value) {
      editValue.value = newValue;
    }
  }
);
</script>


