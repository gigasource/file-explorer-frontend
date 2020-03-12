<script>
  import {ref} from '@vue/composition-api'
  import File from './File'
  import ContextMenu from "./ContextMenu"
  import {Fragment} from 'vue-fragment'

  export default {
    name: 'FileExplorerPanel',
    components: {File, ContextMenu, Fragment},
    props: {
      files: [Array, Object],
      path: String,
      slotNames: Object,
      appendContextOptions: Array,
      viewMode: String,
    },
    setup(props, context) {
      const selectedFile = ref(null);
      const openingContextMenu = ref(null); // the file that has an opening context menu

      function renderFileContainer(files) {
        const elementData = {
          class: {
            'file-container': true,
            'file-container--grid': props.viewMode === 'grid',
            'file-container--list': props.viewMode === 'list',
          },
        }

        if (Array.isArray(files) && files.length > 0) {
          return (
              <div {...elementData}>
                {files.map(f => {
                  const menuData = {
                    props: {
                      value: openingContextMenu.value === f,
                      closeOnContentClick: true,
                      absolute: true,
                      contentFillWidth: false,
                    },
                    scopedSlots: {
                      activator: ({toggleContent}) => {
                        return (
                            <div>
                              {renderFile(f, toggleContent)}
                            </div>
                        )
                      },
                      default: () => {
                        return renderContextMenu(f)
                      }
                    }
                  }

                  return <div>
                    <g-menu {...menuData}/>
                  </div>
                })}
              </div>
          )
        } else {
          return (
              <fragment>
                <g-icon class="empty-folder__icon" color="#bdbdbd" xLarge>far fa-folder-open</g-icon>
                <span class="empty-folder-message">Empty folder</span>
              </fragment>
          )
        }
      }

      function renderFile(f, toggleContextMenu) {
        const fileElData = {
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
              context.emit('openFile', file)
            },
            dblclick(file) {
            },
            contextmenu(e, file) {
              toggleContextMenu(e)
              openingContextMenu.value = file
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
          },
          scopedSlots: {
            default: context.slots[props.slotNames.contextMenu],
          },
          on: {
            openFile: file => context.emit('openFile', file),
            cutFile: file => context.emit('cutFile', file),
            pasteFile: file => context.emit('pasteFile', file),
            deleteFile: file => context.emit('deleteFile', file),
            renameFile: file => context.emit('renameFile', file),
          }
        }

        return <ContextMenu {...elementData}/>
      }

      function render() {
        const elementData = {
          class: {
            'file-explorer-panel': true,
            'file-explorer-panel--empty': !Array.isArray(props.files) || props.files.length === 0,
          },
          on: {
            click: () => openingContextMenu.value = null
          },
        }

        return <div {...elementData}>
          {renderFileContainer(props.files)}
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
    min-height: 100%;

    &--empty {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;
    }
  }

  .file-container {
    display: flex;
    flex-wrap: wrap;

    &--grid ::v-deep {
      flex-direction: row;
      text-align: center;

      > div {
        flex: 0 1 8%;
        padding-top: 4px;
        height: 100%;
      }
    }

    &--list ::v-deep {
      flex-direction: column;

      > div:nth-child(even) {
        background-color: #f7f7f7;
      }
    }
  }

  .empty-folder-message {
    color: #bdbdbd;
    font-size: 3em;
  }
</style>
