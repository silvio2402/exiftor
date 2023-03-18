import React, { useEffect, useState } from 'react';
import { Image as AntDImage, ImageProps as AntDImageProps } from 'antd';
import { trpc } from '../trpc';

interface ImageProps extends AntDImageProps {
  imgPath: string;
  thumbnail?: boolean;
}

const Image = (props: ImageProps) => {
  const { imgPath, thumbnail: initialThumbnail, ...restProps } = props;

  const [thumbnail, setThumbnail] = useState<boolean>(
    initialThumbnail || false
  );

  const [imgSrc, setImgSrc] = useState<string | undefined>();

  // TODO: Only enable query when image is in view (https://bobbyhadz.com/blog/react-check-if-element-in-viewport)
  const { data: imgData } = trpc.readImg.useQuery({
    path: imgPath,
    thumbnail,
  });

  useEffect(() => {
    let newImgSrc: string | undefined;
    if (imgData?.imgBuffer) {
      const { imgBuffer } = imgData;
      const imgBlob = new Blob([imgBuffer], { type: 'image/webp' });
      newImgSrc = URL.createObjectURL(imgBlob);
    }
    setImgSrc(newImgSrc);

    return () => {
      if (newImgSrc) URL.revokeObjectURL(newImgSrc);
    };
  }, [imgData, thumbnail]);

  return (
    <AntDImage
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      src={imgSrc}
      preview={{
        onVisibleChange(isVisible) {
          if (isVisible) setThumbnail(false);
        },
        src: imgSrc,
      }}
    />
  );
};

Image.defaultProps = {
  thumbnail: false,
};

export default Image;
