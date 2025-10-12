// stores/midiStore.js
import { defineStore } from 'pinia';


const MAX_MIDI_MESSAGES = 100;

export const useMidiStore = defineStore('midiStore', {
  state: () => ({
    midiAccess: null,          // Almacena el acceso MIDI global
    midiMessages: [],          // Almacena los mensajes MIDI recibidos
    midiInitialized: false,    // Marca si se inicializó el MIDI correctamente
  }),

  actions: {
    async initializeMidi() {
      if (this.midiInitialized) return;

      try {
        // Solicita acceso a los dispositivos MIDI
        const midiAccess = await navigator.requestMIDIAccess();
        this.midiAccess = midiAccess;
        this.midiInitialized = true;

        // Configura onmidimessage para cada entrada MIDI
        midiAccess.inputs.forEach(input => {
          input.onmidimessage = this.handleMidiMessage;
        });
      } catch (error) {
        console.error("Error al acceder al MIDI:", error);
      }
    },

    handleMidiMessage(event) {
      // Procesa los datos MIDI
      const [command, note, velocity] = event.data;

      // Guarda el mensaje MIDI en el estado
      this.midiMessages.push({ command, note, velocity, timestamp: event.timeStamp });

      if (this.midiMessages.length > MAX_MIDI_MESSAGES) {
        this.midiMessages.shift();
      }

      // Aquí puedes agregar lógica adicional para responder a ciertos comandos
      // como Nota ON, Nota OFF, Control Change, etc.
    },

    clearMidiMessages() {
      // Limpia el historial de mensajes MIDI
      this.midiMessages = [];
    }
  },

  getters: {
    latestMessage: (state) => state.midiMessages[state.midiMessages.length - 1],
    noteOnMessages: (state) => state.midiMessages.filter(msg => msg.command === 144),
    noteOffMessages: (state) => state.midiMessages.filter(msg => msg.command === 128),
    controlChangeMessages: (state) => state.midiMessages.filter(msg => msg.command === 176),
  },
});
