"use client";
import { useRef, useEffect } from "react";

interface SpriteOptions {
  position: { x: number; y: number };
  velocity?: { vel: number };
  image: HTMLImageElement;
}

class Sprite {
  position: { x: number; y: number };
  image: HTMLImageElement;

  constructor({ position, image }: SpriteOptions) {
    this.position = position;
    this.image = image;
  }
  draw(c: CanvasRenderingContext2D) {
    c.drawImage(this.image, this.position.x, this.position.y);
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const SPEED = 0.75;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");
    if (!c) return;

    const keys = {
      w: { pressed: false },
      a: { pressed: false },
      s: { pressed: false },
      d: { pressed: false },
    };

    const loadImage = (src: string): Promise<HTMLImageElement> => {
      return new Promise((resolve) => {
        const img = new window.Image();
        img.src = src;
        img.onload = () => resolve(img);
      });
    };

    Promise.all([loadImage("/gamemap.png"), loadImage("/playerDown.png")]).then(
      ([worldImage, playerImage]) => {
        c.fillStyle = "white";
        c.fillRect(0, 0, canvas.width, canvas.height);

        const background = new Sprite({
          position: { x: -1550, y: -520 },
          image: worldImage,
        });

        function animate() {
          if (!c) return;
          if (!canvas) return;
          window.requestAnimationFrame(animate);
          // console.log("animating");

          background.draw(c);

          c.drawImage(
            playerImage,
            0,
            0,
            playerImage.width / 4,
            playerImage.height,
            canvas.width / 2 - playerImage.width / 8,
            canvas.height / 2 - playerImage.height / 2,
            playerImage.width / 4,
            playerImage.height,
          );

          if (keys.w.pressed && lastKey === "w") {
            background.position.y += SPEED;
          } else if (keys.s.pressed && lastKey === "s") {
            background.position.y -= SPEED;
          } else if (keys.a.pressed && lastKey === "a") {
            background.position.x += SPEED;
          } else if (keys.d.pressed && lastKey === "d") {
            background.position.x -= SPEED;
          } else {
            if (keys.w.pressed) lastKey = "w";
            else if (keys.s.pressed) lastKey = "s";
            else if (keys.a.pressed) lastKey = "a";
            else if (keys.d.pressed) lastKey = "d";
          }
        }

        animate();
      },
    );

    let lastKey = "";
    window.addEventListener("keydown", (e) => {
      switch (e.key) {
        case "w":
          keys.w.pressed = true;
          lastKey = "w";
          break;
        case "s":
          keys.s.pressed = true;
          lastKey = "s";
          break;
        case "a":
          keys.a.pressed = true;
          lastKey = "a";
          break;
        case "d":
          keys.d.pressed = true;
          lastKey = "d";
          break;
      }
      console.log(keys);
    });

    window.addEventListener("keyup", (e) => {
      switch (e.key) {
        case "w":
          keys.w.pressed = false;
          break;
        case "s":
          keys.s.pressed = false;
          break;
        case "a":
          keys.a.pressed = false;
          break;
        case "d":
          keys.d.pressed = false;
          break;
      }
      console.log(keys);
    });
  }, []);

  return (
    // <div className="flex justify-center items-center min-h-screen bg-white">
    //   <canvas
    //     ref={canvasRef}
    //     width={850}
    //     height={576}
    //     className="border border-gray-300"
    //   />
    // </div>

    <div className="flex justify-center items-center min-h-screen bg-gray-100">
      <div className="relative w-[450px] h-[600px]">
        <canvas
          ref={canvasRef}
          width={360}
          height={270}
          className="absolute top-[45px] left-[45px] z-0"
        />

        <div className="absolute inset-0 z-10 pointer-events-none">
          <img
            src="/computerframe.png"
            alt="Computer Frame"
            className="w-full h-full object-contain"
          />
        </div>
      </div>
    </div>
  );
}
