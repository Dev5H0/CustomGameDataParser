import { fileURLToPath } from 'url'
import * as _path from 'path'

class Util {
    public readonly _filterArray:any[] = ['', undefined, null, NaN, Infinity, []]
    public readonly __filterArray:any[] = ['', undefined, null, NaN, Infinity, [], [this._filterArray]]
    public readonly __dirname:string = _path.dirname(fileURLToPath(import.meta.url + '\\..'))
    public getPath(path:string, extension:string='\\'):string { return (this.__dirname + `\\${path}${extension}`).replace('/', '\\') }
    public compareStr(x:string, y:string) { return x.trim().toLowerCase() == y.trim().toLowerCase() }
    public filterArray(array:string[]):string[] { return array.filter((item) => !this.__filterArray.includes(item) ) }
    public splitLines(text:string):string[] { return this.filterArray(text.split(/\r?\n/)) }
    public splitLinesNoFilter(text:string):string[] { return text.split(/\r?\n/) }
}

export default new Util()