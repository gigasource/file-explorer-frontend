<template>
  <g-row v-show="modelValue" v-droppable.file @drag-leave="hideOverlay" @drag-drop="dropFiles"
         class="drop-zone-overlay" justify-content="center"
         align-items="center">
    <div class="ta-center">
      <g-icon class="upload-icon animated infinite bounce" xLarge color="#536DFE">fas fa-cloud-upload-alt
      </g-icon>
      <div class="mt-3 upload-msg">Drop files/folders here to upload</div>
    </div>
  </g-row>
</template>

<script>
  import {Droppable} from "pos-vue-framework";

  export default {
    name: "DropZoneOverlay",
    directives: {
      Droppable
    },
    props: {
      modelValue: Boolean,
    },
    methods: {
      hideOverlay() {
        this.$emit('update:modelValue', false)
      },
      dropFiles(fileDataList) {
        const fileList = fileDataList.filter(data => data.file).map(data => data.file)
        this.$emit('dropFiles', fileList)
        this.hideOverlay()
      }
    }
  }
</script>

<style scoped lang="scss">
  .drop-zone-overlay {
    padding: 0 !important;
    position: absolute;
    width: calc(100% + 24px);
    height: calc(100% + 24px);
    top: -12px;
    left: -12px;
    background-color: #e8f0fe;
    box-shadow: inset 2px 2px #4285f4, inset -2px -2px #4285f4, 0 1px 2px rgba(0, 0, 0, 0.1);

    .upload-icon {
      font-size: 5em !important;
      display: block;
    }

    .upload-msg {
      font-size: 1.5em;
    }
  }
</style>
