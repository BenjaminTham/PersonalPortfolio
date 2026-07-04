"use client";
import gsap from "gsap";
import { useRef, useEffect } from "react";
import { Press_Start_2P } from "next/font/google";

const pressStart2P = Press_Start_2P({
  weight: "400",
  subsets: ["latin"],
});

interface SpriteOptions {
  position: { x: number; y: number };
  velocity?: { vel: number };
  image: HTMLImageElement;
  frames?: { max: number; val: number; elapsed: number; hold: number };
  width?: number;
  height?: number;
  moving?: boolean;
  animate?: boolean;
  isEnemy?: boolean;
  sprites?: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
  rotation?: number;
  name?: string;
}

interface Rectangle {
  position: { x: number; y: number };
  width: number;
  height: number;
}

class Sprite {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames: { max: number; val: number; elapsed: number; hold: number };
  width: number;
  height: number;
  animate: boolean;
  rotation: number;
  sprites?: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
  opacity: number;
  health: number;
  isEnemy: boolean | undefined;
  name?: string;

  constructor({
    position,
    image,
    frames = { max: 1, val: 0, elapsed: 0, hold: 20 },
    width,
    height,
    moving,
    sprites,
    isEnemy = false,
    animate = false,
    rotation = 0,
    name,
  }: SpriteOptions) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = width || this.image.width / this.frames.max;
    this.height = height || this.image.height;
    this.animate = animate;
    this.sprites = sprites;
    this.opacity = 1;
    this.health = 100;
    this.isEnemy = isEnemy;
    this.rotation = rotation;
    this.name = name;
  }
  faint() {
    const dialogueBox = document.querySelector<HTMLElement>("#dialogueBox");
    if (dialogueBox) {
      dialogueBox.style.display = "block";
      dialogueBox.innerHTML = this.name + " fainted! ";
    }

    gsap.to(this.position, {
      y: this.position.y + 20,
    });
    gsap.to(this, {
      opacity: 0,
    });
  }

  draw(c: CanvasRenderingContext2D) {
    c.save();
    c.translate(
      this.position.x + this.width / 2,
      this.position.y + this.height / 2,
    );
    c.rotate(this.rotation);
    c.translate(
      -this.position.x - this.width / 2,
      -this.position.y - this.height / 2,
    );
    c.globalAlpha = this.opacity;
    c.drawImage(
      this.image,
      this.frames.val * (this.image.width / this.frames.max),
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.width,
      this.height,
    );
    c.restore();
    if (!this.animate) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % this.frames.hold === 0) {
      if (this.frames.val < this.frames.max - 1) {
        this.frames.val++;
      } else {
        this.frames.val = 0;
      }
    }

    // c.drawImage(this.image, this.position.x, this.position.y);
  }

  attack({
    attack,
    recipient,
    renderedSprites,
    fireballImage,
    audio,
  }: {
    attack: { name: string; damage: number; type: string };
    recipient: Sprite;
    renderedSprites?: Sprite[];
    fireballImage?: HTMLImageElement;
    audio?: any;
  }) {
    const dialogueBox = document.querySelector<HTMLElement>("#dialogueBox");
    if (dialogueBox) {
      dialogueBox.style.display = "block";
      dialogueBox.innerHTML = this.name + " used " + attack.name;
    }
    // Define these outside the timeline so they are safely captured by the closure
    const movementDistance = this.isEnemy ? -20 : 20;
    const healthBar = this.isEnemy ? "#playerHealthBar" : "#enemyHealthBar";
    let rotation = 1;
    if (this.isEnemy) rotation = -2.2;
    const tl = gsap.timeline();

    switch (attack.name) {
      case "Tackle":
        tl.to(this.position, {
          x: this.position.x - movementDistance,
        })
          .to(this.position, {
            x: this.position.x + movementDistance * 2,
            duration: 0.1,
            onComplete: () => {
              if (audio && audio.tackle) audio.tackle.play();
              recipient.health -= attack.damage;

              // Use the variables defined at the top of the function
              gsap.to(healthBar, {
                width: recipient.health + "%",
              });
              gsap.to(recipient.position, {
                x: recipient.position.x + 10,
                yoyo: true,
                repeat: 5,
                duration: 0.08,
              });
              gsap.to(recipient, {
                opacity: 0,
                repeat: 5,
                yoyo: true,
                duration: 0.08,
              });
            },
          })
          .to(this.position, {
            x: this.position.x,
          });
        break;

      case "Fireball":
        if (!fireballImage || !renderedSprites) return;

        const fireball = new Sprite({
          position: { x: this.position.x, y: this.position.y },
          image: fireballImage,
          frames: { max: 4, val: 0, elapsed: 0, hold: 10 },
          animate: true,
          width: 60,
          height: 60,
          rotation,
        });

        renderedSprites.push(fireball);

        gsap.to(fireball.position, {
          x: recipient.position.x,
          y: recipient.position.y,
          onComplete: () => {
            if (audio && audio.fireballhit) audio.fireballhit.play();
            const index = renderedSprites.indexOf(fireball);
            if (index > -1) renderedSprites.splice(index, 1);

            recipient.health -= attack.damage;
            gsap.to(healthBar, { width: recipient.health + "%" });
            gsap.to(recipient.position, {
              x: recipient.position.x + 10,
              yoyo: true,
              repeat: 5,
              duration: 0.08,
            });
            gsap.to(recipient, {
              opacity: 0,
              repeat: 5,
              yoyo: true,
              duration: 0.08,
            });
          },
        });
        break;
    }
  }
}

interface boundaryOptions {
  position: { x: number; y: number };
  width?: number;
  height?: number;
}

class Boundary {
  static width = 36;
  static height = 36;
  position: { x: number; y: number };
  width: number;
  height: number;
  constructor({ position, width, height }: boundaryOptions) {
    this.position = position;
    this.width = 36;
    this.height = 36;
  }

  draw(c: CanvasRenderingContext2D) {
    c.fillStyle = "rgba(255,0,0,0)";
    c.fillRect(this.position.x, this.position.y, this.width, this.height);
  }
}

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const battleAudio = useRef<HTMLAudioElement | null>(null);

  const collisions = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025,
    1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025,
    0, 1025, 0, 0, 1025, 1025, 1025, 1025, 0, 0, 1025, 1025, 1025, 1025, 1025,
    0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1025, 0, 1025, 0, 0, 1025, 0, 0, 1025, 0, 0, 1025, 0, 1025,
    0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1025, 0, 1025, 0, 0, 1025, 0, 0, 1025, 0, 0, 1025, 0,
    1025, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 1025, 0, 0, 1025, 0, 0, 1025, 0, 0,
    1025, 0, 1025, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 0, 1025, 1025, 1025, 1025,
    0, 0, 0, 1025, 1025, 0, 0, 1025, 0, 0, 0, 1025, 0, 0, 0, 1025, 1025, 1025,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 1025, 1025, 1025, 1025, 0, 0,
    1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0,
    1025, 1025, 1025, 1025, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 1025, 1025,
    0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1025, 1025, 1025, 1025, 1025, 1025, 1025, 0, 1025, 0, 0, 0, 1025, 0, 0,
    1025, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 1025, 1025, 0, 0, 0, 1025, 1025, 1025, 0,
    1025, 1025, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 1025, 1025, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 1025, 1025, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 0, 0, 0, 1025, 1025,
    1025, 1025, 0, 1025, 1025, 1025, 0, 0, 0, 1025, 1025, 1025, 1025, 1025,
    1025, 1025, 1025, 1025, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 1025, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 1025, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  const battleZonesData = [
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 0, 0,
    1025, 1025, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025,
    1025, 1025, 1025, 1025, 1025, 1025, 1025, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 1025, 1025, 1025, 1025, 1025, 1025, 1025, 1025,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
    0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0,
  ];

  const attacks: Record<
    string,
    { name: string; damage: number; type: string }
  > = {
    Tackle: {
      name: "Tackle",
      damage: 10,
      type: "Normal",
    },
    Fireball: {
      name: "Fireball",
      damage: 25,
      type: "Fire",
    },
  };

  const collisionsMap: number[][] = [];
  const battleZonesMap: number[][] = [];

  const boundaries: Boundary[] = [];

  const SPEED = 0.75;

  const offset = { x: -1550, y: -500 };

  const battle = useRef({
    initiated: false,
  });

  useEffect(() => {
    battleAudio.current = new Audio("/Audio/battle.mp3");
    battleAudio.current.volume = 0.3;
    battleAudio.current.loop = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const c = canvas.getContext("2d");
    if (!c) return;

    const audio = {
      Map: new Audio("/Audio/map.mp3"),
      // initBattle: new Audio("/Audio/initBattle.wav"),
      tackle: new Audio("/Audio/tackleHit.wav"),
      fireballinit: new Audio("/Audio/initFireball.wav"),
      fireballhit: new Audio("/Audio/fireballHit.wav"),

      faint: new Audio("/Audio/faint.wav"),
      victory: new Audio("/Audio/victory.mp3"),
    };

    audio.Map.loop = true;
    audio.Map.volume = 0.3;
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

    Promise.all([
      loadImage("/gamemap.png"),
      loadImage("/playerDown.png"),
      loadImage("/playerUp.png"),
      loadImage("/playerLeft.png"),
      loadImage("/playerRight.png"),
      loadImage("/battleBackground.png"),
      loadImage("/draggleSprite.png"),
      loadImage("/embySprite.png"),
      loadImage("/fireball.png"),
    ]).then(
      ([
        worldImage,
        playerDownImage,
        playerUpImage,
        playerLeftImage,
        playerRightImage,
        battleBackgroundImage,
        draggleImage,
        embyImage,
        fireballImage,
      ]) => {
        for (let i = 0; i < collisions.length; i += 70) {
          collisionsMap.push(collisions.slice(i, i + 70));
        }

        for (let i = 0; i < battleZonesData.length; i += 70) {
          battleZonesMap.push(battleZonesData.slice(i, i + 70));
        }

        collisionsMap.forEach((row, i) => {
          row.forEach((symbol, j) => {
            if (symbol == 1025) {
              boundaries.push(
                new Boundary({
                  position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y,
                  },
                }),
              );
            }
          });
        });

        const battleZones: Boundary[] = [];

        battleZonesMap.forEach((row, i) => {
          row.forEach((symbol, j) => {
            if (symbol == 1025) {
              battleZones.push(
                new Boundary({
                  position: {
                    x: j * Boundary.width + offset.x,
                    y: i * Boundary.height + offset.y,
                  },
                }),
              );
            }
          });
        });

        // console.log(gsap);

        c.fillRect(0, 0, canvas.width, canvas.height);

        const background = new Sprite({
          position: { x: offset.x, y: offset.y },
          image: worldImage,
        });

        const player = new Sprite({
          position: {
            x: canvas.width / 2 - 192 / 8,
            y: canvas.height / 2 - 68 / 2,
          },
          image: playerDownImage,
          frames: {
            max: 4,
            val: 0,
            elapsed: 0,
            hold: 20,
          },
          sprites: {
            up: playerUpImage,
            left: playerLeftImage,
            right: playerRightImage,
            down: playerDownImage,
          },
        });

        const movables = [background, ...boundaries, ...battleZones];

        function rectangularCollision({
          rectangle1,
          rectangle2,
        }: {
          rectangle1: Rectangle;
          rectangle2: Rectangle;
        }) {
          return (
            rectangle1.position.x + rectangle1.width >= rectangle2.position.x &&
            rectangle1.position.x <= rectangle2.position.x + rectangle2.width &&
            rectangle1.position.y <=
              rectangle2.position.y + rectangle2.height &&
            rectangle1.position.y + rectangle1.height >= rectangle2.position.y
          );
        }

        const battleBackground = new Sprite({
          position: { x: 0, y: 0 },
          image: battleBackgroundImage,
          width: canvas.width,
          height: 180,
        });
        const draggle = new Sprite({
          position: { x: 265, y: 0 },
          image: draggleImage,
          frames: {
            max: 4,
            val: 0,
            elapsed: 0,
            hold: 40,
          },
          animate: true,
          isEnemy: true,
          width: 60,
          height: 60,
          name: "Draggle",
        });

        const emby = new Sprite({
          position: { x: 80, y: 80 },
          image: embyImage,
          frames: {
            max: 4,
            val: 0,
            elapsed: 0,
            hold: 40,
          },
          animate: true,
          width: 60,
          height: 60,
          name: "Emby",
        });
        let renderedSprites: Sprite[] = [];
        let battleAnimationId: number;
        let queue: (() => void)[] = [];

        function initBattle() {
          // if (battleAudio.current) {
          //   battleAudio.current.currentTime = 0;
          //   battleAudio.current.play();
          // }
          const userInterface =
            document.querySelector<HTMLElement>("#userInterface");
          if (userInterface) userInterface.style.display = "block";

          const dialogueBox =
            document.querySelector<HTMLElement>("#dialogueBox");
          if (dialogueBox) dialogueBox.style.display = "none";

          draggle.health = 100;
          emby.health = 125;

          gsap.to("#enemyHealthBar", { width: "100%" });
          gsap.to("#playerHealthBar", { width: "100%" });

          draggle.position = { x: 265, y: 0 };
          draggle.opacity = 1;
          emby.position = { x: 80, y: 80 };
          emby.opacity = 1;

          renderedSprites = [draggle, emby];
          queue = [];
        }

        function animateBattle() {
          if (!c) return;
          battleAnimationId = window.requestAnimationFrame(animateBattle);
          // console.log(battleAnimationId);
          battleBackground.draw(c);
          renderedSprites.forEach((sprite) => sprite.draw(c));
          // console.log("animate battle");
        }

        function animate() {
          if (!c) return;
          if (!canvas) return;
          const animationId = window.requestAnimationFrame(animate);

          background.draw(c);
          player.draw(c);

          boundaries.forEach((boundary) => {
            boundary.draw(c);
          });
          let moving = true;
          player.animate = false;
          // console.log(animationId);
          if (battle.current.initiated) return; //activate a battle
          if (
            keys.w.pressed ||
            keys.a.pressed ||
            keys.s.pressed ||
            keys.d.pressed
          ) {
            for (let i = 0; i < battleZones.length; i++) {
              const battleZone = battleZones[i];
              const overlappingArea =
                (Math.min(
                  player.position.x + player.width,
                  battleZone.position.x + battleZone.width,
                ) -
                  Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                  player.position.y + player.height,
                  battleZone.position.y + battleZone.height,
                ) -
                  Math.max(player.position.y, battleZone.position.y));
              if (
                rectangularCollision({
                  rectangle1: {
                    ...player,
                    width: player.width / 2,
                    height: player.height / 4, // Very short box
                    position: {
                      x: player.position.x + player.width / 4,
                      y: player.position.y + player.height * 0.7, // Position at the bottom
                    },
                  },
                  rectangle2: battleZone,
                }) &&
                overlappingArea > (battleZone.width * battleZone.height) / 2 &&
                Math.random() < 0.001
              ) {
                // console.log("activate battle");
                //deactivate animation loop
                window.cancelAnimationFrame(animationId);
                audio.Map.pause();
                // audio.initBattle.play();
                if (battleAudio.current) {
                  battleAudio.current.currentTime = 0;
                  battleAudio.current.play();
                }
                battle.current.initiated = true;
                gsap.to("#overlappingDiv", {
                  opacity: 1,
                  repeat: 3,
                  yoyo: true,
                  duration: 0.4,
                  onComplete() {
                    gsap.to("#overlappingDiv", {
                      opacity: 1,
                      duration: 0.4,
                      onComplete() {
                        gsap.to("#overlappingDiv", {
                          opacity: 1,
                          duration: 0.4,
                          onComplete() {
                            // activate a new animation loop,
                            initBattle();
                            animateBattle();
                            gsap.to("#overlappingDiv", {
                              opacity: 0,
                              duration: 0.4,
                            });
                          },
                        });
                      },
                    });
                  },
                });
                break;
              }
            }
          }

          battleZones.forEach((battleZone) => {
            battleZone.draw(c);
          });

          if (keys.w.pressed && lastKey === "w") {
            player.animate = true;
            if (player.sprites) player.image = player.sprites.up;
            for (let i = 0; i < boundaries.length; i++) {
              const boundary = boundaries[i];
              if (
                rectangularCollision({
                  rectangle1: {
                    ...player,
                    width: player.width / 2,
                    height: player.height / 4, // Very short box
                    position: {
                      x: player.position.x + player.width / 4,
                      y: player.position.y + player.height * 0.7, // Position at the bottom
                    },
                  },
                  rectangle2: {
                    ...boundary,
                    position: {
                      x: boundary.position.x,
                      y: boundary.position.y + SPEED,
                    },
                  },
                })
              ) {
                // console.log("collision detected");
                moving = false;
                break;
              }
            }

            // background.position.y += SPEED;
            if (moving) {
              movables.forEach((movable) => {
                movable.position.y += SPEED;
              });
            }
          } else if (keys.s.pressed && lastKey === "s") {
            player.animate = true;
            if (player.sprites) player.image = player.sprites.down;
            for (let i = 0; i < boundaries.length; i++) {
              const boundary = boundaries[i];
              if (
                rectangularCollision({
                  rectangle1: {
                    ...player,
                    width: player.width / 2,
                    height: player.height / 4, // Very short box
                    position: {
                      x: player.position.x + player.width / 4,
                      y: player.position.y + player.height * 0.7, // Position at the bottom
                    },
                  },
                  rectangle2: {
                    ...boundary,
                    position: {
                      x: boundary.position.x,
                      y: boundary.position.y - SPEED,
                    },
                  },
                })
              ) {
                // console.log("collision detected");
                moving = false;
                break;
              }
            }
            // background.position.y += SPEED;
            if (moving) {
              // background.position.y -= SPEED;
              movables.forEach((movable) => {
                movable.position.y -= SPEED;
              });
            }
          } else if (keys.a.pressed && lastKey === "a") {
            player.animate = true;
            if (player.sprites) player.image = player.sprites.left;
            for (let i = 0; i < boundaries.length; i++) {
              const boundary = boundaries[i];
              if (
                rectangularCollision({
                  rectangle1: {
                    ...player,
                    width: player.width / 2,
                    height: player.height / 4, // Very short box
                    position: {
                      x: player.position.x + player.width / 4,
                      y: player.position.y + player.height * 0.7, // Position at the bottom
                    },
                  },
                  rectangle2: {
                    ...boundary,
                    position: {
                      x: boundary.position.x + SPEED,
                      y: boundary.position.y,
                    },
                  },
                })
              ) {
                // console.log("collision detected");
                moving = false;
                break;
              }
            }
            // background.position.y += SPEED;
            if (moving) {
              // background.position.x += SPEED;
              movables.forEach((movable) => {
                movable.position.x += SPEED;
              });
            }
          } else if (keys.d.pressed && lastKey === "d") {
            player.animate = true;
            if (player.sprites) player.image = player.sprites.right;
            for (let i = 0; i < boundaries.length; i++) {
              const boundary = boundaries[i];
              if (
                rectangularCollision({
                  rectangle1: {
                    ...player,
                    width: player.width / 2,
                    height: player.height / 4, // Very short box
                    position: {
                      x: player.position.x + player.width / 4,
                      y: player.position.y + player.height * 0.7, // Position at the bottom
                    },
                  },
                  rectangle2: {
                    ...boundary,
                    position: {
                      x: boundary.position.x - SPEED,
                      y: boundary.position.y,
                    },
                  },
                })
              ) {
                // console.log("collision detected");
                moving = false;
                break;
              }
            }
            // background.position.y += SPEED;
            if (moving) {
              // background.position.x -= SPEED;
              movables.forEach((movable) => {
                movable.position.x -= SPEED;
              });
            }
          } else {
            if (keys.w.pressed) lastKey = "w";
            else if (keys.s.pressed) lastKey = "s";
            else if (keys.a.pressed) lastKey = "a";
            else if (keys.d.pressed) lastKey = "d";
          }
          if (!player.animate) {
            player.frames.val = 0;
          }
        }

        animate();
        const startBackgroundMusic = () => {
          audio.Map.play().catch((error) => {
            console.log("Audio play still blocked:", error);
          });

          window.removeEventListener("click", startBackgroundMusic);
          window.removeEventListener("keydown", startBackgroundMusic);
        };

        window.addEventListener("click", startBackgroundMusic);
        window.addEventListener("keydown", startBackgroundMusic);

        // initBattle();
        // animateBattle();
        document.querySelectorAll("button").forEach((button) => {
          button.addEventListener("click", (e) => {
            const target = e.currentTarget as HTMLButtonElement;
            const attackName = target.textContent?.trim();

            emby.attack({
              attack: attacks[attackName],
              recipient: draggle,
              renderedSprites: renderedSprites,
              fireballImage: fireballImage,
              audio: audio,
            });

            // alert(attackName);
            if (attackName == "Tackle") {
              audio.tackle.play();
            } else if (attackName == "Fireball") {
              audio.fireballinit.play();
            }

            // Check if Enemy Faints
            if (draggle.health <= 0) {
              queue.push(() => {
                draggle.faint();
                if (battleAudio.current) {
                  battleAudio.current.pause();
                  battleAudio.current.currentTime = 0;
                  audio.victory.play();
                }
              });

              queue.push(() => {
                gsap.to("#overlappingDiv", {
                  opacity: 1,
                  onComplete: () => {
                    if (battleAudio.current) {
                      battleAudio.current.pause();
                      battleAudio.current.currentTime = 0;
                    }
                    audio.victory.pause();
                    audio.victory.currentTime = 0;
                    cancelAnimationFrame(battleAnimationId);
                    animate();
                    audio.Map.play();
                    const userInterface =
                      document.querySelector<HTMLElement>("#userInterface");
                    if (userInterface) {
                      userInterface.style.display = "none";
                    }

                    gsap.to("#overlappingDiv", {
                      opacity: 0,
                    });

                    battle.current.initiated = false;
                  },
                });
              });
              return;
            }

            // Enemy Attack
            queue.push(() => {
              const attackValues = Object.values(attacks);
              const randomAttack =
                attackValues[Math.floor(Math.random() * attackValues.length)];

              if (randomAttack.name === "Tackle") {
                audio.tackle.play();
              } else if (randomAttack.name === "Fireball") {
                audio.fireballinit.play();
              }
              draggle.attack({
                attack: randomAttack,
                recipient: emby,
                renderedSprites: renderedSprites,
                fireballImage: fireballImage,
                audio: audio,
              });

              // Check if Player Faints
              if (emby.health <= 0) {
                queue.push(() => {
                  emby.faint();
                });

                queue.push(() => {
                  gsap.to("#overlappingDiv", {
                    opacity: 1,
                    onComplete: () => {
                      cancelAnimationFrame(battleAnimationId);
                      animate(); // Resume main map loop

                      const userInterface =
                        document.querySelector<HTMLElement>("#userInterface");
                      if (userInterface) {
                        userInterface.style.display = "none";
                      }

                      gsap.to("#overlappingDiv", {
                        opacity: 0,
                      });

                      battle.current.initiated = false;
                    },
                  });
                });

                queue.push(() => {
                  gsap.to("#overlappingDiv", {
                    opacity: 1,
                    onComplete: () => {
                      cancelAnimationFrame(battleAnimationId);
                      animate(); // Resume main map loop

                      const userInterface =
                        document.querySelector<HTMLElement>("#userInterface");
                      if (userInterface) {
                        userInterface.style.display = "none";
                      }

                      gsap.to("#overlappingDiv", {
                        opacity: 0,
                      });

                      // CRITICAL: Unlock the battle state so we can walk again!
                      battle.current.initiated = false;
                    },
                  });
                });
                return;
              }
            });
          });
        });
        const dialogueBox = document.querySelector<HTMLElement>("#dialogueBox");

        if (dialogueBox) {
          dialogueBox.addEventListener("click", (e) => {
            if (queue.length > 0) {
              queue[0]();
              queue.shift();
            } else {
              if (e) {
                dialogueBox.style.display = "none";
              }
            }
          });
        }
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
        {/* health bar */}
        <div id="userInterface" className="hidden">
          <div className="absolute z-10 bg-white top-[65px] left-[65px] w-[120px] p-2 border-4 border-black">
            <h1
              className={`text-[8px] text-black font-bold mb-1 ${pressStart2P.className}`}
            >
              Draggle
            </h1>
            <div className="relative w-full h-[6px] bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="absolute top-0 left-0 h-full bg-gray-500 w-full"></div>

              <div
                id="enemyHealthBar"
                className="absolute top-0 left-0 h-full bg-green-500 w-full"
              ></div>
            </div>
          </div>

          <div className="absolute z-10 bg-white top-[150px] left-[260px] w-[120px] p-2 border-4 border-black">
            <h1
              className={`text-[8px] text-black font-bold mb-1 ${pressStart2P.className}`}
            >
              Emby
            </h1>
            <div className="relative w-full h-[6px] bg-gray-200 rounded-full overflow-hidden mt-1">
              <div className="absolute top-0 left-0 h-full bg-gray-500 w-full"></div>

              <div
                id="playerHealthBar"
                className="absolute top-0 left-0 h-full bg-green-500 w-full"
              ></div>
            </div>
          </div>
          {/* ########## */}

          <div
            className={`absolute flex z-10 bg-white top-[210px] left-[45px] w-[360px] h-[80px] border-t-4 border-black text-black ${pressStart2P.className}`}
          >
            <div
              id="dialogueBox"
              className="hidden absolute z-20 top-0 bottom-0 right-0 left-0 w-full h-full p-3 bg-white text-xs cursor-pointer"
            >
              sasdasdsadasdasda
            </div>
            <div className="w-[40%] p-3 border-r-4 border-black flex items-center overflow-hidden">
              <h1 className="text-xs scale-[0.6] origin-left leading-5 whitespace-nowrap">
                What will
                <br />
                Emby do?
              </h1>
            </div>
            {/* battle btn */}
            <div className="w-[60%] grid grid-cols-2 text-[6px]">
              <button className="hover:bg-gray-200 border-r-2 border-gray-300 flex items-center justify-center overflow-hidden">
                <span className="text-xs scale-[0.60] block">Tackle</span>
              </button>

              <button className="hover:bg-gray-200 flex items-center justify-center overflow-hidden">
                <span className="text-xs scale-[0.60] block">Fireball</span>
              </button>
            </div>
          </div>
        </div>
        <div
          id="overlappingDiv"
          className="absolute top-[45px] left-[45px] w-[360px] h-[270px] bg-black z-10 pointer-events-none opacity-0"
        ></div>
        <canvas
          ref={canvasRef}
          width={360}
          height={270}
          className="absolute top-[45px] left-[45px] z-0"
        />

        <div className="absolute inset-0 z-20 pointer-events-none">
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
