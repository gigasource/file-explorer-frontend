<script>
  import {Fragment} from 'vue-fragment'

  export default {
    name: 'ContextMenu',
    props: {
      appendContextOptions: Array,
      file: Object,
    },
    components: {
      Fragment
    },
    data() {
      return {}
    },
    setup(props, context) {
      const contextOptionClasses = {
        option: 'context-menu-option',
        borderedOption: 'border',
      }

      function renderBaseContextOptions() {
        return (
            <fragment>
              <div class='context-menu-option border' vOn:click={() => context.emit('openFile', props.file)}>Open</div>
              <div class='context-menu-option' vOn:click={() => context.emit('cutFile', props.file)}>Cut</div>
              <div class='context-menu-option' vOn:click={() => context.emit('pasteFile', props.file)}>Paste</div>
              <div class='context-menu-option' vOn:click={() => context.emit('deleteFile', props.file)}>Delete</div>
              <div class='context-menu-option' vOn:click={() => context.emit('renameFile', props.file)}>Rename</div>
            </fragment>
        )
      }

      function renderExtraContextOptions() {
        if (!Array.isArray(props.appendContextOptions) || props.appendContextOptions.length === 0) return null

        return (
            <fragment>
              {props.appendContextOptions.map(({text, handler}) => (
                  <div class='context-menu-option' vOn:click={() => handler(props.file)}>{text}</div>
              ))}
            </fragment>
        )
      }

      function render() {
        if (context.slots.default) return context.slots.default({file: props.file})

        return (
            <div class="context-menu">
              {renderBaseContextOptions()}
              {renderExtraContextOptions()}
            </div>
        )
      }

      return {
        render
      };
    },
    render() {
      return this.render();
    }
  }
</script>

<style lang="scss" scoped>
  ::v-deep .context-menu {
    opacity: 0.98;
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
    }
  }
</style>
