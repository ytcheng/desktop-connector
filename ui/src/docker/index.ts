import { createDockerDesktopClient } from '@docker/extension-api-client';
import { store } from 'src/redux/index'
const ddClient = createDockerDesktopClient();
export function request<T>(config: any) :Promise<T> {
    
    const accessToken = store.getState().setting.accessToken
    if (accessToken) {
        if(!config.headers){
            config.headers = {Authorization: "Bearer " + accessToken}
        } else {
            config.headers.Authorization  = "Bearer " + accessToken
        }
    }
    return ddClient.extension.vm!.service!.request(config).catch(error => {
        if (typeof error === "object" && error !== null && "message" in error) {
            const errorMessage = (error as { message: string }).message;
            const parsedError = JSON.parse(errorMessage);
            if (parsedError.message) {
                throw new Error( parsedError.message);
            }
          }
          throw new Error("Unknown error occurred.");
    }) as Promise<T>
}
export function useDockerDesktopClient() {
    return ddClient;
}