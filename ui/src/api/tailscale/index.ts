// import { defaultRequest } from 'src/http/index'
import { request } from 'src/docker';
import { acl, keys as resKeys, keyItem} from 'src/api/tailscale/type'
/**
 * Retrieve the details for the specified device. 
 * @param deviceid 
 * @returns 
 */
export function getDevice(deviceid: string) {
    return request({
        url : '/api/v2/device/' + deviceid,
        method: 'get'
    })
}
/**
 * Deletes the supplied device from its tailnet. 
 * @param deviceid 
 * @returns 
 */
export function deleteDevice(deviceid: string) {
    return request({
        url : '/api/v2/device/' + deviceid,
        method: 'DELETE'
    })
}
/**
 * Retrieve the list of subnet routes that a device is advertising
 * @param deviceid 
 * @returns 
 */
export function getDeviceRoutes(deviceid: string) {
    return request({
        url : '/api/v2/device/' + deviceid + '/routes',
        method: 'GET'
    })
}
/**
 * Sets a device's enabled subnet routes by replacing the existing list of subnet routes with the supplied parameters. 
 * @param deviceid 
 * @param routes ["10.0.0.0/16", "192.168.1.0/24"]
 * @returns 
 */
export function setDeviceRoutes(deviceid: string, routes: any) {
    return request({
        url : '/api/v2/device/' + deviceid + '/routes',
        method: 'POST',
        data: {routes: routes}
    })
}
/**
 * Authorize a device
 * @param deviceid 
 * @returns 
 */
export function authorizeDevice(deviceid: string) {
    return request({
        url : '/api/v2/device/' + deviceid + '/authorized',
        method: 'POST',
        data: {"authorized": true}
    })
}
/**
 * Update the tags set on a device.
 * @param deviceid 
 * @param tags ["tag:foo", "tag:bar"]
 * @returns 
 */
export function updateDeviceTags(deviceid: string, tags: any) {
    return request({
        url : '/api/v2/device/' + deviceid + '/tags',
        method: 'POST',
        data: {'tags': tags}
    })
}
/**
 * Update properties of the device key.
 * @param deviceid 
 * @returns 
 */
export function updateDeviceKey(deviceid: string) {
    return request({
        url : '/api/v2/device/' + deviceid + '/key',
        method: 'POST',
        data: {"keyExpiryDisabled": true}
    })
}
/**
 * Set the Tailscale IPv4 address of the device.
 * @param deviceid 
 * @param ip 
 * @returns 
 */
export function setDeviceIp(deviceid: string, ip: string) {
    return request({
        url : '/api/v2/device/' + deviceid + '/ip',
        method: 'POST',
        data: {"ipv4": ip}
    })
}
/**
 * Retrieves the current policy file for the given tailnet; this includes the ACL along with the rules and tests that have been defined.
 * @param tailnet 
 * @param details 
 * @returns 
 */
export function getPolicy(tailnet: string="-", details?: boolean) {
    let config: any = {
        url: '/api/v2/tailnet/' + tailnet + '/acl',
        method: 'GET',
        headers: {"Accept": "application/json"},
    }
    if(details){
        config.data = {"details":1}
    }
    return request<acl>(config)
}
/**
 * Sets the ACL for the given tailnet. HuJSON and JSON are both accepted inputs. 
 * @param acl 
 * @param tailnet 
 * @param ifMatch 
 * @returns 
 */
export function updatePolicy(acl: acl, ifMatch?: string, tailnet: string="-") {
    let config: any = {
        url: '/api/v2/tailnet/' + tailnet + '/acl',
        method: 'POST',
        headers: {"Accept": "application/json"},
        data:acl
    }
    if(ifMatch){
        config.headers["If-Match"] = ifMatch
    }
    return request(config)
}
/**
 * When given a user or IP port to match against, returns the tailnet policy rules that apply to that resource without saving the policy file to the server.
 * @param acl 
 * @param type 
 * @param previewFor 
 * @param tailnet 
 * @returns 
 */
export function previewPolicy(acl: acl, type: string, previewFor: string, tailnet: string="-"){
    let params: Record<string, any> = {
        "type": type,
        "previewFor": previewFor
    }
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/acl/preview?'+Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`).join("&"),
        method: 'POST',
        headers: {"Accept": "application/json"},
        data:acl
    })
}
/**
 * This method works in one of two modes, neither of which modifies your current tailnet policy file:

Run ACL tests: When the request body contains ACL tests as a JSON array, Tailscale runs ACL tests against the tailnet's current policy file. Learn more about ACL tests.
Validate a new policy file: When the request body is a JSON object, Tailscale interprets the body as a hypothetical new tailnet policy file with new ACLs, including any new rules and tests. It validates that the policy file is parsable and runs tests to validate the existing rules.
 * @param acl 
 * @param tailnet 
 * @returns 
 */
export function validatePolicy(acl: acl, tailnet: string="-"){
    let config: any = {
        url: '/api/v2/tailnet/' + tailnet + '/acl/validate',
        method: 'POST',
        headers: {"Accept": "application/json"},
        data: acl
    }
    return request(config)
}
/**
 * Lists the devices in a tailnet. Optionally use the fields query parameter to explicitly indicate which fields are returned.
 * @param tailnet 
 * @param fields
 * @returns 
 */
export function devices(tailnet: string="-", fields: string = "all") {
    let params: Record<string, any> = {
        "fields": fields
    }
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/devices?'+Object.entries(params).map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(value.toString())}`).join("&"),
        method: 'GET'
    })
}
/**
 * Returns a list of active auth keys and API access tokens. 
 * @param tailnet 
 * @returns 
 */
export function keys(tailnet: string="-"){
    return request<resKeys>({
        url: '/api/v2/tailnet/' + tailnet + '/keys',
        method: 'GET'
    })
}
/**
 * Creates a new auth key in the specified tailnet.
 * @param key 
 * @param tailnet 
 * @returns 
 */
export function createKey(key:any, tailnet: string="-"){
    return request<keyItem>({
        url: '/api/v2/tailnet/' + tailnet + '/keys',
        method: 'POST',
        data: key,
    })
}
/**
 * Returns a JSON object with information about a specific key, such as its creation and expiration dates and its capabilities.
 * @param keyid 
 * @param tailnet 
 * @returns 
 */
export function getKey(keyid: string, tailnet: string="-"){
    return request<keyItem>({
        url: '/api/v2/tailnet/' + tailnet + '/keys/'+keyid,
        method: 'GET'
    })
}
/**
 * Deletes a specific key.
 * @param keyid 
 * @param tailnet 
 * @returns 
 */
export function deleteKey(keyid: string, tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/keys/'+keyid,
        method: 'DELETE'
    })
}
/**
 * The tailnet DNS methods are provided for fetching and modifying various DNS settings for a tailnet. 
 * @param tailnet 
 * @returns 
 */
export function getNameservers(tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/nameservers',
        method: 'GET'
    })
}
/**
 * Replaces the list of global DNS nameservers for the given tailnet with the list supplied in the request. 
 * @param dns ["8.8.8.8"]
 * @param tailnet 
 * @returns 
 */
export function setNameservers(dns:any, tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/nameservers',
        method: 'POST',
        data: {'dns': dns}
    })
}
/**
 * Retrieves the DNS preferences that are currently set for the given tailnet.
 * @param tailnet 
 * @returns 
 */
export function getDnsPreferences(tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/preferences',
        method: 'GET'
    })
}
/**
 * Set the DNS preferences for a tailnet; specifically, the MagicDNS setting. 
 * @param preference {"magicDNS": true}
 * @param tailnet 
 * @returns 
 */
export function setDnsPreferences(preference: any, tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/preferences',
        method: 'POST',
        data: preference
    })
}
/**
 * Retrieves the list of search paths, also referred to as search domains, that is currently set for the given tailnet.
 * @param tailnet 
 * @returns 
 */
export function getSearchPaths(tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/searchpaths',
        method: 'GET'
    })
}
/**
 * Replaces the list of search paths with the list supplied by the user and returns an error otherwise.
 * @param searchPaths ["user1.example.com", "user2.example.com"]
 * @param tailnet 
 * @returns 
 */
export function setSearchPaths(searchPaths: any, tailnet: string="-"){
    return request({
        url: '/api/v2/tailnet/' + tailnet + '/dns/searchpaths',
        method: 'POST',
        data:{searchPaths: searchPaths}
    })
}