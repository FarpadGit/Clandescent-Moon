// This is an (almost) direct copy of the zillow/react-slider package from GitHub which apparently has been abandoned and not maintained for a while, yet I couldn't find an
// equally good replacement for it. Made a copy here, added an "unfocus" method and added Typescript types to everything so it is not stuck behind legacy dependencies.

import React, { HTMLAttributes } from "react";
import PropTypes from "prop-types";

/**
 * To prevent text selection while dragging.
 * http://stackoverflow.com/questions/5429827/how-can-i-prevent-text-element-selection-with-cursor-drag
 */
function pauseEvent(e: Event) {
  e?.stopPropagation?.();
  e?.preventDefault?.();
  return false;
}

function stopPropagation(e: Event) {
  e?.stopPropagation?.();
}

function sanitizeInValue(x: ReactSliderPropType["value"]) {
  if (x == null || x == undefined) {
    return [];
  }
  return Array.isArray(x) ? x.slice() : [x];
}

function prepareOutValue(x: ReactSliderStateType["value"]) {
  return x !== null && x.length === 1 ? x[0] : x.slice();
}

function trimSucceeding(
  length: number,
  nextValue: number[],
  minDistance: number,
  max: number,
) {
  for (let i = 0; i < length; i += 1) {
    const padding = max - i * minDistance;
    if (nextValue[length - 1 - i] > padding) {
      // eslint-disable-next-line no-param-reassign
      nextValue[length - 1 - i] = padding;
    }
  }
}

function trimPreceding(
  length: number,
  nextValue: number[],
  minDistance: number,
  min: number,
) {
  for (let i = 0; i < length; i += 1) {
    const padding = min + i * minDistance;
    if (nextValue[i] < padding) {
      // eslint-disable-next-line no-param-reassign
      nextValue[i] = padding;
    }
  }
}

function addHandlers(eventMap: { [key: string]: EventListener }) {
  Object.keys(eventMap).forEach((key) => {
    if (typeof document !== "undefined") {
      document.addEventListener(key, eventMap[key], false);
    }
  });
}

function removeHandlers(eventMap: { [key: string]: EventListener }) {
  Object.keys(eventMap).forEach((key) => {
    if (typeof document !== "undefined") {
      document.removeEventListener(key, eventMap[key], false);
    }
  });
}

function trimAlignValue(val: number, props: ReactSliderPropType) {
  return alignValue(trimValue(val, props), props);
}

function alignValue(val: number, props: ReactSliderPropType) {
  const valModStep = (val - props.min) % props.step;
  let alignedValue = val - valModStep;

  if (Math.abs(valModStep) * 2 >= props.step) {
    alignedValue += valModStep > 0 ? props.step : -props.step;
  }

  return parseFloat(alignedValue.toFixed(5));
}

function trimValue(val: number, props: ReactSliderPropType) {
  let trimmed = val;
  if (trimmed <= props.min) {
    trimmed = props.min;
  }
  if (trimmed >= props.max) {
    trimmed = props.max;
  }

  return trimmed;
}

type ReactSliderPropType = {
  min: number;
  max: number;
  step: number;
  pageFn: (...args: any[]) => any;
  minDistance: number;
  defaultValue: number | number[];
  value?: number | number[];
  orientation: "horizontal" | "vertical";
  className: string;
  thumbClassName: string;
  thumbActiveClassName: string;
  withTracks: boolean;
  trackClassName: string;
  pearling: boolean;
  disabled: boolean;
  snapDragDisabled: boolean;
  invert: boolean;
  marks: number[] | boolean | number;
  markClassName: string;
  onBeforeChange?: (value: number | number[], thumbIndex: number) => any;
  onChange?: (newValue: number | number[], thumbIndex: number) => any;
  onAfterChange?: (newValue: number | number[], thumbIndex: number) => any;
  onSliderClick?: (value: number) => any;
  ariaLabel?: string | string[];
  ariaLabelledby?: string | string[];
  ariaValuetext?: string | ((...args: any[]) => any);
  renderTrack: (...args: any[]) => any;
  renderThumb: (...args: any[]) => any;
  renderMark: (...args: any[]) => any;
};

type ReactSliderStateType = {
  index: number;
  upperBound: number;
  sliderLength: number;
  value: number[];
  zIndices: number[];
  thumbSize?: number;
  pending: boolean;
  startValue?: number;
  startPosition?: number;
};

class ReactSlider extends React.Component<
  ReactSliderPropType,
  ReactSliderStateType
> {
  static displayName = "ReactSlider";

  static propTypes = {
    /**
     * The minimum value of the slider.
     */
    min: PropTypes.number,

    /**
     * The maximum value of the slider.
     */
    max: PropTypes.number,

    /**
     * Value to be added or subtracted on each step the slider makes.
     * Must be greater than zero.
     * `max - min` should be evenly divisible by the step value.
     */
    step: PropTypes.number,

    /**
     * The result of the function is the value to be added or subtracted
     * when the `Page Up` or `Page Down` keys are pressed.
     *
     * The current `step` value will be passed as the only argument.
     * By default, paging will modify `step` by a factor of 10.
     */
    pageFn: PropTypes.func,

    /**
     * The minimal distance between any pair of thumbs.
     * Must be positive, but zero means they can sit on top of each other.
     */
    minDistance: PropTypes.number,

    /**
     * Determines the initial positions of the thumbs and the number of thumbs.
     *
     * If a number is passed a slider with one thumb will be rendered.
     * If an array is passed each value will determine the position of one thumb.
     * The values in the array must be sorted.
     */
    defaultValue: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),

    /**
     * Like `defaultValue` but for
     * [controlled components](http://facebook.github.io/react/docs/forms.html#controlled-components).
     */
    // eslint-disable-next-line zillow/react/require-default-props
    value: PropTypes.oneOfType([
      PropTypes.number,
      PropTypes.arrayOf(PropTypes.number),
    ]),

    /**
     * Determines whether the slider moves horizontally (from left to right)
     * or vertically (from top to bottom).
     */
    orientation: PropTypes.oneOf(["horizontal", "vertical"]),

    /**
     * The css class set on the slider node.
     */
    className: PropTypes.string,

    /**
     * The css class set on each thumb node.
     *
     * In addition each thumb will receive a numbered css class of the form
     * `${thumbClassName}-${i}`, e.g. `thumb-0`, `thumb-1`, ...
     */
    thumbClassName: PropTypes.string,

    /**
     * The css class set on the thumb that is currently being moved.
     */
    thumbActiveClassName: PropTypes.string,

    /**
     * If `true` tracks between the thumbs will be rendered.
     */
    withTracks: PropTypes.bool,

    /**
     * The css class set on the tracks between the thumbs.
     * In addition track fragment will receive a numbered css class of the form
     * `${trackClassName}-${i}`, e.g. `track-0`, `track-1`, ...
     */
    trackClassName: PropTypes.string,

    /**
     * If `true` the active thumb will push other thumbs
     * within the constraints of `min`, `max`, `step` and `minDistance`.
     */
    pearling: PropTypes.bool,

    /**
     * If `true` the thumbs can't be moved.
     */
    disabled: PropTypes.bool,

    /**
     * Disables thumb move when clicking the slider track
     */
    snapDragDisabled: PropTypes.bool,

    /**
     * Inverts the slider.
     */
    invert: PropTypes.bool,

    /**
     * Shows passed marks on the track, if true it shows all the marks,
     * if an array of numbers it shows just the passed marks, if a number is passed
     * it shows just the marks in that steps: like passing 3 shows the marks 3, 6, 9
     */
    marks: PropTypes.oneOfType([
      PropTypes.arrayOf(PropTypes.number),
      PropTypes.bool,
      PropTypes.number,
    ]),

    /**
     * The css class set on the marks.
     */
    markClassName: PropTypes.string,

    /**
     * Callback called before starting to move a thumb. The callback will only be called if the
     * action will result in a change. The function will be called with two arguments, the first
     * being the initial value(s) the second being thumb index.
     */
    // eslint-disable-next-line max-len
    // eslint-disable-next-line zillow/react/require-default-props, zillow/react/no-unused-prop-types
    onBeforeChange: PropTypes.func,

    /**
     * Callback called on every value change.
     * The function will be called with two arguments, the first being the new value(s)
     * the second being thumb index.
     */
    // eslint-disable-next-line max-len
    // eslint-disable-next-line zillow/react/require-default-props, zillow/react/no-unused-prop-types
    onChange: PropTypes.func,

    /**
     * Callback called only after moving a thumb has ended. The callback will only be called if
     * the action resulted in a change. The function will be called with two arguments, the
     * first being the result value(s) the second being thumb index.
     */
    // eslint-disable-next-line max-len
    // eslint-disable-next-line zillow/react/require-default-props, zillow/react/no-unused-prop-types
    onAfterChange: PropTypes.func,

    /**
     * Callback called when the the slider is clicked (thumb or tracks).
     * Receives the value at the clicked position as argument.
     */
    // eslint-disable-next-line zillow/react/require-default-props
    onSliderClick: PropTypes.func,

    /**
     * aria-label for screen-readers to apply to the thumbs.
     * Use an array for more than one thumb.
     * The length of the array must match the number of thumbs in the value array.
     */
    // eslint-disable-next-line zillow/react/require-default-props
    ariaLabel: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),

    /**
     * aria-labelledby for screen-readers to apply to the thumbs.
     * Used when slider rendered with separate label.
     * Use an array for more than one thumb.
     * The length of the array must match the number of thumbs in the value array.
     */
    // eslint-disable-next-line zillow/react/require-default-props
    ariaLabelledby: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string),
    ]),

    /**
     * aria-valuetext for screen-readers.
     * Can be a static string, or a function that returns a string.
     * The function will be passed a single argument,
     * an object with the following properties:
     *
     *     state => `Value: ${state.value}`
     *
     * - `state.index` {`number`} the index of the thumb
     * - `state.value` {`number` | `array`} the current value state
     * - `state.valueNow` {`number`} the value of the thumb (i.e. aria-valuenow)
     */
    // eslint-disable-next-line zillow/react/require-default-props
    ariaValuetext: PropTypes.oneOfType([PropTypes.string, PropTypes.func]),

    /**
     * Provide a custom render function for the track node.
     * The render function will be passed two arguments,
     * an object with props that should be added to your handle node,
     * and an object with track and slider state:
     *
     *     (props, state) => <div {...props} />
     *
     * - `props` {`object`} props to be spread into your track node
     * - `state.index` {`number`} the index of the track
     * - `state.value` {`number` | `array`} the current value state
     */
    renderTrack: PropTypes.func,

    /**
     * Provide a custom render function for dynamic thumb content.
     * The render function will be passed two arguments,
     * an object with props that should be added to your thumb node,
     * and an object with thumb and slider state:
     *
     *     (props, state) => <div {...props} />
     *
     * - `props` {`object`} props to be spread into your thumb node
     * - `state.index` {`number`} the index of the thumb
     * - `state.value` {`number` | `array`} the current value state
     * - `state.valueNow` {`number`} the value of the thumb (i.e. aria-valuenow)
     */
    // eslint-disable-next-line zillow/react/require-default-props
    renderThumb: PropTypes.func,

    /**
     * Provide a custom render function for the mark node.
     * The render function will be passed one argument,
     * an object with props that should be added to your handle node
     *
     *     (props) => <span {...props} />
     *
     * - `props` {`object`} props to be spread into your track node
     */
    renderMark: PropTypes.func,
  };

  static defaultProps: ReactSliderPropType = {
    min: 0,
    max: 100,
    step: 1,
    pageFn: (step: number) => step * 10,
    minDistance: 0,
    defaultValue: 0,
    orientation: "horizontal",
    className: "slider",
    thumbClassName: "thumb",
    thumbActiveClassName: "active",
    trackClassName: "track",
    markClassName: "mark",
    withTracks: true,
    pearling: false,
    disabled: false,
    snapDragDisabled: false,
    invert: false,
    marks: [],
    renderThumb: (props: HTMLAttributes<HTMLElement> & { key: string }) => {
      const { key, ...rest } = props;
      return <div {...rest} key={key} />;
    },
    renderTrack: (props: HTMLAttributes<HTMLElement> & { key: string }) => {
      const { key, ...rest } = props;
      return <div {...rest} key={key} />;
    },
    renderMark: (props: HTMLAttributes<HTMLElement> & { key: string }) => {
      const { key, ...rest } = props;
      return <span {...rest} key={key} />;
    },
  };

  pendingResizeTimeouts: number[];
  resizeObserver: ResizeObserver | null;
  resizeElementRef: React.RefObject<HTMLElement | null>;
  hasMoved?: boolean;
  isScrolling?: boolean;
  startPosition?: number[];
  slider?: HTMLElement;
  thumbs?: HTMLElement[];
  onChange?: ReactSliderPropType["onChange"];
  onBeforeChange?: ReactSliderPropType["onBeforeChange"];
  onAfterChange?: ReactSliderPropType["onAfterChange"];

  constructor(props: ReactSliderPropType) {
    super(props);

    let value = sanitizeInValue(props.value);
    if (!value.length) {
      value = sanitizeInValue(props.defaultValue);
    }

    // array for storing resize timeouts ids
    this.pendingResizeTimeouts = [];

    const zIndices = [];
    for (let i = 0; i < value.length; i += 1) {
      value[i] = trimAlignValue(value[i], props);
      zIndices.push(i);
    }

    this.resizeObserver = null;
    this.resizeElementRef = React.createRef();

    this.state = {
      index: -1,
      upperBound: 0,
      sliderLength: 0,
      value,
      zIndices,
      pending: false,
    };
  }

  componentDidMount() {
    if (typeof window !== "undefined" && this.resizeElementRef.current) {
      this.resizeObserver = new ResizeObserver(this.handleResize);
      this.resizeObserver.observe(this.resizeElementRef.current);
      this.resize();
    }
  }

  // Keep the internal `value` consistent with an outside `value` if present.
  // This basically allows the slider to be a controlled component.
  static getDerivedStateFromProps(
    props: ReactSliderPropType,
    state: ReactSliderStateType,
  ) {
    const value = sanitizeInValue(props.value);
    if (!value.length) {
      return null;
    }

    // Do not allow controlled upates to happen while we have pending updates
    if (state.pending) {
      return null;
    }

    return {
      value: value.map((item) => trimAlignValue(item, props)),
    };
  }

  componentDidUpdate() {
    // If an upperBound has not yet been determined (due to the component being hidden
    // during the mount event, or during the last resize), then calculate it now
    if (this.state.upperBound === 0) {
      this.resize();
    }
  }

  componentWillUnmount() {
    this.clearPendingResizeTimeouts();
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  onKeyUp = () => {
    this.onEnd();
  };

  onMouseUp = () => {
    this.onEnd(this.getMouseEventMap());
  };

  onTouchEnd = (e: TouchEvent) => {
    e.preventDefault();
    this.onEnd(this.getTouchEventMap());
  };

  onBlur = () => {
    this.setState({ index: -1 }, () => this.onEnd(this.getKeyDownEventMap()));
  };

  onEnd(eventMap?: { [key: string]: EventListener }) {
    if (eventMap) {
      removeHandlers(eventMap);
    }
    if (this.hasMoved) {
      this.fireChangeEvent("onAfterChange");
    }

    // Allow controlled updates to continue
    this.setState({ pending: false });

    this.hasMoved = false;
  }

  onMouseMove = (e: MouseEvent) => {
    // Prevent controlled updates from happening while mouse is moving
    this.setState({ pending: true });

    const position = this.getMousePosition(e);
    const diffPosition = this.getDiffPosition(position[0]);
    const newValue = this.getValueFromPosition(diffPosition);
    this.move(newValue);
  };

  onTouchMove = (e: TouchEvent) => {
    if (e.touches.length > 1) {
      return;
    }

    // Prevent controlled updates from happending while touch is moving
    this.setState({ pending: true });

    const position = this.getTouchPosition(e);

    if (typeof this.isScrolling === "undefined" && this.startPosition) {
      const diffMainDir = position[0] - this.startPosition[0];
      const diffScrollDir = position[1] - this.startPosition[1];
      this.isScrolling = Math.abs(diffScrollDir) > Math.abs(diffMainDir);
    }

    if (this.isScrolling) {
      this.setState({ index: -1 });
      return;
    }

    const diffPosition = this.getDiffPosition(position[0]);
    const newValue = this.getValueFromPosition(diffPosition);

    this.move(newValue);
  };

  onKeyDown = (e: KeyboardEvent) => {
    if (e.ctrlKey || e.shiftKey || e.altKey || e.metaKey) {
      return;
    }

    // Prevent controlled updates from happening while a key is pressed
    this.setState({ pending: true });

    switch (e.key) {
      case "ArrowLeft":
      case "ArrowDown":
      case "Left":
      case "Down":
        e.preventDefault();
        this.moveDownByStep();
        break;
      case "ArrowRight":
      case "ArrowUp":
      case "Right":
      case "Up":
        e.preventDefault();
        this.moveUpByStep();
        break;
      case "Home":
        e.preventDefault();
        this.move(this.props.min);
        break;
      case "End":
        e.preventDefault();
        this.move(this.props.max);
        break;
      case "PageDown":
        e.preventDefault();
        this.moveDownByStep(this.props.pageFn(this.props.step));
        break;
      case "PageUp":
        e.preventDefault();
        this.moveUpByStep(this.props.pageFn(this.props.step));
        break;
      default:
    }
  };

  onSliderMouseDown = (e: MouseEvent) => {
    // do nothing if disabled or right click
    if (this.props.disabled || e.button === 2) {
      return;
    }

    // Prevent controlled updates from happening while mouse is moving
    this.setState({ pending: true });

    if (!this.props.snapDragDisabled) {
      const position = this.getMousePosition(e);
      this.forceValueFromPosition(position[0], (i: number) => {
        this.start(i, position[0]);
        addHandlers(this.getMouseEventMap());
      });
    }

    pauseEvent(e);
  };

  onSliderClick = (e: MouseEvent) => {
    if (this.props.disabled) {
      return;
    }

    if (this.props.onSliderClick && !this.hasMoved) {
      const position = this.getMousePosition(e);
      const valueAtPos = trimAlignValue(
        this.calcValue(this.calcOffsetFromPosition(position[0])),
        this.props,
      );
      this.props.onSliderClick(valueAtPos);
    }
  };

  getValue() {
    return prepareOutValue(this.state.value);
  }

  getClosestIndex(pixelOffset: number) {
    let minDist = Number.MAX_VALUE;
    let closestIndex = -1;

    const { value } = this.state;
    const l = value.length;

    for (let i = 0; i < l; i += 1) {
      const offset = this.calcOffset(value[i]);
      const dist = Math.abs(pixelOffset - offset);
      if (dist < minDist) {
        minDist = dist;
        closestIndex = i;
      }
    }

    return closestIndex;
  }

  getMousePosition(e: MouseEvent) {
    return [e[`page${this.axisKey()}`], e[`page${this.orthogonalAxisKey()}`]];
  }

  getTouchPosition(e: TouchEvent) {
    const touch = e.touches[0];
    return [
      touch[`page${this.axisKey()}`],
      touch[`page${this.orthogonalAxisKey()}`],
    ];
  }

  getKeyDownEventMap() {
    return {
      keydown: this.onKeyDown as (e: Event) => void,
      keyup: this.onKeyUp,
      focusout: this.onBlur,
    };
  }

  getMouseEventMap() {
    return {
      mousemove: this.onMouseMove as (e: Event) => void,
      mouseup: this.onMouseUp as (e: Event) => void,
    };
  }

  getTouchEventMap() {
    return {
      touchmove: this.onTouchMove as (e: Event) => void,
      touchend: this.onTouchEnd as (e: Event) => void,
    };
  }

  getValueFromPosition(position: number) {
    const diffValue =
      (position / (this.state.sliderLength - (this.state.thumbSize ?? 0))) *
      (this.props.max - this.props.min);
    return trimAlignValue((this.state.startValue ?? 0) + diffValue, this.props);
  }

  getDiffPosition(position: number) {
    let diffPosition = position - (this.state.startPosition ?? 0);
    if (this.props.invert) {
      diffPosition *= -1;
    }
    return diffPosition;
  }

  // create the `keydown` handler for the i-th thumb
  createOnKeyDown = (i: number) => (e: Event) => {
    if (this.props.disabled) {
      return;
    }
    this.start(i);
    addHandlers(this.getKeyDownEventMap());
    pauseEvent(e);
  };

  // create the `mousedown` handler for the i-th thumb
  createOnMouseDown = (i: number) => (e: MouseEvent) => {
    // do nothing if disabled or right click
    if (this.props.disabled || e.button === 2) {
      return;
    }

    // Prevent controlled updates from happending while mouse is moving
    this.setState({ pending: true });

    const position = this.getMousePosition(e);
    this.start(i, position[0]);
    addHandlers(this.getMouseEventMap());
    pauseEvent(e);
  };

  // create the `touchstart` handler for the i-th thumb
  createOnTouchStart = (i: number) => (e: TouchEvent) => {
    if (this.props.disabled || e.touches.length > 1) {
      return;
    }

    // Prevent controlled updates from happending while touch is moving
    this.setState({ pending: true });

    const position = this.getTouchPosition(e);
    this.startPosition = position;
    // don't know yet if the user is trying to scroll
    this.isScrolling = undefined;
    this.start(i, position[0]);
    addHandlers(this.getTouchEventMap());
    stopPropagation(e);
  };

  handleResize = () => {
    // setTimeout of 0 gives element enough time to have assumed its new size if
    // it is being resized
    const resizeTimeout = window.setTimeout(() => {
      // drop this timeout from pendingResizeTimeouts to reduce memory usage
      this.pendingResizeTimeouts.shift();
      this.resize();
    }, 0);

    this.pendingResizeTimeouts.push(resizeTimeout);
  };

  resize() {
    const { slider, thumbs } = this;
    const thumb = thumbs?.[0];
    if (!slider || !thumb) {
      return;
    }

    const sizeKey = this.sizeKey();

    // For the slider size, we want to use the client width/height, excluding any borders
    const sliderRect = slider.getBoundingClientRect();
    const sliderSize = slider[sizeKey];
    const sliderMax = sliderRect[this.posMaxKey()];
    const sliderMin = sliderRect[this.posMinKey()];

    // For the thumb size, we want to use the outer width/height, including any borders
    const thumbRect = thumb.getBoundingClientRect();
    const thumbSize =
      thumbRect[
        sizeKey.replace("client", "").toLowerCase() as "width" | "height"
      ];

    const upperBound = sliderSize - thumbSize;
    const sliderLength = Math.abs(sliderMax - sliderMin);

    if (
      this.state.upperBound !== upperBound ||
      this.state.sliderLength !== sliderLength ||
      this.state.thumbSize !== thumbSize
    ) {
      this.setState({
        upperBound,
        sliderLength,
        thumbSize,
      });
    }
  }

  // calculates the offset of a thumb in pixels based on its value.
  calcOffset(value: number) {
    const range = this.props.max - this.props.min;
    if (range === 0) {
      return 0;
    }
    const ratio = (value - this.props.min) / range;
    return ratio * this.state.upperBound;
  }

  // calculates the value corresponding to a given pixel offset, i.e. the inverse of `calcOffset`.
  calcValue(offset: number) {
    const ratio = offset / this.state.upperBound;
    return ratio * (this.props.max - this.props.min) + this.props.min;
  }

  calcOffsetFromPosition(position: number) {
    const { slider } = this;
    if (!slider) return 0;

    const sliderRect = slider.getBoundingClientRect();
    const sliderMax = sliderRect[this.posMaxKey()];
    const sliderMin = sliderRect[this.posMinKey()];

    // The `position` value passed in is the mouse position based on the window height.
    // The slider bounding rect is based on the viewport, so we must add the window scroll
    // offset to normalize the values.
    const windowOffset = window[`page${this.axisKey()}Offset`];
    const sliderStart =
      windowOffset + (this.props.invert ? sliderMax : sliderMin);

    let pixelOffset = position - sliderStart;
    if (this.props.invert) {
      pixelOffset = this.state.sliderLength - pixelOffset;
    }
    pixelOffset -= (this.state.thumbSize ?? 0) / 2;
    return pixelOffset;
  }

  // Snaps the nearest thumb to the value corresponding to `position`
  // and calls `callback` with that thumb's index.
  forceValueFromPosition(position: number, callback: (...args: any[]) => any) {
    const pixelOffset = this.calcOffsetFromPosition(position);
    const closestIndex = this.getClosestIndex(pixelOffset);
    const nextValue = trimAlignValue(this.calcValue(pixelOffset), this.props);

    // Clone this.state.value since we'll modify it temporarily
    // eslint-disable-next-line zillow/react/no-access-state-in-setstate
    const value = this.state.value.slice();
    value[closestIndex] = nextValue;

    // Prevents the slider from shrinking below `props.minDistance`
    for (let i = 0; i < value.length - 1; i += 1) {
      if (value[i + 1] - value[i] < this.props.minDistance) {
        return;
      }
    }

    this.fireChangeEvent("onBeforeChange");
    this.hasMoved = true;
    this.setState({ value }, () => {
      callback(closestIndex);
      this.fireChangeEvent("onChange");
    });
  }

  // clear all pending timeouts to avoid error messages after unmounting
  clearPendingResizeTimeouts() {
    do {
      const nextTimeout = this.pendingResizeTimeouts.shift();

      clearTimeout(nextTimeout);
    } while (this.pendingResizeTimeouts.length);
  }

  start(i: number, position?: number) {
    const thumbRef = this.thumbs?.[i];
    if (thumbRef) {
      thumbRef.focus();
    }

    const { zIndices } = this.state;
    // remove wherever the element is
    zIndices.splice(zIndices.indexOf(i), 1);
    // add to end
    zIndices.push(i);

    this.setState((prevState) => ({
      startValue: prevState.value[i],
      startPosition:
        position !== undefined ? position : prevState.startPosition,
      index: i,
      zIndices,
    }));
  }

  moveUpByStep(step = this.props.step) {
    const oldValue = this.state.value[this.state.index];

    // if the slider is inverted and horizontal we want to honor the inverted value
    const newValue =
      this.props.invert && this.props.orientation === "horizontal"
        ? oldValue - step
        : oldValue + step;

    const trimAlign = trimAlignValue(newValue, this.props);
    this.move(Math.min(trimAlign, this.props.max));
  }

  moveDownByStep(step = this.props.step) {
    const oldValue = this.state.value[this.state.index];

    // if the slider is inverted and horizontal we want to honor the inverted value
    const newValue =
      this.props.invert && this.props.orientation === "horizontal"
        ? oldValue + step
        : oldValue - step;

    const trimAlign = trimAlignValue(newValue, this.props);
    this.move(Math.max(trimAlign, this.props.min));
  }

  move(newValue: number) {
    // Clone this.state.value since we'll modify it temporarily
    // eslint-disable-next-line zillow/react/no-access-state-in-setstate
    const value = this.state.value.slice();
    const { index } = this.state;
    const { length } = value;

    // Short circuit if the value is not changing
    const oldValue = value[index];
    if (newValue === oldValue) {
      return;
    }

    // Trigger only before the first movement
    if (!this.hasMoved) {
      this.fireChangeEvent("onBeforeChange");
    }
    this.hasMoved = true;

    // if "pearling" (= thumbs pushing each other) is disabled,
    // prevent the thumb from getting closer than `minDistance` to the previous or next thumb.
    const { pearling, max, min, minDistance } = this.props;
    if (!pearling) {
      if (index > 0) {
        const valueBefore = value[index - 1];
        if (newValue < valueBefore + minDistance) {
          // eslint-disable-next-line no-param-reassign
          newValue = valueBefore + minDistance;
        }
      }

      if (index < length - 1) {
        const valueAfter = value[index + 1];
        if (newValue > valueAfter - minDistance) {
          // eslint-disable-next-line no-param-reassign
          newValue = valueAfter - minDistance;
        }
      }
    }

    value[index] = newValue;

    // if "pearling" is enabled, let the current thumb push the pre- and succeeding thumbs.
    if (pearling && length > 1) {
      if (newValue > oldValue) {
        this.pushSucceeding(value, minDistance, index);
        trimSucceeding(length, value, minDistance, max);
      } else if (newValue < oldValue) {
        this.pushPreceding(value, minDistance, index);
        trimPreceding(length, value, minDistance, min);
      }
    }

    // Normally you would use `shouldComponentUpdate`,
    // but since the slider is a low-level component,
    // the extra complexity might be worth the extra performance.
    this.setState({ value }, this.fireChangeEvent.bind(this, "onChange"));
  }

  pushSucceeding(value: number[], minDistance: number, index: number) {
    let i;
    let padding;
    for (
      i = index, padding = value[i] + minDistance;
      value[i + 1] !== null && padding > value[i + 1];
      i += 1, padding = value[i] + minDistance
    ) {
      // eslint-disable-next-line no-param-reassign
      value[i + 1] = alignValue(padding, this.props);
    }
  }

  pushPreceding(value: number[], minDistance: number, index: number) {
    for (
      let i = index, padding = value[i] - minDistance;
      value[i - 1] !== null && padding < value[i - 1];
      i -= 1, padding = value[i] - minDistance
    ) {
      // eslint-disable-next-line no-param-reassign
      value[i - 1] = alignValue(padding, this.props);
    }
  }

  axisKey() {
    if (this.props.orientation === "vertical") {
      return "Y";
    }
    // Defaults to 'horizontal';
    return "X";
  }

  orthogonalAxisKey() {
    if (this.props.orientation === "vertical") {
      return "X";
    }
    // Defaults to 'horizontal'
    return "Y";
  }

  posMinKey() {
    if (this.props.orientation === "vertical") {
      return this.props.invert ? "bottom" : "top";
    }
    // Defaults to 'horizontal'
    return this.props.invert ? "right" : "left";
  }

  posMaxKey() {
    if (this.props.orientation === "vertical") {
      return this.props.invert ? "top" : "bottom";
    }
    // Defaults to 'horizontal'
    return this.props.invert ? "left" : "right";
  }

  sizeKey() {
    if (this.props.orientation === "vertical") {
      return "clientHeight";
    }
    // Defaults to 'horizontal'
    return "clientWidth";
  }

  fireChangeEvent(event: "onChange" | "onBeforeChange" | "onAfterChange") {
    if (this.props[event]) {
      this.props[event](prepareOutValue(this.state.value), this.state.index);
    }
  }

  buildThumbStyle(offset: number, i: number) {
    let style: Partial<CSSStyleProperties> = {
      position: "absolute",
      touchAction: "none",
      zIndex: (this.state.zIndices.indexOf(i) + 1).toString(),
    };
    if (this.state.index >= 0)
      style = { ...style, willChange: this.posMinKey() };
    style[this.posMinKey()] = `${offset}px`;
    return style;
  }

  buildTrackStyle(min: number, max: number) {
    let obj = {
      position: "absolute",
      willChange:
        this.state.index >= 0
          ? `${this.posMinKey()},${this.posMaxKey()}`
          : undefined,
    };
    obj = { ...obj, [this.posMinKey()]: min, [this.posMaxKey()]: max };
    return obj;
  }

  buildMarkStyle(offset: number) {
    return {
      position: "absolute",
      [this.posMinKey()]: offset,
    };
  }

  renderThumb = (style: Partial<CSSStyleProperties>, i: number) => {
    const className = `${this.props.thumbClassName} ${this.props.thumbClassName}-${i} ${
      this.state.index === i ? this.props.thumbActiveClassName : ""
    }`;

    const props = {
      ref: (r: HTMLElement) => {
        if (this.thumbs) this.thumbs[i] = r;
        else this.thumbs = [r];
      },
      key: `${this.props.thumbClassName}-${i}`,
      className,
      style,
      onMouseDown: this.createOnMouseDown(i),
      onTouchStart: this.createOnTouchStart(i),
      onFocus: this.createOnKeyDown(i),
      tabIndex: 0,
      role: "slider",
      "aria-orientation": this.props.orientation,
      "aria-valuenow": this.state.value[i],
      "aria-valuemin": this.props.min,
      "aria-valuemax": this.props.max,
      "aria-valuetext": "",
      "aria-label": Array.isArray(this.props.ariaLabel)
        ? this.props.ariaLabel[i]
        : this.props.ariaLabel,
      "aria-labelledby": Array.isArray(this.props.ariaLabelledby)
        ? this.props.ariaLabelledby[i]
        : this.props.ariaLabelledby,
      "aria-disabled": this.props.disabled,
    };

    const state = {
      index: i,
      value: prepareOutValue(this.state.value),
      valueNow: this.state.value[i],
    };

    if (this.props.ariaValuetext) {
      props["aria-valuetext"] =
        typeof this.props.ariaValuetext === "string"
          ? this.props.ariaValuetext
          : this.props.ariaValuetext(state);
    }

    return this.props.renderThumb(props, state);
  };

  renderThumbs(offset: number[]) {
    const { length } = offset;

    const styles = [];
    for (let i = 0; i < length; i += 1) {
      styles[i] = this.buildThumbStyle(offset[i], i);
    }

    const res = [];
    for (let i = 0; i < length; i += 1) {
      res[i] = this.renderThumb(styles[i], i);
    }
    return res;
  }

  renderTrack = (i: number, offsetFrom: number, offsetTo: number) => {
    const props = {
      key: `${this.props.trackClassName}-${i}`,
      className: `${this.props.trackClassName} ${this.props.trackClassName}-${i}`,
      style: this.buildTrackStyle(offsetFrom, this.state.upperBound - offsetTo),
    };
    const state = {
      index: i,
      value: prepareOutValue(this.state.value),
    };
    return this.props.renderTrack(props, state);
  };

  renderTracks(offset: number[]) {
    const tracks = [];
    const lastIndex = offset.length - 1;

    tracks.push(this.renderTrack(0, 0, offset[0]));

    for (let i = 0; i < lastIndex; i += 1) {
      tracks.push(this.renderTrack(i + 1, offset[i], offset[i + 1]));
    }

    tracks.push(
      this.renderTrack(lastIndex + 1, offset[lastIndex], this.state.upperBound),
    );

    return tracks;
  }

  renderMarks() {
    let { marks } = this.props;

    const range = this.props.max - this.props.min + 1;

    if (typeof marks === "boolean") {
      marks = Array.from({ length: range }).map((_, key) => key);
    } else if (typeof marks === "number") {
      marks = Array.from({ length: range })
        .map((_, key) => key)
        .filter((key) => key % (marks as number) === 0);
    }

    return marks
      .map(parseFloat as (m: string | number) => number)
      .sort((a, b) => a - b)
      .map((mark) => {
        const offset = this.calcOffset(mark);

        const props = {
          key: mark,
          className: this.props.markClassName,
          style: this.buildMarkStyle(offset),
        };

        return this.props.renderMark(props);
      });
  }

  render() {
    const offset = [];
    const { value } = this.state;
    const l = value.length;
    for (let i = 0; i < l; i += 1) {
      offset[i] = this.calcOffset(value[i]);
    }

    const tracks = this.props.withTracks ? this.renderTracks(offset) : null;
    const thumbs = this.renderThumbs(offset);
    const marks = this.props.marks ? this.renderMarks() : null;

    return React.createElement(
      "div",
      {
        ref: (r: HTMLElement) => {
          this.slider = r;
          this.resizeElementRef.current = r;
        },
        style: { position: "relative" },
        className:
          this.props.className + (this.props.disabled ? " disabled" : ""),
        onMouseDown: this.onSliderMouseDown,
        onClick: this.onSliderClick,
      },
      tracks,
      thumbs,
      marks,
    );
  }

  unfocus() {
    this.slider?.blur();
    this.thumbs?.forEach((thumb) => thumb.blur());
  }
}

export default ReactSlider;
