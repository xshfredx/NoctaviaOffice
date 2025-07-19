
export interface Point {
  x: number;
  y: number;
}

export interface Element {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  scale: number;
}

export interface TextElement extends Element {
  type: 'text';
  text: string;
  fontFamily: string;
  fontSize: number;
}

export interface StickerElement extends Element {
  type: 'sticker';
  src: string;
  image: HTMLImageElement;
}

export type CanvasElement = TextElement | StickerElement;

export interface ImageEffects {
  contrast: number;
  saturation: number;
  noise: number;
  posterize: number;
  blur: number;
  blurAngle: number;
}

export interface TextStyle {
  color: string;
  outline: boolean;
  deepFry: boolean;
}

export interface PanelVisibility {
  imageEffects: boolean;
  textEffects: boolean;
  stickerLibrary: boolean;
}
