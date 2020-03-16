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
        tree.forEach(e => {
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
        return node.state.selected || !node.state.collapse ? 'fas fa-folder-open' : 'fas fa-folder'
      }

      function render() {
        const elementData = {
          props: {
            data: treeData.value,
            itemText: 'folderName',
            itemChildren: 'folders',
            itemIcon: nodeIcon,
            expandLevel: 2,
            value: selectedPath.value,
          },
          on: {
            'node-selected': onFolderSelected
          },
        }

        return (
            <div class="test">
              <g-side-bar-tree-view {...elementData}/>
            </div>
        )
      }

      return {render, selectedPath}
    },
    render() {
      return this.render();
    }
  }
</script>

<style scoped lang="scss">
  .test ::v-deep {
    .g-treeview-item {
      border: 1px solid transparent;
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
