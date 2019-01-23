<template>
  <md-field>
    <label>Upload Audio File</label>
    <md-file accept="audio/*" placeholder="song.mp3" @md-change="loadFile" />
  </md-field>
</template>

<script>
// For an array of arrays of the same length, average the values at index
// j of each array.
function average(lsls, j) {
  let n = 0;
  for (let i = 0; i < lsls.length; i++) {
    n += lsls[i][j];
  }
  return n / lsls.length;
}

export default {
  props: {
    numBars: { type: Number, required: true },
    samplesPerBar: { type: Number, required: true },
  },
  data: () => ({
    audioContext: null,
    audioBuffer: null,
  }),
  computed: {
    peaks() {
      if (!this.audioBuffer) {
        return null;
      }

      const channels = new Array(this.audioBuffer.numberOfChannels);
      for (let i = 0; i < this.audioBuffer.numberOfChannels; i++) {
        channels[i] = this.audioBuffer.getChannelData(i);
      }

      const peaks = new Array(this.numBars * 2);
      const sampleSize = this.audioBuffer.length / this.numBars;
      const sampleStep = Math.floor(sampleSize / this.samplesPerBar) || 1;

      for (let i = 0; i < this.numBars; i++) {
        const start = Math.floor(i * sampleSize);
        const end = start + sampleSize;

        let min = 0;
        let max = 0;

        for (let j = start; j < end; j += sampleStep) {
          const value = average(channels, j);
          if (value > max) {
            max = value;
          }
          if (value < min) {
            min = value;
          }
        }

        peaks[i * 2] = Math.max(-1, min);
        peaks[i * 2 + 1] = Math.min(1, max);
      }
      return peaks;
    },
  },
  watch: {
    peaks(val) {
      this.$emit('update', val);
    },
  },
  methods: {
    loadFile(files) {
      if (files.length === 0) {
        this.peaks = null;
        return;
      }
      const reader = new FileReader();
      reader.addEventListener('load', e => {
        this.decodeAudioData(e.target.result);
      });
      reader.addEventListener('error', console.error);
      reader.readAsArrayBuffer(files[0]);
    },
    decodeAudioData(arrayBuffer) {
      this.audioContext = new OfflineAudioContext(1, 2, 44100);
      this.audioContext.decodeAudioData(
        arrayBuffer,
        audioBuffer => {
          this.audioBuffer = audioBuffer;
        },
        console.error
      );
    },
  },
};
</script>
