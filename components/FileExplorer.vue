<script>
  import _ from 'lodash'
  import {ref, watch} from '@vue/composition-api'
  import Toolbar from './Toolbar/Toolbar'
  import AddressBar from './AddressBar/AddressBar'
  import FileExplorerPanel from './FileExplorerPanel/FileExplorerPanel'
  import {Fragment} from 'vue-fragment'
  import FolderTree from './FolderTree/FolderTree'
  import {folderArrayToFolderParth, folderPathToFolderArray} from '../utils/file-path'

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
      folderTree: Array,
    },
    setup(props, context) {
      const fileInClipboard = ref(null)
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
      const fileSort = ref('az')

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
          const folderArray = folderPathToFolderArray(file.folderPath)
          folderArray.push(file.fileName)
          const folderPath = folderArrayToFolderParth(folderArray)

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
                addressBarDivider: props.addressBarDivider,
              },
              on: {
                'update:viewMode': mode => viewMode.value = mode,
                'update:filter': filter => fileFilter.value = filter,
                'update:group': group => fileGroup.value = group,
                'update:sort': sort => fileSort.value = sort,
                newFile: openUploadFileDialog,
                newFolder: () => context.emit('newFolder'),
                up: () => {
                  const folderArray = folderPathToFolderArray(props.path)
                  folderArray.pop()
                  const newPath = folderArrayToFolderParth(folderArray)

                  context.emit('update:path', newPath)
                },

                'update:display': e => display.value = e,
                'update:searchText': e => searchText.value = e,
                'update:path': path => context.emit('update:path', path)
              }
            }}/>
        )
      }

      /** kept for future use if needed
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
       */

      function renderFileExplorerPanel() {
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
            fileInClipboard: fileInClipboard.value
          },
          on: {
            'update:fileInClipboard': file => fileInClipboard.value = file,
            open: file => {
              openFile(file)
              context.emit('open', file)
            },
            cut: file => context.emit('cut', file),
            paste: file => context.emit('paste', file),
            delete: file => context.emit('delete', file),
            rename: file => context.emit('rename', file),
            newFile: openUploadFileDialog,
            newFolder: () => context.emit('newFolder'),
          }
        }

        return <file-explorer-panel {...elementData}/>
      }

      function renderFolderTree() {
        const folders = props.files ? props.files.filter(f => f.isFolder) : []

        const elementData = {
          props: {
            folders,
            folderTree: props.folderTree,
            path: props.path,
          },
          on: {
            folderSelected: folderPath => {
              if (!folderPath.endsWith('/')) folderPath += '/'
              context.emit('update:path', folderPath)
            }
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
        const fileExplorerVNode = renderFileExplorerPanel()
        const folderTreeVNode = renderFolderTree()

        return (context.slots.components
            && (
                <fragment>
                  {context.slots.components({toolbarVNode, fileExplorerVNode, folderTreeVNode})}
                </fragment>
            ))
            //fallback content
            || (
                <div class="elevation-3 file-explorer">
                  {toolbarVNode}
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
