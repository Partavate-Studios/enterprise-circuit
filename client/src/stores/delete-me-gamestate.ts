import { defineStore } from 'pinia'
import { useAvatar } from './avatar'
import { useGalaxy } from '../stores/galaxy'
import { useEVM } from '../stores/evm'

export const useWorld = defineStore('gamestate', {
	state: () => {
		return {
			avatar: useAvatar(),
			galaxy: useGalaxy(),
			evm: useEVM(),
			updating: false,
			lastBlockLoaded: 0,
		}
	},
	getters: {
		isConnected(): boolean {
			return this.avatar.isConnected && this.galaxy.isConnected
		},
		unloadedBlock(): boolean {
			return this.lastBlockLoaded != this.evm.block
		},
	},
	actions: {
		async loadFromNetwork() {
			console.log('should not be called')
			let currentBlock = this.evm.block
			await Promise.all([
				//this.avatar.getAll(),
				this.galaxy.getAll(),
			])
			await this.avatar.setAvatarsByAddresses(this.galaxy.knownAddresses)
			this.lastBlockLoaded = currentBlock
		},
	},
})
