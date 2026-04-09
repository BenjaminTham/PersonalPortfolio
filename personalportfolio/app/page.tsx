"use client";
import { useRef, useEffect } from "react";

interface SpriteOptions {
  position: { x: number; y: number };
  velocity?: { vel: number };
  image: HTMLImageElement;
  frames?: { max: number; val: number; elapsed: number };
  width?: number;
  height?: number;
  moving?: boolean;
  sprites?: {
    up: HTMLImageElement;
    down: HTMLImageElement;
    left: HTMLImageElement;
    right: HTMLImageElement;
  };
}

interface Rectangle {
  position: { x: number; y: number };
  width: number;
  height: number;
}

class Sprite {
  position: { x: number; y: number };
  image: HTMLImageElement;
  frames: { max: number; val: number; elapsed: number };
  width: number;
  height: number;
  moving: boolean;
  sprites: any;

  constructor({
    position,
    image,
    frames = { max: 1, val: 0, elapsed: 0 },
    width,
    height,
    moving,
    sprites,
  }: SpriteOptions) {
    this.position = position;
    this.image = image;
    this.frames = { ...frames, val: 0, elapsed: 0 };
    this.width = this.image.width / this.frames.max;
    this.height = this.image.height;
    this.moving = false;
    this.sprites = sprites;
  }
  draw(c: CanvasRenderingContext2D) {
    c.drawImage(
      this.image,
      this.frames.val * this.width,
      0,
      this.image.width / this.frames.max,
      this.image.height,
      this.position.x,
      this.position.y,
      this.image.width / this.frames.max,
      this.image.height,
    );
    if (!this.moving) return;
    if (this.frames.max > 1) {
      this.frames.elapsed++;
    }
    if (this.frames.elapsed % 20 === 0) {
      if (this.frames.val < this.frames.max - 1) {
        this.frames.val++;
      } else {
        this.frames.val = 0;
      }
    }

    // c.drawImage(this.image, this.position.x, this.position.y);
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

  const collisionsMap: number[][] = [];

  const boundaries: Boundary[] = [];

  const SPEED = 0.75;

  const offset = { x: -1550, y: -500 };

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

    Promise.all([
      loadImage("/gamemap.png"),
      loadImage("/playerDown.png"),
      loadImage("/playerUp.png"),
      loadImage("/playerLeft.png"),
      loadImage("/playerRight.png"),
      loadImage("/foreground.png"),
    ]).then(
      ([
        worldImage,
        playerDownImage,
        playerUpImage,
        playerLeftImage,
        playerRightImage,
        foregroundImage,
      ]) => {
        for (let i = 0; i < collisions.length; i += 70) {
          collisionsMap.push(collisions.slice(i, i + 70));
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
          },
          sprites: {
            up: playerUpImage,
            left: playerLeftImage,
            right: playerRightImage,
            down: playerDownImage,
          },
        });

        const foreground = new Sprite({
          position: { x: offset.x, y: offset.y },
          image: foregroundImage,
        });

        const movables = [background, ...boundaries, foreground];

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

        function animate() {
          if (!c) return;
          if (!canvas) return;
          window.requestAnimationFrame(animate);

          background.draw(c);
          player.draw(c);
          foreground.draw(c);

          boundaries.forEach((boundary) => {
            boundary.draw(c);
          });

          let moving = true;
          player.moving = false;

          if (keys.w.pressed && lastKey === "w") {
            player.moving = true;
            player.image = player.sprites.up;
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
            player.moving = true;
            player.image = player.sprites.down;
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
            player.moving = true;
            player.image = player.sprites.left;
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
            player.moving = true;
            player.image = player.sprites.right;
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
          if (!player.moving) {
            player.frames.val = 0;
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
