<template>
  <g-dialog v-model="modelValue" persistent width="30%">
    <g-card elevation="16">
      <g-card-title class="dialog">
        Rename file {{ file && file.fileName }}
      </g-card-title>
      <g-card-text>
        <g-text-field v-model="newFileName" :rules="renameRules"/>
      </g-card-text>
      <g-card-actions>
        <g-btn background-color="warning" text-color="#ffffff" @click="close">Cancel</g-btn>
        <g-btn background-color="primary" text-color="#ffffff" @click="renameFile"
               :disabled="file && files && (newFileName === file.fileName || !!(files.find(f => f.fileName === newFileName)))">
          OK
        </g-btn>
      </g-card-actions>
    </g-card>
  </g-dialog>
</template>

<script>
  export default {
    name: "FileRenameDialog.vue",
    props: {
      modelValue: Boolean,
      files: Array,
      file: Object,
    },
    data() {
      return {
        newFileName: '',
        renameRules: [
          v => (this.file && v === this.file.fileName || !(this.files.find(file => file.fileName === v))) || 'Can not rename to an existing name'
        ],
      }
    },
    methods: {
      renameFile() {
        this.$emit('rename', this.file, this.newFileName)
        this.close()
      },
      close() {
        this.$emit('update:modelValue', false)
      },
    },
    watch: {
      file() {
        if (this.file) this.newFileName = this.file.fileName
      }
    }
  }
</script>

<style scoped lang="scss">
</style>
