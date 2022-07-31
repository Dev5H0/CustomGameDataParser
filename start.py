from os import system
system('npm run build')
system('node ./src/parse.js')
# system('node --loader ts-node/esm ./src/parse.ts')