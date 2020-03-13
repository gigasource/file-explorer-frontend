<script>
  import {ref} from "@vue/composition-api";

  export default {
    name: 'ViewOption',
    props: {
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
                    nudgeLeft: 6,
                    contentClass: "file-opt",
                  },
                  on: {
                    input: e => showMenu.value = e,
                  },
                  scopedSlots: {
                    activator: ({on}) => {
                      return (
                          <g-btn class="file-opt__btn" vOn:click={on.click}>
                            <g-icon class="file-icon" color="black" small>{props.optionIcon}</g-icon>
                            <span
                                style="margin-left: 10px">{props.selectedOption === null ? capitalize(props.optionType) : selectedOptionText.value}</span>
                          </g-btn>
                      )
                    },
                    default: () => {
                      return (
                          <div class="file-opt__options">
                            {props.options.map(({text, value}) => {
                              return (
                                  <g-btn class="file-opt__option"
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

<style scoped lang="scss">
  .file-opt__options {
    position: relative;
    background-color: #FFF;
    border-radius: 2px;
    border: 1px solid #E0E0E0;

    &:before {
      content: '';
      width: 0;
      height: 0;
      border: 8px solid transparent;
      border-bottom-color: #fff;
      position: absolute;
      top: -16px;
      left: 50%;
      transform: translateX(-50%);
      z-index: 2;
    }

    &:after {
      content: '';
      width: 0;
      height: 0;
      border: 9px solid transparent;
      border-bottom-color: #E0E0E0;
      position: absolute;
      top: -18px;
      left: 50%;
      transform: translateX(-50%);
    }

    .file-opt__option {
      background-color: #FFF;
      font-size: 14px;
      line-height: 20px;
      padding: 10px;
      border-bottom: 1px solid #6B6F8280;
      text-align: left;
      user-select: none;
      cursor: pointer;
      color: #333333;

      &:hover {
        background-color: #F4F5FA;
      }

      &:last-child {
        border-bottom: none;
      }
    }
  }

  .file-opt__btn {
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
