<script>
  import { computed } from 'vue'
  import { getScopeIdRender } from "../../utils/get-scope-id-render";

  export default {
    name: 'ContextMenu',
    props: {
      appendContextOptions: Array,
      file: Object,
      fileInClipboard: Object,
      path: String,
    },
    data() {
      return {}
    },
    emits: ['open', 'newFile', 'newFolder', 'cut', 'copy', 'paste', 'delete', 'rename'],
    setup(props, context) {
      const disablePaste = computed(() => {
        return props.path.startsWith(props.fileInClipboard.folderPath + props.fileInClipboard.fileName + '/')
      });

      function renderExtraContextOptions() {
        if (!Array.isArray(props.appendContextOptions) || props.appendContextOptions.length === 0) return null

        return props.appendContextOptions.map(({ text, handler }) => (
            <div class='context-menu-option' onClick={() => handler(props.file)}>{text}</div>
        ))
      }

      function renderFn() {
        if (context.slots.default) return context.slots.default({ file: props.file })

        function createOptionData(action, classes, disabled) {
          if (!classes) classes = {}

          return {
            class: {
              'context-menu-option': true,
              'context-menu-option__disabled': disabled,
              ...classes,
            },
            onClick: () => {
              if (!disabled) context.emit(action, props.file)
            }
          }
        }

        return (
            <div class="context-menu">
              <div {...createOptionData('open', { 'border': true }, !props.file)}>Open</div>
              <div {...createOptionData('newFile', null)}>Upload file</div>
              <div {...createOptionData('newFolder', { 'border': true })}>New folder</div>
              <div {...createOptionData('cut', null, !props.file)}>Cut</div>
              <div {...createOptionData('copy', null, !props.file || props.file.isFolder)}>Copy</div>
              <div {...createOptionData('paste', null, !props.fileInClipboard || disablePaste.value)}>Paste</div>
              <div {...createOptionData('delete', null, !props.file)}>Delete</div>
              <div {...createOptionData('rename', null, !props.file)}>Rename</div>
              {renderExtraContextOptions()}
            </div>
        )
      }

      return {
        renderFn
      };
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFn)();
    }
  }
</script>

<style lang="scss" scoped>
  :deep .context-menu {
    z-index: 100;
    border: 1px solid #9E9E9E;
    box-shadow: -1px 1px 6px rgba(0, 0, 0, 0.19);
    border-radius: 4px;

    &-option {
      font-size: 14px;
      color: #212121;
      width: 120px;
      padding: 8px;
      cursor: pointer;
      background: #E5E3E3;

      &.border {
        border: none;
        border-bottom: 1px solid #bdbdbd;
      }

      &:first-child {
        border-radius: 4px 4px 0 0;
      }

      &:last-child {
        border-radius: 0 0 4px 4px;
      }

      &:hover {
        background: #efefef;
      }

      &__disabled {
        display: none;
      }
    }
  }
</style>
