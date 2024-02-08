  import { Container, Typography, TextField, Button, Tooltip, IconButton } from "@mui/material";
  import { ReactEventHandler, useState } from "react";
  
  import { connect } from 'react-redux'
  import { saveConfig } from 'src/redux/modules/setting/action'
  import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
  import { useDockerDesktopClient } from 'src/docker';

  interface Settings {
    general: {
      apiAccessToken: string;
    };
    dns: {
      domainSuffix: string;
      dockerLabel: string;
    };
  }

  interface SettingViewProps {
    toggleSettingView: ReactEventHandler;
    apiAccessToken: string;
    domainSuffix: string;
    dockerLabel: string;
  }
  // function SettingView({toggleSettingView,apiAccessToken,domainSuffix,dockerLabel}:SettingViewProps) {
  function SettingView(props: any) {
    const ddClient = useDockerDesktopClient();
    const {accessToken, domainSuffix, dockerLabel, toggleSettingView, saveConfig} = props
    const [settings, setSettings] = useState<Settings>({
      general: {
        apiAccessToken: accessToken
      },
      dns:{
        domainSuffix:domainSuffix,
        dockerLabel:dockerLabel,
      }
    });
    console.log(settings);
    const handleSave = () => {
      saveConfig(settings.general.apiAccessToken, settings.dns.domainSuffix, settings.dns.dockerLabel)
      ddClient!.extension.vm!.cli.exec("/app/coredns-saveconfig.sh", ["--label="+settings.dns.dockerLabel, "--suffix="+settings.dns.domainSuffix]).then(()=>{
        ddClient.desktopUI.toast.success("save success")
        toggleSettingView();
      });
    };  
    const handleInputChange = (
      group: 'general' | 'dns',
      key: keyof Settings['general'] | keyof Settings['dns'],
      value: string
    ) => {
      setSettings((prevSettings) => ({
        ...prevSettings,
        [group]: {
          ...prevSettings[group],
          [key]: value,
        },
      }));
    };
    const settingDescriptions: Record<string, string> = {
      'apiAccessToken': 'This is the API Access Token used for general settings.',
      'domainSuffix': 'This is the domain suffix for DNS settings.',
      'dockerLabel': 'This is the Docker label for DNS settings.',
    };
    return (
      <div style={{ textAlign: 'left' }}>
        <header className="flex items-center justify-between pb-5">
          <div className="font-semibold text-xl">
            <IconButton onClick={toggleSettingView}><KeyboardArrowLeftIcon /></IconButton>Settings
          </div>
        </header>
        <Container maxWidth="sm" style={{ marginLeft:0, padding: '20px', marginTop: '0px', textAlign: 'left' }}>
          {/* <Typography variant="h6" gutterBottom>
            General Settings
          </Typography>
          <Tooltip title={settingDescriptions['apiAccessToken']} arrow>
            <TextField
              label="API Access Token"
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              value={settings.general.apiAccessToken}
              onChange={(e) => handleInputChange('general', 'apiAccessToken', e.target.value)}
            />
          </Tooltip> */}

          <Typography variant="h6" gutterBottom style={{ marginTop: '10px' }}>
            DNS Settings
          </Typography>
          <Tooltip title={settingDescriptions['domainSuffix']} arrow>
            <TextField
              label="Domain Suffix"
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              value={settings.dns.domainSuffix}
              onChange={(e) => handleInputChange('dns', 'domainSuffix', e.target.value)}
            />
          </Tooltip>
          <Tooltip title={settingDescriptions['dockerLabel']} arrow>
            <TextField
              label="Docker Label"
              fullWidth
              size="small"
              margin="normal"
              variant="outlined"
              value={settings.dns.dockerLabel}
              onChange={(e) => handleInputChange('dns', 'dockerLabel', e.target.value)}
            />
          </Tooltip>

          <Button variant="contained" color="primary" onClick={handleSave} style={{ marginTop: '20px' }}>
            Save Settings
          </Button>
      </Container>
      </div>
    );
  }
  export default connect<SettingViewProps>((state: any) => state.setting, {
    saveConfig,
  })(SettingView)