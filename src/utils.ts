import { fileURLToPath } from 'url'
import * as path from 'path'

export const __dirname:string = path.dirname(fileURLToPath(import.meta.url + '\\..'))

export function compareStr(x:string, y:string) { return x.trim().toLowerCase() == y.trim().toLowerCase() }
export function splitLines(text:string):string[] { return text.split(/\r?\n/) }
