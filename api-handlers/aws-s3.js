import createCommonApiHandlers from './common'
import _ from 'lodash'
import ax from 'axios'
import md5 from 'md5'

const CancelToken = axios.CancelToken

function createAwsS3Handlers(options) {
  const {apiBaseUrl, namespace} = options;

  const axios = ax.create()
  if (namespace) axios.defaults.headers.common[namespace.key] = namespace.value;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  const commonHandlers = createCommonApiHandlers(options)

  function uploadFiles(files, folderPath, uploadCompletedCallback) {
    if (!files || files.length === 0) return
    const uploads = []

    _.forEach(files, file => {
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
        .then(async (response) => {
          upload.progress = 100
          upload.success = true
          await createFileMetadata(file, folderPath, generatedFileName)
          return response
        })
        .catch(() => {
          upload.progress = 0
          upload.success = false
        })
        .finally((response) => {
          upload.inProgress = false
          uploadCompletedCallback(response)
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

class FileStreamChunkReader {
  constructor(reader, chunkSize = 1024 * 1024) {
    this._reader = reader
    this._buffer = new Uint8ArrayWrapper(chunkSize)
  }

  read(onChunk, onCompleted) {
    this._onChunk = onChunk
    this._onCompleted = onCompleted
    this._reader.read().then(this.processBytes.bind(this))
  }

  processBytes({done, value}) {
    if (!done) {
      this._buffer.push(value)
      _.each(this._buffer.pullFromChunks(), this._onChunk)
      this._reader.read().then(this.processBytes.bind(this))
    } else {
      this._buffer.flush()
      _.each(this._buffer.pullFromChunks(), this._onChunk)
      this._buffer.clear()
      this._onCompleted()
    }
  }
}
class Uint8ArrayWrapper {
  constructor(length) {
    this._chunks = []
    this._buffer = new Uint8Array(length)
    this._maxLength = length
    this._curLen = 0
    this._remain = length
  }

  push(arr) {
    if (!(arr instanceof Uint8Array) || arr.length === 0)
      return

    if (this._remain <= arr.length) {
      const part1 = arr.slice(0, this._remain)
      const part2 = arr.slice(this._remain, arr.length)
      this._buffer.set(part1, this._curLen)
      this._pushToChunks(this._buffer.slice(0, this._maxLength))
      this._curLen = 0
      this._remain = this._maxLength
      if (part2.length)
        this.push(part2)
    } else {
      this._buffer.set(arr, this._curLen)
      this._curLen += arr.length
      this._remain = this._maxLength - this._curLen
    }
  }

  pullFromChunks() {
    let rs = this._chunks
    this._chunks = null
    return rs
  }

  _pushToChunks(chunk) {
    if (this._chunks === null) {
      this._chunks = []
    }
    this._chunks.push(chunk)
  }

  flush() {
    if (this._curLen) {
      this._pushToChunks(this._buffer.slice(0, this._curLen))
    }
    this._curLen = 0
    this._remain = this._maxLength
  }

  clear() {
    this._buffer = null
    this._chunks = null
  }
}

export default createAwsS3Handlers
