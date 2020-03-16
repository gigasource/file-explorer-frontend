export function folderPathToFolderArray(folderPath) {
  const folderArray = folderPath.split('/')
  return folderArray.filter(folderName => folderName.trim().length > 0)
}

export function folderArrayToFolderParth(folderArray) {
  folderArray = folderArray.filter(folderName => folderName.trim().length > 0)
  let folderPath = folderArray.join('/')
  if (!folderPath.startsWith('/')) folderPath = '/' + folderPath
  if (!folderPath.endsWith('/')) folderPath += '/'
  return folderPath
}
