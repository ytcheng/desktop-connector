import { useState, Suspense, useEffect } from "react"
import Tooltip from "src/components/tooltip"
import useTailscale, {
  State,
  BackendState,
  shallow,
  subscribeToContainers,
} from "src/tailscale"
import {store, persistor} from 'src/redux/index';
import {Provider} from "react-redux";
import {PersistGate} from 'redux-persist/integration/react'  // 注意这里  

import { debounce } from "src/utils"
import useInterval from "src/hooks/interval"
import ContainerView from "src/views/container-view"
import LoadingView from "src/views/loading-view"
import NeedsAuthView from "src/views/needs-auth-view"
import OnboardingView from "src/views/onboarding-view"
import SettingView from "src/views/setting-view";

export default function App() {
  
  return (
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <Tooltip.Provider>
          <div className="text-sm h-full">
            <Suspense fallback={<LoadingView />}>
              <Router />
            </Suspense>
          </div>
        </Tooltip.Provider>
      </PersistGate>
    </Provider>
  )
}

const selector = (state: State) => ({
  initialized: state.initialized,
  backendState: state.backendState,
  loginUser: state.loginUser,
  fetchHostname: state.fetchHostname,
  fetchStatus: state.fetchStatus,
  fetchHostStatus: state.fetchHostStatus,
  fetchContainers: state.fetchContainers,
})
function Router() {
  const [isSettingViewOpen, setIsSettingViewOpen] = useState(false);
  const toggleSettingView = () => {
    setIsSettingViewOpen(!isSettingViewOpen);
  };
  const {
    initialized,
    backendState,
    loginUser,
    fetchHostname,
    fetchStatus,
    fetchHostStatus,
    fetchContainers,
  } = useTailscale(selector, shallow)

  const onboarding = showOnboarding(backendState, loginUser)

  useEffect(() => {
    fetchHostname()
  }, [fetchHostname])

  useEffect(() => {
    // Fetch containers whenever Docker tells us they change.

    // We debounce the fetch call to avoid requesting too many times when
    // containers start up or shut down. There's usually 3–5 events in quick
    // succession, but we only need to fetch once.
    const fetch = debounce((event) => {
      // console.log(
      //   "fetching because of event",
      //   event.Type,
      //   event.Action,
      //   event.time,
      // )
      fetchContainers()
    }, 600)
    const watcher = subscribeToContainers({
      onEvent: (event) => fetch(event),
      onError: (err) => {
        console.error("Docker error:", err)
      },
    })
    fetchContainers()
    if (typeof watcher === "undefined" || typeof watcher.close !== "function") {
      // Older versions of Docker don't have a close function.
      return
    }
    return () => {
      watcher.close()
    }
  }, [fetchContainers])

  useInterval(fetchStatus, 5000)
  useInterval(fetchHostStatus, 10000)

  if (!initialized) {
    return <LoadingView />
  }
  if (backendState === "NeedsMachineAuth") {
    return <NeedsAuthView />
  }
  if (onboarding) {
    return <OnboardingView />
  }
  if (isSettingViewOpen){
    return <SettingView  toggleSettingView={toggleSettingView}/>
  }
  return <ContainerView toggleSettingView={toggleSettingView}/>
}

const showOnboarding = (state: BackendState, user?: object) => {
  if (state === "NoState" || state === "NeedsLogin") {
    return true
  }
  if (state === "Stopped" && user === undefined) {
    return true
  }
  return false
}
