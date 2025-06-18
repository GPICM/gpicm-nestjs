import { ImageTargetEnum } from "./enums/image-target-enum";
import { ImageTransformConfig } from "./object-values/image-transform-config";

export const imageTransformMap = {
  [ImageTargetEnum.POSTS_GENERIC_IMAGE]: new ImageTransformConfig({
    format: "webp",
    sizes: [
      { alias: "sm", maxWidth: 128 },
      { alias: "md", maxWidth: 320 },
      { alias: "lg", maxWidth: 560 },
      { alias: "base", maxWidth: 720 },
    ],
  }),
  [ImageTargetEnum.USERS_AVATAR]: new ImageTransformConfig({
    format: "webp",
    sizes: [
      { alias: "sm", maxWidth: 64 },
      { alias: "md", maxWidth: 128 },
      { alias: "lg", maxWidth: 240 },
      { alias: "base", maxWidth: 320 },
    ],
  }),
};

export const DEFAULT_IMAGE_CONFIG = new ImageTransformConfig({
  format: "webp",
  sizes: [
    { alias: "sm", maxWidth: 96 },
    { alias: "md", maxWidth: 240 },
    { alias: "lg", maxWidth: 480 },
    { alias: "base", maxWidth: 560 },
  ],
});

export function resolveImageTransformConfig(
  target?: ImageTargetEnum
): ImageTransformConfig {
  if (target && imageTransformMap[target]) {
    return imageTransformMap[target];
  }

  return DEFAULT_IMAGE_CONFIG;
}
