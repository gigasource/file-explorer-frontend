<script>
  import {ref} from "@vue/composition-api";

  export default {
    name: 'ViewOption',
    props: {
      prependText: {
        type: String,
        default: '',
      },
      selectedOption: String,
      options: Array,
      optionIcon: String,
      optionType: String,
    },
    setup(props, context) {
      const capitalize = function (s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      }
      const selectedOptionText = ref((props.options.find(e => e.value === props.selectedOption)))
      const showMenu = ref(false)
      const onOptionSelected = function (option, optionText) {
        selectedOptionText.value = optionText
        context.emit(`update:${props.optionType}`, option)
      }

      function render() {
        return context.slots.default &&
            context.slots.default({
              [`on${capitalize(props.optionType)}Selected`]: onOptionSelected,
              options: props.options,
              selectedOption: props.selectedOption
            })
            || <g-menu
                {...{
                  props: {
                    value: showMenu.value,
                    closeOnContentClick: true,
                    nudgeBottom: 10,
                    nudgeRight: 25,
                    contentClass: `file-explorer-view-option`,
                  },
                  on: {
                    input: e => showMenu.value = e,
                  },
                  scopedSlots: {
                    activator: ({on}) => {
                      return (
                          <g-btn class="view-option__btn" vOn:click={on.click}>
                            <g-icon class="file-icon" color="black" small>{props.optionIcon}</g-icon>
                            <span
                                style="margin-left: 10px">{props.prependText}{props.selectedOption === null ? capitalize(props.optionType) : selectedOptionText.value}</span>
                          </g-btn>
                      )
                    },
                    default: () => {
                      return (
                          <div class="view-option__options">
                            {props.options.map(({text, value}) => {
                              return (
                                  <g-btn class="view-option__option"
                                         vOn:click={() => onOptionSelected(value, text)}>{text}</g-btn>
                              )
                            })}
                          </div>
                      )
                    }
                  }
                }}>
            </g-menu>
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

<style lang="scss">
  .file-explorer-view-option {
    .view-option {
      &__options {
        display: flex;
        flex-direction: column;
        border: 1px solid #6B6F8280;
      }

      &__option {
        cursor: pointer;

        &:not(:last-child ) {
          border-bottom: 1px solid #6B6F8280 !important;
        }
      }
    }
  }

  .view-option__btn {
    height: 80% !important;
  }
</style>
