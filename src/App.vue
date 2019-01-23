<template>
  <div :class="$style.container">
    <div :class="$style.controls">
      <md-field>
        <label>Row Height</label>
        <md-input type="number" v-model.number="rowHeight" />
      </md-field>
      <md-field>
        <label>Number of Rows</label>
        <md-input type="number" v-model.number="numRows" />
      </md-field>
      <md-field>
        <label>Bars Per Row</label>
        <md-input type="number" v-model.number="barsPerRow" />
      </md-field>
      <md-field>
        <label>Samples Per Bar</label>
        <md-input type="number" v-model.number="samplesPerBar" />
      </md-field>
      <md-field>
        <label>Row Spacing</label>
        <md-input type="number" v-model.number="rowSpacing" />
      </md-field>
    </div>
    <div :class="$style.row">
      <load-audio
        :num-bars="numBars"
        :samples-per-bar="samplesPerBar"
        @update="updatePeaks"
      />
      <md-button class="md-raised md-primary" :disabled="!peaks" @click="render"
        >Render</md-button
      >
    </div>
    <waveform
      :peaks="renderPeaks"
      :num-rows="numRows"
      :row-height="rowHeight"
      :bars-per-row="barsPerRow"
      :row-spacing="rowSpacing"
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
    renderPeaks: null,
    rowHeight: 100,
    numRows: 6,
    barsPerRow: 2000,
    samplesPerBar: 100,
    rowSpacing: 0,
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
    render() {
      this.renderPeaks = this.peaks;
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
  display: flex;
  flex-wrap: wrap;
  justify-content: space-between;

  > * {
    width: 48%;
  }
}

.row {
  display: flex;
  align-items: center;

  > :first-child {
    margin: 15px 15px 15px 0;
  }

  > :last-child {
    margin: 15px 0 15px 15px;
  }
}
</style>
