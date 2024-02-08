package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"os/exec"
	"os/signal"
	"strings"
	"sync"
	"syscall"

	docker "github.com/fsouza/go-dockerclient"
)

var mutex sync.RWMutex
var dockerNetworkMap map[string]docker.Network = make(map[string]docker.Network)

func main() {
	go startDockerWatcher()
	socketPath := "/run/guest-services/backend.sock"
	listener, err := net.Listen("unix", socketPath)
	if err != nil {
		panic(err)
	}
	// defer os.Remove(socketPath)

	targetUrl, _ := url.Parse("https://api.tailscale.com")
	proxy := httputil.NewSingleHostReverseProxy(targetUrl)
	http.HandleFunc("/", proxy.ServeHTTP)
	go http.Serve(listener, nil)

	sigChan := make(chan os.Signal, 1)
	signal.Notify(sigChan, os.Interrupt, syscall.SIGTERM)
	<-sigChan
	os.Remove(socketPath)
	os.Exit(0)
}

func startDockerWatcher() {
	client, err := docker.NewClientFromEnv()
	if err != nil {
		log.Printf("[docker] NewClientFromEnv error %s", err)
		panic(err)
	}

	events := make(chan *docker.APIEvents)

	if err := client.AddEventListenerWithOptions(docker.EventsOptions{Filters: map[string][]string{"type": {"network"}, "event": {"create", "destroy", "update", "remove", "prune"}}}, events); err != nil {
		log.Printf("[docker] AddEventListenerWithOptions error %s", err)
		panic(err)
	}

	networks, err := client.ListNetworks()
	if err != nil {
		log.Printf("[docker] ListNetworks error %s", err)
		panic(err)
	}

	for _, network := range networks {
		id := network.ID
		dockerNetworkMap[id] = network
	}
	tailscaleUp()
	for msg := range events {
		go func(msg *docker.APIEvents) {
			mutex.Lock()
			defer mutex.Unlock()
			event := fmt.Sprintf("%s:%s", msg.Type, msg.Action)
			switch event {
			case "network:create", "network:update":
				network, err := client.NetworkInfo(msg.Actor.ID)
				if err != nil {
					log.Printf("[docker] Event error %s #%s: %s", event, msg.Actor.ID[:12], err)
					return
				}
				dockerNetworkMap[msg.Actor.ID] = *network
			case "network:destroy", "network:remove", "network:prune":
				delete(dockerNetworkMap, msg.Actor.ID)
			}
			tailscaleUp()
		}(msg)
	}
}
func tailscaleUp() {
	var advertizeRoutes []string
	for _, network := range dockerNetworkMap {
		for _, ipam := range network.IPAM.Config {
			fmt.Printf("id:%s,ipam%s\n", network.ID, ipam.Subnet)
			advertizeRoutes = append(advertizeRoutes, ipam.Subnet)
		}
	}
	cmd := exec.Command("/app/tailscale", "status", "--json")
	output, err := cmd.CombinedOutput()
	if err != nil {
		fmt.Printf("Error executing command:%s, output:%s\n", err, output)
		return
	}
	var status map[string]interface{}
	err = json.Unmarshal([]byte(output), &status)
	if err != nil {
		fmt.Printf("Error executing command:%s, output:%s\n", err, output)
		return
	}
	self, ok := status["Self"].(map[string]interface{})
	if !ok {
		fmt.Println("找不到 Self 字段")
		return
	}

	hostName, ok := self["HostName"].(string)
	if !ok {
		fmt.Println("找不到 HostName 字段")
		return
	}

	cmd = exec.Command("/app/tailscale", "up", "--advertise-tags=tag:docker", "--accept-dns=false", "--hostname="+hostName, "--advertise-routes="+strings.Join(advertizeRoutes, ","), "--accept-routes=true", "--reset")
	fmt.Print("/app/tailscale", "up", "--advertise-tags=tag:docker", "--accept-dns=false", "--hostname="+hostName, "--advertise-routes="+strings.Join(advertizeRoutes, ","), "--accept-routes=true", "--reset")
	// Run the command and capture its output
	output, err = cmd.CombinedOutput()

	if err != nil {
		fmt.Printf("Error executing command:%s, output:%s\n", err, output)
		return
	}

	// Print the output of the command
	fmt.Println("Command output:")
	fmt.Println(string(output))
}
