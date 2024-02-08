# Desktop Connector

[English version](./README.md)

**Desktop Connector** 是在 Tailscale Docker extension的开发 Docker 扩展。它为容器连接和使用固定域名访问容器提供了额外的功能。借助 Desktop Connector，您可以直接使用容器的 IP 地址连接到容器，无需使用 `expose` 指令暴露端口。

## 功能

Desktop Connector 提供了以下关键功能：

1. 直接容器连接：通过容器的 IP 地址直接连接容器，无需暴露端口。
2. 域名分配：为每个容器分配唯一的域名，方便容器之间以及从桌面访问容器。

## 先决条件

在开始使用 Desktop Connector 之前，请确保已安装以下先决条件：

- Docker Desktop: 您需要一种具有扩展功能的定制版 Docker Desktop。您可以从[此处](https://github.com/docker/desktop-extension-samples/releases)下载它。
- Docker CLI 扩展：安装 Docker CLI 扩展，该扩展可在与 Docker Desktop 定制版相同的位置找到。
- Node.js：确保在本地机器上安装了 Node.js。推荐的版本是 v16.13.1。
- Yarn：安装 Yarn，一个软件包管理器，版本需为 v1.22.17 或更高。

## 设置

安装完先决条件后，请按照以下步骤设置 Desktop Connector：

1. 运行以下命令以启用扩展的 beta 版本：

   ```
   docker extension enable
   ```

2. 执行以下命令构建并安装扩展 Docker 容器：

   ```
   make install-extension
   ```

3. 打开 Docker Desktop，您现在应该在侧边栏菜单中看到一个新的 "Desktop Connector" 部分。

## 开发扩展后端

如果需要对扩展的元数据或后端进行更改，请按照以下步骤：

1. 对扩展的元数据或后端代码进行必要的更改。

2. 执行以下命令重新构建并重新安装扩展：

   ```
   make install-extension
   ```

## 开发扩展用户界面

扩展的用户界面是一个在构建时进行静态捆绑的 React 应用程序。为了便于快速开发迭代，您可以使用本地服务器来提供用户界面，而无需在每次更改时重新构建 Docker 容器。按照以下步骤进行操作：

1. 运行以下命令以在 [localhost:3000](http://localhost:3000) 启动本地服务器以提供扩展用户界面：

   ```
   make dev-extension
   ```

2. Docker Desktop 将被指示使用本地服务器作为扩展用户界面。您所做的任何更改都将进行热重载，以提供流畅的开发体验。

就是这样！您已成功设置了 Desktop Connector Docker 扩展，并可以使用其功能通过 IP 地址连接到容器并分配域名以促进容器和桌面之间的通信。