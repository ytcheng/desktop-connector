import { combineReducers, legacy_createStore as createStore } from 'redux'
import { persistReducer, persistStore } from 'redux-persist'
import storage from 'redux-persist/lib/storage'
// import thunk from 'redux-thunk'

// import menu from './modules/menu/reducer'
// import theme from './modules/theme/reducer'
import setting from 'src/redux/modules/setting/reducer'
import { PERSIT_CONFIG_MU } from 'src/redux/constant'

// Reducer function resolution
const reducer = combineReducers({
    // menu,
    setting,
    // theme
})

// persitConfig configuration information
const persitConfig = {
    key: PERSIT_CONFIG_MU,
    storage: storage,
    whitelist:['setting']
}

// create configuration persist information
const persist_reducers = persistReducer(persitConfig, reducer)

// Solve the problem that the same function supports multiple dispatches and asynchronous actions in React development
let store = createStore(persist_reducers)

const persistor = persistStore(store)

const clearPersistor = () => {
    localStorage.removeItem(`persist:${PERSIT_CONFIG_MU}`)
}
export { clearPersistor, persistor, store }