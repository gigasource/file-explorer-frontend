<script>
  import { getScopeIdRender } from "../../utils/get-scope-id-render";

  export default {
    name: 'ViewMode',
    props: {
      disabled: Boolean,
      outlined: Boolean,
      selectedViewMode: String,
      backgroundColor: {
        type: String,
        default: 'white',
      },
      textColor: {
        type: String,
        default: '#616161',
      },
    },
    setup(props, context) {
      const viewModes = ['grid', 'list']

      const onViewModeUpdated = function (viewMode) {
        context.emit('update:viewMode', viewMode)
      }

      function renderFn() {
        return context.slots.default &&
            context.slots.default({ onViewModeUpdated, selectedViewMode: props.selectedViewMode })
            || <g-item-group class="view-mode mx-1">
              {viewModes.map(mode => {
                return (
                    <g-btn {...{
                      class: {
                        'view-mode--selection': true,
                        [`view-mode--${mode}`]: true,
                        'view-mode--selected': props.selectedViewMode === mode,
                      },
                      flat: true,
                      backgroundColor: props.backgroundColor,
                      textColor: props.textColor,
                      disabled: props.disabled,
                      onClick: () => onViewModeUpdated(mode)
                    }}>
                      <g-icon class="file-icon"
                              color={props.selectedViewMode === mode ? 'white' : 'black'}
                              small>{mode === 'grid' ? 'fas fa-th' : 'fas fa-list'}</g-icon>
                    </g-btn>
                )
              })}
            </g-item-group>
      }

      return {
        renderFn
      }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFn)();
    }
  }
</script>

<style lang="scss" scoped>
  .view-mode {
    height: 70% !important;
    display: flex;
    cursor: pointer;
    align-items: center;

    :deep(.view-mode--selection) {
      height: 100% !important;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    :deep(.view-mode--selected) {
      background-color: #536dfe !important;
    }
  }
</style>
