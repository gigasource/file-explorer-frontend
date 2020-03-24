<template>
  <g-dialog :width="width" :value="value && uploadingItems.length > 0" content-class="file-upload-dialog" hide-overlay persistent>
    <div class="file-upload-dialog__header">
      <div class="file-upload-dialog__header__title">{{title}}</div>
      <g-icon class="file-upload-dialog__header__close-btn" color="#F5F5F5" @click="close" medium>fas fa-times</g-icon>
    </div>
    <div class="file-upload-dialog__items">
      <div v-for="(uploadItem, i) in uploadingItems"
           :class="['upload-item', uploadItem.progress < 100 && 'upload-item--uploading']"
           :key="i">
        <g-icon v-if="getFileType(uploadItem) === 'image'" class="upload-item__thumbnail" color="#536DFE" medium>fas fa-file-image</g-icon>
        <g-icon v-else-if="getFileType(uploadItem) === 'video'" class="upload-item__thumbnail" color="#536DFE" medium>fas fa-file-video</g-icon>
        <g-icon v-else class="upload-item__thumbnail" color="#536DFE" medium>fas fa-file</g-icon>
        <div class="upload-item__title">{{ uploadItem.fileName }}</div>
        <g-spacer/>
        <div class="upload-item__progress" @mouseenter="mouseEnterUploadProgress(uploadItem)" @mouseleave="mouseLeaveUploadProgress(uploadItem)">
          <g-btn icon v-if="uploadItem.hovered && !uploadItem.success" small @click="cancelUpload(uploadItem)">
            <g-icon color="#757575" medium>fas fa-times-circle</g-icon>
          </g-btn>
          <g-progress-circular v-else-if="uploadItem.inProgress" class="upload-item__progress--uploading" v-else size="25" color="#536DFE" :value="uploadItem.progress"/>
          <div v-else-if="uploadItem.success" class="upload-item__progress--finished">
            <img alt src="/plugins/cloud-signage-plugin/assets/upload-completed.svg"/>
          </div>
          <div v-else-if="!uploadItem.success" class="upload-item__progress--failed">
            <img alt src="/plugins/cloud-signage-plugin/assets/upload-failed.svg"/>
          </div>
        </div>
      </div>
    </div>

    <action-confirm-dialog
        dialog-title="Cancel upload"
        dialog-text="Your upload is not complete. Would you like to cancel the upload?"
        confirm-action-text="Cancel upload"
        cancel-action-text="Continue upload"
        v-model="showConfirmCancelUploadDialog"
        @confirm="cancelAllUploads"/>
  </g-dialog>
</template>

<script>
  import ActionConfirmDialog from "./ActionConfirmDialog";
  export default {
    name: "FileUploadProgressDialog",
    components: {ActionConfirmDialog},
    props: {
      value: Boolean,
      width: {
        type: Number,
        default: 440,
      },
      uploadingItems: {
        type: Array,
        default: () => [],
      },
    },
    data() {
      return {
        showConfirmCancelUploadDialog: false,
      }
    },
    computed: {
      title() {
        if (this.isUploading()) {
          return `Uploading ${this.uploadingItems.length} ${this.uploadingItems.length === 1 ? 'file' : 'files'}`
        } else {
          return `Upload ${this.uploadingItems.length} ${this.uploadingItems.length === 1 ? 'file' : 'files'} complete`
        }
      }
    },
    methods: {
      getFileType(file) {
        if (file.mimeType.startsWith('image')) return 'image'
        if (file.mimeType.startsWith('video')) return 'video'
        else return 'other'
      },
      mouseEnterUploadProgress(file) {
        this.$set(file, 'hovered', true)
      },
      mouseLeaveUploadProgress(file) {
        this.$set(file, 'hovered', false)
      },
      cancelUpload(uploadItem) {
        const itemIndex = this.uploadingItems.indexOf(uploadItem)
        if (itemIndex < 0) return

        if (uploadItem.inProgress) uploadItem.cancel()

        this.$emit('removeUploadItem', itemIndex)
      },
      cancelAllUploads() {
        this.uploadingItems.forEach(uploadItem => uploadItem.cancel())
        this.$emit('update:uploadingItems', [])
      },
      isUploading() {
        return this.uploadingItems.find(item => item.inProgress)
      },
      close() {
        if (this.isUploading()) {
          this.showConfirmCancelUploadDialog = true
        } else {
          this.$emit('update:uploadingItems', [])
        }
      }
    }
  }
</script>

<style lang="scss">
  .file-upload-dialog {
    flex-direction: column;
    background: white;
    border-radius: 8px;
    position: absolute;
    bottom: 24px;
    right: 24px;
    max-height: 500px !important;
    border: 1px solid #212121;
    border-top-width: 0;

    &__header {
      display: flex;
      background: #212121;
      padding: 16px 24px;
      position: relative;
      border-top-left-radius: 8px;
      border-top-right-radius: 8px;

      &__title {
        color: white;
        font-size: 24px;
        font-weight: 600;
        line-height: 28px;
      }

      &__close-btn {
        position: absolute;
        top: 16px;
        right: 16px;
        cursor: pointer;
      }
    }

    &__status {
      background: #F5F5F5;
      padding: 16px 24px;
      color: #212121;
      font-size: 15px;
      line-height: 24px;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }

    &__items {
      overflow: auto;

      .upload-item {
        display: flex;
        padding: 8px 24px;
        align-items: center;

        &:not(:last-child) {
          border-bottom: 0.5px solid #f5f5f5;
        }

        &--uploading {
          opacity: 0.7;
        }

        &__thumbnail {
        }

        &__title {
          width: 300px;
          margin: 0 16px;
          text-overflow: ellipsis;
          overflow: hidden;
          white-space: nowrap;
          color: #333333;
          font-size: 18px;
          line-height: 50px;
        }

        &__progress {
          position: relative;
          width: 25px;
          height: 25px;

          &-finished {
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;

            img {
              width: 25px;
              height: 25px;
            }
          }

          &-hover {
            z-index: 2;
            visibility: hidden;
          }
        }
      }
    }
  }
</style>
