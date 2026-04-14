<script>
  import ContextMenu from "./ContextMenu"
  import { Draggable } from "pos-vue-framework"
  import videoThumbGridItem from '../../assets/images/video-thumb-grid-item.svg'
  import folderImage from '../../assets/images/folder-image.svg'
  import { getScopeIdRender } from "../../utils/get-scope-id-render";

  export default {
    name: 'File',
    directives: { Draggable },
    components: { ContextMenu },
    props: {
      file: Object,
      selected: {
        type: Boolean,
        default: false,
      },
      viewMode: String,
      draggable: Boolean,
      fileNameDisplayMaxLength: Number,
    },
    emits: ['click', 'dblclick', 'contextmenu'],
    setup(props, context) {
      function renderFileIcon() {
        const fileIconSrc = props.file.thumbnailUrl || props.file.viewUrl

        if (props.file.mimeType && props.file.mimeType.startsWith('image') && fileIconSrc) {
          return <img draggable="false" class="file-thumbnail" src={fileIconSrc}/>
        } else if (props.file.mimeType && props.file.mimeType.startsWith('video')) {
          return <img class="file-icon" src={videoThumbGridItem}
                      draggable="false"/>
        } else {
          if (props.file.isFolder) {
            return <img class="file-icon" src={folderImage}
                        draggable="false"/>
          } else {
            return <g-icon draggable="false" class="file-icon" color="blue">fas fa-file</g-icon>
          }
        }
      }

      function formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';

        const k = 1024;
        const dm = decimals < 0 ? 0 : decimals;
        const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];

        const i = Math.floor(Math.log(bytes) / Math.log(k));

        return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
      }

      function renderFileName() {
        let fileName = props.file.fileName

        if (props.viewMode === 'grid' && fileName.length > props.fileNameDisplayMaxLength) {
          const numberOfLeftChars = Math.ceil(props.fileNameDisplayMaxLength / 2)
          const numberOfRightChars = Math.floor(props.fileNameDisplayMaxLength / 2)

          fileName = fileName.substring(0, numberOfLeftChars) + '...' + fileName.substring(fileName.length - numberOfRightChars)
        }

        if (props.viewMode === 'grid') return <span className="file-name">{fileName}</span>
        if (props.file.isFolder) return <div> <p>Name: {fileName}</p> <p>Date: {props.file.createdDate}</p> </div>
        return (
            <div>
              <p>Name: {fileName}</p>
              <p>Size: {formatBytes(props.file.sizeInBytes)}</p>
              <p>Date: {props.file.createdDate}</p>
            </div>
        )
      }

      const renderFile = () => {
        if (!props.file) return

        const fileData = {
          class: {
            'file': true,
            'file--grid': props.viewMode === 'grid',
            'file--list': props.viewMode === 'list',
            'file--selected': props.selected,
          },
          onClick() {
            context.emit('click', props.file);
          },
          onDblclick() {
            context.emit('dblclick', props.file);
          },
          onContextmenu(e) {
            e.preventDefault()
            context.emit('contextmenu', e, props.file);
          },
        }

        if (props.draggable) {
          Object.assign(fileData, {
            directives: [
              {
                name: 'draggable',
                value: props.file,
                modifiers: { move: true }
              }
            ]
          })
        }

        if (context.slots.default) return context.slots.default({
          file: props.file,
          selected: props.selected,
        })

        return (
            <div {...fileData}>
              {renderFileIcon()}
              {renderFileName()}
            </div>
        );
      }

      return {
        renderFile
      }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFile)();
    }
  }
</script>

<style scoped lang="scss">
  .file {
    &:hover {
      background: #90caf9;
    }

    &--grid {
      padding: 4px;

      .file-name {
        word-break: break-all;
        display: flex;
        justify-content: center;
        padding: 0 4px;
      }
    }

    &--list {
      padding: 8px;
      display: flex;
      font-size: small;
      gap: 10px;
      cursor: pointer;

      .file-thumbnail {
        width: 60px;
        height: 60px;
      }

      .file-icon {
        font-size: 60px !important;
        width: 60px;
        height: 60px;
        padding: 0 !important;
      }

      .file-name {
        word-break: break-all;
        padding-left: 12px;
      }
    }

    .file-icon {
      padding: 2px 5px;
    }

    .file-name-edit :deep {
      display: flex;
      justify-content: center;

      .g-tf input {
        text-align: center;
      }

      .g-tf-label {
        display: none;
      }

      .g-tf-append__inner {
        padding-left: 0;
      }

      .g-tf-wrapper {
        margin: 0;
        width: 75%;
      }

      .g-tf-input-group {
        justify-content: center;
      }
    }
  }

  .file--grid {
    .file-thumbnail {
      width: 60px;
      height: 60px;
    }

    .file-icon {
      font-size: 60px !important;
      width: 60px;
      height: 60px;
    }

    .file-name {
      margin-top: 8px;
      font-size: 12px;
    }
  }
</style>
