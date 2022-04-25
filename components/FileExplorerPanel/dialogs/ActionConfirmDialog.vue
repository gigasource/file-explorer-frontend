<template>
  <g-dialog v-model="modelValue" persistent width="30%">
    <div elevation="16">
      <div class="dialog">
        {{dialogTitle}}
      </div>
      <div class="ta-center">
        <h5>{{dialogText}}</h5>
      </div>
      <div>
        <g-btn-bs background-color="warning" text-color="#ffffff" @click="close">{{cancelActionText}}</g-btn-bs>
        <g-btn-bs background-color="primary" text-color="#ffffff" @click="doAction">{{confirmActionText}}</g-btn-bs>
      </div>
    </div>
  </g-dialog>
</template>

<script>
  import GDialog from '../../pvf/components/GDialog/GDialog';
  import GBtnBs from '../../pvf/components/GBtn/GBtnBs';

  export default {
    name: "ActionConfirmDialog",
    emits: ['update:modelValue', 'confirm'],
    components: { GDialog, GBtnBs },
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
