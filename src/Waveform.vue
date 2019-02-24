<template>
  <md-card :md-with-hover="canDownloadSvg" :class="$style.card">
    <md-ripple v-if="canDownloadSvg">
      <canvas
        v-show="showCanvas"
        ref="canvas"
        style="width: 100%"
        @click="download"
      ></canvas>
    </md-ripple>
    <canvas
      v-else
      v-show="showCanvas"
      ref="canvas"
      style="width: 100%"
    ></canvas>
  </md-card>
</template>

<script>
import { saveAs } from 'file-saver';

import { asyncFor } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

export default {
  props: {
    canDownloadSvg: { type: Boolean, default: false },
    peaks: { type: Array, default: null },
    numRows: { type: Number, required: true },
    rowHeight: { type: Number, required: true },
    barsPerRow: { type: Number, required: true },
    rowSpacing: { type: Number, required: true },
    renderSignal: { type: Boolean, required: true },
  },
  data: () => ({
    svg: null,
    showCanvas: false,
    downloadReady: false,
  }),
  computed: {
    totalHeight() {
      return (
        this.rowHeight * this.numRows + this.rowSpacing * (this.numRows - 1)
      );
    },
    halfRowHeight() {
      return this.rowHeight / 2;
    },
    numBars() {
      return this.barsPerRow * this.numRows;
    },
  },
  watch: {
    renderSignal: 'render',
  },
  methods: {
    render() {
      if (this.canDownloadSvg) {
        this.svg = document.createElementNS(SVG_NS, 'svg');
        this.svg.setAttribute('xmlns', SVG_NS);
        this.svg.setAttribute('width', '100%');
        this.svg.setAttribute('height', this.totalHeight);
        this.svg.setAttribute(
          'viewBox',
          `0 0 ${this.barsPerRow} ${this.totalHeight}`
        );
        this.svg.setAttribute('preserveAspectRatio', 'none');
        this.svg.setAttribute('shape-rendering', 'crispEdges');
      }

      this.$refs.canvas.style.height = `${this.totalHeight}px`;
      this.$refs.canvas.setAttribute('height', this.totalHeight);
      this.$refs.canvas.setAttribute('width', this.barsPerRow);

      this.downloadReady = false;
      if (!this.peaks) {
        this.showCanvas = false;
        return;
      }
      this.showCanvas = true;

      const progressStep = Math.floor(this.numBars / 20) || 1;
      asyncFor(
        this.numBars,
        i => {
          if (i % progressStep === 0) {
            this.$emit('progress', (i * 100) / this.numBars);
          }
          const row = Math.floor(i / this.barsPerRow);
          const y =
            row * (this.rowHeight + this.rowSpacing) + this.halfRowHeight;
          const x = i % this.barsPerRow;
          const k = 2 * (row * this.barsPerRow + x);
          this.renderLine(x, y, this.peaks[k], this.peaks[k + 1]);
        },
        () => {
          this.$emit('progress', 100);
          this.downloadReady = true;
        }
      );
    },
    renderLine(x, y, min, max) {
      const y1 = y - max * this.halfRowHeight;
      const y2 = y - min * this.halfRowHeight;

      const ctx = this.$refs.canvas.getContext('2d');
      ctx.strokeStyle = '#000000';
      ctx.beginPath();
      ctx.moveTo(x, y1);
      ctx.lineTo(x, y2);
      ctx.stroke();

      if (!this.canDownloadSvg) {
        return;
      }

      const line = document.createElementNS(SVG_NS, 'line');
      line.setAttributeNS(null, 'x1', x);
      line.setAttributeNS(null, 'x2', x);
      line.setAttributeNS(null, 'y1', y1);
      line.setAttributeNS(null, 'y2', y2);
      line.setAttributeNS(null, 'stroke', 'black');
      this.svg.appendChild(line);
    },
    download() {
      if (!this.canDownloadSvg || !this.downloadReady) {
        return;
      }
      saveAs(
        new Blob([this.svg.outerHTML], {
          type: 'application/svg+xml',
        }),
        'waveform-' + Date.now() + '.svg'
      );
    },
  },
};
</script>

<style lang="scss" module>
.card {
  margin: 15px 0;
}
</style>
