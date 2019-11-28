import { Tween } from 'es6-tween';
import React, { useState, useEffect } from 'react';

import styles from './style.module.css';

export default React.forwardRef((props, ref) => {
  const [scale, setScale] = useState(0);
  const [showText, setShowText] = useState(false);
  const {
    data: {
      text, style, animated,
    },
  } = props;

  let tween;

  useEffect(() => {
    if (tween || !animated) return;
    tween = new Tween({ scale: 0 })
    .to({ scale: 1 }, 200)
    .on('update', (update) => {
      setScale(update.scale);
    })
    .on('complete', () => {
      setShowText(true);
      tween = null;
    })
    .start();
    return () => {
      if (tween) {
        tween.stop();
        tween = null;
      }
    };
  }, [animated]);

  if (!text) return null;
  return (
    <div className={styles.wrap} style={style} ref={ref}>
      <div className={styles.bar} style={{ transform: `scaleX(${scale})` }} />
      <div className={`${styles.text} ${showText ? '' : styles.hidden}`}>{text}</div>
    </div>
  );
});
