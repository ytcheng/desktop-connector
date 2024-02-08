export  interface acl{
    acls?: any,
    groups?: any,
    hosts?: any,
    postures?: any,
    tagOwners?: any,
    autoApprovers?: any,
    ssh?: any,
    nodeAttrs?: any,
    tests?: any
}
export interface keys{
    keys:keyListItem[]
}
export interface keyListItem{
    id: string,
    description: string
}
export interface keyItem{
    id: string,
    key: string,
    created: string,
    expires: string,
    revoked: string,
    capabilities: any,
}
export class KeyExistError extends Error {
    public keyid:string;
    constructor(message: string, keyid: string) {
      super(message);
      this.name = 'KeyExistError';
      this.keyid = keyid;
    }
}
  