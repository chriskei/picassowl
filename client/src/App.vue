<template>
  <div id="app">
    <h1>Picassowl</h1>
    <hr />
    <div class="app-flex">
      <div>
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
          <canvas id="image-firstpass" width="480" height="320" />
        </div>
        <h4>
          If you're not satisfied, pick a different image before proceeding
        </h4>
      </div>
      <div class="middle-container" id="middle-container">
        <h2>Show me the steps!</h2>
        <button class="button" @click="showRight">
          ⇨
        </button>
      </div>
      <div class="right-container" id="right-container">
        <h2>Steps:</h2>
        <canvas id="image-secondpass" width="480" height="320" />
      </div>
    </div>
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
          const img = new Image();
          img.src = this.imageData;
          const canvas = document.getElementById("image-firstpass");
          const ctx = canvas.getContext("2d");
          const canvas2 = document.getElementById("image-secondpass");
          const ctx2 = canvas2.getContext("2d");
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

            // process
            for (let i = 0; i < arrHeightSlots; i++) {
              for (let j = 0; j < arrWidthSlots; j = j + 4) {
                const currentIndex = arrWidthSlots * i + j;
                const min = Math.min(
                  updatedImageDataArr[currentIndex],
                  updatedImageDataArr[currentIndex + 1],
                  updatedImageDataArr[currentIndex + 2]
                );
                const first = 205;
                if (min <= first) {
                  updatedImageDataArr[currentIndex] = min;
                  updatedImageDataArr[currentIndex + 1] = min;
                  updatedImageDataArr[currentIndex + 2] = min;
                } else {
                /*else if (min <= first + 20) {
                  updatedImageDataArr[currentIndex] = 255;
                  updatedImageDataArr[currentIndex + 1] = 0;
                  updatedImageDataArr[currentIndex + 2] = 0;
                  
                } */
                  updatedImageDataArr[currentIndex] = 255;
                  updatedImageDataArr[currentIndex + 1] = 255;
                  updatedImageDataArr[currentIndex + 2] = 255;
                }
              }
            }

            ctx.putImageData(updatedImageData, 0, 0);
            ctx2.putImageData(updatedImageData, 0, 0);
            document.getElementById("middle-container").style.visibility =
              "visible";
          };
        };
        reader.readAsDataURL(files[0]);
        this.$emit("input", files[0]);
      }
    },
    showRight() {
      document.getElementById("right-container").style.visibility = "visible";
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
  text-align: left;
}
.app-flex {
  display: flex;
  flex-direction: row;
}
.middle-container {
  display: flex;
  flex-direction: column;
  margin-left: 5rem;
  justify-content: center;
  visibility: hidden;
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
.button {
  font-size: 40px;
  border: none;
  cursor: pointer;
}
.right-container {
  display: flex;
  flex-direction: column;
  margin-left: 5rem;
  visibility: hidden;
}
</style>
