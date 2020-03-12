<script>
  import {ref} from '@vue/composition-api';
  import ContextMenu from "./ContextMenu";

  export default {
    name: 'File',
    components: {ContextMenu},
    props: {
      file: null,
      selected: {
        type: Boolean,
        default: false,
      },
      viewMode: String,
    },
    directives: {
      focus: {
        inserted: function (el) {
          el.click()
        }
      }
    },
    setup(props, context) {
      const isEditingName = ref(false)
      const showContextMenu = ref(false)

      function renderFileIcon() {
        let icon = 'fas fa-file';

        if (props.file.isFolder) icon = 'fas fa-folder';
        else if (props.mimeType === 'video') icon = 'fas fa-film';
        else if (props.mimeType === 'image') icon = 'fas fa-file-image';

        return <g-icon class="file-icon" color="blue" xLarge>{icon}</g-icon>
      }

      function renderFileName() {
        let fileName = props.file.fileName;

        const fileNameEditEventListeners = {
          on: {
            blur() {
              context.emit('updateFileName', props.file, fileName);
              isEditingName.value = false;
            }
          }
        }

        if (!isEditingName.value) return (
            <span class="file-name">
              {props.file.fileName}
            </span>
        )

        // vFocus is a custom directive declared on top of this file
        else return (
            <div class="file-name-edit">
              <g-text-field
                  outlined vFocus dense
                  {...fileNameEditEventListeners}
                  value={fileName}
                  vOn:input={newName => fileName = newName}/>
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
          on: {
            click() {
              context.emit('click', props.file);
            },
            dblclick() {
              context.emit('dblclick', props.file);
            },
            contextmenu(e) {
              e.preventDefault()
              context.emit('contextmenu', e, props.file);
            },
          },
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
      return this.renderFile()
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
        display: flex;
        justify-content: center;
        padding: 0 4px;
      }
    }

    &--list {
      padding: 8px;

      .file-name {
        padding-left: 6px;
      }
    }

    .file-icon {
      padding: 2px 5px;
    }

    .file-name-edit ::v-deep {
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

  .grid-item {

  }

  .list-item {
  }
</style>
