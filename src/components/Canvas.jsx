import React from "react";
import { useState } from "react";
import { useEffect } from "react";
import { useRef } from "react";
import platformImg from "../assets/platform.png";
import platformSmallTall from "../assets/platformSmallTall.png";
import hills from "../assets/hills.png";
import background from "../assets/background.png";
import sprintRunLeft from "../assets/spriteRunLeft.png";
import sprintRunRight from "../assets/spriteRunRight.png";
import sprintStandLeft from "../assets/spriteStandLeft.png";
import sprintStandRight from "../assets/spriteStandRight.png";

const Canvas = () => {
  const [ctx, setContext] = useState();
  const [canvas, setCanvas] = useState();
  const canvasRef = useRef();

  useEffect(() => {
    setCanvas(canvasRef.current);
    if (canvas) {
      // if (canvas) required to prevent render until canvas is available
      canvas.width = 1024;
      canvas.height = 576;
      setContext(canvas.getContext("2d"));
    }
  }, [canvas]);

  const gravity = 0.5;

  const createImage = (imageSrc) => {
    // default html image class
    const image = new Image();
    image.src = imageSrc;
    return image;
  };

  class Player {
    constructor() {
      this.speed = 10;
      this.position = {
        x: 100,
        y: 100,
      };

      this.velocity = {
        x: 0,
        y: 0,
      };

      this.width = 66;
      this.height = 150;

      this.image = createImage(sprintStandRight);
      this.frames = 0
    }

    draw() {
      if (ctx) {
        // if (ctx) required to prevent render until ctx is available
        ctx.drawImage(
          this.image,
          177 * this.frames,
          0,
          177, 
          400,
          this.position.x,
          this.position.y,
          this.width,
          this.height
        );
      }
    }

    update() {
      this.frames ++
      if(this.frames > 28) {
        this.frames = 0
      }
      this.draw();
      this.position.x += this.velocity.x;
      this.position.y += this.velocity.y;

      if (canvas) {
        if (this.position.y + this.height + this.velocity.y <= canvas.height) {
          this.velocity.y += gravity;
        }
      }
    }
  }

  class GenericObject {
    constructor({ x, y, image }) {
      this.position = {
        x: x,
        y: y,
      };
      this.image = image;
      this.width = image.width;
      this.height = image.height;
    }

    draw() {
      if (ctx) {
        ctx.drawImage(this.image, this.position.x, this.position.y);
      }
    }
  }

  class Platform {
    constructor({ x, y, image }) {
      this.position = {
        x: x,
        y: y,
      };
      this.image = image;
      this.width = image.width;
      this.height = image.height;
    }

    draw() {
      if (ctx) {
        // if (ctx) required to prevent render until ctx is available
        // ctx.fillStyle = "blue";
        // ctx.fillRect(this.position.x, this.position.y, this.width, this.height);
        ctx.drawImage(this.image, this.position.x, this.position.y);
      }
    }
  }

  let platformImage = createImage(platformImg);
  let platformSmallTallImage = createImage(platformSmallTall);
  let player = new Player();

  let platforms = [];

  let genericObjects = [];

  const keys = {
    right: {
      pressed: false,
    },
    left: {
      pressed: false,
    },
  };

  let scrollOffset = 0;

  const init = () => {
    platformImage = createImage(platformImg);
    player = new Player();

    platforms = [
      new Platform({
        x:
          platformImage.width * 4 +
          300 -
          2 +
          platformImage.width -
          platformSmallTallImage.width,
        y: 330,
        image: platformSmallTallImage,
      }),
      new Platform({ x: -1, y: 470, image: platformImage }),
      new Platform({
        x: platformImage.width - 3,
        y: 470,
        image: platformImage,
      }),
      new Platform({
        x: platformImage.width * 2 + 100,
        y: 470,
        image: platformImage,
      }),
      new Platform({
        x: platformImage.width * 3 + 300,
        y: 470,
        image: platformImage,
      }),
      new Platform({
        x: platformImage.width * 4 + 300 - 2,
        y: 470,
        image: platformImage,
      }),
      new Platform({
        x: platformImage.width * 5 + 800 - 2,
        y: 470,
        image: platformImage,
      }),
    ];

    genericObjects = [
      new GenericObject({ x: -1, y: -1, image: createImage(background) }),
      new GenericObject({ x: -1, y: -1, image: createImage(hills) }),
    ];

    scrollOffset = 0;
  };

  const animate = () => {
    if (ctx) {
      // if (ctx) required to prevent render until ctx is available
      requestAnimationFrame(animate);
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      genericObjects.forEach((genericObject) => {
        genericObject.draw();
      });

      platforms.forEach((platform) => {
        platform.draw();
      });

      player.update();

      if (keys.right.pressed && player.position.x < 400) {
        player.velocity.x = player.speed;
      } else if (
        (keys.left.pressed && player.position.x > 100) ||
        (keys.left.pressed && scrollOffset === 0 && player.position.x > 0)
      ) {
        player.velocity.x = -player.speed;
      } else {
        player.velocity.x = 0;
        if (keys.right.pressed) {
          scrollOffset += player.speed;
          platforms.forEach((platform) => {
            platform.position.x -= player.speed;
          });
          genericObjects.forEach((genericObject) => {
            genericObject.position.x -= player.speed * 0.66;
          });
        } else if (keys.left.pressed && scrollOffset > 0) {
          scrollOffset -= player.speed;
          platforms.forEach((platform) => {
            platform.position.x += player.speed;
          });
          genericObjects.forEach((genericObject) => {
            genericObject.position.x += player.speed * 0.66;
          });
        }

        // Win Condition
        if (scrollOffset > platformImage.width * 5 + 700 - 2) {
          console.log("you win");
        }

        // Lose Condition
        if (player.position.y > canvas.height) {
          console.log("you lose");
          // alert('Loss!')
          init();
        }
      }

      // Platform collision
      platforms.forEach((platform) => {
        if (
          player.position.y + player.height <= platform.position.y &&
          player.position.y + player.height + player.velocity.y >=
            platform.position.y &&
          player.position.x + player.width >= platform.position.x &&
          player.position.x <= platform.position.x + platform.width
        ) {
          player.velocity.y = 0;
        }
      });
    }
  };

  init();
  animate();

  const handleKeyDown = ({ keyCode }) => {
    switch (keyCode) {
      case 65:
        // "A left"
        keys.left.pressed = true;
        break;
      case 68:
        // "D right"
        keys.right.pressed = true;
        break;
      case 83:
        // "S down"
        break;
      case 87:
        // "W up"
        player.velocity.y -= 12;
        break;
      default:
        console.log();
    }
  };

  const handleKeyUp = ({ keyCode }) => {
    switch (keyCode) {
      case 65:
        // "A left"
        keys.left.pressed = false;
        break;
      case 68:
        // "D right"
        keys.right.pressed = false;
        break;
      case 83:
        // "S down"
        break;
      case 87:
        // "W up"
        break;
      default:
        console.log();
    }
  };

  return (
    <div className="flex justify-center bg-black h-screen">
      <canvas
        ref={canvasRef}
        tabIndex="0"
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
      ></canvas>
    </div>
  );
};

export default Canvas;
