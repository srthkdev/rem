"use client";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image"; // Import next/image for optimized images

interface NekoCursorProps {
  enabled: boolean;
}

type Direction =
  | "right"
  | "downright"
  | "down"
  | "downleft"
  | "left"
  | "upleft"
  | "up"
  | "upright";
type State = "idle" | "run" | "sleep" | "scratch" | "yawn";

// Map directions to available frames (diagonals use closest cardinal direction if not available)
const DIRECTION_MAP: Record<Direction, Direction> = {
  right: "right",
  downright: "right",
  down: "down",
  downleft: "left",
  left: "left",
  upleft: "left",
  up: "up",
  upright: "right",
};

const FRAME_MAP: Record<State, Record<Direction, string[]>> = {
  idle: {
    right: ["/neko/1.GIF"],
    downright: ["/neko/1.GIF"],
    down: ["/neko/1.GIF"],
    downleft: ["/neko/1.GIF"],
    left: ["/neko/1.GIF"],
    upleft: ["/neko/1.GIF"],
    up: ["/neko/1.GIF"],
    upright: ["/neko/1.GIF"],
  },
  run: {
    right: ["/neko/2.GIF", "/neko/3.GIF", "/neko/4.GIF", "/neko/5.GIF"],
    downright: ["/neko/2.GIF", "/neko/3.GIF", "/neko/4.GIF", "/neko/5.GIF"],
    down: ["/neko/12.GIF", "/neko/13.GIF"],
    downleft: ["/neko/6.GIF", "/neko/7.GIF", "/neko/8.GIF", "/neko/9.GIF"],
    left: ["/neko/6.GIF", "/neko/7.GIF", "/neko/8.GIF", "/neko/9.GIF"],
    upleft: ["/neko/6.GIF", "/neko/7.GIF", "/neko/8.GIF", "/neko/9.GIF"],
    up: ["/neko/10.GIF", "/neko/11.GIF"],
    upright: ["/neko/2.GIF", "/neko/3.GIF", "/neko/4.GIF", "/neko/5.GIF"],
  },
  sleep: {
    right: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    downright: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    down: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    downleft: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    left: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    upleft: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    up: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
    upright: ["/neko/14.GIF", "/neko/15.GIF", "/neko/16.GIF"],
  },
  scratch: {
    right: ["/neko/19.GIF", "/neko/20.GIF"],
    downright: ["/neko/19.GIF", "/neko/20.GIF"],
    down: ["/neko/23.GIF", "/neko/24.GIF"],
    downleft: ["/neko/17.GIF", "/neko/18.GIF"],
    left: ["/neko/17.GIF", "/neko/18.GIF"],
    upleft: ["/neko/17.GIF", "/neko/18.GIF"],
    up: ["/neko/21.GIF", "/neko/22.GIF"],
    upright: ["/neko/19.GIF", "/neko/20.GIF"],
  },
  yawn: {
    right: ["/neko/1.GIF"], // fallback to idle
    downright: ["/neko/1.GIF"],
    down: ["/neko/1.GIF"],
    downleft: ["/neko/1.GIF"],
    left: ["/neko/1.GIF"],
    upleft: ["/neko/1.GIF"],
    up: ["/neko/1.GIF"],
    upright: ["/neko/1.GIF"],
  },
};

function getDirection(dx: number, dy: number): Direction {
  const angle = Math.atan2(dy, dx);
  if (angle > -Math.PI / 8 && angle <= Math.PI / 8) return "right";
  if (angle > Math.PI / 8 && angle <= (3 * Math.PI) / 8) return "downright";
  if (angle > (3 * Math.PI) / 8 && angle <= (5 * Math.PI) / 8) return "down";
  if (angle > (5 * Math.PI) / 8 && angle <= (7 * Math.PI) / 8)
    return "downleft";
  if (angle > (7 * Math.PI) / 8 || angle <= (-7 * Math.PI) / 8) return "left";
  if (angle > (-7 * Math.PI) / 8 && angle <= (-5 * Math.PI) / 8)
    return "upleft";
  if (angle > (-5 * Math.PI) / 8 && angle <= (-3 * Math.PI) / 8) return "up";
  if (angle > (-3 * Math.PI) / 8 && angle <= -Math.PI / 8) return "upright";
  return "right";
}

export const NekoCursor: React.FC<NekoCursorProps> = ({ enabled }) => {
  const getInitialPos = () => ({
    x: typeof window !== "undefined" ? window.innerWidth / 2 : 0,
    y: typeof window !== "undefined" ? window.innerHeight / 2 : 0,
  });
  const [pos, setPos] = useState(() => getInitialPos());
  const [visible, setVisible] = useState(false);
  const [frameIdx, setFrameIdx] = useState(0);
  const [state, setState] = useState<State>("idle");
  const [direction, setDirection] = useState<Direction>("right");
  const frameRef = useRef<number | null>(null);
  const animRef = useRef<number | null>(null);
  const sleepTimer = useRef<NodeJS.Timeout | null>(null);
  const yawnTimer = useRef<NodeJS.Timeout | null>(null);
  const lastMouse = useRef({ x: pos.x, y: pos.y, time: Date.now() });
  const lastAngle = useRef<number>(0);
  const [yawning, setYawning] = useState(false);

  // Physics
  const velocity = useRef({ x: 0, y: 0 });
  const friction = 0.85;
  const acceleration = 0.6;
  const maxSpeed = 3.2;
  const idleDistance = 12;
  const sleepDelay = 5000;
  const yawnDelay = 3500;
  const scratchDistance = 8;
  const frameInterval = 180;
  const directionThreshold = Math.PI / 12; // Only update facing if angle changes enough

  // Mouse tracking
  useEffect(() => {
    if (!enabled) {
      setVisible(false);
      return;
    }
    setVisible(true);
    let mouse = getInitialPos();
    const neko = { ...mouse }; // Use `const` here since it's never reassigned
    let running = true;
    velocity.current = { x: 0, y: 0 };

    const handleMouseMove = (e: MouseEvent) => {
      mouse = { x: e.clientX, y: e.clientY };
      lastMouse.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      if (state === "sleep" || state === "yawn") setState("run");
      setYawning(false);
    };
    window.addEventListener("mousemove", handleMouseMove);

    const animate = () => {
      if (!running) return;
      const winW = window.innerWidth;
      const winH = window.innerHeight;
      let nextState: State = state;
      let nextDir: Direction = direction;
      const dx = mouse.x - neko.x;
      const dy = mouse.y - neko.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      // Edge detection
      let scratching = false;
      if (neko.x < scratchDistance) {
        neko.x = scratchDistance;
        velocity.current.x = -velocity.current.x * 0.5;
        nextState = "scratch";
        nextDir = "left";
        scratching = true;
      } else if (neko.x > winW - scratchDistance) {
        neko.x = winW - scratchDistance;
        velocity.current.x = -velocity.current.x * 0.5;
        nextState = "scratch";
        nextDir = "right";
        scratching = true;
      } else if (neko.y < scratchDistance) {
        neko.y = scratchDistance;
        velocity.current.y = -velocity.current.y * 0.5;
        nextState = "scratch";
        nextDir = "up";
        scratching = true;
      } else if (neko.y > winH - scratchDistance) {
        neko.y = winH - scratchDistance;
        velocity.current.y = -velocity.current.y * 0.5;
        nextState = "scratch";
        nextDir = "down";
        scratching = true;
      }
      // Movement physics
      if (!scratching && dist > idleDistance) {
        nextState = "run";
        // Accelerate
        const angle = Math.atan2(dy, dx);
        velocity.current.x += Math.cos(angle) * acceleration;
        velocity.current.y += Math.sin(angle) * acceleration;
        // Clamp speed
        const speed = Math.sqrt(
          velocity.current.x ** 2 + velocity.current.y ** 2,
        );
        if (speed > maxSpeed) {
          velocity.current.x = (velocity.current.x / speed) * maxSpeed;
          velocity.current.y = (velocity.current.y / speed) * maxSpeed;
        }
        // Direction update only if angle changes enough
        if (Math.abs(angle - lastAngle.current) > directionThreshold) {
          nextDir = getDirection(dx, dy);
          lastAngle.current = angle;
        }
      } else if (!scratching) {
        // Idle
        nextState = "idle";
        velocity.current.x *= friction;
        velocity.current.y *= friction;
      }
      // Move
      neko.x += velocity.current.x;
      neko.y += velocity.current.y;
      setPos({ x: neko.x, y: neko.y });
      setState(nextState);
      setDirection(nextDir);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => {
      running = false;
      window.removeEventListener("mousemove", handleMouseMove);
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
    // eslint-disable-next-line
  }, [enabled]);

  // Yawn and sleep timer
  useEffect(() => {
    if (!visible) return;
    if (sleepTimer.current) clearTimeout(sleepTimer.current);
    if (yawnTimer.current) clearTimeout(yawnTimer.current);
    if (state !== "sleep" && state !== "yawn") {
      yawnTimer.current = setTimeout(() => {
        setYawning(true);
        setState("yawn");
        sleepTimer.current = setTimeout(() => {
          setYawning(false);
          setState("sleep");
        }, sleepDelay - yawnDelay);
      }, yawnDelay);
    }
    return () => {
      if (sleepTimer.current) clearTimeout(sleepTimer.current);
      if (yawnTimer.current) clearTimeout(yawnTimer.current);
    };
  }, [state, visible]);

  // Animation frame cycling
  useEffect(() => {
    if (!visible) return;
    if (animRef.current) clearInterval(animRef.current);
    animRef.current = window.setInterval(() => {
      setFrameIdx((idx) => {
        const dir = DIRECTION_MAP[direction];
        const frames = FRAME_MAP[state][dir];
        return (idx + 1) % frames.length;
      });
    }, frameInterval);
    return () => {
      if (animRef.current) clearInterval(animRef.current);
    };
  }, [state, direction, visible]);

  if (!visible) return null;
  const dir = DIRECTION_MAP[direction];
  const frames = FRAME_MAP[state][dir];
  const frame = frames[frameIdx % frames.length];
  return (
    <Image
      src={frame}
      alt="Neko Cat"
      width={32}
      height={32}
      style={{
        position: "fixed",
        left: pos.x - 16,
        top: pos.y - 16,
        pointerEvents: "none",
        zIndex: 9999,
        transition: "filter 0.2s",
        filter: "drop-shadow(0 2px 4px rgba(0,0,0,0.2))",
      }}
      draggable={false}
    />
  );
};
