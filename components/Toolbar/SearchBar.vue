<script>
  import _ from 'lodash';

  export default {
    name: "Search",
    props: {
      placeholder: String,
      value: String
    },
    setup(props, context) {
      const onSearchInput = _.debounce(searchText => context.emit('input', searchText), 250)

      const renderSearchField = function () {
        const fallbackContent = (
            <div class="search row-flex align-items-center br-2 pa-1">
              <g-text-field type="text" prependIcon="search"
                            value={props.searchText} vOn:input={onSearchInput} placeholder={props.placeholder}/>
            </div>
        );

        return (context.slots.default && context.slots.default({onSearchInput}))
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
    border: 1px solid #D7D7D7;
    background-color: #FFFFFF;
    margin-left: 4px;

    .g-tf-wrapper {
      margin: 0;
    }

    > * {
      margin-right: 5px;
      font-size: 15px;
    }
  }
</style>
