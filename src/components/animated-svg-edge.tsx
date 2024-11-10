import type { Edge, EdgeProps, Position } from "@xyflow/react";
import { BaseEdge, getBezierPath, getStraightPath, getSmoothStepPath } from "@xyflow/react";

export type AnimatedSvgEdge = Edge<{
  duration: number;
  direction?: "forward" | "reverse" | "alternate" | "alternate-reverse";
  path?: "bezier" | "smoothstep" | "step" | "straight";
  repeat?: number | "indefinite";
  shape: keyof typeof shapes;
}>;

export function AnimatedSvgEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data = {
    duration: 2,
    direction: "forward",
    path: "bezier",
    repeat: "indefinite",
    shape: "circle",
  },
  ...delegated
}: EdgeProps<AnimatedSvgEdge>) {
  const Shape = shapes[data.shape];

  const [path] = getPath({
    type: data.path ?? "bezier",
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  const animateMotionProps = getAnimateMotionProps({
    duration: data.duration,
    direction: data.direction ?? "forward",
    repeat: data.repeat ?? "indefinite",
    path,
  });

  return (
    <>
      <BaseEdge id={id} path={path} {...delegated} />
      <Shape animateMotionProps={animateMotionProps} />
    </>
  );
}

type AnimateMotionProps = {
  dur: string;
  keyTimes: string;
  keyPoints: string;
  repeatCount: number | "indefinite";
  path: string;
  calcMode: string;
};

type AnimatedSvg = React.FC<{ animateMotionProps: AnimateMotionProps }>;

const shapes = {
  circle: ({ animateMotionProps }) => {
    const circles = Array.from({ length: 5 }).map((_, index) => (
      <circle key={index} r="3" className="fill-sky-500">
        <animateMotion {...animateMotionProps} keyPoints={`${index / 5};${(index + 0.5) / 5};${(index + 1) / 5}`} keyTimes="0;0.5;1" />
      </circle>
    ));
    return (
      <>
        <defs>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {circles}
      </>
    );
  },

  package: ({ animateMotionProps }) => (
    <g fill="#dfc7b1" stroke="#2a2a2a" transform="translate(-10,-10)">
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
      <animateMotion {...animateMotionProps} />
    </g>
  ),
} satisfies Record<string, AnimatedSvg>;

function getPath({
  type,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
}: {
  type: "bezier" | "smoothstep" | "step" | "straight";
  sourceX: number;
  sourceY: number;
  targetX: number;
  targetY: number;
  sourcePosition: Position;
  targetPosition: Position;
}) {
  switch (type) {
    case "bezier":
      return getBezierPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });

    case "smoothstep":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
      });

    case "step":
      return getSmoothStepPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
        sourcePosition,
        targetPosition,
        borderRadius: 0,
      });

    case "straight":
      return getStraightPath({
        sourceX,
        sourceY,
        targetX,
        targetY,
      });
  }
}

function getAnimateMotionProps({
  duration,
  direction,
  repeat,
  path,
}: {
  duration: number;
  direction: "forward" | "reverse" | "alternate" | "alternate-reverse";
  repeat: number | "indefinite";
  path: string;
}) {
  const base = {
    path,
    repeatCount: repeat,
    calcMode: "linear",
  };

  switch (direction) {
    case "forward":
      return {
        ...base,
        dur: `${duration}s`,
        keyTimes: "0;1",
        keyPoints: "0;1",
      };

    case "reverse":
      return {
        ...base,
        dur: `${duration}s`,
        keyTimes: "0;1",
        keyPoints: "1;0",
      };

    case "alternate":
      return {
        ...base,
        dur: `${duration * 2}s`,
        keyTimes: "0;0.5;1",
        keyPoints: "0;1;0",
      };

    case "alternate-reverse":
      return {
        ...base,
        dur: `${duration * 2}s`,
        keyTimes: "0;0.5;1",
        keyPoints: "1;0;1",
      };
  }
}
