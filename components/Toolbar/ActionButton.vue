<script>
  import { getScopeIdRender } from "../../utils/get-scope-id-render";
  import GIcon from '../pvf/components/GIcon/GIcon';
  import GBtnBs from '../pvf/components/GBtn/GBtnBs';

  export default {
    name: 'ActionButton',
    components: { GIcon, GBtnBs },
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

      function renderFn() {
        return context.slots.default &&
            context.slots.default({ [props.actionName]: onAction })
            ||
            (
                <g-btn-bs outlined={props.outlined} class="mx-1 action-btn" disabled={props.disabled} flat
                       background-color={props.backgroundColor} text-color={props.textColor}
                       onClick={() => context.emit(props.actionName)}>
                  <g-icon class="action-btn__icon" color={props.actionIconColor} small>{props.actionIcon}</g-icon>
                  <span style="margin-left: 10px">{capitalize(props.actionText)}</span>
                </g-btn-bs>
            )
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

<style scoped lang="scss">
  .action-btn {
    height: 70% !important;
  }
</style>
