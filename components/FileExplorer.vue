<script>
  import _ from 'lodash'
  import {ref, watch, computed} from '@vue/composition-api'
  import Toolbar from './Toolbar/Toolbar'
  import AddressBar from './AddressBar/AddressBar'
  import FileExplorerPanel from './FileExplorerPanel/FileExplorerPanel'
  import {Fragment} from 'vue-fragment'
  import FolderTree from './FolderTree/FolderTree'
  import {folderArrayToFolderParth, folderPathToFolderArray} from '../utils/file-path'
  import _openUploadFileDialog from '../api-handlers/openUploadFileDialog';

  export default {
    name: 'FileExplorer',
    components: {FolderTree, FileExplorerPanel, AddressBar, Toolbar, Fragment},
    props: {
      apiHandler: Object,

      accept: String,
      appendContextOptions: Array,
      addressBarDivider: {
        type: String,
        default: '>',
      },
      viewMode: {
        type: String,
        default: 'grid',
      },
      /*
        Slot names will be used to hide components, for example:
        ['file-sort', 'btn-back', 'btn-new-file', 'address-bar']
       */
      hideComponents: {
        type: Array,
        default: () => []
      },
      draggable: Boolean,
      droppable: {
        type: Boolean,
        default: true,
      },
    },
    setup(props, context) {
      // slot name for children components
      const toolbarSlots = {
        viewModeSelection: 'view-mode-selection',
        fileSort: 'file-sort',
        btnBack: 'btn-back',
        btnNewFile: 'btn-new-file',
        btnNewFolder: 'btn-new-folder',
        searchBar: 'search-bar',
        prepend: 'toolbar-prepend',
        append: 'toolbar-append',
      }
      const fileExplorerPanelSlots = {
        contextMenu: 'context-menu',
        file: 'file',
      }
      const addressBarSlots = {
        addressBar: 'address-bar',
      }

      const fileInClipboard = ref(null)
      const viewMode = ref(props.viewMode)
      const fileSort = ref('az')
      const searchText = ref('')

      const path = ref('/')
      const files = ref(null)
      const folderTree = ref(null)

      const uploadingItems = ref([])
      const showFileUploadProgressDialog = ref(false)

      async function refresh() {
        files.value = await props.apiHandler.getFilesInPath(path.value)
        folderTree.value = await props.apiHandler.getFolderTree(path.value)
      }

      watch(() => [path.value], refresh)

      const activeFiles = computed(() => getFilteredFiles(files.value, path.value, fileSort.value, searchText.value))

      function openFile(file) {
        if (file.isFolder) {
          const folderArray = folderPathToFolderArray(file.folderPath)
          folderArray.push(file.fileName)
          const folderPath = folderArrayToFolderParth(folderArray)

          return path.value = folderPath
        }
      }

      async function uploadFiles(files) {
        const uploads = await props.apiHandler.uploadFiles(files, path.value, refresh)

        showFileUploadProgressDialog.value = true
        uploadingItems.value = uploadingItems.value.concat(uploads)
      }

      function openUploadFileDialog() {
        _openUploadFileDialog({ mimeType: "*", multiple: true }, uploadFiles)
      }

      async function onNewFolder() {
        await props.apiHandler.createNewFolder(path.value)
        await refresh()
      }

      function getFilteredFiles(files, path, sort, searchText) {
        if (!files) return

        let tempFiles = _.cloneDeep(files)

        if (sort) tempFiles = sortFiles(sort, tempFiles)
        if (searchText) tempFiles = tempFiles.filter(file => file.fileName.toLocaleLowerCase().includes(searchText.toLowerCase()))

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

      function renderToolbar(addressBarVNode) {
        function onUp() {
          const folderArray = folderPathToFolderArray(path.value)
          folderArray.pop()

          path.value = folderArrayToFolderParth(folderArray)
        }

        return (
            <toolbar {...{
              scopedSlots: context.slots,
              props: {
                selectedViewMode: viewMode.value,
                selectedSort: fileSort.value,
                viewMode: viewMode.value,
                path: path.value,

                searchText: searchText.value,
                slotNames: {...toolbarSlots, ...addressBarSlots},
                addressBarDivider: props.addressBarDivider,
                hideComponents: props.hideComponents,
                addressBarVNode,
              },
              on: {
                'update:viewMode': mode => {
                  viewMode.value = mode
                  context.emit('update:viewMode', mode)
                },
                'update:sort': sort => fileSort.value = sort,
                'update:searchText': e => searchText.value = e,
                'update:path': p => path.value = p,
                newFile: openUploadFileDialog,
                newFolder: onNewFolder,
                up: onUp,
              }
            }}/>
        )
      }

      function renderAddressBar() {
        // if (isHidden(addressBarSlots.addressBar)) return ''

        const elementData = {
          class: {
            'ml-2': true,
          },
          props: {
            path: path.value,
            divider: props.addressBarDivider,
          },
          on: {
            'update:path': p => path.value = p,
          },
          scopedSlots: {
            default: context.slots[addressBarSlots.addressBar],
          },
        }

        return <address-bar {...elementData}/>
      }

      function renderFileExplorerPanel() {
        function onCut(file) {
          fileInClipboard.value = file
        }

        async function onPaste() {
          if (!fileInClipboard.value) return

          if (fileInClipboard.value.folderPath !== path.value) {
            await props.apiHandler.pasteFile(path.value, fileInClipboard.value)
            await refresh()
          }
          fileInClipboard.value = null
        }

        async function onDelete(file) {
          await props.apiHandler.deleteFile(file)
          await refresh()
        }

        async function onRename(file, newName) {
          await props.apiHandler.renameFile(file, newName)
          await refresh()
        }

        const elementData = {
          scopedSlots: context.slots,
          props: {
            files: activeFiles.value,
            path: path.value,
            slotNames: fileExplorerPanelSlots,
            appendContextOptions: props.appendContextOptions,
            viewMode: viewMode.value,
            fileInClipboard: fileInClipboard.value,
            uploadingItems: uploadingItems.value,
            showFileUploadProgressDialog: showFileUploadProgressDialog.value,
            draggable: props.draggable,
            droppable: props.droppable,
          },
          on: {
            'update:fileInClipboard': file => fileInClipboard.value = file,
            'removeUploadItem': itemIndex => uploadingItems.value.splice(itemIndex, 1),
            'update:uploadingItems': items => uploadingItems.value = items,
            'update:showFileUploadProgressDialog': value => showFileUploadProgressDialog.value = value,
            open: file => {
              openFile(file)
              context.emit('open', file)
            },
            cut: onCut,
            paste: onPaste,
            delete: onDelete,
            rename: onRename,
            newFile: openUploadFileDialog,
            newFolder: onNewFolder,
            uploadFiles
          }
        }

        return <file-explorer-panel {...elementData}/>
      }

      function renderFolderTree() {
        const folders = files && files.value ? files.value.filter(f => f.isFolder) : []

        function onFolderSelected(folderPath) {
          if (!folderPath.endsWith('/')) folderPath += '/'
          path.value = folderPath
        }

        const elementData = {
          props: {
            folders,
            folderTree: folderTree.value,
            path: path.value,
          },
          on: {
            folderSelected: onFolderSelected
          }
        }

        return <folder-tree {...elementData} />
      }

      const render = () => {
        const addressBarVNode = renderAddressBar()
        const toolbarVNode = renderToolbar(addressBarVNode)
        const fileExplorerVNode = renderFileExplorerPanel()
        const folderTreeVNode = renderFolderTree()

        return (context.slots.components
            && (
                <fragment>
                  {context.slots.components({addressBarVNode, toolbarVNode, fileExplorerVNode, folderTreeVNode})}
                </fragment>
            ))
            //fallback content
            || (
                <div class="elevation-3 vue-file-explorer">
                  {toolbarVNode}
                  {fileExplorerVNode}
                </div>
            )
      }

      return {
        render, openUploadFileDialog
      }
    },
    render() {
      return this.render()
    }
  }
</script>

<style lang="scss">
  .vue-file-explorer {
    display: flex;
    flex-direction: column;
    height: 100%;
  }
</style>
