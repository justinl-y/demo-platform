import { useLayoutEffect, useRef, useState } from 'react';

import type { RefObject } from 'react';

// Fallbacks used only until the table has painted and real heights can be measured.
const FALLBACK_ROW = 55;
const FALLBACK_PAGER = 32;
// antd pagination has `margin: 16px 0`; getBoundingClientRect misses that, so add it back.
const PAGER_MARGIN = 32;
// A few px kept clear so sub-pixel rounding never pushes the pager under the box's clip edge.
const SAFETY = 4;

const pxHeight = (el: Element | null): number => (el ? el.getBoundingClientRect().height : 0);

// Fits an antd Table to its own flex region rather than to the window: `ref` wraps the table in a
// flex:1 box whose height is whatever the layout leaves for it. We measure that box, subtract the real
// header + pager heights, and size the scroll body to fill exactly the rest — so the pager is always
// pinned just inside the bottom (never clipped, no large gap). `pageSize` is the whole rows that fit in
// that body; pass it to the table (and, for server pagination, to the API) so the remainder paginates.
//
// The ResizeObserver is created once per element; `deps` (data settling) re-run the measurement
// through the stored compute, so it only reads layout on resize or when the data changes — never on
// every render. Returns the scroll-body height and the fitting page size.
export const useFitTable = (
  ref: RefObject<HTMLDivElement | null>,
  deps: unknown[],
) => {
  const [dims, setDims] = useState({ bodyHeight: 400,
    pageSize: 8 });
  const computeRef = useRef<() => void>(() => {});

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const compute = () => {
      const region = el.clientHeight;
      if (region === 0) return;

      const rowHeight = pxHeight(el.querySelector('.ant-table-row')) || FALLBACK_ROW;
      const headerHeight = pxHeight(el.querySelector('.ant-table-thead'));
      const pager = (pxHeight(el.querySelector('.ant-pagination')) || FALLBACK_PAGER) + PAGER_MARGIN;

      const bodyHeight = Math.max(rowHeight, region - headerHeight - pager - SAFETY);
      const pageSize = Math.max(1, Math.floor(bodyHeight / rowHeight));

      // Functional bail-out: identical dims return the same object, so this never re-renders in a loop.
      setDims((prev) => (prev.bodyHeight === bodyHeight && prev.pageSize === pageSize
        ? prev
        : {
            bodyHeight,
            pageSize,
          }));
    };

    computeRef.current = compute;

    const observer = new ResizeObserver(compute);
    observer.observe(el);
    compute();

    return () => observer.disconnect();
  }, [ref]);

  // Re-measure when the data settles (rows appear / heights change) without recreating the observer.
  useLayoutEffect(() => {
    computeRef.current();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

  return dims;
};
