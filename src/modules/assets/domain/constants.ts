import { MediaTargetEnum } from "./entities/Media";
import { ImageTransformConfig } from "./object-values/image-transform-config";

export const imageTransformMap = {
  [MediaTargetEnum.POSTS_GENERIC_IMAGE]: new ImageTransformConfig({
    format: "webp",
    sizes: [
      { alias: "sm", maxWidth: 128 },
      { alias: "md", maxWidth: 320 },
      { alias: "lg", maxWidth: 512 },
    ],
  }),
  [MediaTargetEnum.USERS_AVATAR]: new ImageTransformConfig({
    format: "webp",
    sizes: [
      { alias: "sm", maxWidth: 64 },
      { alias: "md", maxWidth: 128 },
      { alias: "lg", maxWidth: 240 },
    ],
  }),
};

export const DEFAULT_IMAGE_CONFIG = new ImageTransformConfig({
  format: "webp",
  sizes: [
    { alias: "sm", maxWidth: 96 },
    { alias: "md", maxWidth: 240 },
    { alias: "lg", maxWidth: 480 },
  ],
});
