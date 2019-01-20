<template>
  <div id="app">
    <div>
      <input type="file" accept="audio/*" @change="onFileSelected" />
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
const SVG_NS = 'http://www.w3.org/2000/svg';

// For an array of arrays of the same length, average the values at index
// j of each array.
function average(lsls, j) {
  let n = 0;
  for (let i = 0; i < lsls.length; i++) {
    n += lsls[i][j];
  }
  return n / lsls.length;
}

function removeAllChildNodes(el) {
  while (el.firstChild) {
    el.removeChild(el.firstChild);
  }
}

export default {
  data: () => ({
    audioContext: null,
    audioBuffer: null,
    rowHeight: 100,
    numRows: 6,
    numBars: 10000,
    samplesPerBar: 100,
  }),
  computed: {
    totalHeight() {
      return this.rowHeight * this.numRows;
    },
    halfRowHeight() {
      return this.rowHeight / 2;
    },
    barsPerRow() {
      return Math.floor(this.numBars / this.numRows);
    },
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
  mounted() {
    this.resizeSvg();
  },
  methods: {
    resizeSvg() {
      this.$refs.svg.setAttribute('height', this.rowHeight * this.numRows);
      this.$refs.svg.setAttribute(
        'viewBox',
        `0 0 ${this.barsPerRow} ${this.rowHeight * this.numRows}`
      );
    },
    onFileSelected(e) {
      this.loadFile(e.currentTarget.files[0]);
    },
    loadFile(f) {
      const reader = new FileReader();
      reader.addEventListener('load', e => {
        this.decodeAudioData(e.target.result);
      });
      reader.addEventListener('error', console.error);
      reader.readAsArrayBuffer(f);
    },
    decodeAudioData(arrayBuffer) {
      this.audioContext = new OfflineAudioContext(1, 2, 44100);
      this.audioContext.decodeAudioData(
        arrayBuffer,
        audioBuffer => {
          this.audioBuffer = audioBuffer;
          this.render();
        },
        console.error
      );
    },
    render() {
      if (!this.peaks) {
        return;
      }
      removeAllChildNodes(this.$refs.svg);
      for (let i = 0; i < this.numRows; i++) {
        const y = i * this.rowHeight + this.halfRowHeight;
        for (let j = 0; j < this.barsPerRow; j++) {
          const k = 2 * (i * this.barsPerRow + j);
          this.renderBar(j, y, this.peaks[k], this.peaks[k + 1]);
        }
      }
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
  },
};
</script>
