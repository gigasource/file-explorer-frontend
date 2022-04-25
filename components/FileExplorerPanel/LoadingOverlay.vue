<template>
  <g-overlay class="loading-overlay" :value="value">
    <div class="ta-center">
      <g-progress-circular class="loading-overlay__progress" indeterminate color="primary" :size="64"/>
      <h3 class="loading-overlay__message">{{message}}</h3>
    </div>
  </g-overlay>
</template>

<script>
  import GOverlay from '../pvf/components/GOverlay/GOverlay';
  import GProgressCircular from '../pvf/components/GProgressCircular/GProgressCircular';

  export default {
    name: "LoadingOverlay",
    components: {GOverlay, GProgressCircular},
    props: {
      value: Boolean,
      message: String,
    }
  }
</script>

<style scoped lang="scss">
  .loading-overlay {
    &__progress, &__message {
      color: #3949ab !important;
    }
  }
</style>
