<script>
  import {computed} from '@vue/composition-api'

  export default {
    name: 'AddressBar',
    props: {
      path: String,
      divider: String,
    },
    setup(props, context) {
      const breadcrumbs = computed(() => {
        const paths = props.path.split('/')
            .filter(item => !!item)
            .map((item, index, array) => {
              const absolutePath = `/${array.slice(0, index + 1).join('/')}/`

              return {
                folderName: item,
                index: index + 1,
                length: array.length + 1,
                absolutePath,
              }
            })

        paths.unshift({
          folderName: 'Home',
          index: 0,
          length: paths.length + 1,
          absolutePath: '/',
        })

        return paths
      });

      function render() {
        const updatePath = absolutePath => context.emit('update:path', absolutePath)

        if (context.slots.default) {
          return context.slots.default({breadcrumbs: breadcrumbs.value, updatePath})
        }

        const elementData = {
          class: {
            'address-bar': true,
          },
          scopedSlots: {
            item: props => {
              const itemData = {
                class: {
                  'breadcrumb-item': true,
                  'breadcrumb-item--blurred': props.item.length > 1 && props.item.index < props.item.length - 1,
                },
                on: {
                  click: () => {
                    if (props.item.index === props.item.length - 1) return
                    updatePath(props.item.absolutePath)
                  }
                }
              }

              return (
                  <div {...itemData}>
                    {
                      props.item.absolutePath !== '/'
                          ? <img width="12px" draggable="false"
                                 src="/plugins/cloud-signage-plugin/assets/file-explorer-path-folder.svg"/>
                          : ''
                    }
                    <span class="ml-1">{props.item.folderName}</span>
                  </div>
              )
            },
            divider: () => {
              return (
                  <img draggable="false" src="/plugins/cloud-signage-plugin/assets/file-explorer-path-separator.svg"/>
              )
            }
          },
          props: {
            items: breadcrumbs.value,
            divider: props.divider
          }
        }

        return context.slots.default
            ? context.slots.default()
            : <g-breadcrumbs {...elementData}/>
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
  .address-bar {
    flex-grow: 1 !important;
    padding: 0 8px !important;
    height: 70%;
    background-color: white;
    margin: 0 0.25rem !important;
    color: #212121;

    ::v-deep .g-breadcrumbs-divider {
      padding: 0 4px !important;
    }

    ::v-deep .breadcrumb-item {
      display: flex;
      align-items: center;
      cursor: pointer;

      &--blurred {
        color: #bdbdbd;
      }
    }

  }
</style>
