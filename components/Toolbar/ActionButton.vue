<script>
  export default {
    name: 'ActionButton',
    props: {
      actionName: String,
      actionIcon: String,
      actionText: String,
      disabled: Boolean,
    },
    setup(props, context) {
      const capitalize = function (s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }
      const onAction = function () {
        context.emit(`on${capitalize(props.actionName)}`)
      }

      function render() {
        return context.slots.default &&
            context.slots.default({[`on${capitalize(props.actionName)}`]: onAction})
            ||
            (
                <g-btn class="action-btn" disabled={props.disabled} vOn:click={() => context.emit(`on${capitalize(props.actionName)}`)}>
                  <g-icon class="action-btn__icon" color="black" small>{props.actionIcon}</g-icon>
                  <span style="margin-left: 10px">{capitalize(props.actionText)}</span>
                </g-btn>
            )
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

<style scoped lang="scss">
  .action-btn {
    height: 27px;
    background-color: #fff;
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: center;
    padding-left: 5px;
    padding-right: 5px;
    margin-left: 5px;
    cursor: pointer;
    font-size: 14px;
    line-height: 20px;
    color: #616161;
  }
</style>
