class AudioEngine {
  constructor() {
    this.context = null;
    this.byteBeatNode = null;
    this.sampleTime = 8000;
    this.isPlaying = false;
    this.position = 0;
    this.lastUpdateTime = 0;
  }

  /**
   * Initializes the audio context and sets up the ByteBeatNode.
   * Automatically called on first play().
   * @throws {Error} If there's an issue initializing the audio context.
   */
  async initialize() {
    if (!this.byteBeatNode) {
      this.context = new (window.AudioContext || window.webkitAudioContext)();
      await this.context.resume();
      await ByteBeatNode.setup(this.context);
      this.byteBeatNode = new ByteBeatNode(this.context);
      this.byteBeatNode.setType(ByteBeatNode.Type.byteBeat);
      this.byteBeatNode.setExpressionType(ByteBeatNode.ExpressionType.infix);
      this.byteBeatNode.setDesiredSampleRate(this.sampleTime);

      this.stack = await this.byteBeatNode.createStack();
      return true;
    }
  }

  /**
   * Sets the desired sample rate for the ByteBeat.
   * @param {number} sampleTime - The desired sample rate in seconds.
   * @throws {Error} If an error occurs during setting the sample rate.
   * */
  setSampleRate(sampleTime = 8000) {
    try {
      this.sampleTime = sampleTime;
      if (this.byteBeatNode) {
        this.byteBeatNode.setDesiredSampleRate(sampleTime);
      }
    } catch (error) {
      console.error("Error setting sample rate:", error);
      throw error;
    }
  }
  /**
   * Starts playing the ByteBeat.
   * Initializes the audio context if not done already.
   * @throws {Error} If an error occurs during playback.
   */
  async play() {
    if (this.isPlaying) return false;

    if (!this.byteBeatNode) {
      await this.initialize();
    }

    try {
      await this.initialize();
      this.byteBeatNode.connect(this.context.destination);
      await this.context.resume();
      this.isPlaying = true;
      return true; // Retorna true si se ha comenzado a reproducir
    } catch (error) {
      console.error("Error starting ByteBeat:", error);
      throw error;
    }
  }

  /**
   * Pauses the currently playing ByteBeat audio.
   * If audio is not playing, this method has no effect.
   */
  async pause() {
    if (!this.byteBeatNode) {
      await this.initialize();
    }
    if (!this.isPlaying) return false;
    this.byteBeatNode.disconnect();
    this.isPlaying = false;
    return true;
  }

  /**
   * Stop the currently playing ByteBeat audio.
   * If audio is not playing, just reset the timer
   */
  async stop() {
    if (!this.byteBeatNode) return true;
    this.byteBeatNode.reset();
    if (!this.isPlaying) return;
    this.byteBeatNode.disconnect();
    this.isPlaying = false;
    return true;
  }

  async getSamplesForVisualization(width) {
    if (!this.byteBeatNode) {
      await this.initialize();
    }

    const now = performance.now();
    const elapsedTimeMS = now - this.lastUpdateTime;
    this.lastUpdateTime = now;

    if (this.isPlaying) {
      const startTime = this.position;
      const endTime =
        (startTime +
          elapsedTimeMS * 0.001 * this.byteBeatNode.getDesiredSampleRate()) |
        0;
      const duration = endTime - startTime;
      this.position = endTime;

      const context = await this.byteBeatNode.createContext();

      const leftValues = await this.byteBeatNode.getSamplesForTimeRange(
        startTime,
        endTime,
        width,
        context,
        this.stack,
        0
      );
      const rightValues = await this.byteBeatNode.getSamplesForTimeRange(
        startTime,
        endTime,
        width,
        context,
        this.stack,
        1
      );

      return { left: leftValues, right: rightValues };
    }

    return null;
  }
  /**
   * Reset the timer
   */
  async reset() {
    this.position = 0;
    this.lastUpdateTime = 0;

    if (this.byteBeatNode) {
      this.byteBeatNode.reset();
    }
  }

  /**
   *
   * @returns the current time in seconds
   */
  getTime() {
    if (!this.byteBeatNode) return 0;

    const time = this.byteBeatNode.getTime() ?? 0;
    return time;
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
