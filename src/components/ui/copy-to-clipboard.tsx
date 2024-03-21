"use client";

import { Button } from "@nextui-org/button";
import { useClipboard } from "@mantine/hooks";
import IconifyIcon from "./icon";
import { Tooltip } from "@nextui-org/tooltip";
import { useState } from "react";
import { motion } from "framer-motion";

export default function CopyToClipboard({
  text,
  tooltipText,
}: {
  text: string;
  tooltipText: string;
}) {
  const clipboard = useClipboard({ timeout: 500 });
  const [icon, setIcon] = useState("mingcute:copy-line");

  return (
    <Tooltip color="secondary" content={tooltipText}>
      <Button
        className="flex flex-col text-xs"
        color="secondary"
        variant="light"
        isIconOnly
        onMouseEnter={() => {
          setIcon("mingcute:copy-fill");
        }}
        onMouseLeave={() => {
          setIcon("mingcute:copy-line");
        }}
        onClick={() => clipboard.copy(text)}
      >
        {clipboard.copied ? (
          <AnimatedCheckIcon />
        ) : (
          <IconifyIcon icon={icon} height={20} />
        )}
      </Button>
    </Tooltip>
  );
}

function AnimatedCheckIcon() {
  return (
    <motion.svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      strokeWidth={1.5}
      stroke="currentColor"
    >
      <motion.path
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{
          type: "tween",
          duration: 0.3,
          ease: "easeIn",
        }}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m2 14l7 6L22 4"
      />
    </motion.svg>
  );
}
