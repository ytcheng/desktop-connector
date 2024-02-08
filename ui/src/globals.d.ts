interface Container {
  Id: string
  Names: string[]
  Ports: Port[]
  Image: string
  ImageID: string
  State: string
  Status: string
  Config: {
    Hostname: string
  }
  Labels: {
    "com.docker.desktop.plugin"?: true
    "com.docker.desktop.extension"?: true
    "com.docker.compose.project"?: string
    "com.docker.compose.service"?: string
    [key: string]: string 
  },
  NetworkSettings: {
    Networks:{
      [key: string]: {
        Aliases: string
      }
    }
  }
  Created: number // unix timestamp
}

interface Port {
  PublicPort: number
  Type: string
}
interface ContainerGroup {
  Name: string,
  Type: "container" | "group"
  Containers: Container[]
}
