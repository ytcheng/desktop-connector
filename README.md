# Desktop Connector
[中文版](./README_zh.md)
The Desktop Connector is a Docker extension built upon the Tailscale Docker extension. It provides additional functionality for connecting to containers and accessing them using fixed domain names. With the Desktop Connector, you can directly connect to containers using their IP addresses without the need to expose ports through the `expose` directive.

## Features

The Desktop Connector offers the following key features:

1. Direct Container Connection: Connect to containers directly using their IP addresses, eliminating the need for port exposure.
2. Domain Name Allocation: Assign a unique domain name to each container, allowing easy access between containers and from the desktop to the containers.

## Prerequisites

Before getting started with the Desktop Connector, make sure you have the following prerequisites installed:

- Docker Desktop: You need a custom build of Docker Desktop with extension capabilities. You can download it from [here](https://github.com/docker/desktop-extension-samples/releases).
- Docker CLI extension: Install the Docker CLI extension, which is available at the same location as the Docker Desktop custom build.
- Node.js: Ensure you have Node.js installed on your local machine. The recommended version is v16.13.1.
- Yarn: Install Yarn, a package manager, with version v1.22.17 or later.

## Setting up

Once you have installed the prerequisites, follow these steps to set up the Desktop Connector:

1. Enable the extension beta by running the following command:

   ```
   docker extension enable
   ```

2. Build and install the extension Docker container by executing the following command:

   ```
   make install-extension
   ```

3. Open Docker Desktop, and you should now see a new "Desktop Connector" section in the sidebar menu.

## Developing the extension backend

If you need to make changes to the extension metadata or backend, follow these steps:

1. Make the necessary changes to the extension's metadata or backend code.

2. Rebuild and reinstall the extension by executing the following command:

   ```
   make install-extension
   ```

## Developing the extension UI

The extension UI is a React app bundled statically at build time. To facilitate faster development iterations, you can use a local server to serve the UI instead of rebuilding the Docker container on each change. Follow these steps:

1. Run the following command to start a local server at [localhost:3000](http://localhost:3000) for serving the extension UI:

   ```
   make dev-extension
   ```

2. Docker Desktop will be instructed to use the local server as the extension UI. Any changes you make will be hot-reloaded, allowing for a smooth development experience.

That's it! You have successfully set up the Desktop Connector Docker extension and can now leverage its features to connect to containers using IP addresses and allocate domain names to facilitate communication between containers and the desktop.