<script>
  export default {
    name: 'ActionButton',
    props: {
      actionName: String,
      actionIcon: String,
      actionIconColor: {
        type: String,
        default: 'black',
      },
      actionText: String,
      disabled: Boolean,
      outlined: Boolean,
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
      const capitalize = function (s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }
      const onAction = function () {
        context.emit(props.actionName)
      }

      function render() {
        return context.slots.default &&
            context.slots.default({[props.actionName]: onAction})
            ||
            (
                <g-btn outlined={props.outlined} class="mx-1 action-btn" disabled={props.disabled} flat
                       background-color={props.backgroundColor} text-color={props.textColor}
                       vOn:click={() => context.emit(props.actionName)}>
                  <g-icon class="action-btn__icon" color={props.actionIconColor} small>{props.actionIcon}</g-icon>
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
    height: 70% !important;
  }
</style>
