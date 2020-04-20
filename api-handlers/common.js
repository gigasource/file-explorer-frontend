import {setPropertyMappings, transformInternal} from '../utils/property-mapping'
import ax from 'axios';

function createCommonApiHandlers(options) {
  let initialized = false
  const {apiBaseUrl, userNamespace} = options;

  const axios = ax.create()
  if (userNamespace) axios.defaults.headers.common['user'] = userNamespace;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  async function createNewFolder(folderPath, newFolderName = 'New Folder') {
    await axios.post(`${apiBaseUrl}/folders`, {
      folderName: newFolderName,
      folderPath: folderPath,
    })
  }

  async function getFilesInPath(folderPath) {
    if (!initialized) {
      setPropertyMappings((await axios.get(`${apiBaseUrl}/property-mappings`)).data)
      initialized = true
    }

    const data = (await axios.get(`${apiBaseUrl}/file-metadata?folderPath=${folderPath}`)).data

    return transformInternal(data)
  }

  async function getFolderTree() {
    return transformInternal((await axios.get(`${apiBaseUrl}/folder-tree`)).data);
  }

  async function renameFile(file, newFileName) {
    const id = file._id;
    const apiUrl = `${apiBaseUrl}/file-metadata/rename/${id}`;
    const requestBody = {
      newFileName
    }

    await axios.put(apiUrl, requestBody);
  }

  async function deleteFile(file) {
    const id = file._id;
    const apiUrl = `${apiBaseUrl}/files/${id}`;

    await axios.delete(apiUrl);
  }

  async function deleteFileByPath(filePath) {
    await axios.delete(`${apiBaseUrl}/filePaths/${filePath}`);
  }

  async function pasteFile(folderPath, fileInClipboard) {
    const id = fileInClipboard._id;
    const apiUrl = `${apiBaseUrl}/file-metadata/move/${id}`;
    const requestBody = {newFolderPath: folderPath}

    await axios.put(apiUrl, requestBody);
  }

  return {
    createNewFolder,
    getFilesInPath,
    getFolderTree,
    renameFile,
    deleteFile,
    deleteFileByPath,
    pasteFile,
  }
}

export default createCommonApiHandlers
