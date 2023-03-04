import React, { useEffect, useState } from 'react';
import { Image as AntDImage, ImageProps as AntDImageProps } from 'antd';
import type { ReadImgArgs } from 'common/ipc-types';
import handleError from 'renderer/errorhandling';

interface ImageProps extends AntDImageProps {
  imgPath: string;
  thumbnail?: boolean;
}

const Image = (props: ImageProps) => {
  const { imgPath, thumbnail: initialThumbnail, ...restProps } = props;

  const [thumbnail, setThumbnail] = useState<boolean>(
    initialThumbnail || false
  );

  const [thumbSrc, setThumbSrc] = useState<string | undefined>(undefined);
  const [fullSrc, setFullSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    const currImgSrc = new Promise<string | null>((resolve, reject) => {
      if (!thumbnail) {
        resolve(null);
      }
      const { ipcRenderer } = window.electron;
      const args: ReadImgArgs = {
        path: imgPath,
        thumbnail: true,
      };
      ipcRenderer
        .invoke('read-img', args)
        .then((result) => {
          const { imgBuffer } = result;
          const imgBlob = new Blob([imgBuffer], { type: 'image/webp' });
          const newImgSrc = URL.createObjectURL(imgBlob);
          setThumbSrc(newImgSrc);
          resolve(newImgSrc);
          return null;
        })
        .catch((err) => {
          handleError(err);
          setThumbSrc(undefined);
          reject(err instanceof Error ? err.message : undefined);
        });
    });

    return () => {
      currImgSrc
        .then(
          (revokeImgSrc) => revokeImgSrc && URL.revokeObjectURL(revokeImgSrc)
        )
        .catch(handleError);
    };
  }, [imgPath, thumbnail]);

  useEffect(() => {
    const currImgSrc = new Promise<string | null>((resolve, reject) => {
      if (thumbnail) {
        resolve(null);
      }
      const { ipcRenderer } = window.electron;
      const args: ReadImgArgs = {
        path: imgPath,
        thumbnail: thumbnail || false,
      };
      ipcRenderer
        .invoke('read-img', args)
        .then((result) => {
          const { imgBuffer } = result;
          const imgBlob = new Blob([imgBuffer], { type: 'image/webp' });
          const newImgSrc = URL.createObjectURL(imgBlob);
          setFullSrc(newImgSrc);
          resolve(newImgSrc);
          return null;
        })
        .catch((err) => {
          handleError(err);
          reject(err instanceof Error ? err.message : undefined);
        });
    });

    return () => {
      currImgSrc
        .then(
          (revokeImgSrc) => revokeImgSrc && URL.revokeObjectURL(revokeImgSrc)
        )
        .catch(handleError);
    };
  }, [imgPath, thumbnail]);

  return (
    <AntDImage
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...restProps}
      src={thumbSrc}
      preview={{
        onVisibleChange(isVisible) {
          if (isVisible) setThumbnail(false);
        },
        src: fullSrc,
      }}
    />
  );
};

Image.defaultProps = {
  thumbnail: false,
};

export default Image;
