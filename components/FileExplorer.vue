<script>
  import _ from 'lodash'
  import { ref, watch, computed } from 'vue'
  import Toolbar from './Toolbar/Toolbar'
  import AddressBar from './AddressBar/AddressBar'
  import FileExplorerPanel from './FileExplorerPanel/FileExplorerPanel'
  import FolderTree from './FolderTree/FolderTree'
  import { folderArrayToFolderParth, folderPathToFolderArray } from '../utils/file-path'
  import _openUploadFileDialog from '../api-handlers/openUploadFileDialog';
  import { getScopeIdRender } from '../utils/get-scope-id-render.js';

  export default {
    name: 'FileExplorer',
    components: { FolderTree, FileExplorerPanel, AddressBar, Toolbar },
    emits: ['open', 'update:viewMode'],
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
      fileNameDisplayMaxLength: {
        type: Number,
        default: 15,
      }
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
      const contextAction = ref('')
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

      watch(() => [path.value], refresh, {immediate: true})

      const activeFiles = computed(() => getFilteredFiles(files.value, path.value, fileSort.value, searchText.value))

      function openFile(file) {
        if (file.isFolder) {
          const folderArray = folderPathToFolderArray(file.folderPath)
          folderArray.push(file.fileName)
          const folderPath = folderArrayToFolderParth(folderArray)

          return path.value = folderPath
        }
      }

      function uploadFiles(files) {
        const uploads = props.apiHandler.uploadFiles(files, path.value, {
          uploadCompletedCallback(...args) {
            uploadingItems.value = [...uploadingItems.value];
            refresh(...args);
          },
          ignoreDuplicate: true,
          uploadProgressCallback() {
            uploadingItems.value = [...uploadingItems.value];
          },
        });

        showFileUploadProgressDialog.value = true
        uploadingItems.value = uploadingItems.value.concat(uploads)
      }

      function openUploadFileDialog() {
        _openUploadFileDialog({ mimeType: "*", multiple: true }, uploadFiles)
      }

      async function onNewFolder() {
        await props.apiHandler.createNewFolder(path.value, 'New Folder', true)
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
        const collator = new Intl.Collator(undefined, { numeric: true });

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
              //props
              selectedViewMode: viewMode.value,
              selectedSort: fileSort.value,
              viewMode: viewMode.value,
              path: path.value,

              searchText: searchText.value,
              slotNames: { ...toolbarSlots, ...addressBarSlots },
              addressBarDivider: props.addressBarDivider,
              hideComponents: props.hideComponents,
              addressBarVNode,
              //events
              'onUpdate:viewMode': mode => {
                viewMode.value = mode
                context.emit('update:viewMode', mode)
              },
              'onUpdate:sort': sort => fileSort.value = sort,
              'onUpdate:searchText': e => searchText.value = e,
              'onUpdate:path': p => path.value = p,
              onNewFile: openUploadFileDialog,
              onNewFolder,
              onUp,
            }} vSlots={context.slots}/>
        )
      }

      function renderAddressBar() {
        // if (isHidden(addressBarSlots.addressBar)) return ''

        const elementData = {
          class: {
            'ml-2': true,
          },
          path: path.value,
          divider: props.addressBarDivider,
          'onUpdate:path': p => path.value = p,
        }

        if (context.slots[addressBarSlots.addressBar])
          return <address-bar {...elementData}>{context.slots[addressBarSlots.addressBar]()}</address-bar>
        return <address-bar {...elementData}/>
      }

      function renderFileExplorerPanel() {

        function onCut(file) {
          fileInClipboard.value = file
          contextAction.value = 'cut'
        }

        function onCopy(file) {
          fileInClipboard.value = file
          contextAction.value = 'copy'
        }

        async function onPaste() {
          if (!fileInClipboard.value) return

          if (contextAction.value === 'copy') {
            await props.apiHandler.cloneFile(path.value, fileInClipboard.value)
            await refresh()
          } else if (contextAction.value === 'cut') {
            if (fileInClipboard.value.folderPath !== path.value) {
              await props.apiHandler.moveFile(path.value, fileInClipboard.value)
              await refresh()
            }
            fileInClipboard.value = null
          }
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
          ...{//props
            files: activeFiles.value,
            path: path.value,
            slotNames: fileExplorerPanelSlots,
            appendContextOptions: props.appendContextOptions,
            viewMode: viewMode.value,
            fileInClipboard: fileInClipboard.value,
            contextAction: contextAction.value,
            uploadingItems: uploadingItems.value,
            showFileUploadProgressDialog: showFileUploadProgressDialog.value,
            draggable: props.draggable,
            droppable: props.droppable,
            fileNameDisplayMaxLength: props.fileNameDisplayMaxLength,
          },
          ...{//events
            'onUpdate:fileInClipboard': file => fileInClipboard.value = file,
            'onRemoveUploadItem': itemIndex => uploadingItems.value.splice(itemIndex, 1),
            'onUpdate:uploadingItems': items => uploadingItems.value = items,
            'onUpdate:showFileUploadProgressDialog': value => showFileUploadProgressDialog.value = value,
            onOpen: file => {
              openFile(file)
              context.emit('open', file)
            },
            onCut,
            onCopy,
            onPaste,
            onDelete,
            onRename,
            onNewFile: openUploadFileDialog,
            onNewFolder: onNewFolder,
            onUploadFiles: uploadFiles
          }
        }

        return <file-explorer-panel {...elementData} vSlots={context.slots}/>
      }

      function renderFolderTree() {
        const folders = files && files.value ? files.value.filter(f => f.isFolder) : []

        function onFolderSelected(folderPath) {
          if (!folderPath.endsWith('/')) folderPath += '/'
          path.value = folderPath
        }

        const elementData = {
          folders,
          folderTree: folderTree.value,
          path: path.value,
          onFolderSelected
        }

        return <folder-tree {...elementData} />
      }

      const renderFn = () => {
        const addressBarVNode = renderAddressBar()
        const toolbarVNode = renderToolbar(addressBarVNode)
        const fileExplorerVNode = renderFileExplorerPanel()
        const folderTreeVNode = renderFolderTree()

        return (context.slots.components &&
                context.slots.components({ addressBarVNode, toolbarVNode, fileExplorerVNode, folderTreeVNode })
            )
            //fallback content
            || (
                <div class="elevation-3 vue-file-explorer">
                  {toolbarVNode}
                  {fileExplorerVNode}
                </div>
            )
      }

      return {
        renderFn, openUploadFileDialog
      }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFn)();
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
