import createCommonApiHandlers from './common'
import forEach from 'lodash/forEach'
import ax from 'axios'

//TODO: replace this as this is a project-specific utility
import FileStreamChunkReader from "../../components/utils/FileStreamChunkReader";
import md5 from 'md5';

const CancelToken = axios.CancelToken

function createAwsS3Handlers(options) {
  const {apiBaseUrl, userNamespace} = options;

  const axios = ax.create()
  if (userNamespace) axios.defaults.headers.common['user'] = userNamespace;

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
    let fileMetadata = {
      isFolder: false,
      fileName: file.name,
      folderPath,
      mimeType: file.type,
      sizeInBytes: file.size,
      fileSource: file.fileDownloadUrl,
      generatedFileName,
    }

    if (file.type.startsWith('video')) {
      const partsData = await getVideoPartsMetadata(file)
      const videoDuration = await getVideoDurationMetadata(file)

      fileMetadata = {...fileMetadata, parts: partsData, duration: videoDuration}
    }

    await axios.post(`${apiBaseUrl}/file-metadata`, fileMetadata)
  }

  function insertFileUrl(files) {
    if (!files) return files

    return files.map(file => ({
      ...file,
      viewUrl: file.fileSource,
      downloadUrl: file.fileSource,
    }))
  }

  const {getFilesInPath: getFiles, ...commonFunctions} = commonHandlers

  async function getFilesInPath(folderPath) {
    let filesInFolder = await getFiles(folderPath)
    filesInFolder = insertFileUrl(filesInFolder)
    return filesInFolder
  }

  async function getVideoDurationMetadata(file) {
    return new Promise(resolve => {
      window.URL = window.URL || window.webkitURL;
      const video = document.createElement('video');
      video.preload = 'metadata';

      video.onloadedmetadata = function () {
        window.URL.revokeObjectURL(video.src)
        resolve(Math.round(video.duration))
      }

      video.src = URL.createObjectURL(file)
    })
  }

  function getVideoPartsMetadata(file) {
    return new Promise(resolve => {
      const parts = [];

      let n = 0;
      const onChunk = (chunk) => {
        parts.push({
          n: n++,
          md5: md5(chunk),
        })
      };

      function onReadComplete() {
        resolve(parts)
      }

      new FileStreamChunkReader(file.stream().getReader()).read(onChunk, onReadComplete)
    })
  }

  return {
    getFilesInPath,
    ...commonFunctions,
    uploadFiles,
    uploadFile,
  }
}

export default createAwsS3Handlers
