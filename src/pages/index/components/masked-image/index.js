import React, { useRef, useEffect } from 'react';
import { debounce } from 'lodash-es';
import styles from './style.module.css';

export default function MaskedImage(props) {
  const ref = useRef();
  const handleUpdate = () => {
    const { naturalWidth, naturalHeight } = ref.current;
    const ratioImage = naturalWidth / naturalHeight;
    const {
      wrapProps: {
        width: clientWidth,
        height: clientHeight,
      },
    } = props;
    const ratioScr = clientWidth / clientHeight;
    let imageWidth;
    let imageHeight;
    if (ratioImage > ratioScr) {
      imageHeight = clientHeight;
      imageWidth = Math.floor(ratioImage * imageHeight);
    } else {
      imageWidth = clientWidth;
      imageHeight = Math.floor(imageWidth / ratioImage);
    }
    const imageLeft = Math.floor((clientWidth - imageWidth) / 2);
    const imageTop = Math.floor((clientHeight - imageHeight) / 2);
    const scale = imageWidth / naturalWidth;
    const { onLoad } = props;
    onLoad({
      el: ref.current,
      width: imageWidth,
      height: imageHeight,
      left: imageLeft,
      top: imageTop,
      scale,
    });
  };
  const debouncedUpdate = debounce(handleUpdate, 200);

  useEffect(() => {
    window.addEventListener('resize', debouncedUpdate, false);
    return () => {
      window.removeEventListener('resize', debouncedUpdate, false);
    };
  });

  const { url, wrapProps, imageProps } = props;
  if (!url || !wrapProps) return null;
  const {
    width, height, top, left,
  } = imageProps || {};
  return (
    <div>
      <div
        className={styles.image}
        style={{
          width,
          height,
          top,
          left,
        }}
      >
        <img src={url} ref={ref} onLoad={handleUpdate} />
      </div>
      <div className={styles.mask} />
    </div>
  );
}
