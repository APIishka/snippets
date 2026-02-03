import { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import UnifiedContentCard from './UnifiedContentCard';

const GAP = 8;

/**
 * Masonry for words: same logic as code page.
 * Measures each card at correct column width so heights are accurate (no reflow).
 * Newest first at top of each column.
 */
export default function MasonryWords({ words, onEdit, isAuthenticated }) {
  const [columnCount, setColumnCount] = useState(1);
  const [containerWidth, setContainerWidth] = useState(0);
  const [measuredHeights, setMeasuredHeights] = useState({});
  const [containerHeight, setContainerHeight] = useState(0);
  const containerRef = useRef(null);
  const itemRefs = useRef({});
  const resizeTimeoutRef = useRef(null);
  const rafRef = useRef(null);

  useEffect(() => {
    const updateColumnCount = () => {
      const w = window.innerWidth;
      if (w >= 1024) setColumnCount(3);
      else if (w >= 768) setColumnCount(2);
      else setColumnCount(1);
    };
    updateColumnCount();
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(() => {
        updateColumnCount();
        setMeasuredHeights({});
      }, 150);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
    };
  }, []);

  const estimateHeight = useCallback((item) => {
    const totalChars = (item.content || '').length + (item.translation || '').length + (item.notes || '').length;
    const baseHeight = 40;
    const charsPerLine = 42;
    const lineHeight = 20;
    const numLines = Math.min(12, Math.max(1, Math.ceil(totalChars / charsPerLine)));
    return baseHeight + numLines * lineHeight;
  }, []);

  const distributedItems = useMemo(() => {
    if (columnCount === 1) {
      return words.map((item) => ({ item, column: 0 }));
    }
    const columns = Array.from({ length: columnCount }, () => []);
    const columnHeights = Array(columnCount).fill(0);
    words.forEach((item) => {
      const h = estimateHeight(item);
      let minIndex = 0;
      for (let i = 1; i < columnCount; i++) {
        if (columnHeights[i] < columnHeights[minIndex]) minIndex = i;
      }
      columns[minIndex].push(item);
      columnHeights[minIndex] += h;
    });
    const result = [];
    const maxLength = Math.max(...columns.map((col) => col.length));
    for (let row = 0; row < maxLength; row++) {
      for (let col = 0; col < columnCount; col++) {
        if (columns[col][row]) result.push({ item: columns[col][row], column: col });
      }
    }
    return result;
  }, [words, columnCount, estimateHeight]);

  const columnWidth = containerWidth > 0 && columnCount > 1
    ? (containerWidth - (columnCount - 1) * GAP) / columnCount
    : 0;

  const positions = useMemo(() => {
    if (columnCount === 1 || columnWidth <= 0) return {};
    const colTops = Array(columnCount).fill(0);
    const result = {};
    distributedItems.forEach(({ item, column }) => {
      const h = measuredHeights[item.id] ?? estimateHeight(item);
      result[item.id] = {
        position: 'absolute',
        left: `${column * (columnWidth + GAP)}px`,
        top: `${colTops[column]}px`,
        width: `${columnWidth}px`,
      };
      colTops[column] += h + GAP;
    });
    return result;
  }, [distributedItems, columnCount, columnWidth, measuredHeights, estimateHeight]);

  const computedContainerHeight = useMemo(() => {
    if (columnCount === 1 || columnWidth <= 0) return 0;
    const colTops = Array(columnCount).fill(0);
    distributedItems.forEach(({ item, column }) => {
      const h = measuredHeights[item.id] ?? estimateHeight(item);
      colTops[column] += h + GAP;
    });
    return Math.max(...colTops, 0);
  }, [distributedItems, columnCount, measuredHeights, estimateHeight]);

  useEffect(() => {
    if (columnCount === 1) {
      setContainerWidth(0);
      setContainerHeight(0);
      return;
    }
    const w = containerRef.current?.offsetWidth || 0;
    if (w > 0) setContainerWidth(w);
  }, [columnCount, distributedItems.length]);

  useEffect(() => {
    if (columnCount === 1 || distributedItems.length === 0 || columnWidth <= 0) {
      setContainerHeight(0);
      return;
    }
    const updateHeights = () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const next = {};
        let hasAll = true;
        distributedItems.forEach(({ item }) => {
          const el = itemRefs.current[item.id];
          if (el) {
            const h = el.offsetHeight || el.scrollHeight || 100;
            next[item.id] = h;
          } else {
            hasAll = false;
          }
        });
        if (Object.keys(next).length > 0) {
          setMeasuredHeights(next);
          const colTops = Array(columnCount).fill(0);
          distributedItems.forEach(({ item, column }) => {
            colTops[column] += (next[item.id] ?? estimateHeight(item)) + GAP;
          });
          setContainerHeight(Math.max(...colTops, 0));
        }
      });
    };
    const t = setTimeout(updateHeights, 50);
    const handleResize = () => {
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      resizeTimeoutRef.current = setTimeout(updateHeights, 100);
    };
    window.addEventListener('resize', handleResize);
    return () => {
      clearTimeout(t);
      if (resizeTimeoutRef.current) clearTimeout(resizeTimeoutRef.current);
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', handleResize);
    };
  }, [distributedItems, columnCount, columnWidth]);

  if (columnCount === 1) {
    return (
      <div className="space-y-1">
        {words.map((item) => (
          <UnifiedContentCard
            key={item.id}
            item={item}
            contentType="word"
            languageLabel={null}
            bodyText={[item.content, item.translation].filter(Boolean).join(' — ')}
            onEdit={onEdit}
            isAuthenticated={isAuthenticated}
            compact
          />
        ))}
      </div>
    );
  }

  return (
    <>
      <style>{`
        .masonry-words-container { position: relative; width: 100%; }
        .masonry-words-item { transition: top 0.2s ease, left 0.2s ease; }
      `}</style>
      <div
        ref={containerRef}
        className="masonry-words-container"
        style={
          containerWidth > 0 && columnWidth > 0
            ? { height: computedContainerHeight || containerHeight || 100, minHeight: computedContainerHeight || containerHeight || 100 }
            : { minHeight: 0 }
        }
      >
        {distributedItems.map(({ item }) => (
          <div
            key={item.id}
            ref={(el) => { if (el) itemRefs.current[item.id] = el; }}
            className="masonry-words-item"
            style={positions[item.id] || { position: 'relative', width: '100%' }}
          >
            <UnifiedContentCard
              item={item}
              contentType="word"
              languageLabel={null}
              bodyText={[item.content, item.translation].filter(Boolean).join(' — ')}
              onEdit={onEdit}
              isAuthenticated={isAuthenticated}
              compact
            />
          </div>
        ))}
      </div>
    </>
  );
}
