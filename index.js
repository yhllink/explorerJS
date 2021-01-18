const fs = require('fs')
const path = require('path')

function succ (data = {}, message = '') { return { code: 200, data, message } }
function err (data = {}, message = '') { return { code: 400, data, message } }

// 判断目录是否存在
function existsSync (pathHas) {
  pathHas = path.join(pathHas)
  try {
    const state = fs.statSync(pathHas)
    let type
    if (state.isFile()) type = 'file'
    if (state.isDirectory()) type = 'dir'
    return succ({ type })
  } catch (error) {
    return err(error, 'The current path does not exist')
  }
}
function exists (pathHas) {
  return new Promise(function (resolve) {
    pathHas = path.join(pathHas)
    fs.stat(pathHas, function (error, state) {
      if (error) return resolve(err(error, 'The current path does not exist'))

      let type
      if (state.isFile()) type = 'file'
      if (state.isDirectory()) type = 'dir'
      return resolve(succ({ type }))
    })
  })
}

// 判断文件是否存在
function fileHasSync (dirPath) {
  dirPath = path.join(dirPath)
  const res = existsSync(dirPath)
  if (res.code === 200 && res.data.type === 'file') return succ()
  return err({}, res.code === 200 ? 'The current path is not a file' : 'The current path does not exist')
}
async function fileHas (dirPath) {
  dirPath = path.join(dirPath)
  const res = await exists(dirPath)
  if (res.code === 200 && res.data.type === 'file') return succ()
  return err({}, res.code === 200 ? 'The current path is not a file' : 'The current path does not exist')
}

// 判断文件夹是否存在
function dirHasSync (dirPath) {
  dirPath = path.join(dirPath)
  const res = existsSync(dirPath)
  if (res.code === 200 && res.data.type === 'dir') return succ()
  return err({}, res.code === 200 ? 'The current path is not a folder' : 'The current path does not exist')
}
async function dirHas (dirPath) {
  dirPath = path.join(dirPath)
  const res = await exists(dirPath)
  if (res.code === 200 && res.data.type === 'dir') return succ()
  return err({}, res.code === 200 ? 'The current path is not a folder' : 'The current path does not exist')
}

// 读取文件目录
function readDirSync (dirPath) {
  dirPath = path.join(dirPath)
  const res = dirHasSync(dirPath)
  if (res.code !== 200) return res
  return succ(fs.readdirSync(dirPath))
}
function readDir (dirPath) {
  return new Promise(async function (resolve) {
    dirPath = path.join(dirPath)
    const res = await dirHas(dirPath)
    if (res.code !== 200) return resolve(res)

    fs.readdir(dirPath, function (error, state) {
      if (error) return resolve(err(error, 'Directory read failure'))
      resolve(succ(state))
    })
  })
}

// 删除(文件|文件夹)
function deletePathSync (delPath) {
  delPath = path.join(delPath)
  const res = existsSync(delPath)
  if (res.code !== 200) return succ()

  if (res.data.type === 'file') {
    fs.unlinkSync(delPath)
    return succ()
  }

  if (res.data.type === 'dir') {
    const res = readDirSync(delPath)
    if (res.code === 200) {
      for (let i = 0; i < res.data.length; i++) {
        deletePathSync(path.join(delPath, res.data[i]))
      }
    }
    fs.rmdirSync(delPath)
  }

  return succ()
}
function deletePath (delPath) {
  return new Promise(async function (resolve) {
    delPath = path.join(delPath)
    const res = await exists(delPath)
    if (res.code !== 200) return resolve(succ())

    if (res.data.type === 'file') {
      fs.unlink(delPath, function (error) {
        if (error) return resolve(err(error))
        return resolve(succ())
      })
    }

    if (res.data.type === 'dir') {
      console.log(111);
      const res = await readDir(delPath)
      if (res.code === 200) {
        for (let i = 0; i < res.data.length; i++) {
          await deletePath(path.join(delPath, res.data[i]))
        }
      }

      fs.rmdir(delPath, function (error) {
        if (error) return resolve(err(error, 'Folder deletion failed'))
        resolve(succ())
      })
    }
  })
}

// 创建文件夹
function mkDirSync (dirPath) {
  dirPath = path.join(dirPath)
  if (dirHasSync(dirPath).code === 200) return succ({}, 'The folder already exists')
  const dirName = path.dirname(dirPath)
  mkDirSync(dirName === '.' ? './' : dirName)
  fs.mkdirSync(dirPath)
  return succ()
}
function mkDir (dirPath) {
  return new Promise(async function (resolve) {
    dirPath = path.join(dirPath)
    if ((await dirHas(dirPath)).code === 200) return resolve(succ({}, 'The folder already exists'))

    const dirName = path.dirname(dirPath)
    await mkDir(dirName === '.' ? './' : dirName)

    fs.mkdir(dirPath, function (error) {
      if (error) return resolve(err(error, 'The folder already exists'))
      resolve(succ())
    })
  })
}

// 创建/修改文件(覆盖)
function writeFileSync (filePath, data) {
  filePath = path.join(filePath)
  mkDirSync(path.join(filePath, '../'))
  return fs.writeFileSync(filePath, data)
}
function writeFile (filePath, data) {
  return new Promise(async function (resolve) {
    filePath = path.join(filePath)
    await mkDir(path.join(filePath, '../'))
    fs.writeFile(filePath, data, function (error) {
      if (error) return resolve(err(error, 'File write failure'))
      resolve(succ())
    })
  })
}

// 创建/追加文件
function appendFileSync (filePath, data) {
  filePath = path.join(filePath)
  mkDirSync(path.join(filePath, '../'))
  return fs.appendFileSync(filePath, data)
}
function appendFile (filePath, data) {
  return new Promise(async function (resolve) {
    filePath = path.join(filePath)
    await mkDir(path.join(filePath, '../'))
    fs.appendFile(filePath, data, function (error) {
      if (error) return resolve(err(error, 'File append failure'))
      resolve(succ())
    })
  })
}

// 读取文件
function readFileSync (filePath) {
  filePath = path.join(filePath)
  const res = fileHasSync(filePath)
  if (res.code !== 200) return res

  return succ(fs.readFileSync(filePath, 'utf-8'))
}
function readFile (filePath) {
  return new Promise(async function (resolve) {
    filePath = path.join(filePath)
    const res = await fileHas(filePath)
    if (res.code !== 200) return resolve(res)

    fs.readFile(filePath, 'utf-8', function (error, data) {
      if (error) return resolve(err(error, 'File read failure'))
      resolve(succ(data))
    })
  })
}

// 拷贝(文件|文件夹)
function copySync (from, to, ignores = []) {
  from = path.join(from)
  to = path.join(to)
  ignores = ignores.map(function (p) { return path.join(p) })

  const fromPath = existsSync(from)
  if (fromPath.code !== 200) return err({}, 'The source path does not exist')

  if (ignores.includes(from)) return err({}, 'The source path is an ignored path')

  if (fromPath.data.type == 'file') {
    fs.copyFileSync(from, to)
    return succ()
  }

  if (fromPath.data.type == 'dir') {
    mkDirSync(to)
    const res = readDirSync(from)
    if (res.code === 200) {
      const fileList = res.data
      for (let i = 0; i < fileList.length; i++) {
        copySync(path.join(from, fileList[i]), path.join(to, fileList[i]), ignores)
      }
    }
  }
}
function copy (from, to, ignores = []) {
  return new Promise(async function (resolve) {
    from = path.join(from)
    to = path.join(to)
    ignores = ignores.map(function (p) { return path.join(p) })

    const fromPath = await exists(from)
    if (fromPath.code !== 200) return resolve(err({}, 'The source path does not exist'))

    if (ignores.includes(from)) return resolve(err({}, 'The source path is an ignored path'))

    if (fromPath.data.type == 'file') {
      return resolve(await (function () {
        return new Promise(function (resolve) {
          fs.copyFile(from, to, function (error) {
            if (error) return resolve(err(error, 'File copy failed'))
            resolve(succ())
          })
        })
      })())
    }

    if (fromPath.data.type == 'dir') {
      await mkDir(to)
      const res = await readDir(from)
      if (res.code === 200) {
        const fileList = res.data
        for (let i = 0; i < fileList.length; i++) {
          await copy(path.join(from, fileList[i]), path.join(to, fileList[i]), ignores)
        }
      }
    }

    return resolve(succ())
  })
}

module.exports = {
  existsSync,
  exists,
  fileHasSync,
  fileHas,
  dirHasSync,
  dirHas,
  readDirSync,
  readDir,
  deletePathSync,
  deletePath,
  mkDirSync,
  mkDir,
  writeFileSync,
  writeFile,
  appendFileSync,
  appendFile,
  readFileSync,
  readFile,
  copySync,
  copy
}