import { defineStore } from 'pinia'
import { ethers, formatEther } from 'ethers'
import deployments from '../../libraries/galactic/networkDeployments'
import networks from '../../libraries/galactic/networkDetails'
import { EIP1193Provider, useVueDapp } from '@vue-dapp/core'
import { computed, markRaw, ref } from 'vue'
import { useVueDappModal } from '@vue-dapp/modal'

export const useEVM = defineStore('wallet', () => {
	const provider = ref<ethers.BrowserProvider | null>(null)
	const signer = ref<ethers.JsonRpcSigner | null>(null)
	const balance = ref(0.0)
	const hasWallet = ref(false)
	const block = ref<number | null>(null)

	const { wallet, isConnected } = useVueDapp()

	// ====================== getters ======================

	const signerAddress = computed(() => signer.value?.address || '')

	const chainName = computed(() => {
		if (!wallet.chainId) return 'unknown network'
		if (networks.hasOwnProperty(wallet.chainId)) {
			return networks[wallet.chainId].name
		}
		return 'unknown network'
	})

	const isSuppportedNetwork = computed(() => {
		if (!wallet.chainId) return false
		return deployments.hasOwnProperty(wallet.chainId)
	})

	const shortSigner = computed(() => {
		const length = signerAddress.value.length
		if (length >= 8) {
			return signerAddress.value.substring(0, 5) + '...' + signerAddress.value.substring(length - 3)
		}
		return signerAddress.value
	})

	const currencyData = computed(() => {
		if (!wallet.chainId) return null
		if (networks.hasOwnProperty(wallet.chainId)) {
			return networks[wallet.chainId].currency
		}
		return {
			name: '',
			symbol: '',
			decimals: 18,
		}
	})

	const faucets = computed(() => {
		if (!wallet.chainId) return []
		if (networks.hasOwnProperty(wallet.chainId)) {
			return networks[wallet.chainId].faucets
		}
		return []
	})

	const explorer = computed(() => {
		if (!wallet.chainId) return ''
		if (networks.hasOwnProperty(wallet.chainId)) {
			return networks[wallet.chainId].explorer
		}
		return ''
	})

	// ============================== methods ==============================

	async function connect() {
		const { open } = useVueDappModal()
		open()
	}

	async function setWallet(p: EIP1193Provider) {
		provider.value = markRaw(new ethers.BrowserProvider(p))
		signer.value = markRaw(await provider.value.getSigner())
		hasWallet.value = true

		provider.value.on('block', (blockNumber: number) => {
			block.value = blockNumber
		})
	}

	function resetWallet() {
		provider.value = null
		signer.value = null
		hasWallet.value = false
	}

	async function getBalance() {
		if (!provider.value) return
		let bal = await provider.value.getBalance(signerAddress.value)
		balance.value = Number(formatEther(bal))
	}

	async function switchNetwork(chainId: number) {
		// todo
	}

	async function getContract(address: string, abi: any) {
		if (!signer.value) {
			throw new Error('No signer found')
		}
		const contract = new ethers.Contract(address, abi, signer.value)
		return contract
	}

	return {
		...useVueDapp(),
		chainId: computed(() => wallet.chainId || null),
		isConnected: computed(() => {
			return isConnected.value && !!signer.value
		}),

		provider,
		signer,
		balance,
		hasWallet,
		block,

		signerAddress,
		chainName,
		isSuppportedNetwork,
		shortSigner,
		currencyData,
		faucets,
		explorer,

		connect,
		setWallet,
		resetWallet,
		getBalance,
		switchNetwork,
		getContract,
	}
})

export const useEVMDeprecated = defineStore('wallet', {
	state: () => {
		return {
			isConnected: false,
			hasWallet: false,
			signer: null as ethers.Signer | null,
			signerAddress: '' as string,
			provider: null as ethers.providers.Web3Provider | null,
			chain: null as any,
			chainId: '' as string,
			block: null,
			switchingNetwork: false,
			deployments: deployments,
			balance: 0.0 as number,
		}
	},
	getters: {
		chainName(): string {
			if (networks.hasOwnProperty(this.chainId)) {
				return networks[this.chainId].name
			}
			return 'unknown network'
		},
		isSuppportedNetwork(): boolean {
			return deployments.hasOwnProperty(this.chainId)
		},
		shortSigner(): string {
			const length = this.signerAddress.length
			if (length >= 8) {
				return this.signerAddress.substring(0, 5) + '...' + this.signerAddress.substring(length - 3)
			}
			return this.signerAddress
		},
		currencyData(): object {
			if (networks.hasOwnProperty(this.chainId)) {
				return networks[this.chainId].currency
			}
			return {
				name: '',
				symbol: '',
				decimals: 18,
			}
		},
		faucets(): string {
			if (networks.hasOwnProperty(this.chainId)) {
				return networks[this.chainId].faucets
			}
			return []
		},
		explorer(): string {
			if (networks.hasOwnProperty(this.chainId)) {
				return networks[this.chainId].explorer
			}
			return ''
		},
	},
	actions: {
		async connect() {
			await this.init()

			try {
				await this.provider.send('eth_requestAccounts', [])
			} catch (e: any) {
				console.log(e.message)
				return
			}

			try {
				await this.getSigner()
			} catch (e: any) {
				console.log(e.message)
				return
			}

			await this.getChainData()
			await this.getBalance()

			this.isConnected = true
		},

		async init() {
			try {
				this.provider = new ethers.providers.Web3Provider(window.ethereum, 'any')
			} catch (e: any) {
				console.log(e.message)
				return
			}
			this.hasWallet = true
		},

		async getBalance() {
			let balance = await this.provider.getBalance(this.signerAddress)
			balance = ethers.utils.formatEther(balance)
			this.balance = Math.round(balance * 1e4) / 1e4
		},

		async getChainData() {
			try {
				this.chain = await this.provider.getNetwork()
			} catch (e: any) {
				cosnole.log(e.message)
				return
			}
			this.chainId = this.chain.chainId
		},

		async getSigner() {
			try {
				this.signer = await this.provider.getSigner()
				this.signerAddress = await this.signer.getAddress()
				console.log('signer is ', this.signerAddress)
			} catch (e: any) {
				console.log(e.message)
				return
			}
			this.applyEvents()
			console.log('Signer Address: ', this.signerAddress)
		},

		applyEvents() {
			window.ethereum.removeAllListeners()
			window.ethereum.on('accountsChanged', async () => {
				console.log('account changed')
				this.signer = null
				this.signerAddress = null
				this.isConnected = false
				this.getSigner()
				//todo: be more graceful
				window.location.reload()
			})
			window.ethereum.on('connected', async () => {
				console.log('account re-connected')
				this.isConnected = true
				this.getSigner()
			})
			window.ethereum.on('disconnect', async () => {
				console.log('account disconnected')
				if (!this.switchingNetwork) {
					this.signer = null
					this.signerAddress = ''
					this.isConnected = false
					//todo: be more graceful
					window.location.reload()
				}
			})
			window.ethereum.on('chainChanged', async () => {
				console.log('chain changed A')
				this.connect()
			})

			this.provider.removeAllListeners()
			this.provider.on('block', (blockNumber: Number) => {
				this.block = blockNumber
			})

			this.switchingNetwork = false
		},

		async switchNetwork(chainId: String) {
			this.switchingNetwork = true
			try {
				await window.ethereum.request({
					method: 'wallet_switchEthereumChain',
					params: [{ chainId: chainId }],
				})
			} catch (e) {
				console.log('Error requesting network.', e.message)
				/*
        refactor to add any chain

        if (confirm('Polygon Mainnet was not found. Would you like us to try to add it?')) {
          let data = [{
            chainId: chainId,
            chainName: 'Polygon Mainnet',
            nativeCurrency: {
              name: 'MATIC',
              symbol: 'MATIC',
              decimals: 18
            },
            rpcUrls: ['https://polygon-rpc.com'],
            blockExplorerUrls: ['https://polygonscan.com/']
          }]
          try {
            await window.ethereum.request({
              method: 'wallet_addEthereumChain',
              params: data
            });
          } catch (e) {
            console.log('Error requesting network.', e.message)
            store.alert = 'We were unable to add the network.'
          }
        }
        */
			}
			setTimeout(
				function () {
					this.switchingNetwork = false
				}.bind(this),
				500,
			)
		},

		async getContract(address: string, abi: any) {
			const contract = await new ethers.Contract(address, abi, this.signer)
			return contract
		},
	},
})
