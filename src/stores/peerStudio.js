import { defineStore } from 'pinia';

export const usePeerStore = defineStore('peerStore', {
  state: () => ({
    peers: {},          // Almacena pares de conexiones `Peer` por ID
    connections: {},    // Almacena conexiones activas por `Peer` ID
  }),

  actions: {
    addPeer(id, peerInstance) {
      // Agrega una nueva instancia `Peer` al store
      this.peers[id] = peerInstance;
    },

    removePeer(id) {
      // Elimina una instancia `Peer` y sus conexiones
      if (this.peers[id]) {
        this.peers[id].disconnect();
        delete this.peers[id];
      }
      if (this.connections[id]) {
        delete this.connections[id];
      }
    },

    addConnection(peerId, connection) {
      // Agrega una conexión específica a un `Peer`
      if (!this.connections[peerId]) {
        this.connections[peerId] = [];
      }
      this.connections[peerId].push(connection);
    },

    removeConnection(peerId, connectionId) {
      // Elimina una conexión específica por su ID
      if (this.connections[peerId]) {
        this.connections[peerId] = this.connections[peerId].filter(
          conn => conn.id !== connectionId
        );
      }
    },

    clearAllPeers() {
      // Desconecta y elimina todas las instancias de `Peer`
      Object.keys(this.peers).forEach((id) => this.removePeer(id));
    },
  },

  getters: {
    getConnectionsByPeer: (state) => (peerId) => state.connections[peerId] || [],
    getPeerById: (state) => (id) => state.peers[id],
  },
});
