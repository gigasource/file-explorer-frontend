<script>
  import _ from 'lodash'
  import SearchBar from "./SearchBar"
  import ViewMode from './ViewMode'
  import ViewOption from "./ViewOption";
  import {Fragment} from 'vue-fragment';
  import ActionButton from "./ActionButton";
  import AddressBar from "../AddressBar/AddressBar";

  export default {
    components: {AddressBar, ActionButton, ViewOption, ViewMode, SearchBar, Fragment},
    props: {
      selectedViewMode: String,
      selectedFilter: String,
      selectedGroup: String,
      selectedSort: String,
      slotNames: Object,
      path: String,
      addressBarDivider: {
        type: String,
        default: '->',
      },
    },
    name: 'Toolbar',
    setup(props, context) {
      const renderUpButton = () => {
        return <action-button {...{
          props: {
            actionText: 'Up',
            actionIcon: 'fas fa-arrow-up',
            actionName: 'up',
            disabled: props.path === '/',
          },
          on: {
            up: () => context.emit('up')
          },
          scopedSlots: {
            default: context.slots[props.slotNames.btnBack]
          }
        }}/>
      }

      const renderViewMode = () => {
        return <view-mode {...{
          props: {
            selectedViewMode: props.selectedViewMode
          },
          on: {
            'update:viewMode': viewMode => context.emit('update:viewMode', viewMode)
          },
          scopedSlots: {
            default: context.slots[props.slotNames.viewModeSelection]
          }
        }} />
      }

      const renderFileSort = () => {
        return <view-option {...{
          props: {
            prependText: 'Sort: ',
            selectedOption: props.selectedSort,
            options: [
              {text: 'A-Z', value: 'az'},
              {text: 'Z-A', value: 'za'},
              {text: 'Newer', value: 'new'},
              {text: 'Older', value: 'old'},
            ],
            optionIcon: 'fas fa-sort',
            optionType: 'sort',
          },
          on: {
            'update:sort': sort => context.emit('update:sort', sort)
          },
          scopedSlots: {
            default: context.slots[props.slotNames.fileSort]
          }
        }}/>
      }

      const renderFileGroup = () => {
        return <view-option {...{
          props: {
            selectedOption: props.selectedGroup,
            options: [
              {text: 'No group', value: null},
              {text: 'Group 1', value: '1'},
              {text: 'Group 2', value: '2'},
            ],
            optionIcon: 'fas fa-layer-group',
            optionType: 'group',
          },
          on: {
            'update:group': group => context.emit('update:group', group)
          },
          scopedSlots: {
            default: context.slots[props.slotNames.fileGroup]
          }
        }}/>
      }

      const renderSearchBar = () => {
        const onInput = function (searchText) {
          context.emit('update:searchText', searchText)
        }

        return <search-bar {...{
          props: {
            value: props.searchText,
            placeholder: 'Search',
          },
          on: {
            input: onInput
          },
          scopedSlots: {
            default: context.slots[props.slotNames.searchBar]
          }
        }} />
      }

      const renderNewFileButton = () => {
        return <action-button {...{
          props: {
            actionText: 'Upload',
            actionIcon: 'fas fa-cloud-upload-alt',
            actionName: 'newFile',
            actionIconColor: 'white',
            backgroundColor: '#536DFE',
            textColor: 'white',
          },
          on: {
            newFile: () => context.emit('newFile')
          },
          scopedSlots: {
            default: context.slots[props.slotNames.btnNewFile]
          }
        }}/>
      }

      const renderNewFolderButton = () => {
        return <action-button {...{
          props: {
            actionText: 'New Folder',
            actionIcon: 'fas fa-plus-circle',
            actionName: 'newFolder',
            outlined: true,
            textColor: '#536DFE',
            actionIconColor: '#536DFE',
          },
          on: {
            newFolder: () => context.emit('newFolder')
          },
          scopedSlots: {
            default: context.slots[props.slotNames.btnNewFolder]
          }
        }}/>
      }

      function renderAddressBar() {
        const elementData = {
          class: {
            'ml-2': true,
          },
          props: {
            path: props.path,
            divider: props.addressBarDivider,
          },
          on: {
            updatePath: path => context.emit('update:path', path),
          },
          scopedSlots: {
            default: context.slots[props.slotNames.addressBar],
          },
        }

        return <address-bar {...elementData}/>
      }

      const renderToolbar = () => {
        return <div class="file-explorer__toolbar">
          {renderUpButton()}
          {renderViewMode()}
          {renderFileSort()}
          {renderAddressBar()}

          {renderSearchBar()}
          {renderNewFolderButton()}
          {renderNewFileButton()}
        </div>
      }

      return {
        renderToolbar
      }
    },
    render() {
      return this.renderToolbar()
    },
  }
</script>

<style scoped lang="scss">
  .file-explorer {
    &__toolbar {
      display: flex;
      height: 50px;
      justify-content: space-between;
      padding: 0 10px;
      align-items: center;
      background-color: #E0E0E0;
      user-select: none;
    }
  }

  .search-text {
    height: 27px;
  }
</style>
