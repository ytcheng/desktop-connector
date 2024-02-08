import { useCallback, useState, ChangeEvent} from "react"
import { connect } from 'react-redux'
import { ReactComponent as TailscaleLogo } from "src/assets/tailscale-logo.svg"
import {TextField, Box, Button, Link} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import useInterval from "src/hooks/interval"
import useTailscale, { State, shallow } from "src/tailscale"
import { openBrowser } from "src/utils"
import { setToken, setAuthkey } from 'src/redux/modules/setting/action'
import { keys as listKeys,createKey, getPolicy, updatePolicy, deleteKey } from 'src/api/tailscale'
import { acl, keys, KeyExistError, keyItem} from 'src/api/tailscale/type'
import { useDockerDesktopClient } from 'src/docker';


const selector = (state: State) => ({
  hostname: state.hostname,
  fetchStatus: state.fetchStatus,
  login: state.login,
})

/**
 * OnboardingView is shown when users first install the Tailscale extension.
 * It explains Tailscale and asks them to sign in or create an account.
 */
function OnboardingView(props: any) {
  const ddClient = useDockerDesktopClient();
  const { setToken} = props

  const { fetchStatus, login } = useTailscale(
    selector,
    shallow,
  )
  const [accessToken, setAccessToken] = useState(props.accessToken)
  const [logining, setLogining] = useState(false)
  

  const handleAccessTokenChange= (event: ChangeEvent<HTMLInputElement>) => {
    setAccessToken(event.target.value);
    console.log(accessToken);
  }
  const handleAccessTokenSaveClick = useCallback(() => {
    setLogining(true);
    setToken(accessToken)

    //update policy
    getPolicy().then((res:acl) => {
      console.log(res)
      if(!res.tagOwners?.hasOwnProperty('tag:docker')){
        res.tagOwners['tag:docker'] = ["autogroup:admin"]
        updatePolicy(res).then(r => console.log(r))
      }
    }).catch(err => {
      ddClient.desktopUI.toast.error(err.message)
    })

    //create key
    listKeys().then((res:keys) => {
      console.log(res);
      let key = res.keys.find((key) => key.description === "docker");
      if(key){
        throw new KeyExistError("key exist",key.id)
      }
      return Promise.resolve(key)
    }).catch(err => {
      if(err instanceof KeyExistError){
        console.log(err)
        deleteKey(err.keyid)
      }
      ddClient.desktopUI.toast.error(err.message)
    }).then(()=>{
      return createKey({
        "capabilities": {
          "devices": {
            "create": {
              "reusable": false,
              "ephemeral": false,
              "preauthorized": false,
              "tags": [ "tag:docker" ]
            }
          }
        },
        "expirySeconds": 86400,
        "description": "docker"
      });
    }).then((key:keyItem)=>{
      if(key){
        login(key.key)
        .then(fetchStatus)
        .then(()=>{
          setLogining(false);
        });
      }
    })
  }, [setToken, accessToken, ddClient.desktopUI.toast,fetchStatus, login])

  useInterval(fetchStatus, 2500)

  return (
    <div>
      <div className="flex flex-col items-center py-24 text-center">
        <div className="mx-auto max-w-xl">
          <div className="flex items-center justify-center space-x-4 mb-8">
            <TailscaleLogo />
            <h1 className="text-3xl font-medium">desktop-connector</h1>
          </div>
          <h2 className="text-lg mb-12">
            Share exposed container ports onto your private Tailscale network.
            Tailscale makes it easy to collaborate on services with teammates,
            SSH into containers, and more.
          </h2>
        </div>
        <div className="flex space-x-3 mb-6">
          <Box
              sx={{
                width: 500,
                maxWidth: '100%',
              }}
            >
            <TextField
            size="small"
            label="API access tokens"
            value={accessToken}
            fullWidth
            InputLabelProps={{
              shrink: true,
            }}
            onChange={handleAccessTokenChange}
            ></TextField>
          </Box>
          <LoadingButton
            loading={logining}
            variant="contained"
            onClick={handleAccessTokenSaveClick}
            size="small"
          >
            OK
          </LoadingButton>
        </div>
        <p className="text-gray-600 dark:text-gray-300">
          你可以从
          <Link
            component="button"
            variant="body2"
            onClick={() => {
              openBrowser("https://login.tailscale.com/admin/settings/keys")
            }}
          >
            这里
          </Link>
          获取 api access token
        </p>
      </div>
      <div className="fixed bottom-8 left-12 right-12 flex px-5 py-4 bg-white dark:bg-docker-gray-700 shadow-popover dark:shadow-2xl rounded-lg">
        <div>
          <h3 className="font-semibold">New to Tailscale?</h3>
          <p>
            Learn how Tailscale works and how to use it with Docker in our docs.
          </p>
        </div>
        <div className="ml-auto">
          <Button
            variant="contained"
            onClick={() =>
              openBrowser("https://tailscale.com/kb/1184/docker-desktop/")
            }
          >
            Read docs
          </Button>
        </div>
      </div>
    </div>
  )
}
export default connect((state: any) => state.setting, {
  setToken,
  setAuthkey
})(OnboardingView)