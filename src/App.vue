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
      <button @click="downloadSvg">Download</button>
    </div>
    <svg
      ref="svg"
      width="100%"
      preserveAspectRatio="none"
      xmlns="http://www.w3.org/2000/svg"
      shape-rendering="crispEdges"
    ></svg>
  </div>
</template>

<script>
import throttle1 from 'lodash/fp/throttle';
import { saveAs } from 'file-saver';

import LoadAudio from './LoadAudio.vue';

const SVG_NS = 'http://www.w3.org/2000/svg';

const throttle = throttle1.convert({ fixed: false });

function removeAllChildNodes(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export default {
  components: {
    LoadAudio,
  },
  data: () => ({
    peaks: null,
    rowHeight: 100,
    numRows: 6,
    barsPerRow: 2000,
    samplesPerBar: 100,
  }),
  computed: {
    totalHeight() {
      return this.rowHeight * this.numRows;
    },
    halfRowHeight() {
      return this.rowHeight / 2;
    },
    numBars() {
      return this.barsPerRow * this.numRows;
    },
  },
  watch: {
    peaks: 'render',
    numRows: 'render',
    rowHeight: 'render',
  },
  mounted() {
    this.resizeSvg();
  },
  methods: {
    resizeSvg() {
      this.$refs.svg.setAttribute('height', this.totalHeight);
      this.$refs.svg.setAttribute(
        'viewBox',
        `0 0 ${this.barsPerRow} ${this.totalHeight}`
      );
    },
    updatePeaks(peaks) {
      this.peaks = peaks;
    },
    render: throttle(
      200,
      function() {
        /* eslint-disable no-invalid-this */
        removeAllChildNodes(this.$refs.svg);
        if (!this.peaks) {
          return;
        }
        this.resizeSvg();
        for (let i = 0; i < this.numRows; i++) {
          const y = i * this.rowHeight + this.halfRowHeight;
          for (let j = 0; j < this.barsPerRow; j++) {
            const k = 2 * (i * this.barsPerRow + j);
            this.renderBar(j, y, this.peaks[k], this.peaks[k + 1]);
          }
        }
        /* eslint-enable no-invalid-this */
      },
      { leading: false }
    ),
    renderBar(x, y, min, max) {
      const line = document.createElementNS(SVG_NS, 'line');
      const maxY = y - max * this.halfRowHeight;
      const minY = y - min * this.halfRowHeight;
      line.setAttributeNS(null, 'x1', x);
      line.setAttributeNS(null, 'x2', x);
      line.setAttributeNS(null, 'y1', maxY);
      line.setAttributeNS(null, 'y2', minY);
      line.setAttributeNS(null, 'stroke', 'black');
      this.$refs.svg.appendChild(line);
    },
    downloadSvg() {
      saveAs(
        new Blob([this.$refs.svg.outerHTML], {
          type: 'application/svg+xml',
        }),
        'waveform-' + Date.now() + '.svg'
      );
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
