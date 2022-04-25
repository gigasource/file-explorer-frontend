<script>
  import { ref, watch } from 'vue'
  import File from './File'
  import ContextMenu from "./ContextMenu"
  import FileViewerDialog from "./dialogs/FileViewerDialog"
  import FileRenameDialog from './dialogs/FileRenameDialog'
  import ActionConfirmDialog from "./dialogs/ActionConfirmDialog"
  import FileUploadProgressDialog from "./dialogs/FileUploadProgressDialog";
  import Droppable from '../pvf/directives/drag-and-drop/droppable';
  import DropZoneOverlay from "./DropZoneOverlay";
  import GIcon from '../pvf/components/GIcon/GIcon';
  import GMenu from '../pvf/components/GMenu/GMenu';
  import _ from 'lodash'
  import emptyFolder from '../../assets/images/empty_folder.svg'
  import { getScopeIdRender } from "../../utils/get-scope-id-render";


  export default {
    name: 'FileExplorerPanel',
    directives: {
      Droppable
    },
    emits: [
        'open', 'cut', 'copy', 'paste', 'rename', 'delete', 'newFile', 'newFolder', 'uploadFiles',
        'update:showFileUploadProgressDialog', 'removeUploadItem', 'update:uploadingItems',
    ],
    components: {
      DropZoneOverlay,
      FileUploadProgressDialog,
      ActionConfirmDialog,
      FileRenameDialog,
      FileViewerDialog,
      File,
      ContextMenu,
      GIcon,
      GMenu
    },
    props: {
      files: [Array, Object],
      path: String,
      slotNames: Object,
      appendContextOptions: Array,
      viewMode: String,
      fileInClipboard: Object,
      contextAction: String,
      showFileUploadProgressDialog: Boolean,
      uploadingItems: {
        type: Array,
        default: () => [],
      },
      draggable: Boolean,
      droppable: Boolean,
      fileNameDisplayMaxLength: Number,
    },
    setup(props, context) {
      const selectedFile = ref(null)
      const showContextMenu = ref(false)
      const showFileViewerDialog = ref(false)
      const showFileRenameDialog = ref(false)
      const showConfirmDeleteDialog = ref(false)
      const showDropZoneOverlay = ref(false)

      function renderFileContainer() {
        const menuData = {
          modelValue: showContextMenu.value,
          closeOnContentClick: true,
          absolute: true,
          contentFillWidth: false,
          minWidth: 'initial',
        }

        const menuSlots = {
          activator: ({ toggleContent: toggleContextMenu }) => {
            const containerData = {
              class: {
                'file-container': true,
                'file-container--grid': props.viewMode === 'grid',
                'file-container--list': props.viewMode === 'list',
              },
            }

            const contextMenuListener = {
              onContextmenu(e) {
                e.preventDefault()
                toggleContextMenu(e)
                selectedFile.value = null
              },
            }

            if (Array.isArray(props.files) && props.files.length > 0) {
              return (
                  <div class="fill-height" {...contextMenuListener}>
                    <div {...containerData}>
                      {props.files.map(f => {
                        return <div>
                          {renderFile(f, toggleContextMenu)}
                        </div>
                      })}
                    </div>
                  </div>
              )
            } else {
              return (
                  <div class="fill-height" {...contextMenuListener}>
                    <div class="file-container--empty">
                      <div class="ta-center">
                        <img draggable="false" src={emptyFolder}
                             width="15%"/>
                        <div class="file-container--empty__message">You haven't uploaded any content yet</div>
                        <div class="file-container--empty__message">Click '<span
                            style="font-weight: 600; color: #9a9a9a">Upload</span>' to get started
                        </div>
                        <div class="file-container--empty__upload mt-3" onClick={() => context.emit('newFile')}>
                          <g-icon class="mr-2" xLarge color="#536DFE">fas fa-cloud-upload-alt</g-icon>
                          <span class="mt-2">Upload</span>
                        </div>
                      </div>
                    </div>
                  </div>
              )
            }
          },
          default: () => {
            return renderContextMenu(selectedFile.value)
          }
        }

        return (
            <g-menu {...menuData} vSlots={menuSlots}/>
        )
      }

      function renderFile(f, toggleContextMenu) {
        const fileElData = {
          class: {
            'file--cut': props.fileInClipboard && f && props.fileInClipboard._id === f._id && props.contextAction === 'cut',
          },
          selected: f === selectedFile.value,
          file: f,
          viewMode: props.viewMode,
          draggable: props.draggable,
          fileNameDisplayMaxLength: props.fileNameDisplayMaxLength,
          onClick(file) {
            selectedFile.value = file;
            if (!file.isFolder) showFileViewerDialog.value = true
            context.emit('open', file)
          },
          onDblclick(file) {
          },
          onContextmenu(e, file) {
            e.stopPropagation()
            toggleContextMenu(e)
            selectedFile.value = file
          },
          onUpdateFileName(file, newFileName) {
            file.fileName = newFileName;
          }
        }

        if (context.slots[props.slotNames.file])
          return <File {...fileElData}>{context.slots[props.slotNames.file]()}</File>

        return <File {...fileElData}/>
      }

      function renderContextMenu(file) {
        const elementData = {
          appendContextOptions: props.appendContextOptions,
          file,
          fileInClipboard: props.fileInClipboard,
          path: props.path,
          onOpen: file => {
            selectedFile.value = file;
            if (!file.isFolder) showFileViewerDialog.value = true
            context.emit('open', file)
          },
          onCut: file => {
            context.emit('cut', file)
          },
          onCopy: file => {
            context.emit('copy', file)
          },
          onPaste: () => {
            context.emit('paste')
          },
          onDelete: file => {
            showConfirmDeleteDialog.value = true
            selectedFile.value = file
          },
          onRename: file => {
            showFileRenameDialog.value = true
            selectedFile.value = file
          },
          onNewFile: () => context.emit('newFile'),
          onNewFolder: () => context.emit('newFolder'),
        }

        if (context.slots[props.slotNames.contextMenu])
          return <context-menu {...elementData}>
            {context.slots[props.slotNames.contextMenu]()}
          </context-menu>

        return <context-menu {...elementData}/>
      }

      function renderFileViewerDialog() {
        const fileViewerDialogData = {
          showDialog: showFileViewerDialog.value,
          file: selectedFile.value,
          onClose: () => showFileViewerDialog.value = false,
        }

        return <file-viewer-dialog {...fileViewerDialogData}/>
      }

      function renderFileRenameDialog() {
        const dialogData = {
          files: props.files,
          file: selectedFile.value,
          modelValue: showFileRenameDialog.value,
          onRename: (file, newName) => context.emit('rename', file, newName),
          'onUpdate:modelValue': val => showFileRenameDialog.value = val,
        }

        return <file-rename-dialog {...dialogData} />
      }

      function renderConfirmDeleteDialog() {
        const dialogData = {
          file: selectedFile.value,
          modelValue: showConfirmDeleteDialog.value,
          dialogTitle: `Delete ${selectedFile.value && selectedFile.value.isFolder ? 'folder' : 'file'} ${selectedFile.value && selectedFile.value.fileName}`,
          dialogText: `Are you sure you want to delete this ${selectedFile.value && selectedFile.value.isFolder ? 'folder' : 'file'}?`,
          confirmActionText: 'delete',
          onConfirm: () => context.emit('delete', selectedFile.value),
          'onUpdate:modelValue': val => showConfirmDeleteDialog.value = val,
        }

        return <action-confirm-dialog {...dialogData} />
      }

      function renderFileUploadProgressDialog() {
        const dialogData = {
          modelValue: props.showFileUploadProgressDialog,
          uploadingItems: props.uploadingItems,
          'onUpdate:modelValue': value => context.emit('update:showFileUploadProgressDialog', value),
          'onRemoveUploadItem': itemIndex => context.emit('removeUploadItem', itemIndex),
          'onUpdate:uploadingItems': items => context.emit('update:uploadingItems', items),
        }

        return <file-upload-progress-dialog {...dialogData}/>
      }

      function renderDropZoneOverlay() {
        if (!props.droppable) return ''

        const overlayData = {
          modelValue: showDropZoneOverlay.value,
          'onUpdate:modelValue': val => showDropZoneOverlay.value = val,
          onDropFiles: fileList => context.emit('uploadFiles', fileList),
        }

        return <drop-zone-overlay {...overlayData}/>
      }

      function renderFn() {
        const elementData = {
          class: {
            'file-explorer-panel': true,
            'file-explorer-panel--empty': !Array.isArray(props.files) || props.files.length === 0,
          },
        }

        if (props.droppable) {
          Object.assign(elementData, {
            directives: [
              {
                name: 'droppable',
                value: true,
                modifiers: { file: true }
              }
            ],
            'onDrag-over': _.debounce(
                function () {
                  showDropZoneOverlay.value = true
                }, 100, {
                  leading: true,
                  trailing: false,
                }
            ),
          })
        }

        return <div {...elementData}>
          {renderFileContainer(props.files)}
          {renderDropZoneOverlay()}
          {renderFileViewerDialog()}
          {renderFileRenameDialog()}
          {renderConfirmDeleteDialog()}
          {renderFileUploadProgressDialog()}
        </div>
      }

      return {
        renderFn, selectedFile, showFileViewerDialog
      }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFn)();
    }
  }
</script>

<style lang="scss" scoped>
  .file-explorer-panel {
    position: relative;
    height: 100%;

    &--empty {
    }

    :deep .file-container {
      &--grid {
        display: grid;
        grid-gap: 0.33%;
        row-gap: 10px;
        grid-template-columns: repeat(12, 8%);
        text-align: center;

        > div {
          padding-top: 4px;
          height: 100%;
        }
      }

      &--list {
        flex-direction: column;

        > div:nth-child(even) {
          background-color: #f7f7f7;
        }
      }

      &--empty {
        height: 100%;
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        align-items: center;

        &__message {
          color: #bdbdbd;
          font-size: 2em;
        }

        &__upload {
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #536DFE;
          font-size: 1.75em;
        }
      }

      .file--cut {
        opacity: 0.6;
      }
    }
  }
</style>
