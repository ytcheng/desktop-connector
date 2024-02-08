import React, { ReactEventHandler, useCallback, useEffect, useState } from "react"
import { connect } from 'react-redux'
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import SettingsIcon from '@mui/icons-material/Settings';


import cx from "classnames"
import Avatar from "src/components/avatar"
import Dialog from "src/components/dialog"
import Button from "src/components/button"
import DropdownMenu from "src/components/dropdown-menu"
import Tooltip from "src/components/tooltip"
import useTailscale, {
  State,
  shallow,
  openTailscaleOnHost,
} from "src/tailscale"
import copyToClipboard from "src/lib/clipboard"
import {
  navigateToContainer,
  navigateToContainerLogs,
  openBrowser,
} from "src/utils"
import Icon from "src/components/icon"
import useTimedToggle from "src/hooks/timed-toggle"

type ConfirmLogoutAction = "logout" | "none"

const selector = (state: State) => ({
  backendState: state.backendState,
  loginUser: state.loginUser,
  connect: state.connect,
  disconnect: state.disconnect,
  logout: state.logout,
})
interface ContainerViewProps {
  toggleSettingView: ReactEventHandler;
}
/**
 * ContainerView is the main view of the Tailscale Docker extension. It shows
 * the list of containers and Tailscale URLs they can use to access them.
 */
function ContainerView(props: any) {
  const {domainSuffix, dockerLabel, toggleSettingView} = props
  const { backendState, loginUser, connect, disconnect, logout } = useTailscale(
    selector,
    shallow,
  )
  const [connecting, setConnecting] = useState(false)
  const [confirmLogoutAction, setConfirmLogoutAction] =
    useState<ConfirmLogoutAction>("none")

  const handleConnectClick = useCallback(async () => {
    setConnecting(true)
    await connect()
    setConnecting(false)
  }, [connect])

  const handleConfirmLogout = useCallback(() => {
    if (confirmLogoutAction === "logout") {
      logout()
    }
    setConfirmLogoutAction("none")
  }, [confirmLogoutAction, logout])

  return (
    <div>
      <Dialog
        open={confirmLogoutAction !== "none"}
        onOpenChange={(open) =>
          open ? undefined : setConfirmLogoutAction("none")
        }
        onConfirm={handleConfirmLogout}
        title="Log out?"
        action="Log out"
        destructive
      >
        <p>
          Logging out of Tailscale will disconnect all exposed ports. Any
          members of your Tailscale network using these Tailscale URLs will no
          longer be able to access your containers.
        </p>
      </Dialog>
      <header className="flex items-center justify-between pb-5">
        <div>
          <div className="font-semibold text-xl">Tailscale</div>
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <span className="mr-2">
              {backendState === "Stopped" ? "Signed in to" : "Connected to"}{" "}
              {loginUser?.tailnetName}
            </span>
            <Tooltip content="This is your tailnet name. Other members of your tailnet can connect to your public container ports.">
              <Icon className="text-gray-500" name="info" size="13" />
            </Tooltip>
          </div>
        </div>
        <div className="flex ml-auto space-x-3">
          {backendState === "Stopped" ? (
            <Button
              variant="minimal"
              loading={connecting}
              onClick={handleConnectClick}
            >
              Connect
            </Button>
          ) : (
            <>
            <Button variant="minimal" onClick={disconnect}>
              Disconnect
            </Button>
            <Button variant="minimal" onClick={toggleSettingView}>
              <SettingsIcon />
            </Button>
            </>
          )}
          <DropdownMenu
            asChild
            align="end"
            trigger={
              <button className="-ml-3 px-3 py-2 group rounded-lg flex items-center overflow-hidden transition focus:outline-none hover:bg-[rgba(31,41,55,0.05)] dark:hover:bg-[rgba(255,255,255,0.05)]  focus-visible:bg-[rgba(31,41,55,0.05)] dark:focus-visible:bg-[rgba(255,255,255,0.05)]">
                <Avatar
                  name={loginUser?.displayName || "Unknown"}
                  src={loginUser?.profilePicUrl}
                  className="w-6 h-6"
                />
                <Icon
                  className="ml-2 text-gray-500 group-hover:text-gray-400 group-focus:text-gray-400 transition-colors"
                  name="chevron-down"
                  size="16"
                />
              </button>
            }
          >
            <DropdownMenu.Group>
              <p className="font-medium min-w-[12rem]">
                {loginUser?.displayName}
              </p>
              <p className="opacity-80">{loginUser?.loginName}</p>
            </DropdownMenu.Group>
            <DropdownMenu.Separator />
            <DropdownMenu.Link href="https://tailscale.com/kb">
              Tailscale docs
            </DropdownMenu.Link>
            {loginUser?.isAdmin && (
              <DropdownMenu.Link href="https://login.tailscale.com/admin">
                Admin console
              </DropdownMenu.Link>
            )}
            <DropdownMenu.Link href="https://tailscale.com/download">
              Download Tailscale
            </DropdownMenu.Link>
            <DropdownMenu.Link href="https://tailscale.com/licenses/tailscale">
              Open Source Licenses
            </DropdownMenu.Link>
            <DropdownMenu.Separator />
            <DropdownMenu.Item
              onSelect={() => setConfirmLogoutAction("logout")}
            >
              Log out
            </DropdownMenu.Item>
          </DropdownMenu>
        </div>
      </header>
      {backendState === "Stopped" ? (
        <div className="flex flex-col items-center text-center max-w-lg mx-auto py-8">
          {/* TODO: refine the language in this state. */}
          <div className="mb-4">
            <Icon className="text-gray-300" name="offline" size="36" />
          </div>
          <h2 className="text-lg font-semibold mb-2">
            Tailscale is disconnected
          </h2>
          <p className="mb-8">
            Reconnect to continue sharing your containers with your private
            network.
          </p>
          <Button
            variant="primary"
            size="lg"
            loading={connecting}
            onClick={handleConnectClick}
          >
            Connect
          </Button>
        </div>
      ) : (
        <>
        <CollapsibleTable domainSuffix={domainSuffix} dockerLabel={dockerLabel}/>
        {/* <ContainerTable /> */}
        </>
      )}
    </div>
  )
}

const containerSelector = (state: State) => ({
  containers: state.containers,
  containerGroups: state.containerGroups,
  tailscaleIP: state.tailscaleIPs.length > 0 ? state.tailscaleIPs[0] : "",
  magicDNSEnabled: state.magicDNSStatus?.enabled || false,
  magicDNSName: state.magicDNSStatus?.dnsName || "",
})

function HostItem(props: {host: string}){
  const { host } = props;
  const [copied, setCopied] = useTimedToggle(false, 1000)
  const [showTooltip, setShowTooltip] = useState(false)
  const [persistTooltipCopy, setPersistTooltipCopy] = useTimedToggle(false, 200)
  const handleCopyClick = useCallback(() => {
    copyToClipboard(host)
    setShowTooltip(true)
    setPersistTooltipCopy(true)
    setCopied(true)
  }, [host, setPersistTooltipCopy, setCopied])
  return (
    <Tooltip
      asChild
      content={
        copied || persistTooltipCopy ? "Copied!" : "Copy URL to clipboard"
      }
      closeOnClick={false}
      open={showTooltip || copied}
      onOpenChange={setShowTooltip}
    >
    <button
      className={cx(tableButtonClass, "flex items-center max-w-full")}
      onClick={handleCopyClick}
    >
      <span className="truncate min-w-0">{host}</span>
      <Icon
        className="ml-1.5 text-gray-500 dark:text-gray-400 shrink-0"
        name={copied ? "check" : "clipboard"}
        size="14"
      />
    </button>
    </Tooltip>
  );
}
function Row(props: { row: ContainerGroup, dockerLabel:string, domainSuffix:string }) {
  const { row, dockerLabel, domainSuffix } = props;
  if (row.Type === "container"){
    return (
      <ContainerRow container={row.Containers[0]} indent={false} dockerLabel={dockerLabel} domainSuffix={domainSuffix}></ContainerRow>
    );
  }else{
    return (
      <ComposeRow row={row} dockerLabel={dockerLabel} domainSuffix={domainSuffix}></ComposeRow>
    );
  }
}
function ContainerRow(props: { container: Container, indent: boolean, dockerLabel:string, domainSuffix:string }){
  const { container, indent, dockerLabel, domainSuffix } = props;
  return (
    <TableRow>
      <TableCell></TableCell>
      <TableCell align="left">
        <Box marginLeft={indent?4:0}>
          <div className="flex items-center min-w-0">
            <Icon
              className={cx("mr-3 shrink-0", {
                "text-emerald-400 dark:text-green-300": true,
                "text-gray-400 dark:text-gray-600": false,
              })}
              name="container"
              size="24"
            />
            {container.Names.map((n) => n.slice(1).trim()).join(",")}
          </div>
        </Box>
      </TableCell>
      <TableCell align="left">{container.Image}</TableCell>
      <TableCell align="left">
        <List
        sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}
        aria-label="contacts"
        >
          {container.Labels["com.docker.compose.project"] && (
            <ListItem>
              <HostItem host={container.Labels["com.docker.compose.service"] + "." + container.Labels["com.docker.compose.project"] + "." + domainSuffix}></HostItem>
            </ListItem>
          )}
          {container.Config?.Hostname && (
            <ListItem>
              <HostItem host={container.Config.Hostname + "." + domainSuffix}></HostItem>
            </ListItem>
          )}
          {container.Names.map((name) => (
            <ListItem key={name}>
              <HostItem host={name.slice(1).trim() + "." + domainSuffix}></HostItem>
            </ListItem>
          ))}
          {container.Labels[dockerLabel] && container.Labels[dockerLabel].endsWith(domainSuffix) && (
            <ListItem>
              <HostItem host={container.Labels[dockerLabel]}></HostItem>
            </ListItem>
          )}
        </List>
      </TableCell>
      <TableCell align="left">
        <DropdownMenu
          asChild
          trigger={
            <button className={cx(tableIconButtonClass)}>
              <Icon name="more" size="1.25em" />
            </button>
          }
        >
          <DropdownMenu.Separator />
          <DropdownMenu.Item
            onSelect={() => navigateToContainer(container.Id)}
          >
            View container
          </DropdownMenu.Item>
          <DropdownMenu.Item
            onSelect={() => navigateToContainerLogs(container.Id)}
          >
            View logs
          </DropdownMenu.Item>
        </DropdownMenu>
      </TableCell>
    </TableRow>
  );
}
function ComposeRow(props: { row: ContainerGroup,dockerLabel:string, domainSuffix:string }){
  const { row, dockerLabel, domainSuffix } = props;
  const [open, setOpen] = React.useState(false);
  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }}>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell align="left">
          <div className="flex items-center min-w-0">
            <Icon
              className={cx("mr-3 shrink-0", {
                "text-emerald-400 dark:text-green-300": true,
                "text-gray-400 dark:text-gray-600": false,
              })}
              name="compose"
              size="24"
            />
            {row.Name}
          </div>
        </TableCell>
        <TableCell align="left"></TableCell>
        <TableCell align="left"></TableCell>
        <TableCell align="left"></TableCell>
      </TableRow>
      {row.Type === "group" && open &&
        row.Containers.map((container:Container) => (
          <ContainerRow key={container.Id} container={container} indent={true} dockerLabel={dockerLabel} domainSuffix={domainSuffix}/>
        ) )
      }
    </React.Fragment>
  );
}
function CollapsibleTable(props:{dockerLabel:string, domainSuffix:string}) {
  const {domainSuffix, dockerLabel} = props
  const {containerGroups } =
    useTailscale(containerSelector, shallow)
  return (
    <>
    <HostWarning />
    {Object.keys(containerGroups).length > 0 ? (
    <TableContainer component={Paper}>
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow>
            <TableCell sx={{width: 10}}/>
            <TableCell align="left">Name</TableCell>
            <TableCell align="left">Image</TableCell>
            <TableCell align="left" sx={{minWidth: 300}}>Host</TableCell>
            <TableCell align="left"></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {Object.values(containerGroups).map((row:ContainerGroup) => (
            <Row key={row.Name} row={row} domainSuffix={domainSuffix}  dockerLabel={dockerLabel}/>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
    ) : (
      <div className="text-center py-12">
          <p className="text-xl font-medium mb-1">No containers are running.</p>
          <p className="help-text">Go to the Containers tab to get started.</p>
        </div>
    )}
    </>
  );
}

// const borderColor = "border-gray-200 dark:border-[rgba(255,255,255,0.09)]"
// const tablePadding = "px-2 h-14"
// const tableHeaderClass = cx(
//   "uppercase tracking-wider text-gray-700 dark:text-gray-200 text-xs border-b select-none",
//   tablePadding,
//   borderColor,
// )
// const tableCellClass = cx(tablePadding, borderColor)
const tableIconButtonClass =
  "text-gray-600 dark:text-gray-300 focus:outline-none enabled:hover:bg-[rgba(31,41,55,0.05)] enabled:dark:hover:bg-[rgba(255,255,255,0.05)] focus-visible:bg-[rgba(31,41,55,0.05)] dark:focus-visible:bg-[rgba(255,255,255,0.05)] px-2 py-2 rounded disabled:opacity-50"
const tableButtonClass = "focus:outline-none focus-visible:ring"

const hostWarningSelector = (state: State) => ({
  hostStatus: state.hostStatus,
  loginName: state.loginUser?.loginName,
  fetchHostStatus: state.fetchHostStatus,
})

/**
 * HostWarning shows a warning when the state of the user's host device is
 * configured in a way that prevents access.
 */
function HostWarning() {
  const { loginName, hostStatus, fetchHostStatus } =
    useTailscale(hostWarningSelector, shallow)
  const [showHostWarning, setShowHostWarning] = useState(true) // TODO: replace with sticky "does host have Tailscale" condition

  useEffect(() => {
    fetchHostStatus()
  }, [fetchHostStatus])

  if (
    !showHostWarning ||
    !loginName ||
    hostStatus.status === "unknown" ||
    (hostStatus.status === "running")
  ) {
    return null
  }

  const messages: { title: string; description: React.ReactNode } =
    hostStatus.status === "installed"
      ? {
          title: "Your host device is not running Tailscale",
          description: (
            <>
              Tailscale is installed on your host device, but is not running.
              Open Tailscale and log in on your host device to access private
              Tailscale URLs.
            </>
          ),
        }
      : hostStatus.status === "not-installed" 
      ? {
          title: `Your host device is not running Tailscale`,
          description:
            "Tailscale is not installed on your host device. Please install it to access these container URLs.",
        }
        : 
        {title: "", description: ""}

  return (
    <div className="flex flex-col items-start px-4 py-4 mb-4 rounded-md bg-faded-gray-5 dark:bg-docker-dark-gray-700">
      <h3 className="font-semibold text-base mb-2">{messages.title}</h3>
      <p className="mb-4 max-w-3xl text-gray-700 dark:text-gray-200">
        {messages.description}
      </p>
      <div className="flex space-x-2">
        <Button onClick={() => setShowHostWarning(false)}>Close</Button>
        {hostStatus.status === "installed" ? (
          <Button onClick={openTailscaleOnHost}>Open Tailscale</Button>
        ) : hostStatus.status === "not-installed" ? (
          <Button onClick={() => openBrowser("https://tailscale.com/download")}>
            Download Tailscale
          </Button>
        ) : ""}
      </div>
    </div>
  )
}
export default connect<ContainerViewProps>((state: any) => state.setting, {
})(ContainerView)