<script>
  import {ref, computed, onMounted} from '@vue/composition-api'
  import {folderArrayToFolderParth, folderPathToFolderArray} from '../../utils/file-path'

  export default {
    name: "FolderTree",
    props: {
      value: String,
      folders: Array,
      folderTree: Array,
      path: String,
    },
    setup(props, context) {
      function folderPathToTreePath(folderPath) {
        if (folderPath === '/') return 'folders.0'
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

      function render() {
        const elementData = {
          props: {
            data: treeData.value,
            itemText,
            itemChildren: 'folders',
            itemIcon: nodeIcon,
            expandLevel: 2,
            value: selectedPath.value,
          },
          on: {
            'node-selected': onFolderSelected
          },
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

      return {render, selectedPath}
    },
    render() {
      return this.render();
    }
  }
</script>

<style scoped lang="scss">
  .folder-tree ::v-deep {
    .g-treeview-item {
      border: 1px solid transparent;
      font-weight: bold;

      .g-icon {
        color: #2962FF;
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
