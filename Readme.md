# yhl-explorer-js
提供文件管理、目录管理


## Install

```
npm install yhl-explorer-js
```

### Use

```javascript
const explorerJS = require('yhl-explorer-js')

console.log(explorerJS.existsSync('./existsSync.js')) // { code: 200, data: { type: 'file' }, message: '' }

;(async function() {
  const res = await explorerJS.exists('./existsSync.js')
  console.log(res) // { code: 200, data: { type: 'file' }, message: '' }
})()
```


### Api
``` javascript
  explorerJS.existsSync // 判断目录是否存在（同步）
  explorerJS.exists // 判断目录是否存在
  explorerJS.fileHasSync // 判断文件是否存在（同步）
  explorerJS.fileHas // 判断文件是否存在
  explorerJS.dirHasSync // 判断文件夹是否存在（同步）
  explorerJS.dirHas // 判断文件夹是否存在
  explorerJS.readDirSync // 读取文件目录（同步）
  explorerJS.readDir // 读取文件目录
  explorerJS.deletePathSync // 删除(文件|文件夹)（同步）
  explorerJS.deletePath // 删除(文件|文件夹)
  explorerJS.mkDirSync // 创建文件夹（同步）
  explorerJS.mkDir // 创建文件夹
  explorerJS.writeFileSync // 创建/修改文件(覆盖)（同步）
  explorerJS.writeFile // 创建/修改文件(覆盖)
  explorerJS.readFileSync // 读取文件（utf-8）（同步）
  explorerJS.readFile // 读取文件（utf-8）
  explorerJS.copySync // 拷贝(文件|文件夹)（同步）
  explorerJS.copy // 拷贝(文件|文件夹)
```


## License

[MIT](https://github.com/epoberezkin/ajv-errors/blob/master/LICENSE)
