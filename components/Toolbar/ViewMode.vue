<script>
  export default {
    name: 'ViewMode',
    props: {
      selectedViewMode: String,
    },
    setup(props, context) {
      const viewModes = ['grid', 'list']

      const onViewModeUpdated = function(viewMode) {
        context.emit('update:viewMode', viewMode)
      }

      function render() {
        return context.slots.default &&
            context.slots.default({onViewModeUpdated, selectedViewMode: props.selectedViewMode})
            || <g-item-group class="view-mode">
              {viewModes.map(mode => {
                return (
                    <g-btn {...{
                      class: {
                        [`view-mode--${mode}`]: true,
                        'view-mode--selected': props.selectedViewMode === mode,
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
    display: flex;
    cursor: pointer;

    &--selected {
      background-color: #90caf9 !important;
    }
  }
</style>
