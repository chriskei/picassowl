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
            class="hide"
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
          <canvas class="hide" id="image-firstpass" width="480" height="320" />
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
        <canvas id="image-zerothpass" width="480" height="320" />
        <canvas class="hide" id="image-secondpass" width="480" height="320" />
        <canvas class="hide" id="image-thirdpass" width="480" height="320" />
        <canvas class="hide" id="image-fourthpass" width="480" height="320" />
        <canvas class="hide" id="image-fifthpass" width="480" height="320" />
        <canvas class="hide" id="image-sixthpass" width="480" height="320" />
        <canvas class="hide" id="image-seventhpass" width="480" height="320" />
        <div
          class="image-input"
          id="image-eighthpass"
          :style="{ 'background-image': `url(${imageData})`, display: 'none' }"
        />
        <div class="range-container">
          <label for="range" class="range-label">Step {{ step }}</label>
          <input
            type="range"
            name="range"
            min="0"
            max="7"
            value="0"
            class="range-input"
            id="range-input"
            @change="setRangeLabel"
          />
        </div>
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
      step: 0,
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
          const width = 480;
          const height = 320;

          // image manipulation
          img.onload = function() {
            ctx.drawImage(img, 0, 0, width, height);
            const imageData = ctx.getImageData(0, 0, width, height);
            const imageDataArr = imageData.data;
            const updatedImageData = ctx.createImageData(width, height);
            const updatedImageDataArr = updatedImageData.data;

            /*
            const result = axios.get(axios.defaults.baseURL, {
              params: {
                imageData: imageData,
                updatedImageData: updatedImageData,
              },
            });
            */

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

            // grayscale
            for (let i = 0; i < arrHeightSlots; i++) {
              for (let j = 0; j < arrWidthSlots; j = j + 4) {
                const currentIndex = arrWidthSlots * i + j;
                const min = Math.min(
                  updatedImageDataArr[currentIndex],
                  updatedImageDataArr[currentIndex + 1],
                  updatedImageDataArr[currentIndex + 2]
                );
                updatedImageDataArr[currentIndex] = min;
                updatedImageDataArr[currentIndex + 1] = min;
                updatedImageDataArr[currentIndex + 2] = min;
              }
            }

            ctx.putImageData(updatedImageData, 0, 0);
            document.getElementById("image-firstpass").style.display = "flex";
            document.getElementById("middle-container").style.visibility =
              "visible";
          };
        };
        reader.readAsDataURL(files[0]);
        this.$emit("input", files[0]);
      }
    },
    showRight() {
      const width = 480;
      const height = 320;
      const canvas = document.getElementById("image-firstpass");
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, width, height);
      const canvas2 = document.getElementById("image-secondpass");
      const ctx2 = canvas2.getContext("2d");
      ctx2.putImageData(imageData, 0, 0);
      document.getElementById("right-container").style.visibility = "visible";
      this.updateCanvas("image-firstpass", "image-zerothpass", -11);
    },
    hideAll() {
      document.getElementById("image-zerothpass").style.display = "none";
      document.getElementById("image-secondpass").style.display = "none";
      document.getElementById("image-thirdpass").style.display = "none";
      document.getElementById("image-fourthpass").style.display = "none";
      document.getElementById("image-fifthpass").style.display = "none";
      document.getElementById("image-sixthpass").style.display = "none";
      document.getElementById("image-seventhpass").style.display = "none";
      document.getElementById("image-eighthpass").style.display = "none";
    },
    updateCanvas(baseCanvas, changingCanvas, minPixelValue) {
      const width = 480;
      const height = 320;
      const arrWidthSlots = width * 4;
      const arrHeightSlots = height;
      const canvas = document.getElementById(baseCanvas);
      const ctx = canvas.getContext("2d");
      const imageData = ctx.getImageData(0, 0, width, height);
      const imageDataArr = imageData.data;
      const updatedImageData = ctx.createImageData(width, height);
      const updatedImageDataArr = updatedImageData.data;

      for (let i = 0; i < arrHeightSlots; i++) {
        for (let j = 0; j < arrWidthSlots; j = j + 4) {
          const currentIndex = arrWidthSlots * i + j;
          const min = Math.min(
            imageDataArr[currentIndex],
            imageDataArr[currentIndex + 1],
            imageDataArr[currentIndex + 2]
          );
          const first = minPixelValue;
          if (min <= first) {
            updatedImageDataArr[currentIndex] = min;
            updatedImageDataArr[currentIndex + 1] = min;
            updatedImageDataArr[currentIndex + 2] = min;
            updatedImageDataArr[currentIndex + 3] = 255;
          } else if (min <= first + 10) {
            updatedImageDataArr[currentIndex] = 255;
            updatedImageDataArr[currentIndex + 1] = 0;
            updatedImageDataArr[currentIndex + 2] = 0;
            updatedImageDataArr[currentIndex + 3] = 255;
          } else {
            updatedImageDataArr[currentIndex] = 255;
            updatedImageDataArr[currentIndex + 1] = 255;
            updatedImageDataArr[currentIndex + 2] = 255;
            updatedImageDataArr[currentIndex + 3] = 255;
          }
        }
      }

      const canvas2 = document.getElementById(changingCanvas);
      const ctx2 = canvas2.getContext("2d");
      ctx2.putImageData(updatedImageData, 0, 0);
      document.getElementById(changingCanvas).style.display = "flex";
    },
    setRangeLabel() {
      const range = document.getElementById("range-input");
      const value = range.value;
      this.step = value;
      this.hideAll();
      switch (this.step) {
        case "0":
          this.updateCanvas("image-firstpass", "image-zerothpass", -11);
          break;
        case "1":
          this.updateCanvas("image-firstpass", "image-secondpass", 195);
          break;
        case "2":
          this.updateCanvas("image-firstpass", "image-thirdpass", 205);
          break;
        case "3":
          this.updateCanvas("image-firstpass", "image-fourthpass", 215);
          break;
        case "4":
          this.updateCanvas("image-firstpass", "image-fifthpass", 225);
          break;
        case "5":
          this.updateCanvas("image-firstpass", "image-sixthpass", 235);
          break;
        case "6":
          this.updateCanvas("image-firstpass", "image-seventhpass", 256);
          break;
        case "7":
        default:
          document.getElementById("image-eighthpass").style.display = "flex";
          break;
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
  text-align: left;
  background-image: url("./assets/paint.png");
}
.app-flex {
  display: flex;
  flex-direction: row;
  justify-content: space-around;
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
.hide {
  display: none;
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
  justify-content: center;
}
.range-container {
  display: flex;
  flex-direction: row;
  margin-top: 1rem;
}
.range-label {
  margin-right: 1rem;
}
.range-input {
  flex-grow: 1;
}
.image-eighthpass {
  display: none;
}
</style>
