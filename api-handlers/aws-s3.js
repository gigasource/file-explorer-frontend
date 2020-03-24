import createCommonApiHandlers from './common'
import forEach from 'lodash/forEach'
import axios from 'axios'

const CancelToken = axios.CancelToken

function createAwsS3Handlers(options) {
  const {apiBaseUrl} = options;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  const commonHandlers = createCommonApiHandlers(options)

  function uploadFiles(files, folderPath, uploadCompletedCallback) {
    if (!files || files.length === 0) return
    const uploads = []

    forEach(files, file => {
      uploads.push(file)
    })

    return new Promise(resolve => {
      Promise.all(uploads.map(f => uploadFile(f, folderPath, uploadCompletedCallback)))
          .then(uploadInfoObjects => resolve(uploadInfoObjects))
    })
  }

  async function uploadFile(file, folderPath, uploadCompletedCallback) {
    // Get S3 upload URL & upload data to append into FormData
    const apiUrl = `${apiBaseUrl}/file-upload-url?fileName=${file.name}&folderPath=${folderPath}`
    const response = await axios.get(apiUrl)

    const {generatedFileName, originalFileName, fileDownloadUrl, awsS3Data} = response.data
    file.fileDownloadUrl = fileDownloadUrl
    const {url: uploadUrl, fields: uploadData} = awsS3Data

    // Construct FormData for upload request from retrieved upload information
    const formData = new FormData()
    Object.keys(uploadData).forEach(key => formData.append(key, uploadData[key]))
    formData.append('file', file)

    // Send POST request to S3 to upload file
    const source = CancelToken.source();

    const upload = {
      progress: 0,
      inProgress: true,
      cancel: source.cancel,
      mimeType: file.type,
      fileName: originalFileName,
    }

    function onUploadProgress(progress) {
      upload.progress = Math.round(progress.loaded * 100 / progress.total)
    }

    axios.post(uploadUrl, formData, {cancelToken: source.token, onUploadProgress})
        .then(async () => {
          upload.progress = 100
          upload.success = true
          await createFileMetadata(file, folderPath, generatedFileName)
        })
        .catch(() => {
          upload.progress = 0
          upload.success = false
        })
        .finally(() => {
          upload.inProgress = false
          uploadCompletedCallback()
        })

    return upload
  }

  async function createFileMetadata(file, folderPath, generatedFileName) {
    const fileMetadata = {
      isFolder: false,
      fileName: file.name,
      folderPath,
      mimeType: file.type,
      sizeInBytes: file.size,
      fileId: file.fileDownloadUrl,
      generatedFileName,
    }

    await axios.post(`${apiBaseUrl}/file-metadata`, fileMetadata)
  }

  function insertFileUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      viewUrl: file.fileId,
      downloadUrl: file.fileId,
    }))
  }

  const {getFilesInPath: getFiles, ...commonFunctions} = commonHandlers

  async function getFilesInPath(folderPath) {
    let filesInFolder = await getFiles(folderPath)
    filesInFolder = insertFileUrl(filesInFolder)
    return filesInFolder
  }

  return {
    getFilesInPath,
    ...commonFunctions,
    uploadFiles,
    uploadFile,
  }
}

export default createAwsS3Handlers
