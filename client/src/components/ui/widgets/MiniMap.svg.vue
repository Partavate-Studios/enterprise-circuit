<script setup lang="ts">
import { useWorld } from '../../../stores/world'
import { useScreen } from '../../../stores/screen'
</script>

<script lang="ts">
export default {
	name: 'MiniMap',
	data() {
		return {
			world: useWorld(),
			screen: useScreen(),
			divider: 14,
		}
	},
	computed: {
		width() {
			return this.screen.width / this.divider
		},
		height() {
			return this.screen.height / this.divider
		},
		scaler() {
			return 0.125 / this.world.getZoomLevel
		},
		miniWidth() {
			return Math.max(this.width / 12, this.scaler * this.width)
		},
		miniHeight() {
			return Math.max(this.height / 12, this.scaler * this.height)
		},
		miniX() {
			return this.miniWidth / -2 - this.world.getViewPoint.x / (this.divider * 8)
		},
		miniY() {
			return this.miniHeight / -2 - this.world.getViewPoint.y / (this.divider * 8)
		},
		border() {
			return 2200 / this.divider
		},
	},
}
</script>

<template>
	<g>
		<mask id="minimask">
			<rect :x="border / -2" :y="border / -2" :width="border" :height="border" fill="#ffffff" />
		</mask>
		<g mask="url(#minimask)">
			<rect
				:x="border / -2"
				:y="border / -2"
				:width="border"
				:height="border"
				fill="#000000"
				fill-opacity="0.5"
				stroke="#ffffff"
				stroke-opacity="0.5"
			/>

			<rect
				:x="miniX"
				:y="miniY"
				:width="miniWidth"
				:height="miniHeight"
				fill="#ffffff"
				fill-opacity="0.1"
				stroke-width="10"
				stroke="#ffffff"
				stroke-opacity="0.1"
			/>
			<rect
				:x="miniX"
				:y="miniY"
				:width="miniWidth"
				:height="miniHeight"
				fill="none"
				fill-opacity="0.1"
				stroke-width="0.5"
				stroke="#ffffff"
				stroke-opacity="1"
			/>

			<circle cx="0" cy="0" :r="40 / divider" stroke-width="0" fill="#ffffff" fill-opacity="1" />
			<circle cx="0" cy="0" :r="120 / divider" stroke-width="0" fill="#ffffff" fill-opacity="0.2" />
		</g>
	</g>
</template>
