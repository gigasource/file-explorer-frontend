<script>
  import {ref} from '@vue/composition-api'
  import File from './File'
  import ContextMenu from "./ContextMenu"
  import FileViewerDialog from "./FileViewerDialog";

  export default {
    name: 'FileExplorerPanel',
    components: {FileViewerDialog, File, ContextMenu},
    props: {
      files: [Array, Object],
      path: String,
      slotNames: Object,
      appendContextOptions: Array,
      viewMode: String,
      fileInClipboard: Object,
    },
    setup(props, context) {
      const selectedFile = ref(null)
      const showContextMenu = ref(false)
      const showFileViewerDialog = ref(false)

      function renderFileContainer() {
        const menuData = {
          props: {
            value: showContextMenu.value,
            closeOnContentClick: true,
            absolute: true,
            contentFillWidth: false,
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
                      <div {...containerData}>
                        <g-icon class="empty-folder__icon" color="#bdbdbd" xLarge>far fa-folder-open</g-icon>
                        <span class="empty-folder-message">Empty folder</span>
                      </div>
                    </div>
                )
              }
            },
            default: () => {
              return renderContextMenu(selectedFile.value)
            }
          }
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
              context.emit('update:fileInClipboard', file)
              context.emit('cut', file)
            },
            paste: file => {
              context.emit('update:fileInClipboard', null)
              if (props.path !== file.folderPath) context.emit('paste', file)
            },
            delete: file => context.emit('delete', file),
            rename: file => context.emit('rename', file),
            newFile: () => context.emit('newFile'),
            newFolder: () => context.emit('newFolder'),
          }
        }

        return <ContextMenu {...elementData}/>
      }

      function renderFileViewerDialog() {
        const dialogData = {
          props: {
            showDialog: showFileViewerDialog.value,
            file: selectedFile.value,
          },
          on: {
            close: () => showFileViewerDialog.value = false,
          }
        }

        return <file-viewer-dialog {...dialogData}/>
      }

      function render() {
        const elementData = {
          class: {
            'file-explorer-panel': true,
            'file-explorer-panel--empty': !Array.isArray(props.files) || props.files.length === 0,
          },
        }

        return <div {...elementData}>
          {renderFileContainer(props.files)}
          {renderFileViewerDialog()}
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
    height: 100%;

    &--empty {
    }

    .empty-folder-message {
      color: #bdbdbd;
      font-size: 3em;
    }

    ::v-deep .file-container {
      &--grid {
        display: grid;
        grid-gap: 0.5%;
        row-gap: 10px;
        grid-template-columns: repeat(12, 7.83%);
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

      .file--cut {
        opacity: 0.6;
      }
    }
  }
</style>
