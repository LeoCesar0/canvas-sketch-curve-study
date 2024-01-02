const canvasSketch = require("canvas-sketch");

const settings = {
  dimensions: [1080, 1080],
  animate: true,
};

let canvasEl;
let points = [];

const sketch = ({ context, width, height, canvas }) => {
  canvasEl = canvas;

  points = [
    new Point({ x: width / 4, y: height / 2 }),
    new Point({ x: 100, y: height / 4 }),
    new Point({ x: width * 0.75, y: height / 2 }),
    new Point({ x: width * 0.8, y: height * 0.25 }),
    new Point({ x: width * 0.9, y: height * 0.4 }),
  ];

  canvas.addEventListener("mousedown", onMouseDown);

  return ({ context, width, height }) => {
    // --------------------------
    // Draw Canvas
    // --------------------------

    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    // --------------------------
    // Draw point lines
    // --------------------------

    context.save();
    context.strokeStyle = "#33333350";

    context.beginPath();
    context.moveTo(points[0].x, points[0].y);
    points.forEach((point) => {
      context.lineTo(point.x, point.y);
    });
    context.stroke();
    context.restore();

    // --------------------------
    // Draw Curves
    // --------------------------

    context.save();
    context.beginPath();

    context.moveTo(points[0].x, points[0].y);

    for (let i = 0; i < points.length; i++) {
      const curr = points[i];
      const next = points[i + 1];

      if (next) {
        let mx = curr.x + (next.x - curr.x) / 2;
        let my = curr.y + (next.y - curr.y) / 2;

        context.quadraticCurveTo(curr.x, curr.y, mx, my);

        if (i === points.length - 2) {
          context.lineTo(next.x, next.y);
        }
      }
    }

    context.strokeStyle = "blue";
    context.lineWidth = 4;
    context.stroke();

    context.restore();

    points.forEach((point) => point.draw(context));
  };
};

canvasSketch(sketch, settings);

const onMouseDown = (event) => {
  window.addEventListener("mousemove", onMouseMove);
  window.addEventListener("mouseup", onMouseUp);

  const x = (event.offsetX / canvasEl.offsetWidth) * canvasEl.width;
  const y = (event.offsetY / canvasEl.offsetHeight) * canvasEl.height;

  points.forEach((point) => {
    const hit = point.isHit(x, y);
    point.isDragging = hit;
  });

  const hasHitPoint = points.find((point) => point.isDragging);
  if (!hasHitPoint) {
    points.push(new Point({ x, y }));
  }
};

const onMouseMove = (event) => {
  const x = (event.offsetX / canvasEl.offsetWidth) * canvasEl.width;
  const y = (event.offsetY / canvasEl.offsetHeight) * canvasEl.height;

  const draggingPoint = points.find((point) => point.isDragging);

  if (draggingPoint) {
    draggingPoint.x = x;
    draggingPoint.y = y;
  }
};

const onMouseUp = () => {
  window.removeEventListener("mousemove", onMouseMove);
  window.removeEventListener("mouseup", onMouseUp);
};

class Point {
  constructor({ x, y, control = false }) {
    this.x = x;
    this.y = y;
    this.control = control;
    this.radius = 15;
  }

  draw(context) {
    context.save();
    context.fillStyle = this.control ? "red" : "black";

    context.moveTo(this.x, this.y);
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }

  isHit(x, y) {
    const dx = this.x - x;
    const dy = this.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const offset = 10;
    return distance <= this.radius + offset;
  }
}
