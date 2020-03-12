<script>
  import _ from 'lodash'
  import {ref, watch} from '@vue/composition-api'
  import Toolbar from './Toolbar/Toolbar';
  import AddressBar from './AddressBar/AddressBar';
  import FileExplorerPanel from './FileExplorerPanel/FileExplorerPanel';
  import {Fragment} from 'vue-fragment';
  import FolderTree from "./FolderTree/FolderTree";

  export default {
    name: 'FileExplorer',
    components: {FolderTree, FileExplorerPanel, AddressBar, Toolbar, Fragment},
    props: {
      path: String,
      files: Array,
      getFiles: Function, //function getFiles(path) on path change
      accept: String,
      appendContextOptions: Array,
      addressBarDivider: {
        type: String,
        default: '->',
      },
    },
    setup(props, context) {
      // slot name for children components
      const toolbarSlots = {
        viewModeSelection: 'view-mode-selection',
        fileFilter: 'file-filter',
        fileGroup: 'file-group',
        fileSort: 'file-sort',
        btnBack: 'btn-back',
        btnNewFile: 'btn-new-file',
        btnNewFolder: 'btn-new-folder',
        searchBar: 'search-bar',
      }

      const fileExplorerPanelSlots = {
        contextMenu: 'context-menu',
        file: 'file',
      }

      const addressBarSlots = {
        addressBar: 'address-bar',
      }

      const viewMode = ref('grid')
      const fileFilter = ref(null)
      const fileGroup = ref(null)
      const fileSort = ref('old')

      const sort = ref({
        type: 'name',
        asc: true
      })
      const display = ref('grid')
      const group = ref('')
      const searchText = ref('')
      const activeFiles = ref(props.files)

      function openFile(file) {
        if (file.isFolder) {
          let folderPath = `${file.folderPath}${file.fileName}`
          if (!folderPath.endsWith('/')) folderPath += '/'

          return context.emit('update:path', folderPath)
        }
        //todo open file
      }

      function getFilesByPath(files, path) {
        return files.filter(file => file.folderPath === path)
      }

      function getFilteredFiles(files, path, sort, filter, group, searchText) {
        if (!files) return

        let tempFiles = _.cloneDeep(files)

        // if (path) tempFiles = getFilesByPath(files, path)
        // if (searchText) tempFiles = tempFiles.filter(file => file.fileName.toLowerCase().includes(searchText.trim().toLowerCase()))

        // const filesWithMediaType = tempFiles.map(file => {
        //   const type = file.isFolder ? 'folder' : file.mimeType.split('/')[0]
        //
        //   return {
        //     ...file,
        //     type
        //   }
        // })
        //
        // if (filter && filter !== 'none') {
        //   tempFiles = tempFiles.filter(file => {
        //     return filesWithMediaType.filter(f => f.type === filter).includes(i => i._id === file._id)
        //   })
        // }
        //
        // if (group) {
        //   tempFiles = _.groupBy(filesWithMediaType, 'type')
        // }

        // if (sort) {
        //   if (group) {
        //     for (const fileGroup in tempFiles) {
        //       if (tempFiles.hasOwnProperty(fileGroup)) _.set(tempFiles, fileGroup, sortFiles(sort, tempFiles[fileGroup]))
        //     }
        //   } else {
        //     tempFiles = sortFiles(sort, tempFiles)
        //   }
        // }

        if (sort) tempFiles = sortFiles(sort, tempFiles)
        if (searchText) tempFiles = tempFiles.filter(file => file.fileName.includes(searchText))

        return tempFiles
      }

      function sortFiles(sort, files) {
        const collator = new Intl.Collator(undefined, {numeric: true});

        switch (sort) {
          case 'az':
            return files.sort((a, b) => collator.compare(a.fileName, b.fileName));
          case 'za':
            return files.sort((a, b) => collator.compare(b.fileName, a.fileName));
          case 'new':
            return files.sort((a, b) => a.updatedAt < b.updatedAt ? 1 : -1)
          case 'old':
            return files.sort((a, b) => b.updatedAt < a.updatedAt ? 1 : -1)
        }
      }

      watch(() => [props.files, props.path, fileSort.value, fileFilter.value, group.value, searchText.value], (newValues, oldValues) => {
        if (!newValues || newValues === oldValues) return

        activeFiles.value = getFilteredFiles(props.files, props.path, fileSort.value, fileFilter.value, group.value, searchText.value)
      })


      if (props.getFiles && typeof props.getFiles === 'function') {
        watch(() => props.path, (newValues, oldValues) => {
          if (newValues !== oldValues) {
            const files = props.getFiles(props.path)
            context.emit('update:files', files)
          }
        }, {lazy: true})
      }

      function renderToolbar() {
        return (
            <toolbar {...{
              scopedSlots: context.slots,
              props: {
                selectedViewMode: viewMode.value,
                selectedFilter: fileFilter.value,
                selectedSort: fileSort.value,
                selectedGroup: fileGroup.value,
                viewMode: viewMode.value,
                path: props.path,

                filter: fileFilter.value,
                display: display.value,
                group: group.value,
                searchText: searchText.value,
                slotNames: toolbarSlots,
              },
              on: {
                'update:viewMode': mode => viewMode.value = mode,
                'update:filter': filter => fileFilter.value = filter,
                'update:group': group => fileGroup.value = group,
                'update:sort': sort => fileSort.value = sort,
                'onNewFile': openUploadFileDialog,
                'newFolder': () => context.emit('newFolder'),
                'up': () => {
                  let newPath = props.path.split('/')
                  newPath.pop()
                  newPath.pop()
                  newPath = newPath.join('/')
                  if (!newPath.startsWith('/')) newPath = '/' + newPath
                  context.emit('update:path', newPath)
                },

                'update:display': e => display.value = e,
                'update:searchText': e => searchText.value = e
              }
            }}/>
        )
      }

      function renderAddressBar() {
        const elementData = {
          scopedSlots: {
            default: context.slots[addressBarSlots.addressBar],
          },
          props: {
            path: props.path,
            divider: props.addressBarDivider,
          },
          on: {
            updatePath: path => context.emit('update:path', path),
          }
        }

        return <address-bar {...elementData}/>
      }

      function renderFileExplorer() {
        const elementData = {
          scopedSlots: {
            [fileExplorerPanelSlots.contextMenu]: context.slots[fileExplorerPanelSlots.contextMenu],
            [fileExplorerPanelSlots.file]: context.slots[fileExplorerPanelSlots.file],
          },
          props: {
            files: activeFiles.value,
            path: props.path,
            display: display.value,
            slotNames: fileExplorerPanelSlots,
            appendContextOptions: props.appendContextOptions,
            viewMode: viewMode.value,
          },
          on: {
            openFile: file => {
              openFile(file)
              context.emit('openFile', file)
            },
            cutFile: file => context.emit('cutFile', file),
            pasteFile: file => context.emit('pasteFile', file),
            deleteFile: file => context.emit('deleteFile', file),
            renameFile: file => context.emit('renameFile', file),
          }
        }

        return <file-explorer-panel {...elementData}/>
      }

      function renderFolderTree() {
        const folders = props.files ? props.files.filter(f => f.isFolder) : []

        const elementData = {
          props: {
            folders
          }
        }

        return <folder-tree {...elementData} />
      }

      function openUploadFileDialog() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '*';
        input.multiple = true;
        input.addEventListener('change', e => {
          document.body.removeChild(input);
          context.emit('uploadFiles', e.target.files)
        });
        document.body.appendChild(input);
        input.style.display = 'none';
        input.click()
      }

      const render = () => {
        const toolbarVNode = renderToolbar()
        const addressBarVNode = renderAddressBar()
        const fileExplorerVNode = renderFileExplorer()
        const folderTreeVNode = renderFolderTree()

        return (context.slots.components
            && (
                <fragment>
                  {context.slots.components({toolbarVNode, addressBarVNode, fileExplorerVNode, folderTreeVNode})}
                </fragment>
            ))
            //fallback content
            || (
                <div class="elevation-3 file-explorer-panel">
                  {toolbarVNode}
                  {addressBarVNode}
                  {fileExplorerVNode}
                </div>
            )
      }

      return {
        activeFiles,
        render
      }
    },
    render() {
      return this.render()
    }
  }
</script>

<style scoped>
</style>
