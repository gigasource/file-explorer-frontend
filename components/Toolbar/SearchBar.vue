<script>
  import _ from 'lodash';

  export default {
    name: "SearchBar",
    emits: ['update:modelValue'],
    props: {
      placeholder: String,
      modelValue: String
    },
    setup(props, context) {
      const onSearchInput = _.debounce(searchText => context.emit('update:modelValue', searchText), 250)

      const renderSearchField = function () {
        const fallbackContent = (
            <g-text-field class="mx-1 search row-flex align-items-center br-2 pa-1"
                          {...{
                            type: "text",
                            prependInnerIcon: "search",
                            solo: true,
                            flat: true,
                            modelValue: props.modelValue,
                            'onUpdate:modelValue': onSearchInput,
                            placeholder: props.placeholder
                          }}/>
        );

        return (context.slots.default && context.slots.default({
              onSearchInput,
              searchText: props.modelValue,
              placeholder: props.placeholder
            }))
            || fallbackContent
      };

      return {
        renderSearchField
      }
    },
    render() {
      return this.renderSearchField();
    }
  }
</script>

<style lang="scss" scoped>
  .search {
    margin-top: 0;
    margin-bottom: 0;
    padding-top: 0;
    padding-bottom: 0;
    height: 70%;
    background-color: #FFFFFF;
    width: initial;
    flex-grow: 0;
    box-shadow: none;

    .g-tf-wrapper {
      margin: 0;
    }

    > * {
      margin-right: 5px;
      font-size: 15px;
    }
  }
</style>
