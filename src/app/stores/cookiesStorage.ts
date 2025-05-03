import { getCookie, setCookie, removeCookie } from 'typescript-cookie'
import { StateStorage } from 'zustand/middleware'

const cookiesStorage: StateStorage = {
  getItem: (name: string) => {
    return getCookie(name) ?? null
  },
  setItem: (name: string, value: string) => {
    const jsonValue = JSON.parse(value)
    jsonValue.state.hasHydrated = false // Set hasHydrated to false when setting the cookie
    setCookie(name, JSON.stringify(jsonValue), { expires: 365, sameSite: 'Strict' })
  },
  removeItem: (name: string) => {
    removeCookie(name)
  }
}

export default cookiesStorage
