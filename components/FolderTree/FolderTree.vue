<script>
  import {ref, computed} from '@vue/composition-api'

  export default {
    name: "FolderTree",
    props: {
      value: String,
      folders: Array,
    },
    setup(props, context) {
      const rootFolderData = {
        fileName: '/',
        clickable: true,
        folders: [

        ]
      }

      const testData = computed(() => {
        return [
          {
            fileName: '/',
            clickable: true,
            folders: props.folders.map(folder => (
                {
                  clickable: true,
                  ...folder
                }
            )),
          }
        ]
      })

      function convertSidebarConfig(items) {
        return items.map(e => {
          let children
          if (e.items) children = this.convertSidebarConfig(e.items)

          switch (e.choice.toLowerCase()) {
            case 'collection':
              return {text: e.name, type: e.name, icon: e.icon, ...children && {children}, isCollection: true}
            case 'section':
              return {subheader: e.name.toUpperCase(), type: 'subheader'}
            case 'group':
              return {text: e.name, type: e.name, icon: e.icon, ...children && {children}, clickable: e.clickable}
            case 'view':
              const nodeAttrs = {text: e.name, type: e.name, icon: e.icon, isView: true}
              const componentData = this.componentList.find(comp => comp.name === e.name)

              if (componentData) return Object.assign(componentData, nodeAttrs)
          }
        })
      }

      const val = ref(null)

      function getPath(items, path) {
        const newPath = [];
        const folders = path.split('/');
        ;
        for (const folder of folders) {
          const index = _.findIndex(items, item => item.title === folder);
          items.findIndex()
          newPath.push('items');
          if (index > -1) {
            const item = items[index];
            if (item.items) {
              newPath.push(index);
              items = item.items
            }
          } else {
            newPath.push(items.length)
          }
        }
        return newPath.join('.')
      };

      const tree = computed({
        get: () => getPath(props.items, props.value),
        set: val => {
          const path = val.split('.');
          path.shift();
          const value = _.get(props.items, [...path, 'path']);
          context.emit('input', value)
        }
      });

      const slots = {
        default: ({node, nodeState, nodeData, nodePath, nodeText, toggleNodeExpansion, childrenVNodes}) => <li
            className={!nodeState.collapse && childrenVNodes && 'g-treeview__open'}>
          <a {...nodeData}>
            <g-icon size="18" vOn:click={e => toggleNodeExpansion(e, nodePath)} color={'#9e9e9e'}
                    style={!childrenVNodes && {'visibility': 'hidden'}}>
              {nodeState.collapse ? 'keyboard_arrow_right' : 'keyboard_arrow_down'}
            </g-icon>
            <g-icon size="16" color={node.iconColor || '#757575'}>{node.icon}</g-icon>
            <span style={{'margin-left': '4px', 'font-weight': node.home ? '700' : '400'}}>{nodeText}</span>
          </a>
          <g-expand-transition>{childrenVNodes}</g-expand-transition>
        </li>
      };

      function render() {
        const elementData = {
          props: {
            value: val.value,
            // data: props.items,
            data: testData.value,
            itemText: 'fileName',
            itemChildren: 'folders',
            itemIcon: 'fas fa-folder',
            expandLevel: 2,
          },
          on: {
            input: value => val.value = value
          },
          // scopedSlots: {
          //   ...slots
          // }
        }

        return (
            <div class="test">
              <g-side-bar-tree-view {...elementData}/>
            </div>
        )
      }

      return {render}
    },
    render() {
      return this.render()
    }
  }
</script>

<style scoped lang="scss">
  .test ::v-deep {
    .g-treeview-action {
      display: none !important;
    }

    .g-treeview-item {
      border: 1px solid transparent;
    }

    .g-treeview-wrapper {
      .g-treeview-children {
        margin-left: 8px;
      }
    }

    .g-treeview__active {
      background: #CDE7FE !important;
      border-color: #64B5F6;
      color: #2c3e50 !important;
      box-shadow: none !important;
    }

    .g-treeview__open {
      background-color: transparent !important;
    }
  }
</style>
