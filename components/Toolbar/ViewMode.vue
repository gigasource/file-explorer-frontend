<script>
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

      function render() {
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
                      props: {
                        flat: true,
                        backgroundColor: props.backgroundColor,
                        textColor: props.textColor,
                        disabled: props.disabled,
                      },
                      on: {
                        click() {
                          onViewModeUpdated(mode)
                        }
                      }
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
        render
      }
    },
    render() {
      return this.render()
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
