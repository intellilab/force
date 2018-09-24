import React, { useState, useRef, useEffect } from 'react';
import imageUrl from '#/assets/gaara.jpg';
import MaskedImage from '../masked-image';
import Result from '../result';
import styles from './style.module.css';

const data = [
  {
    text: '这是一只眼睛',
    bbox: [450, 350, 600, 450],
  },
  {
    text: '这是另一只眼睛',
    bbox: [680, 400, 830, 500],
  },
  {
    text: '爱',
    bbox: [720, 300, 810, 400],
  },
  {
    text: '这是一只大手',
    bbox: [280, 1170, 820, 1570],
  },
];

export default function Playground() {
  const [wrapProps, setWrapProps] = useState(null);
  const [imageProps, setImageProps] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setWrapProps(rect);
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      <MaskedImage
        url={imageUrl}
        wrapProps={wrapProps}
        imageProps={imageProps}
        onLoad={setImageProps}
      />
      {imageProps && (
        <Result
          wrapProps={wrapProps}
          imageProps={imageProps}
          data={data}
        />
      )}
    </div>
  );
}
