<script>
  import {ref} from '@vue/composition-api'
  import File from './File'
  import ContextMenu from "./ContextMenu"
  import FileViewerDialog from "./dialogs/FileViewerDialog"
  import FileRenameDialog from './dialogs/FileRenameDialog'
  import ActionConfirmDialog from "./dialogs/ActionConfirmDialog"
  import FileUploadProgressDialog from "./dialogs/FileUploadProgressDialog";
  import {Droppable} from "pos-vue-framework";
  import DropZoneOverlay from "./DropZoneOverlay";
  import _ from 'lodash'
  import emptyFolder from '../../assets/images/empty_folder.svg'

  export default {
    name: 'FileExplorerPanel',
    directives: {
      Droppable
    },
    components: {
      DropZoneOverlay,
      FileUploadProgressDialog, ActionConfirmDialog, FileRenameDialog, FileViewerDialog, File, ContextMenu
    },
    props: {
      files: [Array, Object],
      path: String,
      slotNames: Object,
      appendContextOptions: Array,
      viewMode: String,
      fileInClipboard: Object,
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
          props: {
            value: showContextMenu.value,
            closeOnContentClick: true,
            absolute: true,
            contentFillWidth: false,
            minWidth: 'initial',
          },
          scopedSlots: {
            activator: ({toggleContent: toggleContextMenu}) => {
              const containerData = {
                class: {
                  'file-container': true,
                  'file-container--grid': props.viewMode === 'grid',
                  'file-container--list': props.viewMode === 'list',
                },
              }

              const contextMenuListener = {
                on: {
                  contextmenu(e) {
                    e.preventDefault()
                    toggleContextMenu(e)
                    selectedFile.value = null
                  },
                }
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
                          <div class="file-container--empty__upload mt-3" vOn:click={() => context.emit('newFile')}>
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
          },
        }

        return (
            <g-menu {...menuData}/>
        )
      }

      function renderFile(f, toggleContextMenu) {
        const fileElData = {
          class: {
            'file--cut': props.fileInClipboard && f && props.fileInClipboard._id === f._id,
          },
          scopedSlots: {
            default: context.slots[props.slotNames.file]
          },
          props: {
            selected: f === selectedFile.value,
            file: f,
            viewMode: props.viewMode,
            draggable: props.draggable,
            fileNameDisplayMaxLength: props.fileNameDisplayMaxLength,
          },
          on: {
            click(file) {
              selectedFile.value = file;
              if (!file.isFolder) showFileViewerDialog.value = true
              context.emit('open', file)
            },
            dblclick(file) {
            },
            contextmenu(e, file) {
              e.stopPropagation()
              toggleContextMenu(e)
              selectedFile.value = file
            },
            updateFileName(file, newFileName) {
              file.fileName = newFileName;
            }
          },
        }

        return <File {...fileElData}/>
      }

      function renderContextMenu(file) {
        const elementData = {
          props: {
            appendContextOptions: props.appendContextOptions,
            file,
            fileInClipboard: props.fileInClipboard,
            path: props.path,
          },
          scopedSlots: {
            default: context.slots[props.slotNames.contextMenu],
          },
          on: {
            open: file => {
              selectedFile.value = file;
              if (!file.isFolder) showFileViewerDialog.value = true
              context.emit('open', file)
            },
            cut: file => {
              context.emit('cut', file)
            },
            paste: () => {
              context.emit('paste')
            },
            delete: file => {
              showConfirmDeleteDialog.value = true
              selectedFile.value = file
            },
            rename: file => {
              showFileRenameDialog.value = true
              selectedFile.value = file
            },
            newFile: () => context.emit('newFile'),
            newFolder: () => context.emit('newFolder'),
          }
        }

        return <ContextMenu {...elementData}/>
      }

      function renderFileViewerDialog() {
        const fileViewerDialogData = {
          props: {
            showDialog: showFileViewerDialog.value,
            file: selectedFile.value,
          },
          on: {
            close: () => showFileViewerDialog.value = false,
          }
        }

        return <file-viewer-dialog {...fileViewerDialogData}/>
      }

      function renderFileRenameDialog() {
        const dialogData = {
          props: {
            files: props.files,
            file: selectedFile.value,
            value: showFileRenameDialog.value,
          },
          on: {
            rename: (file, newName) => context.emit('rename', file, newName),
            input: val => showFileRenameDialog.value = val,
          }
        }

        return <file-rename-dialog {...dialogData} />
      }

      function renderConfirmDeleteDialog() {
        const dialogData = {
          props: {
            file: selectedFile.value,
            value: showConfirmDeleteDialog.value,
            dialogTitle: `Delete ${selectedFile.value && selectedFile.value.isFolder ? 'folder' : 'file'} ${selectedFile.value && selectedFile.value.fileName}`,
            dialogText: `Are you sure you want to delete this ${selectedFile.value && selectedFile.value.isFolder ? 'folder' : 'file'}?`,
            confirmActionText: 'delete',
          },
          on: {
            confirm: () => context.emit('delete', selectedFile.value),
            input: val => showConfirmDeleteDialog.value = val,
          },
        }

        return <action-confirm-dialog {...dialogData} />
      }

      function renderFileUploadProgressDialog() {
        const dialogData = {
          props: {
            value: props.showFileUploadProgressDialog,
            uploadingItems: props.uploadingItems,
          },
          on: {
            input: value => context.emit('update:showFileUploadProgressDialog', value),
            'removeUploadItem': itemIndex => context.emit('removeUploadItem', itemIndex),
            'update:uploadingItems': items => context.emit('update:uploadingItems', items),
          }
        }

        return <file-upload-progress-dialog {...dialogData}/>
      }

      function renderDropZoneOverlay() {
        if (!props.droppable) return ''

        return <drop-zone-overlay
            value={showDropZoneOverlay.value}
            vOn:input={val => showDropZoneOverlay.value = val}
            vOn:dropFiles={fileList => context.emit('uploadFiles', fileList)}/>
      }

      function render() {
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
                modifiers: {file: true}
              }
            ],
            on: {
              'drag-over': _.debounce(
                  function () {
                    showDropZoneOverlay.value = true
                  }, 100, {
                    leading: true,
                    trailing: false,
                  }
              ),
            }
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
        render
      }
    },
    render() {
      return this.render()
    }
  }
</script>

<style lang="scss" scoped>
  .file-explorer-panel {
    position: relative;
    height: 100%;

    &--empty {
    }

    ::v-deep .file-container {
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
