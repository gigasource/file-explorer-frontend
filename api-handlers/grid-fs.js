import createCommonApiHandlers from './common'
import forEach from 'lodash/forEach'
import axios from 'axios'
const CancelToken = axios.CancelToken

function createGridFsHandlers(options) {
  const {apiBaseUrl} = options;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  const commonHandlers = createCommonApiHandlers(options)

  function uploadFiles(files, folderPath) {
    if (!files || files.length === 0) return;
    const uploadPromises = []

    forEach(files, file => {
      uploadPromises.push(uploadFile(file, folderPath))
    })

    return Promise.all(uploadPromises)
  }

  async function uploadFile(file, folderPath) {
    const apiUrl = `${apiBaseUrl}/files?folderPath=${folderPath}`

    const formData = new FormData()
    formData.append('file', file)

    const source = CancelToken.source()
    return axios.post(apiUrl, formData, {cancelToken: source.token})
  }

  function insertViewUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      viewUrl: `${apiBaseUrl}/files/view/${file.folderPath}${file.fileName}`,
    }))
  }

  function insertDownloadUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      downloadUrl: `${apiBaseUrl}/files/download/${file.folderPath}${file.fileName}`,
    }))
  }

  const {getFilesInPath: getFiles, ...commonFunctions} = commonHandlers

  async function getFilesInPath(folderPath) {
    let filesInFolder = await getFiles(folderPath)
    filesInFolder = insertViewUrl(filesInFolder)
    filesInFolder = insertDownloadUrl(filesInFolder)
    return filesInFolder
  }

  return {
    getFilesInPath,
    ...commonFunctions,
    uploadFiles,
    uploadFile,
  }
}

export default createGridFsHandlers
