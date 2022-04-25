<template>
	<div class="overlay" :class="overlayClass" :style="overlayStyle">
		<div class="overlay-scrim" :style="scrimStyle"></div>
		<div v-if="modelValue" class="overlay-content">
			<slot></slot>
		</div>
	</div>
</template>

<script>
  import getVModel from '../../mixins/getVModel';
  import { computed } from 'vue';

  export default {
    name: "GOverlay",
    props: {
      absolute: Boolean,
			modelValue: {
        type: Boolean,
        default: false
      },
      opacity: {
        type: [Number, String],
        default: 0.46
      },
      color: {
        type: String,
        default: '#212121',
      },
      zIndex: {
        type: [Number, String],
        default: 5,
      }
    },
		emits: ['update:modelValue'],
		setup(props, context) {
			const isActive = getVModel(props, context);

      const computedOpacity = computed(() => isActive.value ? props.opacity : 0);

      const overlayStyle = computed(() => ({
        zIndex: props.zIndex
      }));

      const overlayClass = computed(() => ({
        'overlay__active': isActive.value,
        'overlay__absolute': props.absolute
      }));

      const scrimStyle = computed(() => ({
				backgroundColor: props.color,
				opacity: computedOpacity.value
			}));

			return {
        overlayClass,
        overlayStyle,
				scrimStyle
			}
    }
  }
</script>

<style scoped lang="scss">
//Block
.overlay {

  display: flex;
  align-items: center;
  justify-content: center;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  pointer-events: none;

  //Element
  &-scrim {
    width: 100%;
    height: 100%;
    position: absolute;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
  }

  &-content {
    position: relative;
  }

  //Modifier
  &__active {
    pointer-events: visible;
  }

  &__absolute {
    position: absolute;
  }
}
</style>
