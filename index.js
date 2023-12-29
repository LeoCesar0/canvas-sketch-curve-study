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
    new Point({ x: 100, y: height / 4, control: true }),
    new Point({ x: width * 0.75, y: height / 2 }),
  ];

  canvas.addEventListener("mousedown", onMouseDown);

  return ({ context, width, height }) => {
    context.fillStyle = "white";
    context.fillRect(0, 0, width, height);

    context.save();
    context.beginPath();

    context.moveTo(points[0].x, points[0].y);

    context.quadraticCurveTo(
      points[1].x,
      points[1].y,
      points[2].x,
      points[2].y
    );
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
};

const onMouseMove = (event) => {
  const x = (event.offsetX / canvasEl.offsetWidth) * canvasEl.width;
  const y = (event.offsetY / canvasEl.offsetHeight) * canvasEl.height;

  const draggingPoint = points.find((point) => point.isDragging)

  if(draggingPoint){
    console.log('dragging')
    draggingPoint.x = x
    draggingPoint.y = y
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
