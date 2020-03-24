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
                disabled: index === array.length - 1,
                absolutePath,
              }
            })

        paths.unshift({
          folderName: 'Home',
          disabled: false,
          absolutePath: '/',
        })

        return paths
      });

      function render() {
        const updatePath = absolutePath => context.emit('updatePath', absolutePath)

        if (context.slots.default) {
          return context.slots.default({breadcrumbs: breadcrumbs.value, updatePath})
        }

        const elementData = {
          class: {
            'address-bar': true,
          },
          scopedSlots: {
            item: props => {
              return (
                  <g-btn background-color="#e0e0e0" flat small style="min-width: initial" disabled={props.item.disabled}
                                      vOn:click={() => updatePath(props.item.absolutePath)}>
                    {props.item.folderName}
                  </g-btn>
              )
            }
          },
          props: {
            items: breadcrumbs.value,
            divider: props.divider
          }
        }

        return <g-breadcrumbs {...elementData}/>
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
  }
</style>
