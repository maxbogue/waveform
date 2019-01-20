<template>
  <div :class="$style.container">
    <div :class="$style.controls">
      <label>
        Row Height
        <input type="number" min="10" v-model.number="rowHeight" />
      </label>
      <label>
        Number of Rows
        <input type="number" min="1" v-model.number="numRows" />
      </label>
      <label>
        Bars Per Row
        <input type="number" min="1" v-model.number="barsPerRow" />
      </label>
      <label>
        Samples Per Bar
        <input type="number" v-model.number="samplesPerBar" />
      </label>
      <load-audio
        :num-bars="numBars"
        :samples-per-bar="samplesPerBar"
        @update="updatePeaks"
      />
    </div>
    <waveform
      :peaks="peaks"
      :num-rows="numRows"
      :row-height="rowHeight"
      :bars-per-row="barsPerRow"
    />
  </div>
</template>

<script>
import LoadAudio from './LoadAudio.vue';
import Waveform from './Waveform.vue';

export default {
  components: {
    LoadAudio,
    Waveform,
  },
  data: () => ({
    peaks: null,
    rowHeight: 100,
    numRows: 6,
    barsPerRow: 2000,
    samplesPerBar: 100,
  }),
  computed: {
    numBars() {
      return this.barsPerRow * this.numRows;
    },
  },
  methods: {
    updatePeaks(peaks) {
      this.peaks = peaks;
    },
  },
};
</script>

<style lang="scss" module>
.container {
  margin: 20px auto;
  width: 600px;
}
.controls {
  label {
    display: block;
  }
  input[type='number'] {
    width: 50px;
  }
}
</style>
