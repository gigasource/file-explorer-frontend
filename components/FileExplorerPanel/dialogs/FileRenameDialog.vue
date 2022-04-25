<template>
  <g-dialog v-model="modelValue" persistent width="30%">
    <div elevation="16">
      <div class="dialog">
        Rename file {{ file && file.fileName }}
      </div>
      <div>
        <input v-model="newFileName"/>
      </div>
      <div>
        <g-btn-bs background-color="warning" text-color="#ffffff" @click="close">Cancel</g-btn-bs>
        <g-btn-bs background-color="primary" text-color="#ffffff" @click="renameFile"
               :disabled="file && files && (newFileName === file.fileName || !!(files.find(f => f.fileName === newFileName)))">
          OK
        </g-btn-bs>
      </div>
    </div>
  </g-dialog>
</template>

<script>
  import GDialog from '../../pvf/components/GDialog/GDialog';
  import GBtnBs from '../../pvf/components/GBtn/GBtnBs';
  import GTextField from '../../pvf/components/GInput/GTextField';

  export default {
    name: "FileRenameDialog.vue",
    emits: ['update:modelValue', 'rename'],
    components: {GDialog, GBtnBs, GTextField},
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
