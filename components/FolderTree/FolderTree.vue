<script>
  import { computed } from 'vue'
  import { folderArrayToFolderParth, folderPathToFolderArray } from '../../utils/file-path'
  import { getScopeIdRender } from "../../utils/get-scope-id-render";

  export default {
    name: "FolderTree",
    emits: ['folderSelected'],
    props: {
      folders: Array,
      folderTree: Array,
      path: String,
    },
    setup(props, context) {
      function folderPathToTreePath(folderPath) {
        if (folderPath === '/' || !props.folderTree) return 'folders.0'
        if (!folderPath.endsWith('/')) folderPath += '/'

        let treePath = 'folders.0';
        let folderNames = folderPath.split('/')
        folderNames = folderNames.filter(f => f.length > 0)
        let currentFolderArray = props.folderTree[0].folders;

        while (folderNames.length > 0) {
          const currentFolderName = folderNames.shift();
          const folderIndex = currentFolderArray.findIndex(folder => folder.folderName === currentFolderName);
          currentFolderArray = currentFolderArray[folderIndex].folders
          treePath += `.folders.${folderIndex}`;
        }

        return treePath;
      }

      const selectedPath = computed(() => {
        return folderPathToTreePath(props.path)
      })

      function makeTreeClickable(tree) {
        if (tree) tree.forEach(e => {
          e.clickable = true;
          if (e.folders && e.folders.length > 0) makeTreeClickable(e.folders);
        });
        return tree;
      }

      const treeData = computed(() => {
        return makeTreeClickable(props.folderTree)
      })

      function onFolderSelected(folderObject) {
        const folderArray = folderPathToFolderArray(folderObject.folderPath || '')
        if (folderObject.folderName) folderArray.push(folderObject.folderName)

        context.emit('folderSelected', folderArrayToFolderParth(folderArray));
      }

      function nodeIcon(node) {
        if (node.node.folderName === '/') return 'fas fa-home'
        return node.state.selected || !node.state.collapse ? 'fas fa-folder-open' : 'fas fa-folder'
      }

      function itemText(node) {
        if (!node) return ''

        if (node.folderName === '/') return 'Home'
        else return node.folderName
      }

      function renderFn() {
        const elementData = {
          data: treeData.value,
          itemText,
          itemChildren: 'folders',
          itemIcon: nodeIcon,
          expandLevel: 2,
          modelValue: selectedPath.value,
          onNodeSelected: onFolderSelected
        }

        if (props.folderTree) {
          return (
              <div class="folder-tree">
                <g-side-bar-tree-view {...elementData}/>
              </div>
          )
        } else {
          return <div/>
        }
      }

      return { renderFn, selectedPath }
    },
    render() {
      const renderWithScopeId = getScopeIdRender();
      return renderWithScopeId(this.renderFn)();
    }
  }
</script>

<style scoped lang="scss">
  .folder-tree :deep {
    .g-treeview-item {
      border: 1px solid transparent;
      font-weight: bold;
      font-size: 14px;

      .g-icon {
        color: #2962FF;
        font-size: 16px !important;
        margin: 4px;
      }
    }

    .g-treeview-wrapper {
      .g-treeview-children {
        margin-left: 16px;
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
