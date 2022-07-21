// @ts-ignore
import { __dirname, compareStr, splitLines } from './utils.ts'
import * as fs from 'fs'

const dataPath:string = __dirname + '\\data\\'
const srcPath:string = __dirname + '\\src\\'

let fileExtension:{file:string, list:string, template:string} = {
    file: 'cgd',
    list: 'cgdl',
    template: 'cgdt'
}

type TValueTypes = string|number|boolean|string[]|[number|string,number|string]
type TypeDataCP = {name:string,type:string}
type TypeCP = {name:string,data:TypeDataCP[]}
export default class GenerateCustomParser {
    readonly templatePath!:string
    readonly filePaths!:TypeCP[]
    readonly fileNames:string[]
    data!:any|any[]
    constructor (readonly dataDirectory:string, templateFile:string='DataTemplate', templateDirectory:string=srcPath) {
        this.templatePath = `${templateDirectory}${templateFile}.${fileExtension.template}`
        this.filePaths = []
        this.fileNames = []
        splitLines(fs.readFileSync(this.templatePath, 'utf8')).forEach((line:string):void => {
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
        this.data = []
        this.fileNames.forEach((n:string) => { this.data.push(this.parseFile(n)) })
    }

    parseFile (_file:string):any {
        let fileTemplateData:TypeCP|undefined = this.filePaths.find((value:TypeCP) => value.name == _file)
        if(!this.fileNames.includes(_file)) throw Error(`"${_file}" does not exist in [${this.fileNames}]`)
        if(!fileTemplateData) throw Error()
        let file:string = `${this.dataDirectory}${_file}.${fileExtension.list}`
        let fileContents:string = fs.readFileSync(file).toString().slice(0, -1)
        let fileLines:string[] = splitLines(fileContents)
        let k:string[] = []
        let v:string[] = []
        let data:any[] = []

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

    parseType (t:string, i:any):TValueTypes {
        let o:TValueTypes
        switch (t) {
            case 'string':
                o = String(i)
                break
            case 'number':
                o = Number(i)
                break
            case 'bool':
                if (compareStr(i, 'true')) o = true
                else if (compareStr(i, 'false')) o = false
                else throw Error(`Type "${i}" can only be "true" or "false".`)
                break
            case 'tuple':
                let _tuple:[string,string] = i.split(',')
                o = [Number(_tuple[0]), Number(_tuple[1])]
                break
            case 'list':
                o = i.split(',')
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
}

let GCP = new GenerateCustomParser(dataPath, 'DataTemplate', `${__dirname}\\src\\`)
console.log(GCP.data)
