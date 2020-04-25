<template>
  <div id="app">
    <h1>Picassowl</h1>
    <hr />
    <h2>Image you want to draw:</h2>
    <div
      class="image-input"
      :style="{ 'background-image': `url(${imageData})` }"
      @click="chooseImage"
    >
      <span v-if="!imageData" class="placeholder">
        Click me to input an image (480x320 works best)
      </span>
      <input
        class="file-input"
        ref="fileInput"
        type="file"
        @input="onSelectFile"
      />
    </div>
    <h2>Simplified image preview:</h2>
    <div class="modified-image">
      <span v-if="!imageData" class="secondary-placeholder">
        Waiting for image input
      </span>
      <canvas id="image-firstpass" width="600" height="300" />
    </div>
    <h4>If you're not satisfied, pick a different image before proceeding</h4>
  </div>
</template>

<script>
import axios from "axios";

axios.defaults.baseURL = "https://us-central1-picassowl.cloudfunctions.net";

export default {
  name: "App",
  components: {},
  data() {
    return {
      imageData: null,
    };
  },
  methods: {
    chooseImage() {
      this.$refs.fileInput.click();
    },
    onSelectFile() {
      const input = this.$refs.fileInput;
      const files = input.files;
      if (files && files[0]) {
        const reader = new FileReader();
        reader.onload = (e) => {
          this.imageData = e.target.result;
          var img = new Image();
          img.src = this.imageData;
          var canvas = document.getElementById("image-firstpass");
          var ctx = canvas.getContext("2d");
          const width = 480;
          const height = 320;

          // image manipulation
          img.onload = function() {
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const imageDataArr = imageData.data;
            const updatedImageData = ctx.createImageData(width, height);
            const updatedImageDataArr = updatedImageData.data;

            // vertical and horizonal gradients
            const arrHeightSlots = height;
            const arrWidthSlots = width * 4;
            for (let i = 0; i < arrHeightSlots; i++) {
              for (let j = 0; j < arrWidthSlots; j++) {
                let currentDiff = 0;
                const currentIndex = arrWidthSlots * i + j;
                if (i < arrHeightSlots - 1) {
                  const wantedVerticalIndex = arrWidthSlots * (i + 1) + j;
                  const diff = Math.abs(
                    imageDataArr[currentIndex] -
                      imageDataArr[wantedVerticalIndex]
                  );
                  currentDiff = currentDiff + diff;
                }
                if (j < arrWidthSlots - 4) {
                  const wantedHorizontalIndex = arrWidthSlots * i + (j + 4);
                  const diff = Math.abs(
                    imageDataArr[currentIndex] -
                      imageDataArr[wantedHorizontalIndex]
                  );
                  currentDiff = currentDiff + diff;
                }
                updatedImageDataArr[currentIndex] = 255 - currentDiff / 2;
              }
            }
            console.log(updatedImageData);

            ctx.putImageData(updatedImageData, 0, 0);
          };
        };
        reader.readAsDataURL(files[0]);
        this.$emit("input", files[0]);
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  margin-top: 60px;
  text-align: left;
}
.image-input {
  display: block;
  width: 30rem;
  height: 20rem;
  cursor: pointer;
  background-size: cover;
  background-position: center center;
}
.modified-image {
  display: block;
  width: 30rem;
  height: 20rem;
  background-size: cover;
  background-position: center center;
}
.placeholder {
  background: #f0f0f0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-size: 18px;
  font-family: Helvetica;
}
.placeholder:hover {
  background: #e0e0e0;
}
.secondary-placeholder {
  background: #f0f0f0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #333;
  font-size: 18px;
  font-family: Helvetica;
}
.file-input {
  display: none;
}
</style>
