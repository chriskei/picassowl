const functions = require("firebase-functions");
const fastify = require("fastify")();

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

fastify.register(require("fastify-cors"), {
  origin: true,
  allowedHeaders: [
    "Origin",
    "X-Requested-With",
    "Accept",
    "Content-Type",
    "Authorization",
  ],
  methods: ["GET", "PUT", "PATCH", "POST", "DELETE"],
});

fastify.get("/find-edges/:imageData/:updatedImageData", (req, reply) => {
  const imageData = req.imageData;
  const imageDataArr = imageData.data;
  const updatedImageData = req.updatedImageData;
  const updatedImageDataArr = updatedImageData.data;
  const height = imageData.height;
  const width = imageData.width;

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
          imageDataArr[currentIndex] - imageDataArr[wantedVerticalIndex]
        );
        currentDiff = currentDiff + diff;
      }
      if (j < arrWidthSlots - 4) {
        const wantedHorizontalIndex = arrWidthSlots * i + (j + 4);
        const diff = Math.abs(
          imageDataArr[currentIndex] - imageDataArr[wantedHorizontalIndex]
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

  reply.send(updatedImageData);
});

exports.helloWorld = functions.https.onRequest(fastify);
