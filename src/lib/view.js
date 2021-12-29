import React, {
  useState,
  useRef,
  useCallback,
  useMemo,
  useEffect,
  memo,
} from 'react';
import PropTypes from 'prop-types';

const createObserver = (
  element,
  callbackOnIntersect,
  rootMargin,
  rootElement
) => {
  if (!element) {
    return null;
  }

  const { top, bottom } = element.getBoundingClientRect();
  const { innerHeight } = window;

  if (
    (top < 0 && bottom >= 0) ||
    (top <= innerHeight && bottom > innerHeight)
  ) {
    callbackOnIntersect();
    return null;
  }

  const observer = new IntersectionObserver(
    entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting || entry.intersectionRatio > 0) {
          callbackOnIntersect();
        }
      });
    },
    {
      root: rootElement,
      rootMargin,
    }
  );
  observer.observe(element);

  return observer;
};

const propTypes = {
  data: PropTypes.array.isRequired,
  columns: PropTypes.number.isRequired,
  requestMore: PropTypes.func.isRequired,
  children: PropTypes.func.isRequired,
  bucketSizeVh: PropTypes.number,
  bufferSizeVh: PropTypes.number,
  intersectionMargin: PropTypes.string,
  scrollableParent: PropTypes.node,
};

const VirtualDatagridImpure = ({
  data,
  columns,
  requestMore,
  children: render,
  bucketSizeVh = 2, // The bucket will be N times viewport height big
  bufferSizeVh = 4, // The buffer will be N times viewport height big
  intersectionMargin = '40%',
  scrollableParent = null,
}) => {
  // Polyfill for IntersectionObserver
  // const [hasIO, setHasIO] = useState(!!window.IntersectionObserver);
  const [state, setState] = useState({ BUFFER_SIZE: 0 });

  const { BUCKET_SIZE, BUFFER_SIZE, topPosition = -1 } = state;

  const topBufferRef = useRef(null);
  const bottomBufferRef = useRef(null);
  const dataRef = useRef(); // using this to keep track of the old `data` prop
  const columnsRef = useRef(); // using this to keep track of the old `columns` prop

  const initBucketAndBufferSizes = useCallback(
    (newState = {}) => {
      const ROWS_PER_SCREEN = Math.round(
        window.innerHeight /
        (topBufferRef.current.offsetWidth / columns)
      );
      const VIEWPORT_SIZE = ROWS_PER_SCREEN * columns;
      const BUCKET_SIZE = VIEWPORT_SIZE * bucketSizeVh;

      // If the viewport height has been reduced
      // then we can keep the current BUFFER_SIZE.
      // But in case of grid size change (# of columns)
      // we must recalculate it.
      const BUFFER_SIZE =
        columnsRef.current === columns
          ? Math.max(state.BUFFER_SIZE, VIEWPORT_SIZE * bufferSizeVh)
          : VIEWPORT_SIZE * bufferSizeVh;

      setState({
        ...state,
        ...newState,
        BUCKET_SIZE,
        BUFFER_SIZE,
      });
    },
    [columns, state, bucketSizeVh, bufferSizeVh]
  );

  const timerRef = useRef();
  const queue = useMemo(() => [], []);

  const requestMoreOptimized = useCallback(
    (start, limit) => {
      queue.push([start, limit]);

      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => {
        // The idea here is to request only the last N buckets of items.
        // This will result in limited # of requests in case of a rapid scrolling.
        // And to make it even more optimized, the last N requests will be
        // merged into a single one.
        const params = queue
          .slice(-3)
          .reduce(
            (params, pair, i) => [
              Math.min(params[0], pair[0]),
              pair[1] * ++i,
            ],
            [Infinity]
          );
        requestMore(...params);
        queue.length = 0; // clear queue
      }, 10);
    },
    [timerRef, queue, requestMore]
  );

  useEffect(() => {
    if (!BUFFER_SIZE) {
      // Initial render – calculate buffer size
      initBucketAndBufferSizes();
      columnsRef.current = columns;
      return;
    }

    if (topPosition < 0 || (dataRef.current !== data && !data.length)) {
      // Initial render or re-render (because of changed url location)
      // – load initial portion of items.
      // Ensure requesting more items is executed at the next tick
      // by using a timeout: 0
      setTimeout(() => requestMoreOptimized(0, BUFFER_SIZE));
      setState({
        ...state,
        topPosition: 0,
      });
      dataRef.current = data;
      return;
    }

    if (columnsRef.current !== columns) {
      initBucketAndBufferSizes({ topPosition: 0 });
      columnsRef.current = columns;
      return;
    }

    // if (!hasIO) {
    //   import('intersection-observer').then(() => setHasIO(true));
    //   return;
    // }

    const { current: topBuffer } = topBufferRef;
    const { current: bottomBuffer } = bottomBufferRef;

    const topBufferObserver = createObserver(
      topBuffer,
      () => {
        const newTopPosition = topPosition - BUCKET_SIZE;
        if (newTopPosition < 0) {
          return;
        }

        const needMore = data
          .slice(newTopPosition, newTopPosition + BUCKET_SIZE)
          .some(item => !item);

        if (needMore) {
          requestMoreOptimized(newTopPosition, BUCKET_SIZE);
        }

        setState({
          ...state,
          topPosition: newTopPosition,
        });
      },
      intersectionMargin,
      scrollableParent
    );

    const bottomBufferObserver = createObserver(
      bottomBuffer,
      () => {
        if (topPosition + BUFFER_SIZE >= data.length) {
          return;
        }

        const newTopPosition = topPosition + BUCKET_SIZE;

        const needMore = data
          .slice(newTopPosition, newTopPosition + BUFFER_SIZE)
          .some(item => !item);

        if (needMore) {
          requestMoreOptimized(
            topPosition + BUFFER_SIZE,
            BUCKET_SIZE
          );
        }

        setState({
          ...state,
          topPosition: newTopPosition,
        });
      },
      intersectionMargin,
      scrollableParent
    );

    window.addEventListener('resize', initBucketAndBufferSizes);

    dataRef.current = data;

    return () => {
      if (topBufferObserver) {
        topBufferObserver.unobserve(topBuffer);
      }
      if (bottomBufferObserver) {
        bottomBufferObserver.unobserve(bottomBuffer);
      }
      window.removeEventListener('resize', initBucketAndBufferSizes);
    };
  }, [
    BUFFER_SIZE,
    data,
    // hasIO,
    state,
    BUCKET_SIZE,
    initBucketAndBufferSizes,
    intersectionMargin,
    requestMore,
    scrollableParent,
    topPosition,
  ]);

  return (
    <>
      <div
        className="vws-buffer-top"
        ref={topBufferRef}
        style={{
          width: '100%',
          paddingBottom:
            (Math.ceil(topPosition / columns) / columns) * 100 +
            '%',
        }}
      />
      {render(data.slice(topPosition, topPosition + BUFFER_SIZE))}
      <div
        className="vws-buffer-bottom"
        ref={bottomBufferRef}
        style={{
          width: '100%',
          paddingBottom:
            (data.length > BUFFER_SIZE
              ? (Math.ceil(
                Math.max(
                  0,
                  data.length - topPosition - BUFFER_SIZE
                ) / columns
              ) /
                columns) *
              100
              : 0) + '%',
        }}
      />
    </>
  );
};

VirtualDatagridImpure.propTypes = propTypes;

export const VirtualDatagrid = memo(VirtualDatagridImpure);
