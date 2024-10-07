<template>
  <div :class="$style.container">
    <load-audio
      :num-bars="numBars"
      :samples-per-bar="samplesPerBar"
      @update="updatePeaks"
      @progress="updatePeaksProgress"
    />
    <md-progress-bar
      v-if="peaksProgress >= 0"
      :class="$style.progressBar"
      md-mode="buffer"
      :md-value="renderProgress"
      :md-buffer="peaksProgress"
    />
    <waveform
      :peaks="peaks"
      :num-rows="numRows"
      :row-height="rowHeight"
      :bars-per-row="barsPerRow"
      :row-spacing="rowSpacing"
      :render-signal="renderSignal"
      @progress="updateRenderProgress"
    />
  </div>
</template>

<script lang="ts">
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
    barsPerRow: 4000,
    samplesPerBar: 250,
    rowSpacing: 55,
    renderSignal: false,
    renderProgress: 0,
    peaksProgress: -1,
  }),
  computed: {
    numBars() {
      return this.barsPerRow * this.numRows;
    },
  },
  methods: {
    updatePeaks(peaks) {
      this.peaks = peaks;
      this.renderSignal = !this.renderSignal;
    },
    updatePeaksProgress(peaksProgress) {
      this.peaksProgress = peaksProgress;
      this.renderProgress = 0;
    },
    updateRenderProgress(renderProgress) {
      this.renderProgress = renderProgress;
    },
  },
};
</script>

<style lang="scss" module>
.container {
  margin: 20px auto;
  width: 600px;
}
</style>
