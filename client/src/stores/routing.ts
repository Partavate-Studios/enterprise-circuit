import { defineStore } from 'pinia'

export const useRouting = defineStore('routing', {
  state: () => ({
    currentScreen: 'title',
  }),
  actions: {
    async switchScreen(newScreen:string) {
      //TODO: check to see if it's in an array
      this.currentScreen = newScreen
    },
  },
  getters: {
    screen: (state) => state.currentScreen,
    isScreen: (state) => {
      return (screen:string) => state.currentScreen === screen
    }
  }
})
