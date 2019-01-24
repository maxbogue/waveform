<template>
  <md-card md-with-hover :class="$style.card">
    <md-ripple>
      <svg
        v-show="peaks"
        ref="svg"
        width="100%"
        height="0"
        preserveAspectRatio="none"
        xmlns="http://www.w3.org/2000/svg"
        shape-rendering="crispEdges"
        @click="downloadSvg"
      ></svg>
    </md-ripple>
  </md-card>
</template>

<script>
import { saveAs } from 'file-saver';

import { asyncFor } from './utils';

const SVG_NS = 'http://www.w3.org/2000/svg';

function removeAllChildNodes(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export default {
  props: {
    peaks: { type: Array, default: null },
    numRows: { type: Number, required: true },
    rowHeight: { type: Number, required: true },
    barsPerRow: { type: Number, required: true },
    rowSpacing: { type: Number, required: true },
    renderSignal: { type: Boolean, required: true },
  },
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
    resizeSvg() {
      if (!this.totalHeight) {
        return;
      }
      this.$refs.svg.setAttribute('height', this.totalHeight);
      this.$refs.svg.setAttribute(
        'viewBox',
        `0 0 ${this.barsPerRow} ${this.totalHeight}`
      );
    },
    render() {
      const svg = this.$refs.svg;
      removeAllChildNodes(svg);
      this.resizeSvg();
      if (!this.peaks) {
        return;
      }

      let frag = null;
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
          if (x === 0) {
            if (frag) {
              this.$refs.svg.appendChild(frag);
            }
            frag = document.createDocumentFragment();
          }

          const k = 2 * (row * this.barsPerRow + x);
          const line = this.renderLine(x, y, this.peaks[k], this.peaks[k + 1]);
          frag.appendChild(line);
        },
        () => {
          this.$emit('progress', 100);
          this.$refs.svg.appendChild(frag);
        }
      );
    },
    renderLine(x, y, min, max) {
      const line = document.createElementNS(SVG_NS, 'line');
      const maxY = y - max * this.halfRowHeight;
      const minY = y - min * this.halfRowHeight;
      line.setAttributeNS(null, 'x1', x);
      line.setAttributeNS(null, 'x2', x);
      line.setAttributeNS(null, 'y1', maxY);
      line.setAttributeNS(null, 'y2', minY);
      line.setAttributeNS(null, 'stroke', 'black');
      return line;
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
.card {
  margin: 15px 0;
}
</style>
