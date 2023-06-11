import React, { useEffect, useState } from 'react';
import { Image as AntDImage, ImageProps as AntDImageProps } from 'antd';
import { trpc } from '../trpc';
import Styles from './Image.module.scss';

interface ImageProps extends AntDImageProps {
  imgPath: string;
  thumbnail?: boolean;
  selected?: boolean;
}

const Image = (props: ImageProps) => {
  const {
    imgPath,
    thumbnail: initialThumbnail,
    selected,
    ...restProps
  } = props;

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

  useEffect(() => {
    if (typeof restProps.preview !== 'boolean' && restProps.preview?.visible) {
      setThumbnail(false);
    }
  }, [restProps.preview]);

  return (
    // TODO: Add loading indicator (e.g. remake the image component)
    <AntDImage
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      style={{
        // TODO: Adjust border color to theme
        outlineColor: selected ? '#1890ff' : undefined,
      }}
      className={[restProps.className, Styles.image].join(' ')}
      src={imgSrc}
      preview={
        restProps.preview &&
        typeof restProps.preview !== 'boolean' && {
          onVisibleChange(isVisible, prevVisible) {
            if (isVisible) setThumbnail(false);
            if (typeof restProps.preview !== 'boolean')
              restProps.preview?.onVisibleChange?.(isVisible, prevVisible);
          },
          visible: restProps.preview?.visible,
          src: imgSrc,
        }
      }
    />
  );
};

Image.defaultProps = {
  thumbnail: false,
  selected: true,
};

export default Image;
