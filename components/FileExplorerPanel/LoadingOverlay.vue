<template>
  <g-overlay class="loading-overlay" :value="value">
    <div class="ta-center">
      <g-progress-circular class="loading-overlay__progress" indeterminate color="primary" :size="64"/>
      <h3 class="loading-overlay__message">{{message}}</h3>
    </div>
  </g-overlay>
</template>

<script>
  export default {
    name: "LoadingOverlay",
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
