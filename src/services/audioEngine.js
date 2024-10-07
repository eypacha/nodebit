class AudioEngine {
  constructor() {
    this.context = null;
    this.byteBeatNode = null;
    this.isPlaying = false;
  }

  /**
     * Initializes the audio context and sets up the ByteBeatNode.
     * Automatically called on first play().
     * @throws {Error} If there's an issue initializing the audio context.
     */
  async initialize() {

    if (!this.context) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      await this.context.resume();
      await ByteBeatNode.setup(this.context);
      this.byteBeatNode = new ByteBeatNode(this.context);
      this.byteBeatNode.setType(ByteBeatNode.Type.byteBeat);
      this.byteBeatNode.setExpressionType(ByteBeatNode.ExpressionType.infix);
      this.byteBeatNode.setDesiredSampleRate(8000);
    }
  }

  /**
     * Starts playing the ByteBeat.
     * Initializes the audio context if not done already.
     * @throws {Error} If an error occurs during playback.
     */
  async play() {
    if (this.isPlaying) return false;

    try {
      await this.initialize();
      this.byteBeatNode.connect(this.context.destination);
      await this.context.resume();
      this.isPlaying = true;
      return true; // Retorna true si se ha comenzado a reproducir
    } catch (error) {
      console.error('Error starting ByteBeat:', error);
      throw error;
    }
  }

  /**
   * Pauses the currently playing ByteBeat audio.
   * If audio is not playing, this method has no effect.
   */
  pause() {
    if (!this.isPlaying) return false;

    this.byteBeatNode.disconnect();
    this.isPlaying = false;
    return true;
  }

  /**
   * Sets new expressions for the ByteBeat audio.
   * @param {string[]} expressions - An array of two strings representing 
   *                                 the expressions for left and right channels.
   * @throws {Error} If the ByteBeatNode is not initialized.
   * @example
   * audioService.setExpressions(['t >> 4', 't >> 5']);
   */
  setExpressions(expressions) {
    if (this.byteBeatNode) {
      this.byteBeatNode.setExpressions(expressions);
    }
  }

}

export const audioEngine = new AudioEngine();