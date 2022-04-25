<template>
  <g-dialog v-if="file" v-model="showDialog" :height="600" :width="900" persistent>
    <div class="file-viewer-dialog">
      <div class="file-viewer-dialog__title px-5 pt-4">
        <div class="cs-dialog__title">{{ file.fileName }}</div>
        <g-spacer/>
        <g-btn-bs icon>
          <g-icon color="#7d7d7d" @click="close" medium>fas fa-times</g-icon>
        </g-btn-bs>
      </div>
      <div class="mt-2 px-4">
        <g-row class="file-description">
          <g-col cols="3">
            <span>Format: </span>
            <span class="file-description__value">{{capitalize(getFileFormat(file))}}</span>
          </g-col>
          <g-col v-if="isImageFile || isVideoFile" cols="3">
            <span>Width: </span>
            <span class="file-description__value">{{fileMetadata && fileMetadata.width}}</span>
          </g-col>
          <g-col v-if="isImageFile || isVideoFile" cols="3">
            <span>Height: </span>
            <span class="file-description__value">{{fileMetadata && fileMetadata.height}}</span>
          </g-col>
          <g-col v-if="isVideoFile" cols="3">
            <span>Duration: </span>
            <span class="file-description__value">{{fileMetadata && fileMetadata.duration}}</span>
          </g-col>
        </g-row>
        <g-row justify-content="center">
          <!-- video and img src is set in addMediaMetadataListeners to retrieve metadata -->
          <video v-if="isVideoFile" width="100%" id="video" draggable="false" controls/>
          <img v-else-if="isImageFile" id="image" draggable="false"/>
          <embed v-else-if="isTextFile" :src="file.viewUrl" width="100%" height="500px"/>
          <div v-else style="width: 100%; height: 500px"></div>
        </g-row>
      </div>
      <div class="pb-4">
        <g-btn-bs><a :href="file.downloadUrl" target="_blank" download>Download</a></g-btn-bs>
      </div>
    </div>
  </g-dialog>
</template>

<script>
  import {nextTick} from 'vue'
  import GDialog from '../../pvf/components/GDialog/GDialog';
  import GSpacer from '../../pvf/components/GLayout/GSpacer';
  import GBtnBs from '../../pvf/components/GBtn/GBtnBs';
  import GRow from '../../pvf/components/GLayout/GRow';
  import GCol from '../../pvf/components/GLayout/GCol';
  import GIcon from '../../pvf/components/GIcon/GIcon';

  export default {
    name: "FileViewerDialog",
    emits: ['close'],
    components: {GDialog, GSpacer, GBtnBs, GRow, GCol, GIcon},
    props: {
      file: Object,
      showDialog: Boolean,
    },
    data() {
      return {
        fileMetadata: null,
        isVideoFile: false,
        isImageFile: false,
        isTextFile: false,
      }
    },
    watch: {
      async showDialog(newVal) {
        if (!newVal) return

        this.isImageFile = this.file.mimeType.startsWith('image')
        this.isVideoFile = this.file.mimeType.startsWith('video')
        this.isTextFile = this.file.mimeType.startsWith('text')

        this.addMediaMetadataListeners()
      }
    },
    methods: {
      close() {
        this.fileMetadata = null
        this.$emit('close')
      },
      getFileFormat(file) {
        if (!file.mimeType) return ''

        const mimeParts = file.mimeType.split('/')
        return mimeParts.length > 0 ? mimeParts[0] : ''
      },
      capitalize(s) {
        if (typeof s !== 'string') return ''
        return s.charAt(0).toUpperCase() + s.slice(1)
      },
      getVideoMetadata(e) {
        const video = e.target
        this.fileMetadata = {
          duration: Math.round(video.duration) + 's',
          width: video.videoWidth + 'px',
          height: video.videoHeight + 'px',
        }
      },
      getImageMetadata(e) {
        const image = e.target
        this.fileMetadata = {
          width: image.naturalWidth + 'px',
          height: image.naturalHeight + 'px',
        }
      },
      addMediaMetadataListeners() {
        nextTick(() => {
          setTimeout(() => {
            const video = document.querySelector('#video')
            const image = document.querySelector('#image')
            if (video) {
              video.addEventListener('loadedmetadata', this.getVideoMetadata)
              video.src = this.file.viewUrl
            }
            if (image) {
              image.addEventListener('load', this.getImageMetadata)
              image.src = this.file.viewUrl
            }
          }, 50)
        })
      }
    },
  }
</script>

<style scoped lang="scss">
  .file-viewer-dialog {
    position: relative;

    &__title {
      position: sticky;
      top: 0;
      left: 0;
      background-color: white;
    }
  }

  .file-description {
    font-size: 1.3em;
    font-weight: 500;

    &__value {
      color: #7F7F7F;
    }
  }
</style>
