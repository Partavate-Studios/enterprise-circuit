import { defineStore } from 'pinia'
import { useEVM } from "./evm"
import networkDeployments from "../../libraries/galactic/networkDeployments"
import AvatarArtifact from '../../../evm/contract-artifacts/AvatarControls.json'
import { useContract } from './composables/contract'

//todo store data in chain specific storage

export const useAvatar = defineStore('avatar', {
  state: () => {
    return {
      contract: useContract('AvatarControls', AvatarArtifact.abi),
      evm: useEVM() as any,
      isLoaded: false,
      isLoading: false,

      chainstate: {
        haveAvatar: false as boolean,

        avatarsById: [] as string[],
        avatarsByAddress: [] as string[],

        myAvatarId: null,
        myAvatarName: null,

        avatarCount: null as number | null,
      },
    }
  },
  getters: {
    avatarContractAddress():string {
      if (this.evm.isSuppportedNetwork) {
        return networkDeployments[this.evm.chainId]['AvatarControls']
      }
      return ''
    },
    isConnected():boolean {
      return this.contract.isConnected
    },
    playerHasAvatar():boolean {
      return this.chainstate.haveAvatar
    },
    player():object {
      return {
        registered: this.chainstate.haveAvatar,
        name: this.chainstate.myAvatarName,
        address: this.evm.signerAddress,
        id: this.chainstate.myAvatarId
      }
    },
    namesById():string[] {
      return this.chainstate.avatarsById
    },
    namesByAddress():string[] {
      return this.chainstate.avatarsByAddress
    },
  },
  actions: {

    //controls
    async createAvatar(
      name:string,
      callbackSuccess:Function = ()=>{},
      callbackFailed:Function = ()=>{},
      callbackRejected:Function = ()=>{},
    ) {
      this.contract.call(
        'createAvatar',
        [name],
        callbackSuccess,
        callbackFailed,
        callbackRejected
      )
    },

    //setters (from network)
    async setAll() {
      if (this.isLoading) {
        return
      }
      this.isLoading = true
      await Promise.all([
        this.setAvatarCount(),
        this.setMyAvatarName(),
        this.setMyAvatarId(),
        this.setHaveAvatar()
      ])
      this.isLoaded = true
      this.isLoading = false
    },

    async setAvatarsByAddresses(addresses:string[number]) {
      for(let n:number = 0; n < addresses.length; n++) {
        await this.setAvatarByAddress[addresses[n]]
      }
    },

    async setAvatarByAddress(address:string) {

      this.chainstate.avatarsByAddress[address] = await
        this.getAvatarNameByAddress(address)
    },

    async setAvatarById(id:string) {
      this.chainstate.avatarsById[id] = await
        this.getAvatarNameById(id)
    },

    async setAvatarCount() {
      this.chainstate.avatarCount = await this.contract.read(
        'getAvatarCount'
      )
    },
    async setMyAvatarName() {
      this.chainstate.myAvatarName = await this.contract.read(
        'getMyAvatarName'
      )
    },
    async setMyAvatarId(){
      this.chainstate.myAvatarId = await this.contract.read(
        'getMyAvatarId'
      )
    },
    async setHaveAvatar(){
      this.chainstate.haveAvatar = await this.contract.read(
        'haveAvatar'
      )
    },

    //getters (return a value directly)

    async getAvatarIdByAddress(address:string) {
      const avatar = await this.contract.read(
        'getAvatarIdByAddress',
        [address]
      )
      return avatar
    },
    async getAvatarNameById(id:string) {
      const avatar = await this.contract.read(
        'getAvatarNameById',
        [id]
      )
      return avatar
    },
    async getAvatarNameByAddress(address:string) {
      const avatarName = await this.contract.read(
        'getAvatarNameByAddress',
        [address]
      )
      return avatarName
    },
    async hasAvatar(address:string) {
      const hasAvatar = await this.contract.read(
        'hasAvatar',
        [address]
      )
      return hasAvatar
    },

  }
})
