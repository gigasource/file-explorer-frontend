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
          folderName: '/',
          disabled: false,
          absolutePath: '/',
        })

        return paths
      });

      function render() {
        const updatePath = absolutePath => context.emit('updatePath', absolutePath)

        if (context.slots.default) {
          debugger
          return context.slots.default({breadcrumbs: breadcrumbs.value, updatePath})
        }

        const elementData = {
          scopedSlots: {
            item: props => {
              return (
                  <g-breadcrumbs-item disabled={props.item.disabled} vOn:click={() => updatePath(props.item.absolutePath)}>
                    {props.item.folderName}
                  </g-breadcrumbs-item>
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

<style scoped>

</style>
