<template>
  <g-dialog v-model="modelValue" persistent width="30%">
    <g-card elevation="16">
      <g-card-title class="dialog">
        {{dialogTitle}}
      </g-card-title>
      <g-card-text class="ta-center">
        <h5>{{dialogText}}</h5>
      </g-card-text>
      <g-card-actions>
        <g-btn background-color="warning" text-color="#ffffff" @click="close">{{cancelActionText}}</g-btn>
        <g-btn background-color="primary" text-color="#ffffff" @click="doAction">{{confirmActionText}}
        </g-btn>
      </g-card-actions>
    </g-card>
  </g-dialog>
</template>

<script>
  export default {
    name: "ActionConfirmDialog",
    props: {
      file: Object,
      modelValue: Boolean,
      dialogTitle: String,
      dialogText: String,
      confirmActionText: {
        type: String,
        default: 'Ok',
      },
      cancelActionText: {
        type: String,
        default: 'Cancel',
      }
    },
    methods: {
      close() {
        this.$emit('update:modelValue', false)
      },
      doAction() {
        this.$emit('confirm', true)
        this.close()
      }
    },
  }
</script>

<style scoped lang="scss">

</style>
