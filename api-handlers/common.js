function createCommonApiHandlers(options) {
  const {
    apiBaseUrl,
  } = options;

  if (!apiBaseUrl) throw new Error('Missing apiBaseUrl in parameter object')

  async function createNewFolder(folderPath, newFolderName = 'New Folder') {
    await axios.post(`${apiBaseUrl}/folders`, {
      folderName: newFolderName,
      folderPath: folderPath,
    })
  }

  async function getFilesInPath(folderPath) {
    return (await axios.get(`${apiBaseUrl}/file-metadata?folderPath=${folderPath}`)).data
  }

  async function getFolderTree() {
    return (await axios.get(`${apiBaseUrl}/folder-tree`)).data;
  }

  async function renameFile(file, newFileName) {
    const id = file._id;
    const apiUrl = `${apiBaseUrl}/file-metadata/rename/${id}`;
    const requestBody = {
      fileName: newFileName
    }

    await axios.put(apiUrl, requestBody);
  }

  async function deleteFile(file) {
    const id = file._id;
    const apiUrl = `${apiBaseUrl}/files/${id}`;

    await axios.delete(apiUrl);
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
    pasteFile,
  }
}

export default createCommonApiHandlers
