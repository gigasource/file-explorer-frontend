import createCommonApiHandlers from './common'
import forEach from 'lodash/forEach'
import ax from 'axios'

const CancelToken = axios.CancelToken

function createGridFsHandlers(options) {
  const {apiBaseUrl, namespace, imageThumbnailSize} = options;

  const axios = ax.create()
  if (namespace) axios.defaults.headers.common[namespace.key] = namespace.value;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  const commonHandlers = createCommonApiHandlers(options)

  function uploadFiles(files, folderPath, uploadCompletedCallback, ignoreDuplicate) {
    if (!files || files.length === 0) return
    const uploads = []

    forEach(files, file => {
      uploads.push(file)
    })

    return uploads.map(f => uploadFile(f, folderPath, uploadCompletedCallback, ignoreDuplicate))
  }

  function uploadFile(file, folderPath, uploadCompletedCallback, ignoreDuplicate) {
    let apiUrl = `${apiBaseUrl}/files?folderPath=${folderPath}`
    if (ignoreDuplicate) apiUrl += '&ignoreDuplicate=true'

    const formData = new FormData()
    formData.append('file', file)

    const source = CancelToken.source()

    const upload = {
      progress: 0,
      inProgress: true,
      cancel: source.cancel,
      mimeType: file.type,
      fileName: file.name,
    }

    function onUploadProgress(progress) {
      upload.progress = Math.round(progress.loaded * 100 / progress.total)
    }

    let responseData
    axios.post(apiUrl, formData, {cancelToken: source.token, onUploadProgress})
        .then(async (response) => {
          upload.progress = 100
          upload.success = true
          responseData = response
        })
        .catch(() => {
          upload.progress = 0
          upload.success = false
        })
        .finally(() => {
          upload.inProgress = false
          uploadCompletedCallback(responseData)
        })

    return upload
  }

  function insertViewUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      viewUrl: `${apiBaseUrl}/files/view${file.folderPath}${file.fileName}`,
    }))
  }

  function insertThumbnailUrl(files, width, height) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      thumbnailUrl: `${apiBaseUrl}/files/view${file.folderPath}${file.fileName}?w=${width}&h=${height}`,
    }))
  }

  function insertDownloadUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      downloadUrl: `${apiBaseUrl}/files/download${file.folderPath}${file.fileName}`,
    }))
  }

  const {getFilesInPath: getFiles, ...commonFunctions} = commonHandlers

  async function getFilesInPath(folderPath) {
    let filesInFolder = await getFiles(folderPath)
    filesInFolder = insertViewUrl(filesInFolder)
    filesInFolder = insertDownloadUrl(filesInFolder)

    if (!isNaN(imageThumbnailSize.width) && !isNaN(imageThumbnailSize.height))
      filesInFolder = insertThumbnailUrl(filesInFolder, imageThumbnailSize.width, imageThumbnailSize.height)

    return filesInFolder
  }

  return {
    insertViewUrl,
    insertDownloadUrl,
    getFilesInPath,
    ...commonFunctions,
    uploadFiles,
    uploadFile,
  }
}

export default createGridFsHandlers
