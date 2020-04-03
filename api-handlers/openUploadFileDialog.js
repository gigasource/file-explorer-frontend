export default function openUploadFileDialog(options = { multiple: false, mimeType: '*/*' }, onFileOpened) {
  const input = document.createElement('input')
  input.type = 'file'
  input.accept = options.mimeType
  input.multiple = options.multiple
  input.addEventListener('change', e => {
    onFileOpened && onFileOpened(e.target.files)
  });
  document.body.appendChild(input)
  input.style.display = 'none'
  input.click()
  input.parentNode.removeChild(input)
}
