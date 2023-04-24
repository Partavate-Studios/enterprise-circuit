<script setup lang="ts">
import LogoMetaMask from '../../assets/sprites/LogoMetaMask.svg.vue'
import LogoEthereum from '../../assets/graphics/LogoEthereum.svg.vue'
import LogoOrbiter8 from '../../assets/sprites/LogoOrbiter8.svg.vue'
</script>

<script lang="ts">
export default {
  props: {
    walletConnected: {
      type: Boolean,
      default: false
    },
    networkConnected: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
    }
  },
  async mounted() {
  },
  watch: {
  },
  methods: {
  },
  computed: {
    showConnector () {
      if (!this.walletConnected || !this.networkConnected) {
        return true
      }
      return false
    },
    connectorOffset () {
      if (!this.walletConnected) {
        return -125
      }
      return 125
    },
    leftLineColor () {
      if (!this.walletConnected) {
        return '#ffffaa'
      }
      return '#aaffaa'
    },
    rightLineColor () {
      if (this.walletConnected && !this.networkConnected) {
        return '#ffffaa'
      } else if (this.networkConnected) {
        return '#aaffaa'
      }
      return '#88888888'
    }
  }
}
</script>

<template>
    <g>
      <g transform="translate(-125 0)">
        <line 
          x1="-50" y1="0" 
          x2="50" y2="0"
          stroke-width="4"
          stroke-linecap="round" 
          stroke-dasharray="4 8"
          :stroke="leftLineColor"
        />
      </g>
      <g transform="translate(125 0)">
        <line 
          x1="-50" y1="0" 
          x2="50" y2="0"
          stroke-width="4"
          stroke-linecap="round" 
          stroke-dasharray="4 8"
          :stroke="rightLineColor"
        />
      </g>
      <g :transform="'translate(' + connectorOffset + ' 0)'" v-if="showConnector">
        <g>
          <g>
            <circle 
              cx="0" cy="0" 
              fill="#444444" 
              stroke="#ffffaa"
              stroke-width="2"
              r="6" />
            <animateTransform
              attributeName="transform"
              attributeType="XML"
              type="scale"
              values="1.5; 1; 1.5;"
              dur="1s"
              repeatCount="indefinite"
            />
          </g>
        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="translate"
          values="0, 0; -60, 0; 0, 0; 60, 0; 0, 0"
          dur="2s"
          repeatCount="indefinite"
          animation-timing-function="ease-in-out"
        />
        </g>
      </g>



      <g fill="#fffffff" fill-opacity="0.05" stroke-width="4" stroke-opacity="0.5">
        <g transform="translate(-250 0)" stroke="#aaffaa">
          <rect x="-60" y="-60" width="120" height="120"  rx="20" ry="20"/>
        </g>
        <g transform="translate(0 0)" :stroke="leftLineColor">
          <rect x="-60" y="-60" width="120" height="120"  rx="20" ry="20"/>
        </g>
        <g transform="translate(250 0)" :stroke="rightLineColor">
          <rect x="-60" y="-60" width="120" height="120"  rx="20" ry="20"/>
        </g>
      </g>
      <g transform="translate(-250 0)">
        <LogoOrbiter8 transform="scale(0.15)" />
      </g>
      <g transform="translate(0 0)">
        <LogoMetaMask transform="scale(2) " />
      </g>
      <g transform="translate(250 0)">
        <LogoEthereum transform="scale(0.5)" />
      </g>
    </g>
</template>

<style scoped>
</style>
