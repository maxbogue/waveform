<template>
  <md-field>
    <label>Upload Audio File</label>
    <md-file
      accept="audio/*"
      placeholder="Artist - Song.mp3"
      @md-change="loadFile"
    />
  </md-field>
</template>

<script lang="ts">
import { asyncFor } from './utils';

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
  watch: {
    numBars: 'computePeaks',
    samplesPerBar: 'computePeaks',
    audioBuffer: 'computePeaks',
  },
  methods: {
    loadFile(files) {
      if (files.length === 0) {
        return;
      }
      this.$emit('progress', 0);
      this.$emit('update', null);
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
    computePeaks() {
      if (!this.audioBuffer) {
        this.$emit('progress', 0);
        this.$emit('update', null);
        return;
      }

      const channels = new Array(this.audioBuffer.numberOfChannels);
      for (let i = 0; i < this.audioBuffer.numberOfChannels; i++) {
        channels[i] = this.audioBuffer.getChannelData(i);
      }

      const peaks = new Array(this.numBars * 2);
      const sampleSize = this.audioBuffer.length / this.numBars;
      const sampleStep = Math.floor(sampleSize / this.samplesPerBar) || 1;
      const progressStep = Math.floor(this.numBars / 20) || 1;

      asyncFor(
        this.numBars,
        i => {
          if (i % progressStep === 0) {
            this.$emit('progress', (i * 100) / this.numBars);
          }
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
        },
        () => {
          this.$emit('progress', 100);
          this.$emit('update', peaks);
        }
      );
    },
  },
};
</script>
