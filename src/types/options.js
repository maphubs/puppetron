export type OptionsType = {
  url: string,
  width: number,
  height: number,
  fullPage: boolean,
  landscape: boolean,
  format: string,
  scale: number,
  quality: number,
  delay: number,
  type: ['png' | 'jpeg' | 'pdf'],
  agent: string,
  force: boolean,
  headers?: Object,
  clipSelector?: string,
  cookies?: Array<Object>,
  selector?: string,
  selectorOptions: Object
 }