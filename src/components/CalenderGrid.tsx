import React, { useMemo, useRef, useState } from "react";
import DayCell from "./DayCell";
import TaskItem from "./TaskItem";
import { monthGrid, fmt, weekHeader } from "../utils/date";
import type { Task } from "../types/taks";

interface Props {
  month: Date;
  tasks: Task[];
  onCreate: (range: { start: string; end: string }) => void;
  onMove: (id: string, newStart: string) => void;
  onResize: (id: string, edge: "left" | "right", delta: number) => void;
  filteredIds?: Set<string>;
  onNavigate?: (dir: -1 | 1) => void; // new for navigation
}

export default function CalendarGrid({
  month,
  tasks,
  onCreate,
  onMove,
  onResize,
  filteredIds,
  onNavigate,
}: Props) {
  const cells = monthGrid(month);
  const gridRef = useRef<HTMLDivElement>(null);
  const [dragSel, setDragSel] = useState<null | {
    startIdx: number;
    endIdx: number;
    rect: { left: number; width: number; top: number; height: number };
  }>(null);

  const cellHeight = 100;

  const dateToClampedIndex = (d: Date | string) => {
    const target = new Date(d);
    const first = cells[0].date;
    const last = cells[cells.length - 1].date;

    if (target <= first) return 0;
    if (target >= last) return cells.length - 1;

    const idx = cells.findIndex((c) => fmt(c.date) === fmt(target));
    return idx === -1 ? 0 : idx;
  };

  // --- Selection handlers
  const onCellDown = (idx: number, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    const grid = gridRef.current!;
    const c = grid.children[idx] as HTMLElement;
    const base = grid.getBoundingClientRect();
    const r = c.getBoundingClientRect();
    setDragSel({
      startIdx: idx,
      endIdx: idx,
      rect: {
        left: r.left - base.left,
        top: r.top - base.top,
        width: r.width,
        height: r.height,
      },
    });
  };
  const onCellEnter = (idx: number) => {
    setDragSel((prev) => {
      if (!prev || !gridRef.current) return prev;
      const start = Math.min(prev.startIdx, idx);
      const end = Math.max(prev.startIdx, idx);
      const grid = gridRef.current;
      const first = grid.children[start] as HTMLElement;
      const last = grid.children[end] as HTMLElement;
      const base = grid.getBoundingClientRect();
      const r1 = first.getBoundingClientRect();
      const r2 = last.getBoundingClientRect();
      return {
        ...prev,
        endIdx: idx,
        rect: {
          left: r1.left - base.left,
          top: r1.top - base.top,
          width: r2.right - r1.left,
          height: r1.height,
        },
      };
    });
  };
  const onCellUp = () => {
    if (!dragSel) return;
    const start = cells[Math.min(dragSel.startIdx, dragSel.endIdx)].date;
    const end = cells[Math.max(dragSel.startIdx, dragSel.endIdx)].date;
    onCreate({ start: fmt(start), end: fmt(end) });
    setDragSel(null);
  };

  // --- Dragging & resizing tasks
  const [dragTask, setDragTask] = useState<null | {
    id: string;
    originIdx: number;
    originX: number;
  }>(null);
  const [resizeTask, setResizeTask] = useState<null | {
    id: string;
    edge: "left" | "right";
    originX: number;
  }>(null);

  const onTaskDown = (t: Task, e: React.MouseEvent) => {
    if ((e.target as HTMLElement).dataset.handle) return;
    e.stopPropagation();
    const originIdx = dateToClampedIndex(t.start);
    setDragTask({ id: t.id, originIdx, originX: e.clientX });
  };
  const onHandleDown = (t: Task, edge: "left" | "right", e: React.MouseEvent) => {
    e.stopPropagation();
    setResizeTask({ id: t.id, edge, originX: e.clientX });
  };

  const cellWidth = () =>
    gridRef.current
      ? gridRef.current.getBoundingClientRect().width / 7
      : 0;

  const onGridUp = (e: React.MouseEvent) => {
    if (dragTask) {
      const w = cellWidth();
      const delta = Math.round((e.clientX - dragTask.originX) / w);
      const newIdx = Math.max(
        0,
        Math.min(cells.length - 1, dragTask.originIdx + delta)
      );
      onMove(dragTask.id, fmt(cells[newIdx].date));
      setDragTask(null);
    }
    if (resizeTask) {
      const w = cellWidth();
      const delta = Math.round((e.clientX - resizeTask.originX) / w);
      onResize(resizeTask.id, resizeTask.edge, delta);
      setResizeTask(null);
    }
  };

  // --- Build items
  const items = useMemo(() => {
    return tasks
      .map((t) => {
        const taskStart = new Date(t.start);
        const taskEnd = new Date(t.end);

        if (taskEnd < cells[0].date || taskStart > cells[cells.length - 1].date)
          return null;

        const sIdx = dateToClampedIndex(taskStart);
        const eIdx = dateToClampedIndex(taskEnd);
        if (sIdx > eIdx) return null;

        const row = Math.floor(sIdx / 7);
        const col = sIdx % 7;
        const span = eIdx - sIdx + 1;

        return { t, row, col, span };
      })
      .filter(Boolean) as Array<{
      t: Task;
      row: number;
      col: number;
      span: number;
    }>;
  }, [month, tasks]);

  // --- Indicators
  const hasPrev = tasks.some(
    (t) => new Date(t.end) < cells[0].date && (!filteredIds || filteredIds.has(t.id))
  );
  const hasNext = tasks.some(
    (t) => new Date(t.start) > cells[cells.length - 1].date && (!filteredIds || filteredIds.has(t.id))
  );

  return (
    <div className="calendar" onMouseUp={onGridUp}>
      {hasPrev && (
        <div
          className="month-indicator prev"
          onClick={() => onNavigate?.(-1)}
        >
          ← More tasks in previous month
        </div>
      )}

      <div className="cal-header">
        {weekHeader.map((h) => (
          <div key={h}>{h}</div>
        ))}
      </div>

      <div
        className="grid"
        ref={gridRef}
        onMouseLeave={() => setDragSel(null)}
      >
        {cells.map((c, i) => (
          <DayCell
            key={i}
            date={c.date}
            inMonth={c.inMonth}
            isToday={c.isToday}
            onMouseDown={(e) => onCellDown(i, e)}
            onMouseEnter={() => onCellEnter(i)}
            onMouseUp={onCellUp}
          />
        ))}

        {dragSel && (
          <div
            className="selecting"
            style={{
              left: dragSel.rect.left,
              width: dragSel.rect.width,
              top: dragSel.rect.top,
              height: dragSel.rect.height,
            }}
          />
        )}

        {items.map(({ t, row, col, span }) => {
          const leftPct = col * (100 / 7);
          const widthPct = span * (100 / 7);
          const topPx = row * cellHeight + 34;
          const dim = filteredIds ? !filteredIds.has(t.id) : false;
          return (
            <TaskItem
              key={t.id}
              task={t}
              leftPct={leftPct}
              widthPct={widthPct}
              topPx={topPx}
              dim={dim}
              onMouseDown={(e) => onTaskDown(t, e)}
              onLeftHandleDown={(e) => onHandleDown(t, "left", e)}
              onRightHandleDown={(e) => onHandleDown(t, "right", e)}
            />
          );
        })}
      </div>

      {hasNext && (
        <div
          className="month-indicator next"
          onClick={() => onNavigate?.(1)}
        >
          More tasks in next month →
        </div>
      )}
    </div>
  );
}
