import React, { useState, useRef, useEffect } from 'react';
import Result from '../result';
import styles from './style.module.css';

const messages = [
  'hello, world',
  'Every day is Friday',
  'Today, I don\'t feel like doing anything',
  'I just wanna lay in my bed',
  'Don\'t feel like picking up my phone',
  'So leave a message at the tone',
  '\'Cause today, I swear, I\'m not doing anything',
];
const getMessage = () => messages[Math.floor(Math.random() * messages.length)];

const data = [
  {
    text: getMessage(),
    bbox: [0.3, 0.3, 0.4, 0.4],
  },
  {
    text: getMessage(),
    bbox: [0.4, 0.4, 0.6, 0.6],
  },
  {
    text: getMessage(),
    bbox: [0.3, 0.5, 0.4, 0.6],
  },
  {
    text: getMessage(),
    bbox: [0.2, 0.6, 0.8, 0.8],
  },
];

export default function Playground() {
  const [wrapProps, setWrapProps] = useState(null);
  const ref = useRef();

  useEffect(() => {
    const rect = ref.current.getBoundingClientRect();
    setWrapProps({
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      scale: rect.width / 750,
    });
  }, []);

  return (
    <div className={styles.wrap} ref={ref}>
      {wrapProps && (
        <Result
          wrapProps={wrapProps}
          data={data}
        />
      )}
    </div>
  );
}
