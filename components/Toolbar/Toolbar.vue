<script>
  import SearchBar from "./SearchBar"
  import ViewMode from './ViewMode'
  import ViewOption from "./ViewOption";
  import ActionButton from "./ActionButton";
  import AddressBar from "../AddressBar/AddressBar";
  import { getScopeIdRender } from "../../utils/get-scope-id-render";

  export default {
    components: { AddressBar, ActionButton, ViewOption, ViewMode, SearchBar },
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
      hideComponents: Array,
      addressBarVNode: Object,
    },
    name: 'Toolbar',
    setup(props, context) {
      function isHidden(componentName) {
        return props.hideComponents.includes(componentName)
      }

      const renderUpButton = () => {
        if (isHidden(props.slotNames.btnBack)) return ''

        if (context.slots[props.slotNames.btnBack])
          return <action-button {...{
            actionText: 'Up',
            actionIcon: 'fas fa-arrow-up',
            actionName: 'up',
            disabled: props.path === '/',
            onUp: () => context.emit('up'),
          }}>{context.slots[props.slotNames.btnBack]()}</action-button>

        return <action-button {...{
          actionText: 'Up',
          actionIcon: 'fas fa-arrow-up',
          actionName: 'up',
          disabled: props.path === '/',
          onUp: () => context.emit('up'),
        }}/>
      }

      const renderViewMode = () => {
        if (isHidden(props.slotNames.viewModeSelection)) return ''

        if (context.slots[props.slotNames.viewModeSelection])
          return <view-mode {...{
            selectedViewMode: props.selectedViewMode,
            'onUpdate:viewMode': viewMode => context.emit('update:viewMode', viewMode),
          }}>{context.slots[props.slotNames.viewModeSelection]()}</view-mode>

        return <view-mode {...{
          selectedViewMode: props.selectedViewMode,
          'onUpdate:viewMode': viewMode => context.emit('update:viewMode', viewMode),
        }}/>
      }

      const renderFileSort = () => {
        if (isHidden(props.slotNames.fileSort)) return ''

        if (context.slots[props.slotNames.fileSort])
          return <view-option {...{
            prependText: 'Sort: ',
            selectedOption: props.selectedSort,
            options: [
              { text: 'A-Z', value: 'az' },
              { text: 'Z-A', value: 'za' },
              { text: 'Newer', value: 'new' },
              { text: 'Older', value: 'old' },
            ],
            optionIcon: 'fas fa-sort',
            optionType: 'sort',
            'onUpdate:sort': sort => context.emit('update:sort', sort)
          }}>{context.slots[props.slotNames.fileSort]()}</view-option>

        return <view-option {...{
          prependText: 'Sort: ',
          selectedOption: props.selectedSort,
          options: [
            { text: 'A-Z', value: 'az' },
            { text: 'Z-A', value: 'za' },
            { text: 'Newer', value: 'new' },
            { text: 'Older', value: 'old' },
          ],
          optionIcon: 'fas fa-sort',
          optionType: 'sort',
          'onUpdate:sort': sort => context.emit('update:sort', sort)
        }}/>
      }

      /*
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
      */

      const renderSearchBar = () => {
        if (isHidden(props.slotNames.searchBar)) return ''

        const onInput = function (searchText) {
          context.emit('update:searchText', searchText)
        }

        if (context.slots[props.slotNames.searchBar])
          return <search-bar {...{
            modelValue: props.searchText,
            placeholder: 'Search',
            'onUpdate:modelValue': onInput
          }}>{context.slots[props.slotNames.searchBar]()}</search-bar>

        return <search-bar {...{
          modelValue: props.searchText,
          placeholder: 'Search',
          'onUpdate:modelValue': onInput
        }}/>
      }

      const renderNewFileButton = () => {
        if (isHidden(props.slotNames.btnNewFile)) return ''

        if (context.slots[props.slotNames.btnNewFile])
          return <action-button {...{
            actionText: 'Upload',
            actionIcon: 'fas fa-cloud-upload-alt',
            actionName: 'newFile',
            actionIconColor: 'white',
            backgroundColor: '#536DFE',
            textColor: 'white',
            onNewFile: () => context.emit('newFile')
          }}>{context.slots[props.slotNames.btnNewFile]()}</action-button>

        return <action-button {...{
          actionText: 'Upload',
          actionIcon: 'fas fa-cloud-upload-alt',
          actionName: 'newFile',
          actionIconColor: 'white',
          backgroundColor: '#536DFE',
          textColor: 'white',
          onNewFile: () => context.emit('newFile')
        }}/>
      }

      const renderNewFolderButton = () => {
        if (isHidden(props.slotNames.btnNewFolder)) return ''

        if (context.slots[props.slotNames.btnNewFolder])
          return <action-button {...{
            actionText: 'New Folder',
            actionIcon: 'fas fa-plus-circle',
            actionName: 'newFolder',
            outlined: true,
            textColor: '#536DFE',
            actionIconColor: '#536DFE',
            onNewFolder: () => context.emit('newFolder')
          }}>{context.slots[props.slotNames.btnNewFolder]()}</action-button>

        return <action-button {...{
          actionText: 'New Folder',
          actionIcon: 'fas fa-plus-circle',
          actionName: 'newFolder',
          outlined: true,
          textColor: '#536DFE',
          actionIconColor: '#536DFE',
          onNewFolder: () => context.emit('newFolder')
        }}/>
      }

      function renderAddressBar() {
        if (isHidden(props.slotNames.addressBar)) return ''

        return props.addressBarVNode
      }

      const renderToolbar = () => {
        return <div class="file-explorer__toolbar">
          {context.slots[props.slotNames.prepend] && context.slots[props.slotNames.prepend]()}
          {renderUpButton()}
          {renderViewMode()}
          {renderFileSort()}
          {renderAddressBar()}

          {renderSearchBar()}
          {renderNewFolderButton()}
          {renderNewFileButton()}
          {context.slots[props.slotNames.append] && context.slots[props.slotNames.append]()}
        </div>
      }

      return {
        renderToolbar
      }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderToolbar)();
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
