<template>
  <md-card md-with-hover>
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
      if (!this.peaks) {
        return;
      }
      const parent = svg.parentNode;
      parent.removeChild(svg);
      setTimeout(() => {
        for (let i = 0; i < this.numRows; i++) {
          const y = i * (this.rowHeight + this.rowSpacing) + this.halfRowHeight;
          for (let j = 0; j < this.barsPerRow; j++) {
            const k = 2 * (i * this.barsPerRow + j);
            this.renderBar(j, y, this.peaks[k], this.peaks[k + 1]);
          }
        }
        parent.appendChild(svg);
        this.resizeSvg();
      });
    },
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
