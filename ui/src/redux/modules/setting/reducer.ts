import produce from 'immer'
// import { UnknownAction } from 'redux'

import * as types from 'src/redux/constant'
import { SettingState } from 'src/redux/interface'

const userState: SettingState = {
    domainSuffix: '',
    dockerLabel: '',
    accessToken: '',
    authKey:'',
    // permissions: []
}

// setting reducer
const setting = (state: SettingState = userState, action: any) =>
    produce(state, (draftState) => {
        switch (action.type) {
            case types.SET_TOKEN:
                draftState.accessToken = action.accessToken;
                break   
            case types.SET_AUTH_KEY:
                draftState.authKey = action.authKey;
                break;
            case types.SAVE_CONFIG:
                draftState.accessToken = action.accessToken;
                draftState.domainSuffix = action.domainSuffix;
                draftState.dockerLabel = action.dockerLabel;
                break;
            default:
                return draftState
        }
    })

export default setting