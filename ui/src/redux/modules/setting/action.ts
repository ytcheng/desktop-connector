import * as types from 'src/redux/constant'

// * setToken
export const setToken = (accessToken: string) => ({
    type: types.SET_TOKEN,
    accessToken
})
export const setAuthkey = (authKey: string) => ({
    type: types.SET_AUTH_KEY,
    authKey
})
export const saveConfig = (accessToken: string, domainSuffix: string, dockerLabel: string) => ({
    type: types.SAVE_CONFIG,
    accessToken, domainSuffix, dockerLabel
})