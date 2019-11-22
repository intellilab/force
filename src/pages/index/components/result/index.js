import React from 'react';
import GeneticAlgorithmConstructor from 'geneticalgorithm';
import ResultText from '../result-text';
import styles from './style.module.css';

export default class Result extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      items: [],
    };
    this.cache = {
      nodes: [],
    };
  }

  componentDidMount() {
    this.updateData();
    this.draw();
  }

  componentDidUpdate(prevProps) {
    this.draw();
    if (prevProps !== this.props) this.updateData();
  }

  getOffset(e) {
    const {
      wrapProps: {
        top,
        left,
      },
    } = this.props;
    return {
      offsetX: e.clientX - left,
      offsetY: e.clientY - top,
    };
  }

  handleBind = el => {
    this.cache.canvas = el;
    this.cache.ctx = el ? el.getContext('2d') : null;
  }

  handleBindItem = (i, el) => {
    this.cache.nodes[i] = el;
  }

  handleMouseDown = e => {
    e.preventDefault();
    if (this.dragStart(e)) {
      document.addEventListener('mousemove', this.handleMouseMove, false);
      document.addEventListener('mouseup', this.handleMouseUp, false);
    }
  }

  handleMouseMove = e => {
    this.dragMove(e);
  }

  handleMouseUp = () => {
    if (this.dragEnd()) {
      document.removeEventListener('mousemove', this.handleMouseMove, false);
      document.removeEventListener('mouseup', this.handleMouseUp, false);
    }
  }

  handleTouchStart = e => {
    const [touch] = e.changedTouches;
    if (this.dragStart(touch)) {
      document.addEventListener('touchmove', this.handleTouchMove, false);
      document.addEventListener('touchend', this.handleTouchEnd, false);
    }
  }

  handleTouchMove = e => {
    const [touch] = e.changedTouches;
    this.dragMove(touch);
  }

  handleTouchEnd = () => {
    if (this.dragEnd()) {
      document.removeEventListener('touchmove', this.handleTouchMove, false);
      document.removeEventListener('touchend', this.handleTouchEnd, false);
    }
  }

  updateItems() {
    const { items } = this.state;
    const firstGen = [[]];
    items.forEach((item, index) => {
      const {
        data: {
          tw,
          th,
        },
        rect,
      } = item;
      firstGen[0].push({
        index,
        x1: rect.x1,
        y1: rect.y1,
        w: tw,
        h: th,
      });
    });
    const mutationFunction = (phenotype) => {
      return phenotype.map(rect => {
        rect = { ...rect };
        rect.x1 += (Math.floor(Math.random() * 3) - 1) * 3;
        rect.y1 += (Math.floor(Math.random() * 3) - 1) * 3;
        const rnd = Math.random();
        const item = items[rect.index];
        if (rnd < 0.3) {
          // flip horizontally
          rect.x1 = item.rect.cx * 2 - rect.x1 - rect.w;
        } else if (rnd < 0.6) {
          // flip vertically
          rect.y1 = item.rect.cy * 2 - rect.y1 - rect.h;
        }
        return rect;
      });
    };
    const crossoverFunction = (phenotypeA, phenotypeB) => {
      const halfLength = Math.floor(phenotypeA.length / 2);
      return [
        [
          ...phenotypeA.slice(0, halfLength),
          ...phenotypeB.slice(halfLength),
        ],
        [
          ...phenotypeB.slice(0, halfLength),
          ...phenotypeA.slice(halfLength),
        ],
      ];
    };
    const fitnessFunction = (phenotype) => {
      let badness = 0;
      phenotype.forEach((rect, i) => {
        items.forEach((item, j) => {
          const { dx, dy, area } = rectJoin(rect, item.rect);
          if (area) {
            badness += area * 0.5;
          } else if (i === j) {
            const dis = -Math.max(...[dx, dy].filter(v => v < 0));
            badness += dis * 0.5;
          }
        });
        phenotype.forEach((other) => {
          if (rect !== other) {
            const { area } = rectJoin(rect, other);
            if (area) {
              badness += area * 0.8;
            }
          }
        });
      });
      return -badness;
    };
    const geneticalgorithm = GeneticAlgorithmConstructor({
      mutationFunction,
      crossoverFunction,
      fitnessFunction,
      population: firstGen,
      populationSize: 100,
    });
    for (let i = 0; i < 100; i += 1) {
      geneticalgorithm.evolve();
    }
    const best = geneticalgorithm.best();
    console.info('best:', best, geneticalgorithm.bestScore());
    this.setState({
      items: items.map((item, index) => ({
        ...item,
        data: {
          ...item.data,
          align: 'left',
          animated: true,
          style: {
            top: best[index].y1,
            left: best[index].x1,
          },
        },
      })),
    });
  }

  dragStart(e) {
    const { offsetX, offsetY } = this.getOffset(e);
    const { items } = this.state;
    const index = items.findIndex(item => {
      const {
        x1, y1, w, h,
      } = item.rect;
      return offsetX >= x1 && offsetX <= x1 + w && offsetY >= y1 && offsetY <= y1 + h;
    });
    if (index >= 0) {
      const dragging = {
        x: offsetX,
        y: offsetY,
        index,
        data: items[index],
      };
      this.dragging = dragging;
      return true;
    }
  }

  dragMove(e) {
    const { dragging } = this;
    if (!dragging) return;
    const { offsetX, offsetY } = this.getOffset(e);
    const { imageProps } = this.props;
    const { data: { rect } } = dragging;
    const x1 = rect.x1 + offsetX - dragging.x;
    const y1 = rect.y1 + offsetY - dragging.y;
    const rects = transformRect([
      x1, y1, x1 + rect.w, y1 + rect.h,
    ], {
      scale: 1 / imageProps.scale,
      zoom: 1,
    });
    const newData = {
      ...dragging.data,
      srect: rects.rect,
      rect: rects.srect,
    };
    const { items } = this.state;
    const newItems = [...items];
    newItems[dragging.index] = newData;
    this.setState({ items: newItems }, this.draw);
  }

  dragEnd() {
    const { dragging } = this;
    if (!dragging) return;
    this.dragging = null;
    this.updateItems();
    return true;
  }

  updateData() {
    const { data, imageProps } = this.props;
    if (!data) return;
    const zoom = 1;
    const items = data.map(item => {
      const { text, bbox } = item;
      const rects = transformRect(bbox, { ...imageProps, zoom });
      return {
        bbox,
        zoom,
        ...rects,
        data: {
          text,
          style: {
            right: '100%',
            bottom: '100%',
          },
        },
      };
    });
    this.setState({ items }, () => {
      items.forEach((item, i) => {
        const el = this.cache.nodes[i];
        if (el) {
          ({ offsetWidth: item.data.tw, offsetHeight: item.data.th } = el);
        }
      });
      this.updateItems();
    });
  }

  draw() {
    const { canvas, ctx } = this.cache;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const { items } = this.state;
    const { imageProps: { el } } = this.props;
    items.forEach(({ srect, rect }) => {
      const {
        x1: sx1, y1: sy1, w: sw, h: sh,
      } = srect;
      const {
        x1, y1, w, h,
      } = rect;
      ctx.drawImage(el, sx1, sy1, sw, sh, x1, y1, w, h);
    });
  }

  render() {
    const { items } = this.state;
    const {
      wrapProps: {
        width: clientWidth,
        height: clientHeight,
      },
    } = this.props;
    return (
      <div>
        <canvas
          ref={this.handleBind}
          className={styles.rect}
          width={clientWidth}
          height={clientHeight}
          onMouseDown={this.handleMouseDown}
          onTouchStart={this.handleTouchStart}
        />
        {items.map((item, i) => (
          <ResultText key={i} data={item.data} ref={node => this.handleBindItem(i, node)} />
        ))}
      </div>
    );
  }
}

function rectJoin(rc1, rc2) {
  const x1 = Math.max(rc1.x1, rc2.x1);
  const y1 = Math.max(rc1.y1, rc2.y1);
  const x2 = Math.min(rc1.x1 + rc1.w, rc2.x1 + rc2.w);
  const y2 = Math.min(rc1.y1 + rc1.h, rc2.y1 + rc2.h);
  let area = 0;
  const dx = x2 - x1;
  const dy = y2 - y1;
  if (dx > 0 && dy > 0) {
    // 相交了
    area = dx * dy;
  }
  return {
    x1, y1, x2, y2, dx, dy, area,
  };
}

function transformRect([sx1, sy1, sx2, sy2], options = {}) {
  const {
    scale,
    top = 0,
    left = 0,
    zoom = 1,
  } = options;
  const sw = sx2 - sx1;
  const sh = sy2 - sy1;
  const bw = sw * scale;
  const bh = sh * scale;
  const w = bw * zoom;
  const h = bh * zoom;
  const x1 = left + scale * sx1 - (w - bw) / 2;
  const y1 = top + scale * sy1 - (h - bh) / 2;
  return {
    srect: {
      x1: sx1,
      y1: sy1,
      x2: sx2,
      y2: sy2,
      cx: sx1 + sw / 2,
      cy: sy1 + sh / 2,
      w: sw,
      h: sh,
    },
    rect: {
      x1,
      y1,
      x2: x1 + w,
      y2: y1 + h,
      cx: x1 + w / 2,
      cy: y1 + h / 2,
      w,
      h,
    },
  };
}
