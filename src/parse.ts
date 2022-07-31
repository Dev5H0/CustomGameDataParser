import Util from './utils.js'
import { readFileSync } from 'fs'

const dataPath:string = Util.getPath('data')
const srcPath:string = Util.getPath('src')

let fileExtension:{list:string, template:string} = {
    list: 'cgdl',
    template: 'cgdt'
}

type TValueTypes = string|number|boolean|string[]|[number|string,number|string]
type TypeDataCP = {name:string,type:string}
type TypeCP = {name:string,data:TypeDataCP[]}
export default class GenerateCustomParser {
    protected readonly templatePath!:string
    protected readonly filePaths!:TypeCP[]
    protected readonly fileNames:string[]
    public data!:any|any[]
    constructor (protected readonly dataDirectory:string, templateFile:string='DataTemplate', templateDirectory:string=srcPath) {
        this.templatePath = `${templateDirectory}${templateFile}.${fileExtension.template}`
        this.filePaths = []
        this.fileNames = []
        Util.splitLines(readFileSync(this.templatePath, 'utf8')).forEach((line:string):void => {
            let data:TypeDataCP[] = []
            let x:string[] = line.split('=')
            let fileName:string = x[0]
            x[1].split(':').forEach((d:string) => {
                let [dataName,dataType]:string[] = d.split('.')
                if (!dataType) dataType = 'string'
                data.push({'name':dataName, 'type':dataType})
            })
            this.filePaths.push({name:fileName,data:data})
            this.fileNames.push(fileName)
        })
        this.data = {}
        this.fileNames.forEach((n:string) => { this.data[n] = this.parseFile(n) })
    }

    protected parseFile (_file:string):any[] {
        const fileTemplateData:TypeCP|undefined = this.filePaths.find((value:TypeCP) => value.name == _file)
        if(!this.fileNames.includes(_file)) throw Error(`"${_file}" does not exist in [${this.fileNames}]`)
        if(!fileTemplateData) throw Error()

        const file:string = `${this.dataDirectory}${_file}.${fileExtension.list}`
        const fileContents:string = readFileSync(file).toString().slice(0, -1)
        const fileLines:string[] = Util.splitLines(fileContents)

        let k:string[] = []
        let v:string[] = []
        let data:any = []

        fileTemplateData.data.forEach((kv:TypeDataCP) => {
            k.push(kv.name)
            v.push(kv.type)
        })

        fileLines.forEach((line:string) => {
            let _data:any = {}
            let lineValues = line.split(':')
            lineValues.forEach((val:string, i:number) => {
                _data[k[i]] = this.parseType(v[i], val)
            })
            data.push(_data)
        })

        return data
    }

    protected parseType (t:string, i:any):TValueTypes {
        let o:TValueTypes
        switch (t) {
            case 'string':
                o = String(i)
                break
            case 'number':
                o = Number(i)
                break
            case 'bool':
                if (Util.compareStr(i, 'true')) o = true
                else if (Util.compareStr(i, 'false')) o = false
                else throw Error(`Type "${i}" can only be "true" or "false".`)
                break
            case 'tuple':
                let _tuple:[string,string] = i.split(',')
                o = [Number(_tuple[0]), Number(_tuple[1])]
                break
            case 'list':
                o = i.split(',').filter((obj:string) => { return obj !== ('\r' || '\\r') })
                break
            case 'dict':
                let _o:any = {}
                i.split(',').forEach((_i:string) => {
                    let [k,v]:string[] = _i.split('=')
                    _o[k] = v
                });
                o = _o
                break
            default: throw Error(`"${t}" is not a recognised type. `)
        }
        return o
    }

    public getDataByIndex(file:string, index:number):any { return this.data[file][index] }
    public getDataByValue(file:string, key:string, value:any):any { return this.data[file].find((v:any) => v[key] == value) }
    public setDataByIndex(file:string, index:number, key:string, newValue:any):void { this.data[file][index][key] = newValue }
    public setDataByValue<V>(file:string, key:string, oldValue:V, newValue:V):void { this.data[file][this.data[file].findIndex((v:any) => v[key] == oldValue)][key] = newValue }
}

const GCP = new GenerateCustomParser(dataPath, 'DataTemplate', `${Util.__dirname}\\src\\`)
