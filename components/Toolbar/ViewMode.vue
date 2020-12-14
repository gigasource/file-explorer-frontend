<script>
  import GItemGroup from 'pos-vue-framework/src/components/GItemGroup/GItemGroup'
  import GIcon from 'pos-vue-framework/src/components/GIcon/GIcon'
  import GBtn from 'pos-vue-framework/src/components/GBtn/GBtn'
  import {getCurrentInstance, withScopeId} from 'vue';

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

      const onViewModeUpdated = function(viewMode) {
        context.emit('update:viewMode', viewMode)
      }

      function renderFn() {
        return context.slots.default &&
            context.slots.default({onViewModeUpdated, selectedViewMode: props.selectedViewMode})
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
      const { type } = getCurrentInstance()
      return withScopeId(type.__scopeId)(this.renderFn)()
    }
  }
</script>

<style lang="scss" scoped>
  .view-mode {
    height: 70% !important;
    display: flex;
    cursor: pointer;
    align-items: center;

    &--selection {
      height: 100% !important;
      background-color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    &--selected {
      background-color: #616161 !important;
    }
  }
</style>
