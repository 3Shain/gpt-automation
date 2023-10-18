(function() {
  "use strict";
  try {
    if (typeof document != "undefined") {
      var elementStyle = document.createElement("style");
      elementStyle.appendChild(document.createTextNode("*,::before,::after{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: ;}::backdrop{--un-rotate:0;--un-rotate-x:0;--un-rotate-y:0;--un-rotate-z:0;--un-scale-x:1;--un-scale-y:1;--un-scale-z:1;--un-skew-x:0;--un-skew-y:0;--un-translate-x:0;--un-translate-y:0;--un-translate-z:0;--un-pan-x: ;--un-pan-y: ;--un-pinch-zoom: ;--un-scroll-snap-strictness:proximity;--un-ordinal: ;--un-slashed-zero: ;--un-numeric-figure: ;--un-numeric-spacing: ;--un-numeric-fraction: ;--un-border-spacing-x:0;--un-border-spacing-y:0;--un-ring-offset-shadow:0 0 rgba(0,0,0,0);--un-ring-shadow:0 0 rgba(0,0,0,0);--un-shadow-inset: ;--un-shadow:0 0 rgba(0,0,0,0);--un-ring-inset: ;--un-ring-offset-width:0px;--un-ring-offset-color:#fff;--un-ring-width:0px;--un-ring-color:rgba(147,197,253,0.5);--un-blur: ;--un-brightness: ;--un-contrast: ;--un-drop-shadow: ;--un-grayscale: ;--un-hue-rotate: ;--un-invert: ;--un-saturate: ;--un-sepia: ;--un-backdrop-blur: ;--un-backdrop-brightness: ;--un-backdrop-contrast: ;--un-backdrop-grayscale: ;--un-backdrop-hue-rotate: ;--un-backdrop-invert: ;--un-backdrop-opacity: ;--un-backdrop-saturate: ;--un-backdrop-sepia: ;}.umy-10px{margin-top:10px;margin-bottom:10px;}.umt-10px{margin-top:10px;}.uw-full{width:100%;}.uborder-1px{border-width:1px;}.uborder-dashed{border-style:dashed;}.up-10px{padding:10px;}"));
      document.head.appendChild(elementStyle);
    }
  } catch (e) {
    console.error("vite-plugin-css-injected-by-js", e);
  }
})();
(function() {
  "use strict";
  const sharedConfig = {
    context: void 0,
    registry: void 0
  };
  const equalFn = (a2, b2) => a2 === b2;
  const $PROXY = Symbol("solid-proxy");
  const $TRACK = Symbol("solid-track");
  const signalOptions = {
    equals: equalFn
  };
  let runEffects = runQueue;
  const STALE = 1;
  const PENDING = 2;
  const UNOWNED = {
    owned: null,
    cleanups: null,
    context: null,
    owner: null
  };
  var Owner = null;
  let Transition$1 = null;
  let Listener = null;
  let Updates = null;
  let Effects = null;
  let ExecCount = 0;
  const [transPending, setTransPending] = /* @__PURE__ */ createSignal(false);
  function createRoot(fn, detachedOwner) {
    const listener = Listener, owner = Owner, unowned = fn.length === 0, current = detachedOwner === void 0 ? owner : detachedOwner, root = unowned ? UNOWNED : {
      owned: null,
      cleanups: null,
      context: current ? current.context : null,
      owner: current
    }, updateFn = unowned ? fn : () => fn(() => untrack(() => cleanNode(root)));
    Owner = root;
    Listener = null;
    try {
      return runUpdates(updateFn, true);
    } finally {
      Listener = listener;
      Owner = owner;
    }
  }
  function createSignal(value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const s2 = {
      value,
      observers: null,
      observerSlots: null,
      comparator: options.equals || void 0
    };
    const setter = (value2) => {
      if (typeof value2 === "function") {
        value2 = value2(s2.value);
      }
      return writeSignal(s2, value2);
    };
    return [readSignal.bind(s2), setter];
  }
  function createComputed(fn, value, options) {
    const c2 = createComputation(fn, value, true, STALE);
    updateComputation(c2);
  }
  function createRenderEffect(fn, value, options) {
    const c2 = createComputation(fn, value, false, STALE);
    updateComputation(c2);
  }
  function createEffect(fn, value, options) {
    runEffects = runUserEffects;
    const c2 = createComputation(fn, value, false, STALE);
    if (!options || !options.render)
      c2.user = true;
    Effects ? Effects.push(c2) : updateComputation(c2);
  }
  function createMemo(fn, value, options) {
    options = options ? Object.assign({}, signalOptions, options) : signalOptions;
    const c2 = createComputation(fn, value, true, 0);
    c2.observers = null;
    c2.observerSlots = null;
    c2.comparator = options.equals || void 0;
    updateComputation(c2);
    return readSignal.bind(c2);
  }
  function batch(fn) {
    return runUpdates(fn, false);
  }
  function untrack(fn) {
    if (Listener === null)
      return fn();
    const listener = Listener;
    Listener = null;
    try {
      return fn();
    } finally {
      Listener = listener;
    }
  }
  function onMount(fn) {
    createEffect(() => untrack(fn));
  }
  function onCleanup(fn) {
    if (Owner === null)
      ;
    else if (Owner.cleanups === null)
      Owner.cleanups = [fn];
    else
      Owner.cleanups.push(fn);
    return fn;
  }
  function getListener() {
    return Listener;
  }
  function getOwner() {
    return Owner;
  }
  function runWithOwner(o2, fn) {
    const prev = Owner;
    const prevListener = Listener;
    Owner = o2;
    Listener = null;
    try {
      return runUpdates(fn, true);
    } catch (err) {
      handleError(err);
    } finally {
      Owner = prev;
      Listener = prevListener;
    }
  }
  function startTransition(fn) {
    const l2 = Listener;
    const o2 = Owner;
    return Promise.resolve().then(() => {
      Listener = l2;
      Owner = o2;
      let t2;
      runUpdates(fn, false);
      Listener = Owner = null;
      return t2 ? t2.done : void 0;
    });
  }
  function useTransition() {
    return [transPending, startTransition];
  }
  function createContext(defaultValue, options) {
    const id2 = Symbol("context");
    return {
      id: id2,
      Provider: createProvider(id2),
      defaultValue
    };
  }
  function useContext(context) {
    return Owner && Owner.context && Owner.context[context.id] !== void 0 ? Owner.context[context.id] : context.defaultValue;
  }
  function children(fn) {
    const children2 = createMemo(fn);
    const memo = createMemo(() => resolveChildren(children2()));
    memo.toArray = () => {
      const c2 = memo();
      return Array.isArray(c2) ? c2 : c2 != null ? [c2] : [];
    };
    return memo;
  }
  function readSignal() {
    if (this.sources && this.state) {
      if (this.state === STALE)
        updateComputation(this);
      else {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(this), false);
        Updates = updates;
      }
    }
    if (Listener) {
      const sSlot = this.observers ? this.observers.length : 0;
      if (!Listener.sources) {
        Listener.sources = [this];
        Listener.sourceSlots = [sSlot];
      } else {
        Listener.sources.push(this);
        Listener.sourceSlots.push(sSlot);
      }
      if (!this.observers) {
        this.observers = [Listener];
        this.observerSlots = [Listener.sources.length - 1];
      } else {
        this.observers.push(Listener);
        this.observerSlots.push(Listener.sources.length - 1);
      }
    }
    return this.value;
  }
  function writeSignal(node, value, isComp) {
    let current = node.value;
    if (!node.comparator || !node.comparator(current, value)) {
      node.value = value;
      if (node.observers && node.observers.length) {
        runUpdates(() => {
          for (let i2 = 0; i2 < node.observers.length; i2 += 1) {
            const o2 = node.observers[i2];
            const TransitionRunning = Transition$1 && Transition$1.running;
            if (TransitionRunning && Transition$1.disposed.has(o2))
              ;
            if (TransitionRunning ? !o2.tState : !o2.state) {
              if (o2.pure)
                Updates.push(o2);
              else
                Effects.push(o2);
              if (o2.observers)
                markDownstream(o2);
            }
            if (!TransitionRunning)
              o2.state = STALE;
          }
          if (Updates.length > 1e6) {
            Updates = [];
            if (false)
              ;
            throw new Error();
          }
        }, false);
      }
    }
    return value;
  }
  function updateComputation(node) {
    if (!node.fn)
      return;
    cleanNode(node);
    const owner = Owner, listener = Listener, time = ExecCount;
    Listener = Owner = node;
    runComputation(
      node,
      node.value,
      time
    );
    Listener = listener;
    Owner = owner;
  }
  function runComputation(node, value, time) {
    let nextValue;
    try {
      nextValue = node.fn(value);
    } catch (err) {
      if (node.pure) {
        {
          node.state = STALE;
          node.owned && node.owned.forEach(cleanNode);
          node.owned = null;
        }
      }
      node.updatedAt = time + 1;
      return handleError(err);
    }
    if (!node.updatedAt || node.updatedAt <= time) {
      if (node.updatedAt != null && "observers" in node) {
        writeSignal(node, nextValue);
      } else
        node.value = nextValue;
      node.updatedAt = time;
    }
  }
  function createComputation(fn, init, pure, state = STALE, options) {
    const c2 = {
      fn,
      state,
      updatedAt: null,
      owned: null,
      sources: null,
      sourceSlots: null,
      cleanups: null,
      value: init,
      owner: Owner,
      context: Owner ? Owner.context : null,
      pure
    };
    if (Owner === null)
      ;
    else if (Owner !== UNOWNED) {
      {
        if (!Owner.owned)
          Owner.owned = [c2];
        else
          Owner.owned.push(c2);
      }
    }
    return c2;
  }
  function runTop(node) {
    if (node.state === 0)
      return;
    if (node.state === PENDING)
      return lookUpstream(node);
    if (node.suspense && untrack(node.suspense.inFallback))
      return node.suspense.effects.push(node);
    const ancestors = [node];
    while ((node = node.owner) && (!node.updatedAt || node.updatedAt < ExecCount)) {
      if (node.state)
        ancestors.push(node);
    }
    for (let i2 = ancestors.length - 1; i2 >= 0; i2--) {
      node = ancestors[i2];
      if (node.state === STALE) {
        updateComputation(node);
      } else if (node.state === PENDING) {
        const updates = Updates;
        Updates = null;
        runUpdates(() => lookUpstream(node, ancestors[0]), false);
        Updates = updates;
      }
    }
  }
  function runUpdates(fn, init) {
    if (Updates)
      return fn();
    let wait2 = false;
    if (!init)
      Updates = [];
    if (Effects)
      wait2 = true;
    else
      Effects = [];
    ExecCount++;
    try {
      const res = fn();
      completeUpdates(wait2);
      return res;
    } catch (err) {
      if (!wait2)
        Effects = null;
      Updates = null;
      handleError(err);
    }
  }
  function completeUpdates(wait2) {
    if (Updates) {
      runQueue(Updates);
      Updates = null;
    }
    if (wait2)
      return;
    const e = Effects;
    Effects = null;
    if (e.length)
      runUpdates(() => runEffects(e), false);
  }
  function runQueue(queue) {
    for (let i2 = 0; i2 < queue.length; i2++)
      runTop(queue[i2]);
  }
  function runUserEffects(queue) {
    let i2, userLength = 0;
    for (i2 = 0; i2 < queue.length; i2++) {
      const e = queue[i2];
      if (!e.user)
        runTop(e);
      else
        queue[userLength++] = e;
    }
    for (i2 = 0; i2 < userLength; i2++)
      runTop(queue[i2]);
  }
  function lookUpstream(node, ignore) {
    node.state = 0;
    for (let i2 = 0; i2 < node.sources.length; i2 += 1) {
      const source = node.sources[i2];
      if (source.sources) {
        const state = source.state;
        if (state === STALE) {
          if (source !== ignore && (!source.updatedAt || source.updatedAt < ExecCount))
            runTop(source);
        } else if (state === PENDING)
          lookUpstream(source, ignore);
      }
    }
  }
  function markDownstream(node) {
    for (let i2 = 0; i2 < node.observers.length; i2 += 1) {
      const o2 = node.observers[i2];
      if (!o2.state) {
        o2.state = PENDING;
        if (o2.pure)
          Updates.push(o2);
        else
          Effects.push(o2);
        o2.observers && markDownstream(o2);
      }
    }
  }
  function cleanNode(node) {
    let i2;
    if (node.sources) {
      while (node.sources.length) {
        const source = node.sources.pop(), index = node.sourceSlots.pop(), obs = source.observers;
        if (obs && obs.length) {
          const n2 = obs.pop(), s2 = source.observerSlots.pop();
          if (index < obs.length) {
            n2.sourceSlots[s2] = index;
            obs[index] = n2;
            source.observerSlots[index] = s2;
          }
        }
      }
    }
    if (node.owned) {
      for (i2 = node.owned.length - 1; i2 >= 0; i2--)
        cleanNode(node.owned[i2]);
      node.owned = null;
    }
    if (node.cleanups) {
      for (i2 = node.cleanups.length - 1; i2 >= 0; i2--)
        node.cleanups[i2]();
      node.cleanups = null;
    }
    node.state = 0;
  }
  function castError(err) {
    if (err instanceof Error)
      return err;
    return new Error(typeof err === "string" ? err : "Unknown error", {
      cause: err
    });
  }
  function handleError(err, owner = Owner) {
    const error = castError(err);
    throw error;
  }
  function resolveChildren(children2) {
    if (typeof children2 === "function" && !children2.length)
      return resolveChildren(children2());
    if (Array.isArray(children2)) {
      const results = [];
      for (let i2 = 0; i2 < children2.length; i2++) {
        const result = resolveChildren(children2[i2]);
        Array.isArray(result) ? results.push.apply(results, result) : results.push(result);
      }
      return results;
    }
    return children2;
  }
  function createProvider(id2, options) {
    return function provider(props) {
      let res;
      createRenderEffect(
        () => res = untrack(() => {
          Owner.context = {
            ...Owner.context,
            [id2]: props.value
          };
          return children(() => props.children);
        }),
        void 0
      );
      return res;
    };
  }
  const FALLBACK = Symbol("fallback");
  function dispose(d2) {
    for (let i2 = 0; i2 < d2.length; i2++)
      d2[i2]();
  }
  function mapArray(list, mapFn, options = {}) {
    let items = [], mapped = [], disposers = [], len = 0, indexes = mapFn.length > 1 ? [] : null;
    onCleanup(() => dispose(disposers));
    return () => {
      let newItems = list() || [], i2, j2;
      newItems[$TRACK];
      return untrack(() => {
        let newLen = newItems.length, newIndices, newIndicesNext, temp, tempdisposers, tempIndexes, start, end, newEnd, item;
        if (newLen === 0) {
          if (len !== 0) {
            dispose(disposers);
            disposers = [];
            items = [];
            mapped = [];
            len = 0;
            indexes && (indexes = []);
          }
          if (options.fallback) {
            items = [FALLBACK];
            mapped[0] = createRoot((disposer) => {
              disposers[0] = disposer;
              return options.fallback();
            });
            len = 1;
          }
        } else if (len === 0) {
          mapped = new Array(newLen);
          for (j2 = 0; j2 < newLen; j2++) {
            items[j2] = newItems[j2];
            mapped[j2] = createRoot(mapper);
          }
          len = newLen;
        } else {
          temp = new Array(newLen);
          tempdisposers = new Array(newLen);
          indexes && (tempIndexes = new Array(newLen));
          for (start = 0, end = Math.min(len, newLen); start < end && items[start] === newItems[start]; start++)
            ;
          for (end = len - 1, newEnd = newLen - 1; end >= start && newEnd >= start && items[end] === newItems[newEnd]; end--, newEnd--) {
            temp[newEnd] = mapped[end];
            tempdisposers[newEnd] = disposers[end];
            indexes && (tempIndexes[newEnd] = indexes[end]);
          }
          newIndices = /* @__PURE__ */ new Map();
          newIndicesNext = new Array(newEnd + 1);
          for (j2 = newEnd; j2 >= start; j2--) {
            item = newItems[j2];
            i2 = newIndices.get(item);
            newIndicesNext[j2] = i2 === void 0 ? -1 : i2;
            newIndices.set(item, j2);
          }
          for (i2 = start; i2 <= end; i2++) {
            item = items[i2];
            j2 = newIndices.get(item);
            if (j2 !== void 0 && j2 !== -1) {
              temp[j2] = mapped[i2];
              tempdisposers[j2] = disposers[i2];
              indexes && (tempIndexes[j2] = indexes[i2]);
              j2 = newIndicesNext[j2];
              newIndices.set(item, j2);
            } else
              disposers[i2]();
          }
          for (j2 = start; j2 < newLen; j2++) {
            if (j2 in temp) {
              mapped[j2] = temp[j2];
              disposers[j2] = tempdisposers[j2];
              if (indexes) {
                indexes[j2] = tempIndexes[j2];
                indexes[j2](j2);
              }
            } else
              mapped[j2] = createRoot(mapper);
          }
          mapped = mapped.slice(0, len = newLen);
          items = newItems.slice(0);
        }
        return mapped;
      });
      function mapper(disposer) {
        disposers[j2] = disposer;
        if (indexes) {
          const [s2, set] = createSignal(j2);
          indexes[j2] = set;
          return mapFn(newItems[j2], s2);
        }
        return mapFn(newItems[j2]);
      }
    };
  }
  function createComponent(Comp, props) {
    return untrack(() => Comp(props || {}));
  }
  function trueFn() {
    return true;
  }
  const propTraps = {
    get(_, property, receiver) {
      if (property === $PROXY)
        return receiver;
      return _.get(property);
    },
    has(_, property) {
      if (property === $PROXY)
        return true;
      return _.has(property);
    },
    set: trueFn,
    deleteProperty: trueFn,
    getOwnPropertyDescriptor(_, property) {
      return {
        configurable: true,
        enumerable: true,
        get() {
          return _.get(property);
        },
        set: trueFn,
        deleteProperty: trueFn
      };
    },
    ownKeys(_) {
      return _.keys();
    }
  };
  function resolveSource(s2) {
    return !(s2 = typeof s2 === "function" ? s2() : s2) ? {} : s2;
  }
  function resolveSources() {
    for (let i2 = 0, length = this.length; i2 < length; ++i2) {
      const v2 = this[i2]();
      if (v2 !== void 0)
        return v2;
    }
  }
  function mergeProps(...sources) {
    let proxy = false;
    for (let i2 = 0; i2 < sources.length; i2++) {
      const s2 = sources[i2];
      proxy = proxy || !!s2 && $PROXY in s2;
      sources[i2] = typeof s2 === "function" ? (proxy = true, createMemo(s2)) : s2;
    }
    if (proxy) {
      return new Proxy(
        {
          get(property) {
            for (let i2 = sources.length - 1; i2 >= 0; i2--) {
              const v2 = resolveSource(sources[i2])[property];
              if (v2 !== void 0)
                return v2;
            }
          },
          has(property) {
            for (let i2 = sources.length - 1; i2 >= 0; i2--) {
              if (property in resolveSource(sources[i2]))
                return true;
            }
            return false;
          },
          keys() {
            const keys = [];
            for (let i2 = 0; i2 < sources.length; i2++)
              keys.push(...Object.keys(resolveSource(sources[i2])));
            return [...new Set(keys)];
          }
        },
        propTraps
      );
    }
    const target = {};
    const sourcesMap = {};
    const defined = /* @__PURE__ */ new Set();
    for (let i2 = sources.length - 1; i2 >= 0; i2--) {
      const source = sources[i2];
      if (!source)
        continue;
      const sourceKeys = Object.getOwnPropertyNames(source);
      for (let i3 = 0, length = sourceKeys.length; i3 < length; i3++) {
        const key = sourceKeys[i3];
        if (key === "__proto__" || key === "constructor")
          continue;
        const desc = Object.getOwnPropertyDescriptor(source, key);
        if (!defined.has(key)) {
          if (desc.get) {
            defined.add(key);
            Object.defineProperty(target, key, {
              enumerable: true,
              configurable: true,
              get: resolveSources.bind(sourcesMap[key] = [desc.get.bind(source)])
            });
          } else {
            if (desc.value !== void 0)
              defined.add(key);
            target[key] = desc.value;
          }
        } else {
          const sources2 = sourcesMap[key];
          if (sources2) {
            if (desc.get) {
              sources2.push(desc.get.bind(source));
            } else if (desc.value !== void 0) {
              sources2.push(() => desc.value);
            }
          } else if (target[key] === void 0)
            target[key] = desc.value;
        }
      }
    }
    return target;
  }
  function splitProps(props, ...keys) {
    if ($PROXY in props) {
      const blocked = new Set(keys.length > 1 ? keys.flat() : keys[0]);
      const res = keys.map((k2) => {
        return new Proxy(
          {
            get(property) {
              return k2.includes(property) ? props[property] : void 0;
            },
            has(property) {
              return k2.includes(property) && property in props;
            },
            keys() {
              return k2.filter((property) => property in props);
            }
          },
          propTraps
        );
      });
      res.push(
        new Proxy(
          {
            get(property) {
              return blocked.has(property) ? void 0 : props[property];
            },
            has(property) {
              return blocked.has(property) ? false : property in props;
            },
            keys() {
              return Object.keys(props).filter((k2) => !blocked.has(k2));
            }
          },
          propTraps
        )
      );
      return res;
    }
    const otherObject = {};
    const objects = keys.map(() => ({}));
    for (const propName of Object.getOwnPropertyNames(props)) {
      const desc = Object.getOwnPropertyDescriptor(props, propName);
      const isDefaultDesc = !desc.get && !desc.set && desc.enumerable && desc.writable && desc.configurable;
      let blocked = false;
      let objectIndex = 0;
      for (const k2 of keys) {
        if (k2.includes(propName)) {
          blocked = true;
          isDefaultDesc ? objects[objectIndex][propName] = desc.value : Object.defineProperty(objects[objectIndex], propName, desc);
        }
        ++objectIndex;
      }
      if (!blocked) {
        isDefaultDesc ? otherObject[propName] = desc.value : Object.defineProperty(otherObject, propName, desc);
      }
    }
    return [...objects, otherObject];
  }
  let counter = 0;
  function createUniqueId() {
    const ctx = sharedConfig.context;
    return ctx ? `${ctx.id}${ctx.count++}` : `cl-${counter++}`;
  }
  const narrowedError = (name) => `Stale read from <${name}>.`;
  function For(props) {
    const fallback = "fallback" in props && {
      fallback: () => props.fallback
    };
    return createMemo(mapArray(() => props.each, props.children, fallback || void 0));
  }
  function Show(props) {
    const keyed = props.keyed;
    const condition = createMemo(() => props.when, void 0, {
      equals: (a2, b2) => keyed ? a2 === b2 : !a2 === !b2
    });
    return createMemo(
      () => {
        const c2 = condition();
        if (c2) {
          const child = props.children;
          const fn = typeof child === "function" && child.length > 0;
          return fn ? untrack(
            () => child(
              keyed ? c2 : () => {
                if (!untrack(condition))
                  throw narrowedError("Show");
                return props.when;
              }
            )
          ) : child;
        }
        return props.fallback;
      },
      void 0,
      void 0
    );
  }
  const booleans = [
    "allowfullscreen",
    "async",
    "autofocus",
    "autoplay",
    "checked",
    "controls",
    "default",
    "disabled",
    "formnovalidate",
    "hidden",
    "indeterminate",
    "ismap",
    "loop",
    "multiple",
    "muted",
    "nomodule",
    "novalidate",
    "open",
    "playsinline",
    "readonly",
    "required",
    "reversed",
    "seamless",
    "selected"
  ];
  const Properties = /* @__PURE__ */ new Set([
    "className",
    "value",
    "readOnly",
    "formNoValidate",
    "isMap",
    "noModule",
    "playsInline",
    ...booleans
  ]);
  const ChildProperties = /* @__PURE__ */ new Set([
    "innerHTML",
    "textContent",
    "innerText",
    "children"
  ]);
  const Aliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
    className: "class",
    htmlFor: "for"
  });
  const PropAliases = /* @__PURE__ */ Object.assign(/* @__PURE__ */ Object.create(null), {
    class: "className",
    formnovalidate: {
      $: "formNoValidate",
      BUTTON: 1,
      INPUT: 1
    },
    ismap: {
      $: "isMap",
      IMG: 1
    },
    nomodule: {
      $: "noModule",
      SCRIPT: 1
    },
    playsinline: {
      $: "playsInline",
      VIDEO: 1
    },
    readonly: {
      $: "readOnly",
      INPUT: 1,
      TEXTAREA: 1
    }
  });
  function getPropAlias(prop, tagName) {
    const a2 = PropAliases[prop];
    return typeof a2 === "object" ? a2[tagName] ? a2["$"] : void 0 : a2;
  }
  const DelegatedEvents = /* @__PURE__ */ new Set([
    "beforeinput",
    "click",
    "dblclick",
    "contextmenu",
    "focusin",
    "focusout",
    "input",
    "keydown",
    "keyup",
    "mousedown",
    "mousemove",
    "mouseout",
    "mouseover",
    "mouseup",
    "pointerdown",
    "pointermove",
    "pointerout",
    "pointerover",
    "pointerup",
    "touchend",
    "touchmove",
    "touchstart"
  ]);
  const SVGElements = /* @__PURE__ */ new Set([
    "altGlyph",
    "altGlyphDef",
    "altGlyphItem",
    "animate",
    "animateColor",
    "animateMotion",
    "animateTransform",
    "circle",
    "clipPath",
    "color-profile",
    "cursor",
    "defs",
    "desc",
    "ellipse",
    "feBlend",
    "feColorMatrix",
    "feComponentTransfer",
    "feComposite",
    "feConvolveMatrix",
    "feDiffuseLighting",
    "feDisplacementMap",
    "feDistantLight",
    "feFlood",
    "feFuncA",
    "feFuncB",
    "feFuncG",
    "feFuncR",
    "feGaussianBlur",
    "feImage",
    "feMerge",
    "feMergeNode",
    "feMorphology",
    "feOffset",
    "fePointLight",
    "feSpecularLighting",
    "feSpotLight",
    "feTile",
    "feTurbulence",
    "filter",
    "font",
    "font-face",
    "font-face-format",
    "font-face-name",
    "font-face-src",
    "font-face-uri",
    "foreignObject",
    "g",
    "glyph",
    "glyphRef",
    "hkern",
    "image",
    "line",
    "linearGradient",
    "marker",
    "mask",
    "metadata",
    "missing-glyph",
    "mpath",
    "path",
    "pattern",
    "polygon",
    "polyline",
    "radialGradient",
    "rect",
    "set",
    "stop",
    "svg",
    "switch",
    "symbol",
    "text",
    "textPath",
    "tref",
    "tspan",
    "use",
    "view",
    "vkern"
  ]);
  const SVGNamespace = {
    xlink: "http://www.w3.org/1999/xlink",
    xml: "http://www.w3.org/XML/1998/namespace"
  };
  function reconcileArrays(parentNode, a2, b2) {
    let bLength = b2.length, aEnd = a2.length, bEnd = bLength, aStart = 0, bStart = 0, after = a2[aEnd - 1].nextSibling, map = null;
    while (aStart < aEnd || bStart < bEnd) {
      if (a2[aStart] === b2[bStart]) {
        aStart++;
        bStart++;
        continue;
      }
      while (a2[aEnd - 1] === b2[bEnd - 1]) {
        aEnd--;
        bEnd--;
      }
      if (aEnd === aStart) {
        const node = bEnd < bLength ? bStart ? b2[bStart - 1].nextSibling : b2[bEnd - bStart] : after;
        while (bStart < bEnd)
          parentNode.insertBefore(b2[bStart++], node);
      } else if (bEnd === bStart) {
        while (aStart < aEnd) {
          if (!map || !map.has(a2[aStart]))
            a2[aStart].remove();
          aStart++;
        }
      } else if (a2[aStart] === b2[bEnd - 1] && b2[bStart] === a2[aEnd - 1]) {
        const node = a2[--aEnd].nextSibling;
        parentNode.insertBefore(b2[bStart++], a2[aStart++].nextSibling);
        parentNode.insertBefore(b2[--bEnd], node);
        a2[aEnd] = b2[bEnd];
      } else {
        if (!map) {
          map = /* @__PURE__ */ new Map();
          let i2 = bStart;
          while (i2 < bEnd)
            map.set(b2[i2], i2++);
        }
        const index = map.get(a2[aStart]);
        if (index != null) {
          if (bStart < index && index < bEnd) {
            let i2 = aStart, sequence = 1, t2;
            while (++i2 < aEnd && i2 < bEnd) {
              if ((t2 = map.get(a2[i2])) == null || t2 !== index + sequence)
                break;
              sequence++;
            }
            if (sequence > index - bStart) {
              const node = a2[aStart];
              while (bStart < index)
                parentNode.insertBefore(b2[bStart++], node);
            } else
              parentNode.replaceChild(b2[bStart++], a2[aStart++]);
          } else
            aStart++;
        } else
          a2[aStart++].remove();
      }
    }
  }
  const $$EVENTS = "_$DX_DELEGATE";
  function render(code, element, init, options = {}) {
    let disposer;
    createRoot((dispose2) => {
      disposer = dispose2;
      element === document ? code() : insert(element, code(), element.firstChild ? null : void 0, init);
    }, options.owner);
    return () => {
      disposer();
      element.textContent = "";
    };
  }
  function template$1(html, isCE, isSVG) {
    let node;
    const create = () => {
      const t2 = document.createElement("template");
      t2.innerHTML = html;
      return isSVG ? t2.content.firstChild.firstChild : t2.content.firstChild;
    };
    const fn = isCE ? () => untrack(() => document.importNode(node || (node = create()), true)) : () => (node || (node = create())).cloneNode(true);
    fn.cloneNode = fn;
    return fn;
  }
  function delegateEvents(eventNames, document2 = window.document) {
    const e = document2[$$EVENTS] || (document2[$$EVENTS] = /* @__PURE__ */ new Set());
    for (let i2 = 0, l2 = eventNames.length; i2 < l2; i2++) {
      const name = eventNames[i2];
      if (!e.has(name)) {
        e.add(name);
        document2.addEventListener(name, eventHandler);
      }
    }
  }
  function setAttribute(node, name, value) {
    if (value == null)
      node.removeAttribute(name);
    else
      node.setAttribute(name, value);
  }
  function setAttributeNS(node, namespace, name, value) {
    if (value == null)
      node.removeAttributeNS(namespace, name);
    else
      node.setAttributeNS(namespace, name, value);
  }
  function className(node, value) {
    if (value == null)
      node.removeAttribute("class");
    else
      node.className = value;
  }
  function addEventListener(node, name, handler, delegate) {
    if (delegate) {
      if (Array.isArray(handler)) {
        node[`$$${name}`] = handler[0];
        node[`$$${name}Data`] = handler[1];
      } else
        node[`$$${name}`] = handler;
    } else if (Array.isArray(handler)) {
      const handlerFn = handler[0];
      node.addEventListener(name, handler[0] = (e) => handlerFn.call(node, handler[1], e));
    } else
      node.addEventListener(name, handler);
  }
  function classList(node, value, prev = {}) {
    const classKeys = Object.keys(value || {}), prevKeys = Object.keys(prev);
    let i2, len;
    for (i2 = 0, len = prevKeys.length; i2 < len; i2++) {
      const key = prevKeys[i2];
      if (!key || key === "undefined" || value[key])
        continue;
      toggleClassKey(node, key, false);
      delete prev[key];
    }
    for (i2 = 0, len = classKeys.length; i2 < len; i2++) {
      const key = classKeys[i2], classValue = !!value[key];
      if (!key || key === "undefined" || prev[key] === classValue || !classValue)
        continue;
      toggleClassKey(node, key, true);
      prev[key] = classValue;
    }
    return prev;
  }
  function style(node, value, prev) {
    if (!value)
      return prev ? setAttribute(node, "style") : value;
    const nodeStyle = node.style;
    if (typeof value === "string")
      return nodeStyle.cssText = value;
    typeof prev === "string" && (nodeStyle.cssText = prev = void 0);
    prev || (prev = {});
    value || (value = {});
    let v2, s2;
    for (s2 in prev) {
      value[s2] == null && nodeStyle.removeProperty(s2);
      delete prev[s2];
    }
    for (s2 in value) {
      v2 = value[s2];
      if (v2 !== prev[s2]) {
        nodeStyle.setProperty(s2, v2);
        prev[s2] = v2;
      }
    }
    return prev;
  }
  function spread(node, props = {}, isSVG, skipChildren) {
    const prevProps = {};
    if (!skipChildren) {
      createRenderEffect(
        () => prevProps.children = insertExpression(node, props.children, prevProps.children)
      );
    }
    createRenderEffect(() => props.ref && props.ref(node));
    createRenderEffect(() => assign(node, props, isSVG, true, prevProps, true));
    return prevProps;
  }
  function insert(parent, accessor, marker, initial) {
    if (marker !== void 0 && !initial)
      initial = [];
    if (typeof accessor !== "function")
      return insertExpression(parent, accessor, initial, marker);
    createRenderEffect((current) => insertExpression(parent, accessor(), current, marker), initial);
  }
  function assign(node, props, isSVG, skipChildren, prevProps = {}, skipRef = false) {
    props || (props = {});
    for (const prop in prevProps) {
      if (!(prop in props)) {
        if (prop === "children")
          continue;
        prevProps[prop] = assignProp(node, prop, null, prevProps[prop], isSVG, skipRef);
      }
    }
    for (const prop in props) {
      if (prop === "children") {
        if (!skipChildren)
          insertExpression(node, props.children);
        continue;
      }
      const value = props[prop];
      prevProps[prop] = assignProp(node, prop, value, prevProps[prop], isSVG, skipRef);
    }
  }
  function toPropertyName(name) {
    return name.toLowerCase().replace(/-([a-z])/g, (_, w2) => w2.toUpperCase());
  }
  function toggleClassKey(node, key, value) {
    const classNames2 = key.trim().split(/\s+/);
    for (let i2 = 0, nameLen = classNames2.length; i2 < nameLen; i2++)
      node.classList.toggle(classNames2[i2], value);
  }
  function assignProp(node, prop, value, prev, isSVG, skipRef) {
    let isCE, isProp, isChildProp, propAlias, forceProp;
    if (prop === "style")
      return style(node, value, prev);
    if (prop === "classList")
      return classList(node, value, prev);
    if (value === prev)
      return prev;
    if (prop === "ref") {
      if (!skipRef)
        value(node);
    } else if (prop.slice(0, 3) === "on:") {
      const e = prop.slice(3);
      prev && node.removeEventListener(e, prev);
      value && node.addEventListener(e, value);
    } else if (prop.slice(0, 10) === "oncapture:") {
      const e = prop.slice(10);
      prev && node.removeEventListener(e, prev, true);
      value && node.addEventListener(e, value, true);
    } else if (prop.slice(0, 2) === "on") {
      const name = prop.slice(2).toLowerCase();
      const delegate = DelegatedEvents.has(name);
      if (!delegate && prev) {
        const h2 = Array.isArray(prev) ? prev[0] : prev;
        node.removeEventListener(name, h2);
      }
      if (delegate || value) {
        addEventListener(node, name, value, delegate);
        delegate && delegateEvents([name]);
      }
    } else if (prop.slice(0, 5) === "attr:") {
      setAttribute(node, prop.slice(5), value);
    } else if ((forceProp = prop.slice(0, 5) === "prop:") || (isChildProp = ChildProperties.has(prop)) || !isSVG && ((propAlias = getPropAlias(prop, node.tagName)) || (isProp = Properties.has(prop))) || (isCE = node.nodeName.includes("-"))) {
      if (forceProp) {
        prop = prop.slice(5);
        isProp = true;
      }
      if (prop === "class" || prop === "className")
        className(node, value);
      else if (isCE && !isProp && !isChildProp)
        node[toPropertyName(prop)] = value;
      else
        node[propAlias || prop] = value;
    } else {
      const ns = isSVG && prop.indexOf(":") > -1 && SVGNamespace[prop.split(":")[0]];
      if (ns)
        setAttributeNS(node, ns, prop, value);
      else
        setAttribute(node, Aliases[prop] || prop, value);
    }
    return value;
  }
  function eventHandler(e) {
    const key = `$$${e.type}`;
    let node = e.composedPath && e.composedPath()[0] || e.target;
    if (e.target !== node) {
      Object.defineProperty(e, "target", {
        configurable: true,
        value: node
      });
    }
    Object.defineProperty(e, "currentTarget", {
      configurable: true,
      get() {
        return node || document;
      }
    });
    while (node) {
      const handler = node[key];
      if (handler && !node.disabled) {
        const data = node[`${key}Data`];
        data !== void 0 ? handler.call(node, data, e) : handler.call(node, e);
        if (e.cancelBubble)
          return;
      }
      node = node._$host || node.parentNode || node.host;
    }
  }
  function insertExpression(parent, value, current, marker, unwrapArray) {
    while (typeof current === "function")
      current = current();
    if (value === current)
      return current;
    const t2 = typeof value, multi = marker !== void 0;
    parent = multi && current[0] && current[0].parentNode || parent;
    if (t2 === "string" || t2 === "number") {
      if (t2 === "number")
        value = value.toString();
      if (multi) {
        let node = current[0];
        if (node && node.nodeType === 3) {
          node.data = value;
        } else
          node = document.createTextNode(value);
        current = cleanChildren(parent, current, marker, node);
      } else {
        if (current !== "" && typeof current === "string") {
          current = parent.firstChild.data = value;
        } else
          current = parent.textContent = value;
      }
    } else if (value == null || t2 === "boolean") {
      current = cleanChildren(parent, current, marker);
    } else if (t2 === "function") {
      createRenderEffect(() => {
        let v2 = value();
        while (typeof v2 === "function")
          v2 = v2();
        current = insertExpression(parent, v2, current, marker);
      });
      return () => current;
    } else if (Array.isArray(value)) {
      const array = [];
      const currentArray = current && Array.isArray(current);
      if (normalizeIncomingArray(array, value, current, unwrapArray)) {
        createRenderEffect(() => current = insertExpression(parent, array, current, marker, true));
        return () => current;
      }
      if (array.length === 0) {
        current = cleanChildren(parent, current, marker);
        if (multi)
          return current;
      } else if (currentArray) {
        if (current.length === 0) {
          appendNodes(parent, array, marker);
        } else
          reconcileArrays(parent, current, array);
      } else {
        current && cleanChildren(parent);
        appendNodes(parent, array);
      }
      current = array;
    } else if (value.nodeType) {
      if (Array.isArray(current)) {
        if (multi)
          return current = cleanChildren(parent, current, marker, value);
        cleanChildren(parent, current, null, value);
      } else if (current == null || current === "" || !parent.firstChild) {
        parent.appendChild(value);
      } else
        parent.replaceChild(value, parent.firstChild);
      current = value;
    } else
      ;
    return current;
  }
  function normalizeIncomingArray(normalized, array, current, unwrap2) {
    let dynamic = false;
    for (let i2 = 0, len = array.length; i2 < len; i2++) {
      let item = array[i2], prev = current && current[i2], t2;
      if (item == null || item === true || item === false)
        ;
      else if ((t2 = typeof item) === "object" && item.nodeType) {
        normalized.push(item);
      } else if (Array.isArray(item)) {
        dynamic = normalizeIncomingArray(normalized, item, prev) || dynamic;
      } else if (t2 === "function") {
        if (unwrap2) {
          while (typeof item === "function")
            item = item();
          dynamic = normalizeIncomingArray(
            normalized,
            Array.isArray(item) ? item : [item],
            Array.isArray(prev) ? prev : [prev]
          ) || dynamic;
        } else {
          normalized.push(item);
          dynamic = true;
        }
      } else {
        const value = String(item);
        if (prev && prev.nodeType === 3 && prev.data === value)
          normalized.push(prev);
        else
          normalized.push(document.createTextNode(value));
      }
    }
    return dynamic;
  }
  function appendNodes(parent, array, marker = null) {
    for (let i2 = 0, len = array.length; i2 < len; i2++)
      parent.insertBefore(array[i2], marker);
  }
  function cleanChildren(parent, current, marker, replacement) {
    if (marker === void 0)
      return parent.textContent = "";
    const node = replacement || document.createTextNode("");
    if (current.length) {
      let inserted = false;
      for (let i2 = current.length - 1; i2 >= 0; i2--) {
        const el = current[i2];
        if (node !== el) {
          const isParent = el.parentNode === parent;
          if (!inserted && !i2)
            isParent ? parent.replaceChild(node, el) : parent.insertBefore(node, marker);
          else
            isParent && el.remove();
        } else
          inserted = true;
      }
    } else
      parent.insertBefore(node, marker);
    return [node];
  }
  const SVG_NAMESPACE = "http://www.w3.org/2000/svg";
  function createElement(tagName, isSVG = false) {
    return isSVG ? document.createElementNS(SVG_NAMESPACE, tagName) : document.createElement(tagName);
  }
  function Portal(props) {
    const { useShadow } = props, marker = document.createTextNode(""), mount = () => props.mount || document.body, owner = getOwner();
    let content;
    let hydrating = !!sharedConfig.context;
    createEffect(
      () => {
        content || (content = runWithOwner(owner, () => createMemo(() => props.children)));
        const el = mount();
        if (el instanceof HTMLHeadElement) {
          const [clean, setClean] = createSignal(false);
          const cleanup = () => setClean(true);
          createRoot((dispose2) => insert(el, () => !clean() ? content() : dispose2(), null));
          onCleanup(cleanup);
        } else {
          const container = createElement(props.isSVG ? "g" : "div", props.isSVG), renderRoot = useShadow && container.attachShadow ? container.attachShadow({
            mode: "open"
          }) : container;
          Object.defineProperty(container, "_$host", {
            get() {
              return marker.parentNode;
            },
            configurable: true
          });
          insert(renderRoot, content);
          el.appendChild(container);
          props.ref && props.ref(container);
          onCleanup(() => el.removeChild(container));
        }
      },
      void 0,
      {
        render: !hydrating
      }
    );
    return marker;
  }
  function Dynamic(props) {
    const [p2, others] = splitProps(props, ["component"]);
    const cached = createMemo(() => p2.component);
    return createMemo(() => {
      const component = cached();
      switch (typeof component) {
        case "function":
          return untrack(() => component(others));
        case "string":
          const isSvg = SVGElements.has(component);
          const el = createElement(component, isSvg);
          spread(el, others, isSvg);
          return el;
      }
    });
  }
  const $RAW = Symbol("store-raw"), $NODE = Symbol("store-node"), $HAS = Symbol("store-has"), $SELF = Symbol("store-self");
  function wrap$1(value) {
    let p2 = value[$PROXY];
    if (!p2) {
      Object.defineProperty(value, $PROXY, {
        value: p2 = new Proxy(value, proxyTraps$1)
      });
      if (!Array.isArray(value)) {
        const keys = Object.keys(value), desc = Object.getOwnPropertyDescriptors(value);
        for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
          const prop = keys[i2];
          if (desc[prop].get) {
            Object.defineProperty(value, prop, {
              enumerable: desc[prop].enumerable,
              get: desc[prop].get.bind(p2)
            });
          }
        }
      }
    }
    return p2;
  }
  function isWrappable(obj) {
    let proto;
    return obj != null && typeof obj === "object" && (obj[$PROXY] || !(proto = Object.getPrototypeOf(obj)) || proto === Object.prototype || Array.isArray(obj));
  }
  function unwrap(item, set = /* @__PURE__ */ new Set()) {
    let result, unwrapped, v2, prop;
    if (result = item != null && item[$RAW])
      return result;
    if (!isWrappable(item) || set.has(item))
      return item;
    if (Array.isArray(item)) {
      if (Object.isFrozen(item))
        item = item.slice(0);
      else
        set.add(item);
      for (let i2 = 0, l2 = item.length; i2 < l2; i2++) {
        v2 = item[i2];
        if ((unwrapped = unwrap(v2, set)) !== v2)
          item[i2] = unwrapped;
      }
    } else {
      if (Object.isFrozen(item))
        item = Object.assign({}, item);
      else
        set.add(item);
      const keys = Object.keys(item), desc = Object.getOwnPropertyDescriptors(item);
      for (let i2 = 0, l2 = keys.length; i2 < l2; i2++) {
        prop = keys[i2];
        if (desc[prop].get)
          continue;
        v2 = item[prop];
        if ((unwrapped = unwrap(v2, set)) !== v2)
          item[prop] = unwrapped;
      }
    }
    return item;
  }
  function getNodes(target, symbol) {
    let nodes = target[symbol];
    if (!nodes)
      Object.defineProperty(target, symbol, {
        value: nodes = /* @__PURE__ */ Object.create(null)
      });
    return nodes;
  }
  function getNode(nodes, property, value) {
    if (nodes[property])
      return nodes[property];
    const [s2, set] = createSignal(value, {
      equals: false,
      internal: true
    });
    s2.$ = set;
    return nodes[property] = s2;
  }
  function proxyDescriptor$1(target, property) {
    const desc = Reflect.getOwnPropertyDescriptor(target, property);
    if (!desc || desc.get || !desc.configurable || property === $PROXY || property === $NODE)
      return desc;
    delete desc.value;
    delete desc.writable;
    desc.get = () => target[$PROXY][property];
    return desc;
  }
  function trackSelf(target) {
    getListener() && getNode(getNodes(target, $NODE), $SELF)();
  }
  function ownKeys$1(target) {
    trackSelf(target);
    return Reflect.ownKeys(target);
  }
  const proxyTraps$1 = {
    get(target, property, receiver) {
      if (property === $RAW)
        return target;
      if (property === $PROXY)
        return receiver;
      if (property === $TRACK) {
        trackSelf(target);
        return receiver;
      }
      const nodes = getNodes(target, $NODE);
      const tracked = nodes[property];
      let value = tracked ? tracked() : target[property];
      if (property === $NODE || property === $HAS || property === "__proto__")
        return value;
      if (!tracked) {
        const desc = Object.getOwnPropertyDescriptor(target, property);
        if (getListener() && (typeof value !== "function" || target.hasOwnProperty(property)) && !(desc && desc.get))
          value = getNode(nodes, property, value)();
      }
      return isWrappable(value) ? wrap$1(value) : value;
    },
    has(target, property) {
      if (property === $RAW || property === $PROXY || property === $TRACK || property === $NODE || property === $HAS || property === "__proto__")
        return true;
      getListener() && getNode(getNodes(target, $HAS), property)();
      return property in target;
    },
    set() {
      return true;
    },
    deleteProperty() {
      return true;
    },
    ownKeys: ownKeys$1,
    getOwnPropertyDescriptor: proxyDescriptor$1
  };
  function setProperty(state, property, value, deleting = false) {
    if (!deleting && state[property] === value)
      return;
    const prev = state[property], len = state.length;
    if (value === void 0) {
      delete state[property];
      if (state[$HAS] && state[$HAS][property] && prev !== void 0)
        state[$HAS][property].$();
    } else {
      state[property] = value;
      if (state[$HAS] && state[$HAS][property] && prev === void 0)
        state[$HAS][property].$();
    }
    let nodes = getNodes(state, $NODE), node;
    if (node = getNode(nodes, property, prev))
      node.$(() => value);
    if (Array.isArray(state) && state.length !== len) {
      for (let i2 = state.length; i2 < len; i2++)
        (node = nodes[i2]) && node.$();
      (node = getNode(nodes, "length", len)) && node.$(state.length);
    }
    (node = nodes[$SELF]) && node.$();
  }
  function mergeStoreNode(state, value) {
    const keys = Object.keys(value);
    for (let i2 = 0; i2 < keys.length; i2 += 1) {
      const key = keys[i2];
      setProperty(state, key, value[key]);
    }
  }
  function updateArray(current, next) {
    if (typeof next === "function")
      next = next(current);
    next = unwrap(next);
    if (Array.isArray(next)) {
      if (current === next)
        return;
      let i2 = 0, len = next.length;
      for (; i2 < len; i2++) {
        const value = next[i2];
        if (current[i2] !== value)
          setProperty(current, i2, value);
      }
      setProperty(current, "length", len);
    } else
      mergeStoreNode(current, next);
  }
  function updatePath(current, path, traversed = []) {
    let part, prev = current;
    if (path.length > 1) {
      part = path.shift();
      const partType = typeof part, isArray2 = Array.isArray(current);
      if (Array.isArray(part)) {
        for (let i2 = 0; i2 < part.length; i2++) {
          updatePath(current, [part[i2]].concat(path), traversed);
        }
        return;
      } else if (isArray2 && partType === "function") {
        for (let i2 = 0; i2 < current.length; i2++) {
          if (part(current[i2], i2))
            updatePath(current, [i2].concat(path), traversed);
        }
        return;
      } else if (isArray2 && partType === "object") {
        const { from = 0, to = current.length - 1, by = 1 } = part;
        for (let i2 = from; i2 <= to; i2 += by) {
          updatePath(current, [i2].concat(path), traversed);
        }
        return;
      } else if (path.length > 1) {
        updatePath(current[part], path, [part].concat(traversed));
        return;
      }
      prev = current[part];
      traversed = [part].concat(traversed);
    }
    let value = path[0];
    if (typeof value === "function") {
      value = value(prev, traversed);
      if (value === prev)
        return;
    }
    if (part === void 0 && value == void 0)
      return;
    value = unwrap(value);
    if (part === void 0 || isWrappable(prev) && isWrappable(value) && !Array.isArray(value)) {
      mergeStoreNode(prev, value);
    } else
      setProperty(current, part, value);
  }
  function createStore(...[store, options]) {
    const unwrappedStore = unwrap(store || {});
    const isArray2 = Array.isArray(unwrappedStore);
    const wrappedStore = wrap$1(unwrappedStore);
    function setStore(...args) {
      batch(() => {
        isArray2 && args.length === 1 ? updateArray(unwrappedStore, args[0]) : updatePath(unwrappedStore, args);
      });
    }
    return [wrappedStore, setStore];
  }
  var t = "colors", n = "sizes", r = "space", i = { gap: r, gridGap: r, columnGap: r, gridColumnGap: r, rowGap: r, gridRowGap: r, inset: r, insetBlock: r, insetBlockEnd: r, insetBlockStart: r, insetInline: r, insetInlineEnd: r, insetInlineStart: r, margin: r, marginTop: r, marginRight: r, marginBottom: r, marginLeft: r, marginBlock: r, marginBlockEnd: r, marginBlockStart: r, marginInline: r, marginInlineEnd: r, marginInlineStart: r, padding: r, paddingTop: r, paddingRight: r, paddingBottom: r, paddingLeft: r, paddingBlock: r, paddingBlockEnd: r, paddingBlockStart: r, paddingInline: r, paddingInlineEnd: r, paddingInlineStart: r, top: r, right: r, bottom: r, left: r, scrollMargin: r, scrollMarginTop: r, scrollMarginRight: r, scrollMarginBottom: r, scrollMarginLeft: r, scrollMarginX: r, scrollMarginY: r, scrollMarginBlock: r, scrollMarginBlockEnd: r, scrollMarginBlockStart: r, scrollMarginInline: r, scrollMarginInlineEnd: r, scrollMarginInlineStart: r, scrollPadding: r, scrollPaddingTop: r, scrollPaddingRight: r, scrollPaddingBottom: r, scrollPaddingLeft: r, scrollPaddingX: r, scrollPaddingY: r, scrollPaddingBlock: r, scrollPaddingBlockEnd: r, scrollPaddingBlockStart: r, scrollPaddingInline: r, scrollPaddingInlineEnd: r, scrollPaddingInlineStart: r, fontSize: "fontSizes", background: t, backgroundColor: t, backgroundImage: t, borderImage: t, border: t, borderBlock: t, borderBlockEnd: t, borderBlockStart: t, borderBottom: t, borderBottomColor: t, borderColor: t, borderInline: t, borderInlineEnd: t, borderInlineStart: t, borderLeft: t, borderLeftColor: t, borderRight: t, borderRightColor: t, borderTop: t, borderTopColor: t, caretColor: t, color: t, columnRuleColor: t, fill: t, outline: t, outlineColor: t, stroke: t, textDecorationColor: t, fontFamily: "fonts", fontWeight: "fontWeights", lineHeight: "lineHeights", letterSpacing: "letterSpacings", blockSize: n, minBlockSize: n, maxBlockSize: n, inlineSize: n, minInlineSize: n, maxInlineSize: n, width: n, minWidth: n, maxWidth: n, height: n, minHeight: n, maxHeight: n, flexBasis: n, gridTemplateColumns: n, gridTemplateRows: n, borderWidth: "borderWidths", borderTopWidth: "borderWidths", borderRightWidth: "borderWidths", borderBottomWidth: "borderWidths", borderLeftWidth: "borderWidths", borderStyle: "borderStyles", borderTopStyle: "borderStyles", borderRightStyle: "borderStyles", borderBottomStyle: "borderStyles", borderLeftStyle: "borderStyles", borderRadius: "radii", borderTopLeftRadius: "radii", borderTopRightRadius: "radii", borderBottomRightRadius: "radii", borderBottomLeftRadius: "radii", boxShadow: "shadows", textShadow: "shadows", transition: "transitions", zIndex: "zIndices" }, o = (e, t2) => "function" == typeof t2 ? { "()": Function.prototype.toString.call(t2) } : t2, l = () => {
    const e = /* @__PURE__ */ Object.create(null);
    return (t2, n2, ...r2) => {
      const i2 = ((e2) => JSON.stringify(e2, o))(t2);
      return i2 in e ? e[i2] : e[i2] = n2(t2, ...r2);
    };
  }, s = Symbol.for("sxs.internal"), a = (e, t2) => Object.defineProperties(e, Object.getOwnPropertyDescriptors(t2)), c = (e) => {
    for (const t2 in e)
      return true;
    return false;
  }, { hasOwnProperty: d } = Object.prototype, g = (e) => e.includes("-") ? e : e.replace(/[A-Z]/g, (e2) => "-" + e2.toLowerCase()), p = /\s+(?![^()]*\))/, u = (e) => (t2) => e(..."string" == typeof t2 ? String(t2).split(p) : [t2]), h = { appearance: (e) => ({ WebkitAppearance: e, appearance: e }), backfaceVisibility: (e) => ({ WebkitBackfaceVisibility: e, backfaceVisibility: e }), backdropFilter: (e) => ({ WebkitBackdropFilter: e, backdropFilter: e }), backgroundClip: (e) => ({ WebkitBackgroundClip: e, backgroundClip: e }), boxDecorationBreak: (e) => ({ WebkitBoxDecorationBreak: e, boxDecorationBreak: e }), clipPath: (e) => ({ WebkitClipPath: e, clipPath: e }), content: (e) => ({ content: e.includes('"') || e.includes("'") || /^([A-Za-z]+\([^]*|[^]*-quote|inherit|initial|none|normal|revert|unset)$/.test(e) ? e : `"${e}"` }), hyphens: (e) => ({ WebkitHyphens: e, hyphens: e }), maskImage: (e) => ({ WebkitMaskImage: e, maskImage: e }), maskSize: (e) => ({ WebkitMaskSize: e, maskSize: e }), tabSize: (e) => ({ MozTabSize: e, tabSize: e }), textSizeAdjust: (e) => ({ WebkitTextSizeAdjust: e, textSizeAdjust: e }), userSelect: (e) => ({ WebkitUserSelect: e, userSelect: e }), marginBlock: u((e, t2) => ({ marginBlockStart: e, marginBlockEnd: t2 || e })), marginInline: u((e, t2) => ({ marginInlineStart: e, marginInlineEnd: t2 || e })), maxSize: u((e, t2) => ({ maxBlockSize: e, maxInlineSize: t2 || e })), minSize: u((e, t2) => ({ minBlockSize: e, minInlineSize: t2 || e })), paddingBlock: u((e, t2) => ({ paddingBlockStart: e, paddingBlockEnd: t2 || e })), paddingInline: u((e, t2) => ({ paddingInlineStart: e, paddingInlineEnd: t2 || e })) }, f = /([\d.]+)([^]*)/, m = (e, t2) => e.length ? e.reduce((e2, n2) => (e2.push(...t2.map((e3) => e3.includes("&") ? e3.replace(/&/g, /[ +>|~]/.test(n2) && /&.*&/.test(e3) ? `:is(${n2})` : n2) : n2 + " " + e3)), e2), []) : t2, b = (e, t2) => e in S && "string" == typeof t2 ? t2.replace(/^((?:[^]*[^\w-])?)(fit-content|stretch)((?:[^\w-][^]*)?)$/, (t3, n2, r2, i2) => n2 + ("stretch" === r2 ? `-moz-available${i2};${g(e)}:${n2}-webkit-fill-available` : `-moz-fit-content${i2};${g(e)}:${n2}fit-content`) + i2) : String(t2), S = { blockSize: 1, height: 1, inlineSize: 1, maxBlockSize: 1, maxHeight: 1, maxInlineSize: 1, maxWidth: 1, minBlockSize: 1, minHeight: 1, minInlineSize: 1, minWidth: 1, width: 1 }, k = (e) => e ? e + "-" : "", y = (e, t2, n2) => e.replace(/([+-])?((?:\d+(?:\.\d*)?|\.\d+)(?:[Ee][+-]?\d+)?)?(\$|--)([$\w-]+)/g, (e2, r2, i2, o2, l2) => "$" == o2 == !!i2 ? e2 : (r2 || "--" == o2 ? "calc(" : "") + "var(--" + ("$" === o2 ? k(t2) + (l2.includes("$") ? "" : k(n2)) + l2.replace(/\$/g, "-") : l2) + ")" + (r2 || "--" == o2 ? "*" + (r2 || "") + (i2 || "1") + ")" : "")), B = /\s*,\s*(?![^()]*\))/, $ = Object.prototype.toString, x = (e, t2, n2, r2, i2) => {
    let o2, l2, s2;
    const a2 = (e2, t3, n3) => {
      let c2, d2;
      const p2 = (e3) => {
        for (c2 in e3) {
          const x2 = 64 === c2.charCodeAt(0), z2 = x2 && Array.isArray(e3[c2]) ? e3[c2] : [e3[c2]];
          for (d2 of z2) {
            const e4 = /[A-Z]/.test(S2 = c2) ? S2 : S2.replace(/-[^]/g, (e5) => e5[1].toUpperCase()), z3 = "object" == typeof d2 && d2 && d2.toString === $ && (!r2.utils[e4] || !t3.length);
            if (e4 in r2.utils && !z3) {
              const t4 = r2.utils[e4];
              if (t4 !== l2) {
                l2 = t4, p2(t4(d2)), l2 = null;
                continue;
              }
            } else if (e4 in h) {
              const t4 = h[e4];
              if (t4 !== s2) {
                s2 = t4, p2(t4(d2)), s2 = null;
                continue;
              }
            }
            if (x2 && (u2 = c2.slice(1) in r2.media ? "@media " + r2.media[c2.slice(1)] : c2, c2 = u2.replace(/\(\s*([\w-]+)\s*(=|<|<=|>|>=)\s*([\w-]+)\s*(?:(<|<=|>|>=)\s*([\w-]+)\s*)?\)/g, (e5, t4, n4, r3, i3, o3) => {
              const l3 = f.test(t4), s3 = 0.0625 * (l3 ? -1 : 1), [a3, c3] = l3 ? [r3, t4] : [t4, r3];
              return "(" + ("=" === n4[0] ? "" : ">" === n4[0] === l3 ? "max-" : "min-") + a3 + ":" + ("=" !== n4[0] && 1 === n4.length ? c3.replace(f, (e6, t5, r4) => Number(t5) + s3 * (">" === n4 ? 1 : -1) + r4) : c3) + (i3 ? ") and (" + (">" === i3[0] ? "min-" : "max-") + a3 + ":" + (1 === i3.length ? o3.replace(f, (e6, t5, n5) => Number(t5) + s3 * (">" === i3 ? -1 : 1) + n5) : o3) : "") + ")";
            })), z3) {
              const e5 = x2 ? n3.concat(c2) : [...n3], r3 = x2 ? [...t3] : m(t3, c2.split(B));
              void 0 !== o2 && i2(I(...o2)), o2 = void 0, a2(d2, r3, e5);
            } else
              void 0 === o2 && (o2 = [[], t3, n3]), c2 = x2 || 36 !== c2.charCodeAt(0) ? c2 : `--${k(r2.prefix)}${c2.slice(1).replace(/\$/g, "-")}`, d2 = z3 ? d2 : "number" == typeof d2 ? d2 && e4 in R ? String(d2) + "px" : String(d2) : y(b(e4, null == d2 ? "" : d2), r2.prefix, r2.themeMap[e4]), o2[0].push(`${x2 ? `${c2} ` : `${g(c2)}:`}${d2}`);
          }
        }
        var u2, S2;
      };
      p2(e2), void 0 !== o2 && i2(I(...o2)), o2 = void 0;
    };
    a2(e, t2, n2);
  }, I = (e, t2, n2) => `${n2.map((e2) => `${e2}{`).join("")}${t2.length ? `${t2.join(",")}{` : ""}${e.join(";")}${t2.length ? "}" : ""}${Array(n2.length ? n2.length + 1 : 0).join("}")}`, R = { animationDelay: 1, animationDuration: 1, backgroundSize: 1, blockSize: 1, border: 1, borderBlock: 1, borderBlockEnd: 1, borderBlockEndWidth: 1, borderBlockStart: 1, borderBlockStartWidth: 1, borderBlockWidth: 1, borderBottom: 1, borderBottomLeftRadius: 1, borderBottomRightRadius: 1, borderBottomWidth: 1, borderEndEndRadius: 1, borderEndStartRadius: 1, borderInlineEnd: 1, borderInlineEndWidth: 1, borderInlineStart: 1, borderInlineStartWidth: 1, borderInlineWidth: 1, borderLeft: 1, borderLeftWidth: 1, borderRadius: 1, borderRight: 1, borderRightWidth: 1, borderSpacing: 1, borderStartEndRadius: 1, borderStartStartRadius: 1, borderTop: 1, borderTopLeftRadius: 1, borderTopRightRadius: 1, borderTopWidth: 1, borderWidth: 1, bottom: 1, columnGap: 1, columnRule: 1, columnRuleWidth: 1, columnWidth: 1, containIntrinsicSize: 1, flexBasis: 1, fontSize: 1, gap: 1, gridAutoColumns: 1, gridAutoRows: 1, gridTemplateColumns: 1, gridTemplateRows: 1, height: 1, inlineSize: 1, inset: 1, insetBlock: 1, insetBlockEnd: 1, insetBlockStart: 1, insetInline: 1, insetInlineEnd: 1, insetInlineStart: 1, left: 1, letterSpacing: 1, margin: 1, marginBlock: 1, marginBlockEnd: 1, marginBlockStart: 1, marginBottom: 1, marginInline: 1, marginInlineEnd: 1, marginInlineStart: 1, marginLeft: 1, marginRight: 1, marginTop: 1, maxBlockSize: 1, maxHeight: 1, maxInlineSize: 1, maxWidth: 1, minBlockSize: 1, minHeight: 1, minInlineSize: 1, minWidth: 1, offsetDistance: 1, offsetRotate: 1, outline: 1, outlineOffset: 1, outlineWidth: 1, overflowClipMargin: 1, padding: 1, paddingBlock: 1, paddingBlockEnd: 1, paddingBlockStart: 1, paddingBottom: 1, paddingInline: 1, paddingInlineEnd: 1, paddingInlineStart: 1, paddingLeft: 1, paddingRight: 1, paddingTop: 1, perspective: 1, right: 1, rowGap: 1, scrollMargin: 1, scrollMarginBlock: 1, scrollMarginBlockEnd: 1, scrollMarginBlockStart: 1, scrollMarginBottom: 1, scrollMarginInline: 1, scrollMarginInlineEnd: 1, scrollMarginInlineStart: 1, scrollMarginLeft: 1, scrollMarginRight: 1, scrollMarginTop: 1, scrollPadding: 1, scrollPaddingBlock: 1, scrollPaddingBlockEnd: 1, scrollPaddingBlockStart: 1, scrollPaddingBottom: 1, scrollPaddingInline: 1, scrollPaddingInlineEnd: 1, scrollPaddingInlineStart: 1, scrollPaddingLeft: 1, scrollPaddingRight: 1, scrollPaddingTop: 1, shapeMargin: 1, textDecoration: 1, textDecorationThickness: 1, textIndent: 1, textUnderlineOffset: 1, top: 1, transitionDelay: 1, transitionDuration: 1, verticalAlign: 1, width: 1, wordSpacing: 1 }, z = (e) => String.fromCharCode(e + (e > 25 ? 39 : 97)), W = (e) => ((e2) => {
    let t2, n2 = "";
    for (t2 = Math.abs(e2); t2 > 52; t2 = t2 / 52 | 0)
      n2 = z(t2 % 52) + n2;
    return z(t2 % 52) + n2;
  })(((e2, t2) => {
    let n2 = t2.length;
    for (; n2; )
      e2 = 33 * e2 ^ t2.charCodeAt(--n2);
    return e2;
  })(5381, JSON.stringify(e)) >>> 0), j = ["themed", "global", "styled", "onevar", "resonevar", "allvar", "inline"], E = (e) => {
    if (e.href && !e.href.startsWith(location.origin))
      return false;
    try {
      return !!e.cssRules;
    } catch (e2) {
      return false;
    }
  }, T = (e) => {
    let t2;
    const n2 = () => {
      const { cssRules: e2 } = t2.sheet;
      return [].map.call(e2, (n3, r3) => {
        const { cssText: i2 } = n3;
        let o2 = "";
        if (i2.startsWith("--sxs"))
          return "";
        if (e2[r3 - 1] && (o2 = e2[r3 - 1].cssText).startsWith("--sxs")) {
          if (!n3.cssRules.length)
            return "";
          for (const e3 in t2.rules)
            if (t2.rules[e3].group === n3)
              return `--sxs{--sxs:${[...t2.rules[e3].cache].join(" ")}}${i2}`;
          return n3.cssRules.length ? `${o2}${i2}` : "";
        }
        return i2;
      }).join("");
    }, r2 = () => {
      if (t2) {
        const { rules: e2, sheet: n3 } = t2;
        if (!n3.deleteRule) {
          for (; 3 === Object(Object(n3.cssRules)[0]).type; )
            n3.cssRules.splice(0, 1);
          n3.cssRules = [];
        }
        for (const t3 in e2)
          delete e2[t3];
      }
      const i2 = Object(e).styleSheets || [];
      for (const e2 of i2)
        if (E(e2)) {
          for (let i3 = 0, o3 = e2.cssRules; o3[i3]; ++i3) {
            const l3 = Object(o3[i3]);
            if (1 !== l3.type)
              continue;
            const s2 = Object(o3[i3 + 1]);
            if (4 !== s2.type)
              continue;
            ++i3;
            const { cssText: a2 } = l3;
            if (!a2.startsWith("--sxs"))
              continue;
            const c2 = a2.slice(14, -3).trim().split(/\s+/), d2 = j[c2[0]];
            d2 && (t2 || (t2 = { sheet: e2, reset: r2, rules: {}, toString: n2 }), t2.rules[d2] = { group: s2, index: i3, cache: new Set(c2) });
          }
          if (t2)
            break;
        }
      if (!t2) {
        const i3 = (e2, t3) => ({ type: t3, cssRules: [], insertRule(e3, t4) {
          this.cssRules.splice(t4, 0, i3(e3, { import: 3, undefined: 1 }[(e3.toLowerCase().match(/^@([a-z]+)/) || [])[1]] || 4));
        }, get cssText() {
          return "@media{}" === e2 ? `@media{${[].map.call(this.cssRules, (e3) => e3.cssText).join("")}}` : e2;
        } });
        t2 = { sheet: e ? (e.head || e).appendChild(document.createElement("style")).sheet : i3("", "text/css"), rules: {}, reset: r2, toString: n2 };
      }
      const { sheet: o2, rules: l2 } = t2;
      for (let e2 = j.length - 1; e2 >= 0; --e2) {
        const t3 = j[e2];
        if (!l2[t3]) {
          const n3 = j[e2 + 1], r3 = l2[n3] ? l2[n3].index : o2.cssRules.length;
          o2.insertRule("@media{}", r3), o2.insertRule(`--sxs{--sxs:${e2}}`, r3), l2[t3] = { group: o2.cssRules[r3 + 1], index: r3, cache: /* @__PURE__ */ new Set([e2]) };
        }
        v(l2[t3]);
      }
    };
    return r2(), t2;
  }, v = (e) => {
    const t2 = e.group;
    let n2 = t2.cssRules.length;
    e.apply = (e2) => {
      try {
        t2.insertRule(e2, n2), ++n2;
      } catch (e3) {
      }
    };
  }, M = Symbol(), w = l(), C = (e, t2) => w(e, () => (...n2) => {
    let r2 = { type: null, composers: /* @__PURE__ */ new Set() };
    for (const t3 of n2)
      if (null != t3)
        if (t3[s]) {
          null == r2.type && (r2.type = t3[s].type);
          for (const e2 of t3[s].composers)
            r2.composers.add(e2);
        } else
          t3.constructor !== Object || t3.$$typeof ? null == r2.type && (r2.type = t3) : r2.composers.add(P(t3, e));
    return null == r2.type && (r2.type = "span"), r2.composers.size || r2.composers.add(["PJLV", {}, [], [], {}, []]), L(e, r2, t2);
  }), P = ({ variants: e, compoundVariants: t2, defaultVariants: n2, ...r2 }, i2) => {
    const o2 = `${k(i2.prefix)}c-${W(r2)}`, l2 = [], s2 = [], a2 = /* @__PURE__ */ Object.create(null), g2 = [];
    for (const e2 in n2)
      a2[e2] = String(n2[e2]);
    if ("object" == typeof e && e)
      for (const t3 in e) {
        p2 = a2, u2 = t3, d.call(p2, u2) || (a2[t3] = "undefined");
        const n3 = e[t3];
        for (const e2 in n3) {
          const r3 = { [t3]: String(e2) };
          "undefined" === String(e2) && g2.push(t3);
          const i3 = n3[e2], o3 = [r3, i3, !c(i3)];
          l2.push(o3);
        }
      }
    var p2, u2;
    if ("object" == typeof t2 && t2)
      for (const e2 of t2) {
        let { css: t3, ...n3 } = e2;
        t3 = "object" == typeof t3 && t3 || {};
        for (const e3 in n3)
          n3[e3] = String(n3[e3]);
        const r3 = [n3, t3, !c(t3)];
        s2.push(r3);
      }
    return [o2, r2, l2, s2, a2, g2];
  }, L = (e, t2, n2) => {
    const [r2, i2, o2, l2] = O(t2.composers), c2 = "function" == typeof t2.type || t2.type.$$typeof ? ((e2) => {
      function t3() {
        for (let n3 = 0; n3 < t3[M].length; n3++) {
          const [r3, i3] = t3[M][n3];
          e2.rules[r3].apply(i3);
        }
        return t3[M] = [], null;
      }
      return t3[M] = [], t3.rules = {}, j.forEach((e3) => t3.rules[e3] = { apply: (n3) => t3[M].push([e3, n3]) }), t3;
    })(n2) : null, d2 = (c2 || n2).rules, g2 = `.${r2}${i2.length > 1 ? `:where(.${i2.slice(1).join(".")})` : ""}`, p2 = (s2) => {
      s2 = "object" == typeof s2 && s2 || D;
      const { css: a2, ...p3 } = s2, u2 = {};
      for (const e2 in o2)
        if (delete p3[e2], e2 in s2) {
          let t3 = s2[e2];
          "object" == typeof t3 && t3 ? u2[e2] = { "@initial": o2[e2], ...t3 } : (t3 = String(t3), u2[e2] = "undefined" !== t3 || l2.has(e2) ? t3 : o2[e2]);
        } else
          u2[e2] = o2[e2];
      const h2 = /* @__PURE__ */ new Set([...i2]);
      for (const [r3, i3, o3, l3] of t2.composers) {
        n2.rules.styled.cache.has(r3) || (n2.rules.styled.cache.add(r3), x(i3, [`.${r3}`], [], e, (e2) => {
          d2.styled.apply(e2);
        }));
        const t3 = A(o3, u2, e.media), s3 = A(l3, u2, e.media, true);
        for (const i4 of t3)
          if (void 0 !== i4)
            for (const [t4, o4, l4] of i4) {
              const i5 = `${r3}-${W(o4)}-${t4}`;
              h2.add(i5);
              const s4 = (l4 ? n2.rules.resonevar : n2.rules.onevar).cache, a3 = l4 ? d2.resonevar : d2.onevar;
              s4.has(i5) || (s4.add(i5), x(o4, [`.${i5}`], [], e, (e2) => {
                a3.apply(e2);
              }));
            }
        for (const t4 of s3)
          if (void 0 !== t4)
            for (const [i4, o4] of t4) {
              const t5 = `${r3}-${W(o4)}-${i4}`;
              h2.add(t5), n2.rules.allvar.cache.has(t5) || (n2.rules.allvar.cache.add(t5), x(o4, [`.${t5}`], [], e, (e2) => {
                d2.allvar.apply(e2);
              }));
            }
      }
      if ("object" == typeof a2 && a2) {
        const t3 = `${r2}-i${W(a2)}-css`;
        h2.add(t3), n2.rules.inline.cache.has(t3) || (n2.rules.inline.cache.add(t3), x(a2, [`.${t3}`], [], e, (e2) => {
          d2.inline.apply(e2);
        }));
      }
      for (const e2 of String(s2.className || "").trim().split(/\s+/))
        e2 && h2.add(e2);
      const f2 = p3.className = [...h2].join(" ");
      return { type: t2.type, className: f2, selector: g2, props: p3, toString: () => f2, deferredInjector: c2 };
    };
    return a(p2, { className: r2, selector: g2, [s]: t2, toString: () => (n2.rules.styled.cache.has(r2) || p2(), r2) });
  }, O = (e) => {
    let t2 = "";
    const n2 = [], r2 = {}, i2 = [];
    for (const [o2, , , , l2, s2] of e) {
      "" === t2 && (t2 = o2), n2.push(o2), i2.push(...s2);
      for (const e2 in l2) {
        const t3 = l2[e2];
        (void 0 === r2[e2] || "undefined" !== t3 || s2.includes(t3)) && (r2[e2] = t3);
      }
    }
    return [t2, n2, r2, new Set(i2)];
  }, A = (e, t2, n2, r2) => {
    const i2 = [];
    e:
      for (let [o2, l2, s2] of e) {
        if (s2)
          continue;
        let e2, a2 = 0, c2 = false;
        for (e2 in o2) {
          const r3 = o2[e2];
          let i3 = t2[e2];
          if (i3 !== r3) {
            if ("object" != typeof i3 || !i3)
              continue e;
            {
              let e3, t3, o3 = 0;
              for (const l3 in i3) {
                if (r3 === String(i3[l3])) {
                  if ("@initial" !== l3) {
                    const e4 = l3.slice(1);
                    (t3 = t3 || []).push(e4 in n2 ? n2[e4] : l3.replace(/^@media ?/, "")), c2 = true;
                  }
                  a2 += o3, e3 = true;
                }
                ++o3;
              }
              if (t3 && t3.length && (l2 = { ["@media " + t3.join(", ")]: l2 }), !e3)
                continue e;
            }
          }
        }
        (i2[a2] = i2[a2] || []).push([r2 ? "cv" : `${e2}-${o2[e2]}`, l2, c2]);
      }
    return i2;
  }, D = {}, H = l(), N = (e, t2) => H(e, () => (...n2) => {
    const r2 = () => {
      for (let r3 of n2) {
        r3 = "object" == typeof r3 && r3 || {};
        let n3 = W(r3);
        if (!t2.rules.global.cache.has(n3)) {
          if (t2.rules.global.cache.add(n3), "@import" in r3) {
            let e2 = [].indexOf.call(t2.sheet.cssRules, t2.rules.themed.group) - 1;
            for (let n4 of [].concat(r3["@import"]))
              n4 = n4.includes('"') || n4.includes("'") ? n4 : `"${n4}"`, t2.sheet.insertRule(`@import ${n4};`, e2++);
            delete r3["@import"];
          }
          x(r3, [], [], e, (e2) => {
            t2.rules.global.apply(e2);
          });
        }
      }
      return "";
    };
    return a(r2, { toString: r2 });
  }), V = l(), G = (e, t2) => V(e, () => (n2) => {
    const r2 = `${k(e.prefix)}k-${W(n2)}`, i2 = () => {
      if (!t2.rules.global.cache.has(r2)) {
        t2.rules.global.cache.add(r2);
        const i3 = [];
        x(n2, [], [], e, (e2) => i3.push(e2));
        const o2 = `@keyframes ${r2}{${i3.join("")}}`;
        t2.rules.global.apply(o2);
      }
      return r2;
    };
    return a(i2, { get name() {
      return i2();
    }, toString: i2 });
  }), F = class {
    constructor(e, t2, n2, r2) {
      this.token = null == e ? "" : String(e), this.value = null == t2 ? "" : String(t2), this.scale = null == n2 ? "" : String(n2), this.prefix = null == r2 ? "" : String(r2);
    }
    get computedValue() {
      return "var(" + this.variable + ")";
    }
    get variable() {
      return "--" + k(this.prefix) + k(this.scale) + this.token;
    }
    toString() {
      return this.computedValue;
    }
  }, J = l(), U = (e, t2) => J(e, () => (n2, r2) => {
    r2 = "object" == typeof n2 && n2 || Object(r2);
    const i2 = `.${n2 = (n2 = "string" == typeof n2 ? n2 : "") || `${k(e.prefix)}t-${W(r2)}`}`, o2 = {}, l2 = [];
    for (const t3 in r2) {
      o2[t3] = {};
      for (const n3 in r2[t3]) {
        const i3 = `--${k(e.prefix)}${t3}-${n3}`, s3 = y(String(r2[t3][n3]), e.prefix, t3);
        o2[t3][n3] = new F(n3, s3, t3, e.prefix), l2.push(`${i3}:${s3}`);
      }
    }
    const s2 = () => {
      if (l2.length && !t2.rules.themed.cache.has(n2)) {
        t2.rules.themed.cache.add(n2);
        const i3 = `${r2 === e.theme ? ":root," : ""}.${n2}{${l2.join(";")}}`;
        t2.rules.themed.apply(i3);
      }
      return n2;
    };
    return { ...o2, get className() {
      return s2();
    }, selector: i2, toString: s2 };
  }), Z = l(), X = (e) => {
    let t2 = false;
    const n2 = Z(e, (e2) => {
      t2 = true;
      const n3 = "prefix" in (e2 = "object" == typeof e2 && e2 || {}) ? String(e2.prefix) : "", r2 = "object" == typeof e2.media && e2.media || {}, o2 = "object" == typeof e2.root ? e2.root || null : globalThis.document || null, l2 = "object" == typeof e2.theme && e2.theme || {}, s2 = { prefix: n3, media: r2, theme: l2, themeMap: "object" == typeof e2.themeMap && e2.themeMap || { ...i }, utils: "object" == typeof e2.utils && e2.utils || {} }, a2 = T(o2), c2 = { css: C(s2, a2), globalCss: N(s2, a2), keyframes: G(s2, a2), createTheme: U(s2, a2), reset() {
        a2.reset(), c2.theme.toString();
      }, theme: {}, sheet: a2, config: s2, prefix: n3, getCssText: a2.toString, toString: a2.toString };
      return String(c2.theme = c2.createTheme(l2)), c2;
    });
    return t2 || n2.reset(), n2;
  };
  var commonjsGlobal = typeof globalThis !== "undefined" ? globalThis : typeof window !== "undefined" ? window : typeof global !== "undefined" ? global : typeof self !== "undefined" ? self : {};
  function getDefaultExportFromCjs(x2) {
    return x2 && x2.__esModule && Object.prototype.hasOwnProperty.call(x2, "default") ? x2["default"] : x2;
  }
  var lodash_merge = { exports: {} };
  lodash_merge.exports;
  (function(module, exports) {
    var LARGE_ARRAY_SIZE = 200;
    var HASH_UNDEFINED = "__lodash_hash_undefined__";
    var HOT_COUNT = 800, HOT_SPAN = 16;
    var MAX_SAFE_INTEGER = 9007199254740991;
    var argsTag = "[object Arguments]", arrayTag = "[object Array]", asyncTag = "[object AsyncFunction]", boolTag = "[object Boolean]", dateTag = "[object Date]", errorTag = "[object Error]", funcTag = "[object Function]", genTag = "[object GeneratorFunction]", mapTag = "[object Map]", numberTag = "[object Number]", nullTag = "[object Null]", objectTag = "[object Object]", proxyTag = "[object Proxy]", regexpTag = "[object RegExp]", setTag = "[object Set]", stringTag = "[object String]", undefinedTag = "[object Undefined]", weakMapTag = "[object WeakMap]";
    var arrayBufferTag = "[object ArrayBuffer]", dataViewTag = "[object DataView]", float32Tag = "[object Float32Array]", float64Tag = "[object Float64Array]", int8Tag = "[object Int8Array]", int16Tag = "[object Int16Array]", int32Tag = "[object Int32Array]", uint8Tag = "[object Uint8Array]", uint8ClampedTag = "[object Uint8ClampedArray]", uint16Tag = "[object Uint16Array]", uint32Tag = "[object Uint32Array]";
    var reRegExpChar = /[\\^$.*+?()[\]{}|]/g;
    var reIsHostCtor = /^\[object .+?Constructor\]$/;
    var reIsUint = /^(?:0|[1-9]\d*)$/;
    var typedArrayTags = {};
    typedArrayTags[float32Tag] = typedArrayTags[float64Tag] = typedArrayTags[int8Tag] = typedArrayTags[int16Tag] = typedArrayTags[int32Tag] = typedArrayTags[uint8Tag] = typedArrayTags[uint8ClampedTag] = typedArrayTags[uint16Tag] = typedArrayTags[uint32Tag] = true;
    typedArrayTags[argsTag] = typedArrayTags[arrayTag] = typedArrayTags[arrayBufferTag] = typedArrayTags[boolTag] = typedArrayTags[dataViewTag] = typedArrayTags[dateTag] = typedArrayTags[errorTag] = typedArrayTags[funcTag] = typedArrayTags[mapTag] = typedArrayTags[numberTag] = typedArrayTags[objectTag] = typedArrayTags[regexpTag] = typedArrayTags[setTag] = typedArrayTags[stringTag] = typedArrayTags[weakMapTag] = false;
    var freeGlobal = typeof commonjsGlobal == "object" && commonjsGlobal && commonjsGlobal.Object === Object && commonjsGlobal;
    var freeSelf = typeof self == "object" && self && self.Object === Object && self;
    var root = freeGlobal || freeSelf || Function("return this")();
    var freeExports = exports && !exports.nodeType && exports;
    var freeModule = freeExports && true && module && !module.nodeType && module;
    var moduleExports = freeModule && freeModule.exports === freeExports;
    var freeProcess = moduleExports && freeGlobal.process;
    var nodeUtil = function() {
      try {
        var types = freeModule && freeModule.require && freeModule.require("util").types;
        if (types) {
          return types;
        }
        return freeProcess && freeProcess.binding && freeProcess.binding("util");
      } catch (e) {
      }
    }();
    var nodeIsTypedArray = nodeUtil && nodeUtil.isTypedArray;
    function apply(func, thisArg, args) {
      switch (args.length) {
        case 0:
          return func.call(thisArg);
        case 1:
          return func.call(thisArg, args[0]);
        case 2:
          return func.call(thisArg, args[0], args[1]);
        case 3:
          return func.call(thisArg, args[0], args[1], args[2]);
      }
      return func.apply(thisArg, args);
    }
    function baseTimes(n2, iteratee) {
      var index = -1, result = Array(n2);
      while (++index < n2) {
        result[index] = iteratee(index);
      }
      return result;
    }
    function baseUnary(func) {
      return function(value) {
        return func(value);
      };
    }
    function getValue(object, key) {
      return object == null ? void 0 : object[key];
    }
    function overArg(func, transform) {
      return function(arg) {
        return func(transform(arg));
      };
    }
    var arrayProto = Array.prototype, funcProto = Function.prototype, objectProto = Object.prototype;
    var coreJsData = root["__core-js_shared__"];
    var funcToString = funcProto.toString;
    var hasOwnProperty = objectProto.hasOwnProperty;
    var maskSrcKey = function() {
      var uid = /[^.]+$/.exec(coreJsData && coreJsData.keys && coreJsData.keys.IE_PROTO || "");
      return uid ? "Symbol(src)_1." + uid : "";
    }();
    var nativeObjectToString = objectProto.toString;
    var objectCtorString = funcToString.call(Object);
    var reIsNative = RegExp(
      "^" + funcToString.call(hasOwnProperty).replace(reRegExpChar, "\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g, "$1.*?") + "$"
    );
    var Buffer = moduleExports ? root.Buffer : void 0, Symbol2 = root.Symbol, Uint8Array = root.Uint8Array, allocUnsafe = Buffer ? Buffer.allocUnsafe : void 0, getPrototype = overArg(Object.getPrototypeOf, Object), objectCreate = Object.create, propertyIsEnumerable = objectProto.propertyIsEnumerable, splice = arrayProto.splice, symToStringTag = Symbol2 ? Symbol2.toStringTag : void 0;
    var defineProperty = function() {
      try {
        var func = getNative(Object, "defineProperty");
        func({}, "", {});
        return func;
      } catch (e) {
      }
    }();
    var nativeIsBuffer = Buffer ? Buffer.isBuffer : void 0, nativeMax = Math.max, nativeNow = Date.now;
    var Map2 = getNative(root, "Map"), nativeCreate = getNative(Object, "create");
    var baseCreate = function() {
      function object() {
      }
      return function(proto) {
        if (!isObject2(proto)) {
          return {};
        }
        if (objectCreate) {
          return objectCreate(proto);
        }
        object.prototype = proto;
        var result = new object();
        object.prototype = void 0;
        return result;
      };
    }();
    function Hash(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function hashClear() {
      this.__data__ = nativeCreate ? nativeCreate(null) : {};
      this.size = 0;
    }
    function hashDelete(key) {
      var result = this.has(key) && delete this.__data__[key];
      this.size -= result ? 1 : 0;
      return result;
    }
    function hashGet(key) {
      var data = this.__data__;
      if (nativeCreate) {
        var result = data[key];
        return result === HASH_UNDEFINED ? void 0 : result;
      }
      return hasOwnProperty.call(data, key) ? data[key] : void 0;
    }
    function hashHas(key) {
      var data = this.__data__;
      return nativeCreate ? data[key] !== void 0 : hasOwnProperty.call(data, key);
    }
    function hashSet(key, value) {
      var data = this.__data__;
      this.size += this.has(key) ? 0 : 1;
      data[key] = nativeCreate && value === void 0 ? HASH_UNDEFINED : value;
      return this;
    }
    Hash.prototype.clear = hashClear;
    Hash.prototype["delete"] = hashDelete;
    Hash.prototype.get = hashGet;
    Hash.prototype.has = hashHas;
    Hash.prototype.set = hashSet;
    function ListCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function listCacheClear() {
      this.__data__ = [];
      this.size = 0;
    }
    function listCacheDelete(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        return false;
      }
      var lastIndex = data.length - 1;
      if (index == lastIndex) {
        data.pop();
      } else {
        splice.call(data, index, 1);
      }
      --this.size;
      return true;
    }
    function listCacheGet(key) {
      var data = this.__data__, index = assocIndexOf(data, key);
      return index < 0 ? void 0 : data[index][1];
    }
    function listCacheHas(key) {
      return assocIndexOf(this.__data__, key) > -1;
    }
    function listCacheSet(key, value) {
      var data = this.__data__, index = assocIndexOf(data, key);
      if (index < 0) {
        ++this.size;
        data.push([key, value]);
      } else {
        data[index][1] = value;
      }
      return this;
    }
    ListCache.prototype.clear = listCacheClear;
    ListCache.prototype["delete"] = listCacheDelete;
    ListCache.prototype.get = listCacheGet;
    ListCache.prototype.has = listCacheHas;
    ListCache.prototype.set = listCacheSet;
    function MapCache(entries) {
      var index = -1, length = entries == null ? 0 : entries.length;
      this.clear();
      while (++index < length) {
        var entry = entries[index];
        this.set(entry[0], entry[1]);
      }
    }
    function mapCacheClear() {
      this.size = 0;
      this.__data__ = {
        "hash": new Hash(),
        "map": new (Map2 || ListCache)(),
        "string": new Hash()
      };
    }
    function mapCacheDelete(key) {
      var result = getMapData(this, key)["delete"](key);
      this.size -= result ? 1 : 0;
      return result;
    }
    function mapCacheGet(key) {
      return getMapData(this, key).get(key);
    }
    function mapCacheHas(key) {
      return getMapData(this, key).has(key);
    }
    function mapCacheSet(key, value) {
      var data = getMapData(this, key), size2 = data.size;
      data.set(key, value);
      this.size += data.size == size2 ? 0 : 1;
      return this;
    }
    MapCache.prototype.clear = mapCacheClear;
    MapCache.prototype["delete"] = mapCacheDelete;
    MapCache.prototype.get = mapCacheGet;
    MapCache.prototype.has = mapCacheHas;
    MapCache.prototype.set = mapCacheSet;
    function Stack2(entries) {
      var data = this.__data__ = new ListCache(entries);
      this.size = data.size;
    }
    function stackClear() {
      this.__data__ = new ListCache();
      this.size = 0;
    }
    function stackDelete(key) {
      var data = this.__data__, result = data["delete"](key);
      this.size = data.size;
      return result;
    }
    function stackGet(key) {
      return this.__data__.get(key);
    }
    function stackHas(key) {
      return this.__data__.has(key);
    }
    function stackSet(key, value) {
      var data = this.__data__;
      if (data instanceof ListCache) {
        var pairs = data.__data__;
        if (!Map2 || pairs.length < LARGE_ARRAY_SIZE - 1) {
          pairs.push([key, value]);
          this.size = ++data.size;
          return this;
        }
        data = this.__data__ = new MapCache(pairs);
      }
      data.set(key, value);
      this.size = data.size;
      return this;
    }
    Stack2.prototype.clear = stackClear;
    Stack2.prototype["delete"] = stackDelete;
    Stack2.prototype.get = stackGet;
    Stack2.prototype.has = stackHas;
    Stack2.prototype.set = stackSet;
    function arrayLikeKeys(value, inherited) {
      var isArr = isArray2(value), isArg = !isArr && isArguments(value), isBuff = !isArr && !isArg && isBuffer(value), isType = !isArr && !isArg && !isBuff && isTypedArray(value), skipIndexes = isArr || isArg || isBuff || isType, result = skipIndexes ? baseTimes(value.length, String) : [], length = result.length;
      for (var key in value) {
        if ((inherited || hasOwnProperty.call(value, key)) && !(skipIndexes && // Safari 9 has enumerable `arguments.length` in strict mode.
        (key == "length" || // Node.js 0.10 has enumerable non-index properties on buffers.
        isBuff && (key == "offset" || key == "parent") || // PhantomJS 2 has enumerable non-index properties on typed arrays.
        isType && (key == "buffer" || key == "byteLength" || key == "byteOffset") || // Skip index properties.
        isIndex(key, length)))) {
          result.push(key);
        }
      }
      return result;
    }
    function assignMergeValue(object, key, value) {
      if (value !== void 0 && !eq(object[key], value) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assignValue(object, key, value) {
      var objValue = object[key];
      if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) || value === void 0 && !(key in object)) {
        baseAssignValue(object, key, value);
      }
    }
    function assocIndexOf(array, key) {
      var length = array.length;
      while (length--) {
        if (eq(array[length][0], key)) {
          return length;
        }
      }
      return -1;
    }
    function baseAssignValue(object, key, value) {
      if (key == "__proto__" && defineProperty) {
        defineProperty(object, key, {
          "configurable": true,
          "enumerable": true,
          "value": value,
          "writable": true
        });
      } else {
        object[key] = value;
      }
    }
    var baseFor = createBaseFor();
    function baseGetTag(value) {
      if (value == null) {
        return value === void 0 ? undefinedTag : nullTag;
      }
      return symToStringTag && symToStringTag in Object(value) ? getRawTag(value) : objectToString(value);
    }
    function baseIsArguments(value) {
      return isObjectLike(value) && baseGetTag(value) == argsTag;
    }
    function baseIsNative(value) {
      if (!isObject2(value) || isMasked(value)) {
        return false;
      }
      var pattern = isFunction2(value) ? reIsNative : reIsHostCtor;
      return pattern.test(toSource(value));
    }
    function baseIsTypedArray(value) {
      return isObjectLike(value) && isLength(value.length) && !!typedArrayTags[baseGetTag(value)];
    }
    function baseKeysIn(object) {
      if (!isObject2(object)) {
        return nativeKeysIn(object);
      }
      var isProto = isPrototype(object), result = [];
      for (var key in object) {
        if (!(key == "constructor" && (isProto || !hasOwnProperty.call(object, key)))) {
          result.push(key);
        }
      }
      return result;
    }
    function baseMerge(object, source, srcIndex, customizer, stack) {
      if (object === source) {
        return;
      }
      baseFor(source, function(srcValue, key) {
        stack || (stack = new Stack2());
        if (isObject2(srcValue)) {
          baseMergeDeep(object, source, key, srcIndex, baseMerge, customizer, stack);
        } else {
          var newValue = customizer ? customizer(safeGet(object, key), srcValue, key + "", object, source, stack) : void 0;
          if (newValue === void 0) {
            newValue = srcValue;
          }
          assignMergeValue(object, key, newValue);
        }
      }, keysIn);
    }
    function baseMergeDeep(object, source, key, srcIndex, mergeFunc, customizer, stack) {
      var objValue = safeGet(object, key), srcValue = safeGet(source, key), stacked = stack.get(srcValue);
      if (stacked) {
        assignMergeValue(object, key, stacked);
        return;
      }
      var newValue = customizer ? customizer(objValue, srcValue, key + "", object, source, stack) : void 0;
      var isCommon = newValue === void 0;
      if (isCommon) {
        var isArr = isArray2(srcValue), isBuff = !isArr && isBuffer(srcValue), isTyped = !isArr && !isBuff && isTypedArray(srcValue);
        newValue = srcValue;
        if (isArr || isBuff || isTyped) {
          if (isArray2(objValue)) {
            newValue = objValue;
          } else if (isArrayLikeObject(objValue)) {
            newValue = copyArray(objValue);
          } else if (isBuff) {
            isCommon = false;
            newValue = cloneBuffer(srcValue, true);
          } else if (isTyped) {
            isCommon = false;
            newValue = cloneTypedArray(srcValue, true);
          } else {
            newValue = [];
          }
        } else if (isPlainObject(srcValue) || isArguments(srcValue)) {
          newValue = objValue;
          if (isArguments(objValue)) {
            newValue = toPlainObject(objValue);
          } else if (!isObject2(objValue) || isFunction2(objValue)) {
            newValue = initCloneObject(srcValue);
          }
        } else {
          isCommon = false;
        }
      }
      if (isCommon) {
        stack.set(srcValue, newValue);
        mergeFunc(newValue, srcValue, srcIndex, customizer, stack);
        stack["delete"](srcValue);
      }
      assignMergeValue(object, key, newValue);
    }
    function baseRest(func, start) {
      return setToString(overRest(func, start, identity), func + "");
    }
    var baseSetToString = !defineProperty ? identity : function(func, string) {
      return defineProperty(func, "toString", {
        "configurable": true,
        "enumerable": false,
        "value": constant(string),
        "writable": true
      });
    };
    function cloneBuffer(buffer, isDeep) {
      if (isDeep) {
        return buffer.slice();
      }
      var length = buffer.length, result = allocUnsafe ? allocUnsafe(length) : new buffer.constructor(length);
      buffer.copy(result);
      return result;
    }
    function cloneArrayBuffer(arrayBuffer) {
      var result = new arrayBuffer.constructor(arrayBuffer.byteLength);
      new Uint8Array(result).set(new Uint8Array(arrayBuffer));
      return result;
    }
    function cloneTypedArray(typedArray, isDeep) {
      var buffer = isDeep ? cloneArrayBuffer(typedArray.buffer) : typedArray.buffer;
      return new typedArray.constructor(buffer, typedArray.byteOffset, typedArray.length);
    }
    function copyArray(source, array) {
      var index = -1, length = source.length;
      array || (array = Array(length));
      while (++index < length) {
        array[index] = source[index];
      }
      return array;
    }
    function copyObject(source, props, object, customizer) {
      var isNew = !object;
      object || (object = {});
      var index = -1, length = props.length;
      while (++index < length) {
        var key = props[index];
        var newValue = customizer ? customizer(object[key], source[key], key, object, source) : void 0;
        if (newValue === void 0) {
          newValue = source[key];
        }
        if (isNew) {
          baseAssignValue(object, key, newValue);
        } else {
          assignValue(object, key, newValue);
        }
      }
      return object;
    }
    function createAssigner(assigner) {
      return baseRest(function(object, sources) {
        var index = -1, length = sources.length, customizer = length > 1 ? sources[length - 1] : void 0, guard = length > 2 ? sources[2] : void 0;
        customizer = assigner.length > 3 && typeof customizer == "function" ? (length--, customizer) : void 0;
        if (guard && isIterateeCall(sources[0], sources[1], guard)) {
          customizer = length < 3 ? void 0 : customizer;
          length = 1;
        }
        object = Object(object);
        while (++index < length) {
          var source = sources[index];
          if (source) {
            assigner(object, source, index, customizer);
          }
        }
        return object;
      });
    }
    function createBaseFor(fromRight) {
      return function(object, iteratee, keysFunc) {
        var index = -1, iterable = Object(object), props = keysFunc(object), length = props.length;
        while (length--) {
          var key = props[fromRight ? length : ++index];
          if (iteratee(iterable[key], key, iterable) === false) {
            break;
          }
        }
        return object;
      };
    }
    function getMapData(map, key) {
      var data = map.__data__;
      return isKeyable(key) ? data[typeof key == "string" ? "string" : "hash"] : data.map;
    }
    function getNative(object, key) {
      var value = getValue(object, key);
      return baseIsNative(value) ? value : void 0;
    }
    function getRawTag(value) {
      var isOwn = hasOwnProperty.call(value, symToStringTag), tag = value[symToStringTag];
      try {
        value[symToStringTag] = void 0;
        var unmasked = true;
      } catch (e) {
      }
      var result = nativeObjectToString.call(value);
      if (unmasked) {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }
    function initCloneObject(object) {
      return typeof object.constructor == "function" && !isPrototype(object) ? baseCreate(getPrototype(object)) : {};
    }
    function isIndex(value, length) {
      var type = typeof value;
      length = length == null ? MAX_SAFE_INTEGER : length;
      return !!length && (type == "number" || type != "symbol" && reIsUint.test(value)) && (value > -1 && value % 1 == 0 && value < length);
    }
    function isIterateeCall(value, index, object) {
      if (!isObject2(object)) {
        return false;
      }
      var type = typeof index;
      if (type == "number" ? isArrayLike(object) && isIndex(index, object.length) : type == "string" && index in object) {
        return eq(object[index], value);
      }
      return false;
    }
    function isKeyable(value) {
      var type = typeof value;
      return type == "string" || type == "number" || type == "symbol" || type == "boolean" ? value !== "__proto__" : value === null;
    }
    function isMasked(func) {
      return !!maskSrcKey && maskSrcKey in func;
    }
    function isPrototype(value) {
      var Ctor = value && value.constructor, proto = typeof Ctor == "function" && Ctor.prototype || objectProto;
      return value === proto;
    }
    function nativeKeysIn(object) {
      var result = [];
      if (object != null) {
        for (var key in Object(object)) {
          result.push(key);
        }
      }
      return result;
    }
    function objectToString(value) {
      return nativeObjectToString.call(value);
    }
    function overRest(func, start, transform) {
      start = nativeMax(start === void 0 ? func.length - 1 : start, 0);
      return function() {
        var args = arguments, index = -1, length = nativeMax(args.length - start, 0), array = Array(length);
        while (++index < length) {
          array[index] = args[start + index];
        }
        index = -1;
        var otherArgs = Array(start + 1);
        while (++index < start) {
          otherArgs[index] = args[index];
        }
        otherArgs[start] = transform(array);
        return apply(func, this, otherArgs);
      };
    }
    function safeGet(object, key) {
      if (key === "constructor" && typeof object[key] === "function") {
        return;
      }
      if (key == "__proto__") {
        return;
      }
      return object[key];
    }
    var setToString = shortOut(baseSetToString);
    function shortOut(func) {
      var count = 0, lastCalled = 0;
      return function() {
        var stamp = nativeNow(), remaining = HOT_SPAN - (stamp - lastCalled);
        lastCalled = stamp;
        if (remaining > 0) {
          if (++count >= HOT_COUNT) {
            return arguments[0];
          }
        } else {
          count = 0;
        }
        return func.apply(void 0, arguments);
      };
    }
    function toSource(func) {
      if (func != null) {
        try {
          return funcToString.call(func);
        } catch (e) {
        }
        try {
          return func + "";
        } catch (e) {
        }
      }
      return "";
    }
    function eq(value, other) {
      return value === other || value !== value && other !== other;
    }
    var isArguments = baseIsArguments(function() {
      return arguments;
    }()) ? baseIsArguments : function(value) {
      return isObjectLike(value) && hasOwnProperty.call(value, "callee") && !propertyIsEnumerable.call(value, "callee");
    };
    var isArray2 = Array.isArray;
    function isArrayLike(value) {
      return value != null && isLength(value.length) && !isFunction2(value);
    }
    function isArrayLikeObject(value) {
      return isObjectLike(value) && isArrayLike(value);
    }
    var isBuffer = nativeIsBuffer || stubFalse;
    function isFunction2(value) {
      if (!isObject2(value)) {
        return false;
      }
      var tag = baseGetTag(value);
      return tag == funcTag || tag == genTag || tag == asyncTag || tag == proxyTag;
    }
    function isLength(value) {
      return typeof value == "number" && value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
    }
    function isObject2(value) {
      var type = typeof value;
      return value != null && (type == "object" || type == "function");
    }
    function isObjectLike(value) {
      return value != null && typeof value == "object";
    }
    function isPlainObject(value) {
      if (!isObjectLike(value) || baseGetTag(value) != objectTag) {
        return false;
      }
      var proto = getPrototype(value);
      if (proto === null) {
        return true;
      }
      var Ctor = hasOwnProperty.call(proto, "constructor") && proto.constructor;
      return typeof Ctor == "function" && Ctor instanceof Ctor && funcToString.call(Ctor) == objectCtorString;
    }
    var isTypedArray = nodeIsTypedArray ? baseUnary(nodeIsTypedArray) : baseIsTypedArray;
    function toPlainObject(value) {
      return copyObject(value, keysIn(value));
    }
    function keysIn(object) {
      return isArrayLike(object) ? arrayLikeKeys(object, true) : baseKeysIn(object);
    }
    var merge2 = createAssigner(function(object, source, srcIndex) {
      baseMerge(object, source, srcIndex);
    });
    function constant(value) {
      return function() {
        return value;
      };
    }
    function identity(value) {
      return value;
    }
    function stubFalse() {
      return false;
    }
    module.exports = merge2;
  })(lodash_merge, lodash_merge.exports);
  var lodash_mergeExports = lodash_merge.exports;
  const merge = /* @__PURE__ */ getDefaultExportFromCjs(lodash_mergeExports);
  var noop$1 = () => {
  };
  var noopTransition = (el, done) => done();
  function createSwitchTransition(source, options) {
    const initSource = untrack(source);
    const initReturned = initSource ? [initSource] : [];
    const { onEnter = noopTransition, onExit = noopTransition } = options;
    const [returned, setReturned] = createSignal(
      options.appear ? [] : initReturned
    );
    const [isTransitionPending] = useTransition();
    let next;
    let isExiting = false;
    function exitTransition2(el, after) {
      if (!el)
        return after && after();
      isExiting = true;
      onExit(el, () => {
        batch(() => {
          isExiting = false;
          setReturned((p2) => p2.filter((e) => e !== el));
          after && after();
        });
      });
    }
    function enterTransition2(after) {
      const el = next;
      if (!el)
        return after && after();
      next = void 0;
      setReturned((p2) => [el, ...p2]);
      onEnter(el, after != null ? after : noop$1);
    }
    const triggerTransitions = options.mode === "out-in" ? (
      // exit -> enter
      (prev) => isExiting || exitTransition2(prev, enterTransition2)
    ) : options.mode === "in-out" ? (
      // enter -> exit
      (prev) => enterTransition2(() => exitTransition2(prev))
    ) : (
      // exit & enter
      (prev) => {
        exitTransition2(prev);
        enterTransition2();
      }
    );
    createComputed(
      (prev) => {
        const el = source();
        if (untrack(isTransitionPending)) {
          isTransitionPending();
          return prev;
        }
        if (el !== prev) {
          next = el;
          batch(() => untrack(() => triggerTransitions(prev)));
        }
        return el;
      },
      options.appear ? void 0 : initSource
    );
    return returned;
  }
  var defaultElementPredicate = (item) => item instanceof Element;
  function getFirstChild(value, predicate) {
    if (predicate(value))
      return value;
    if (typeof value === "function" && !value.length)
      return getFirstChild(value(), predicate);
    if (Array.isArray(value)) {
      for (const item of value) {
        const result = getFirstChild(item, predicate);
        if (result)
          return result;
      }
    }
    return null;
  }
  function resolveFirst(fn, predicate = defaultElementPredicate, serverPredicate = defaultElementPredicate) {
    const children2 = createMemo(fn);
    return createMemo(() => getFirstChild(children2(), predicate));
  }
  function createClassnames(props) {
    return createMemo(() => {
      const name = props.name || "s";
      return {
        enterActive: (props.enterActiveClass || name + "-enter-active").split(" "),
        enter: (props.enterClass || name + "-enter").split(" "),
        enterTo: (props.enterToClass || name + "-enter-to").split(" "),
        exitActive: (props.exitActiveClass || name + "-exit-active").split(" "),
        exit: (props.exitClass || name + "-exit").split(" "),
        exitTo: (props.exitToClass || name + "-exit-to").split(" "),
        move: (props.moveClass || name + "-move").split(" ")
      };
    });
  }
  function nextFrame(fn) {
    requestAnimationFrame(() => requestAnimationFrame(fn));
  }
  function enterTransition(classes, events, el, done) {
    const { onBeforeEnter, onEnter, onAfterEnter } = events;
    onBeforeEnter == null ? void 0 : onBeforeEnter(el);
    el.classList.add(...classes.enter);
    el.classList.add(...classes.enterActive);
    queueMicrotask(() => {
      if (!el.parentNode)
        return done == null ? void 0 : done();
      onEnter == null ? void 0 : onEnter(el, () => endTransition());
    });
    nextFrame(() => {
      el.classList.remove(...classes.enter);
      el.classList.add(...classes.enterTo);
      if (!onEnter || onEnter.length < 2) {
        el.addEventListener("transitionend", endTransition);
        el.addEventListener("animationend", endTransition);
      }
    });
    function endTransition(e) {
      if (!e || e.target === el) {
        done == null ? void 0 : done();
        el.removeEventListener("transitionend", endTransition);
        el.removeEventListener("animationend", endTransition);
        el.classList.remove(...classes.enterActive);
        el.classList.remove(...classes.enterTo);
        onAfterEnter == null ? void 0 : onAfterEnter(el);
      }
    }
  }
  function exitTransition(classes, events, el, done) {
    const { onBeforeExit, onExit, onAfterExit } = events;
    if (!el.parentNode)
      return done == null ? void 0 : done();
    onBeforeExit == null ? void 0 : onBeforeExit(el);
    el.classList.add(...classes.exit);
    el.classList.add(...classes.exitActive);
    onExit == null ? void 0 : onExit(el, () => endTransition());
    nextFrame(() => {
      el.classList.remove(...classes.exit);
      el.classList.add(...classes.exitTo);
      if (!onExit || onExit.length < 2) {
        el.addEventListener("transitionend", endTransition);
        el.addEventListener("animationend", endTransition);
      }
    });
    function endTransition(e) {
      if (!e || e.target === el) {
        done == null ? void 0 : done();
        el.removeEventListener("transitionend", endTransition);
        el.removeEventListener("animationend", endTransition);
        el.classList.remove(...classes.exitActive);
        el.classList.remove(...classes.exitTo);
        onAfterExit == null ? void 0 : onAfterExit(el);
      }
    }
  }
  var TRANSITION_MODE_MAP = {
    inout: "in-out",
    outin: "out-in"
  };
  var Transition = (props) => {
    const classnames = createClassnames(props);
    return createSwitchTransition(
      resolveFirst(() => props.children),
      {
        mode: TRANSITION_MODE_MAP[props.mode],
        appear: props.appear,
        onEnter(el, done) {
          enterTransition(classnames(), props, el, done);
        },
        onExit(el, done) {
          exitTransition(classnames(), props, el, done);
        }
      }
    );
  };
  /*!
  * tabbable 5.3.3
  * @license MIT, https://github.com/focus-trap/tabbable/blob/master/LICENSE
  */
  var candidateSelectors = ["input", "select", "textarea", "a[href]", "button", "[tabindex]:not(slot)", "audio[controls]", "video[controls]", '[contenteditable]:not([contenteditable="false"])', "details>summary:first-of-type", "details"];
  var candidateSelector = /* @__PURE__ */ candidateSelectors.join(",");
  var NoElement = typeof Element === "undefined";
  var matches = NoElement ? function() {
  } : Element.prototype.matches || Element.prototype.msMatchesSelector || Element.prototype.webkitMatchesSelector;
  var getRootNode = !NoElement && Element.prototype.getRootNode ? function(element) {
    return element.getRootNode();
  } : function(element) {
    return element.ownerDocument;
  };
  var getCandidates = function getCandidates2(el, includeContainer, filter) {
    var candidates = Array.prototype.slice.apply(el.querySelectorAll(candidateSelector));
    if (includeContainer && matches.call(el, candidateSelector)) {
      candidates.unshift(el);
    }
    candidates = candidates.filter(filter);
    return candidates;
  };
  var getCandidatesIteratively = function getCandidatesIteratively2(elements, includeContainer, options) {
    var candidates = [];
    var elementsToCheck = Array.from(elements);
    while (elementsToCheck.length) {
      var element = elementsToCheck.shift();
      if (element.tagName === "SLOT") {
        var assigned = element.assignedElements();
        var content = assigned.length ? assigned : element.children;
        var nestedCandidates = getCandidatesIteratively2(content, true, options);
        if (options.flatten) {
          candidates.push.apply(candidates, nestedCandidates);
        } else {
          candidates.push({
            scope: element,
            candidates: nestedCandidates
          });
        }
      } else {
        var validCandidate = matches.call(element, candidateSelector);
        if (validCandidate && options.filter(element) && (includeContainer || !elements.includes(element))) {
          candidates.push(element);
        }
        var shadowRoot = element.shadowRoot || // check for an undisclosed shadow
        typeof options.getShadowRoot === "function" && options.getShadowRoot(element);
        var validShadowRoot = !options.shadowRootFilter || options.shadowRootFilter(element);
        if (shadowRoot && validShadowRoot) {
          var _nestedCandidates = getCandidatesIteratively2(shadowRoot === true ? element.children : shadowRoot.children, true, options);
          if (options.flatten) {
            candidates.push.apply(candidates, _nestedCandidates);
          } else {
            candidates.push({
              scope: element,
              candidates: _nestedCandidates
            });
          }
        } else {
          elementsToCheck.unshift.apply(elementsToCheck, element.children);
        }
      }
    }
    return candidates;
  };
  var getTabindex = function getTabindex2(node, isScope) {
    if (node.tabIndex < 0) {
      if ((isScope || /^(AUDIO|VIDEO|DETAILS)$/.test(node.tagName) || node.isContentEditable) && isNaN(parseInt(node.getAttribute("tabindex"), 10))) {
        return 0;
      }
    }
    return node.tabIndex;
  };
  var sortOrderedTabbables = function sortOrderedTabbables2(a2, b2) {
    return a2.tabIndex === b2.tabIndex ? a2.documentOrder - b2.documentOrder : a2.tabIndex - b2.tabIndex;
  };
  var isInput = function isInput2(node) {
    return node.tagName === "INPUT";
  };
  var isHiddenInput = function isHiddenInput2(node) {
    return isInput(node) && node.type === "hidden";
  };
  var isDetailsWithSummary = function isDetailsWithSummary2(node) {
    var r2 = node.tagName === "DETAILS" && Array.prototype.slice.apply(node.children).some(function(child) {
      return child.tagName === "SUMMARY";
    });
    return r2;
  };
  var getCheckedRadio = function getCheckedRadio2(nodes, form) {
    for (var i2 = 0; i2 < nodes.length; i2++) {
      if (nodes[i2].checked && nodes[i2].form === form) {
        return nodes[i2];
      }
    }
  };
  var isTabbableRadio = function isTabbableRadio2(node) {
    if (!node.name) {
      return true;
    }
    var radioScope = node.form || getRootNode(node);
    var queryRadios = function queryRadios2(name) {
      return radioScope.querySelectorAll('input[type="radio"][name="' + name + '"]');
    };
    var radioSet;
    if (typeof window !== "undefined" && typeof window.CSS !== "undefined" && typeof window.CSS.escape === "function") {
      radioSet = queryRadios(window.CSS.escape(node.name));
    } else {
      try {
        radioSet = queryRadios(node.name);
      } catch (err) {
        console.error("Looks like you have a radio button with a name attribute containing invalid CSS selector characters and need the CSS.escape polyfill: %s", err.message);
        return false;
      }
    }
    var checked = getCheckedRadio(radioSet, node.form);
    return !checked || checked === node;
  };
  var isRadio = function isRadio2(node) {
    return isInput(node) && node.type === "radio";
  };
  var isNonTabbableRadio = function isNonTabbableRadio2(node) {
    return isRadio(node) && !isTabbableRadio(node);
  };
  var isZeroArea = function isZeroArea2(node) {
    var _node$getBoundingClie = node.getBoundingClientRect(), width = _node$getBoundingClie.width, height = _node$getBoundingClie.height;
    return width === 0 && height === 0;
  };
  var isHidden = function isHidden2(node, _ref) {
    var displayCheck = _ref.displayCheck, getShadowRoot = _ref.getShadowRoot;
    if (getComputedStyle(node).visibility === "hidden") {
      return true;
    }
    var isDirectSummary = matches.call(node, "details>summary:first-of-type");
    var nodeUnderDetails = isDirectSummary ? node.parentElement : node;
    if (matches.call(nodeUnderDetails, "details:not([open]) *")) {
      return true;
    }
    var nodeRootHost = getRootNode(node).host;
    var nodeIsAttached = (nodeRootHost === null || nodeRootHost === void 0 ? void 0 : nodeRootHost.ownerDocument.contains(nodeRootHost)) || node.ownerDocument.contains(node);
    if (!displayCheck || displayCheck === "full") {
      if (typeof getShadowRoot === "function") {
        var originalNode = node;
        while (node) {
          var parentElement = node.parentElement;
          var rootNode = getRootNode(node);
          if (parentElement && !parentElement.shadowRoot && getShadowRoot(parentElement) === true) {
            return isZeroArea(node);
          } else if (node.assignedSlot) {
            node = node.assignedSlot;
          } else if (!parentElement && rootNode !== node.ownerDocument) {
            node = rootNode.host;
          } else {
            node = parentElement;
          }
        }
        node = originalNode;
      }
      if (nodeIsAttached) {
        return !node.getClientRects().length;
      }
    } else if (displayCheck === "non-zero-area") {
      return isZeroArea(node);
    }
    return false;
  };
  var isDisabledFromFieldset = function isDisabledFromFieldset2(node) {
    if (/^(INPUT|BUTTON|SELECT|TEXTAREA)$/.test(node.tagName)) {
      var parentNode = node.parentElement;
      while (parentNode) {
        if (parentNode.tagName === "FIELDSET" && parentNode.disabled) {
          for (var i2 = 0; i2 < parentNode.children.length; i2++) {
            var child = parentNode.children.item(i2);
            if (child.tagName === "LEGEND") {
              return matches.call(parentNode, "fieldset[disabled] *") ? true : !child.contains(node);
            }
          }
          return true;
        }
        parentNode = parentNode.parentElement;
      }
    }
    return false;
  };
  var isNodeMatchingSelectorFocusable = function isNodeMatchingSelectorFocusable2(options, node) {
    if (node.disabled || isHiddenInput(node) || isHidden(node, options) || // For a details element with a summary, the summary element gets the focus
    isDetailsWithSummary(node) || isDisabledFromFieldset(node)) {
      return false;
    }
    return true;
  };
  var isNodeMatchingSelectorTabbable = function isNodeMatchingSelectorTabbable2(options, node) {
    if (isNonTabbableRadio(node) || getTabindex(node) < 0 || !isNodeMatchingSelectorFocusable(options, node)) {
      return false;
    }
    return true;
  };
  var isValidShadowRootTabbable = function isValidShadowRootTabbable2(shadowHostNode) {
    var tabIndex = parseInt(shadowHostNode.getAttribute("tabindex"), 10);
    if (isNaN(tabIndex) || tabIndex >= 0) {
      return true;
    }
    return false;
  };
  var sortByOrder = function sortByOrder2(candidates) {
    var regularTabbables = [];
    var orderedTabbables = [];
    candidates.forEach(function(item, i2) {
      var isScope = !!item.scope;
      var element = isScope ? item.scope : item;
      var candidateTabindex = getTabindex(element, isScope);
      var elements = isScope ? sortByOrder2(item.candidates) : element;
      if (candidateTabindex === 0) {
        isScope ? regularTabbables.push.apply(regularTabbables, elements) : regularTabbables.push(element);
      } else {
        orderedTabbables.push({
          documentOrder: i2,
          tabIndex: candidateTabindex,
          item,
          isScope,
          content: elements
        });
      }
    });
    return orderedTabbables.sort(sortOrderedTabbables).reduce(function(acc, sortable) {
      sortable.isScope ? acc.push.apply(acc, sortable.content) : acc.push(sortable.content);
      return acc;
    }, []).concat(regularTabbables);
  };
  var tabbable = function tabbable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorTabbable.bind(null, options),
        flatten: false,
        getShadowRoot: options.getShadowRoot,
        shadowRootFilter: isValidShadowRootTabbable
      });
    } else {
      candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorTabbable.bind(null, options));
    }
    return sortByOrder(candidates);
  };
  var focusable = function focusable2(el, options) {
    options = options || {};
    var candidates;
    if (options.getShadowRoot) {
      candidates = getCandidatesIteratively([el], options.includeContainer, {
        filter: isNodeMatchingSelectorFocusable.bind(null, options),
        flatten: true,
        getShadowRoot: options.getShadowRoot
      });
    } else {
      candidates = getCandidates(el, options.includeContainer, isNodeMatchingSelectorFocusable.bind(null, options));
    }
    return candidates;
  };
  var isTabbable = function isTabbable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, candidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorTabbable(options, node);
  };
  var focusableCandidateSelector = /* @__PURE__ */ candidateSelectors.concat("iframe").join(",");
  var isFocusable = function isFocusable2(node, options) {
    options = options || {};
    if (!node) {
      throw new Error("No node provided");
    }
    if (matches.call(node, focusableCandidateSelector) === false) {
      return false;
    }
    return isNodeMatchingSelectorFocusable(options, node);
  };
  /*!
  * focus-trap 6.7.3
  * @license MIT, https://github.com/focus-trap/focus-trap/blob/master/LICENSE
  */
  function ownKeys(object, enumerableOnly) {
    var keys = Object.keys(object);
    if (Object.getOwnPropertySymbols) {
      var symbols = Object.getOwnPropertySymbols(object);
      enumerableOnly && (symbols = symbols.filter(function(sym) {
        return Object.getOwnPropertyDescriptor(object, sym).enumerable;
      })), keys.push.apply(keys, symbols);
    }
    return keys;
  }
  function _objectSpread2(target) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      var source = null != arguments[i2] ? arguments[i2] : {};
      i2 % 2 ? ownKeys(Object(source), true).forEach(function(key) {
        _defineProperty(target, key, source[key]);
      }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(target, Object.getOwnPropertyDescriptors(source)) : ownKeys(Object(source)).forEach(function(key) {
        Object.defineProperty(target, key, Object.getOwnPropertyDescriptor(source, key));
      });
    }
    return target;
  }
  function _defineProperty(obj, key, value) {
    if (key in obj) {
      Object.defineProperty(obj, key, {
        value,
        enumerable: true,
        configurable: true,
        writable: true
      });
    } else {
      obj[key] = value;
    }
    return obj;
  }
  var activeFocusTraps = function() {
    var trapQueue = [];
    return {
      activateTrap: function activateTrap(trap) {
        if (trapQueue.length > 0) {
          var activeTrap = trapQueue[trapQueue.length - 1];
          if (activeTrap !== trap) {
            activeTrap.pause();
          }
        }
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex === -1) {
          trapQueue.push(trap);
        } else {
          trapQueue.splice(trapIndex, 1);
          trapQueue.push(trap);
        }
      },
      deactivateTrap: function deactivateTrap(trap) {
        var trapIndex = trapQueue.indexOf(trap);
        if (trapIndex !== -1) {
          trapQueue.splice(trapIndex, 1);
        }
        if (trapQueue.length > 0) {
          trapQueue[trapQueue.length - 1].unpause();
        }
      }
    };
  }();
  var isSelectableInput = function isSelectableInput2(node) {
    return node.tagName && node.tagName.toLowerCase() === "input" && typeof node.select === "function";
  };
  var isEscapeEvent = function isEscapeEvent2(e) {
    return e.key === "Escape" || e.key === "Esc" || e.keyCode === 27;
  };
  var isTabEvent = function isTabEvent2(e) {
    return e.key === "Tab" || e.keyCode === 9;
  };
  var delay = function delay2(fn) {
    return setTimeout(fn, 0);
  };
  var findIndex = function findIndex2(arr, fn) {
    var idx = -1;
    arr.every(function(value, i2) {
      if (fn(value)) {
        idx = i2;
        return false;
      }
      return true;
    });
    return idx;
  };
  var valueOrHandler = function valueOrHandler2(value) {
    for (var _len = arguments.length, params = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      params[_key - 1] = arguments[_key];
    }
    return typeof value === "function" ? value.apply(void 0, params) : value;
  };
  var getActualTarget = function getActualTarget2(event) {
    return event.target.shadowRoot && typeof event.composedPath === "function" ? event.composedPath()[0] : event.target;
  };
  var createFocusTrap = function createFocusTrap2(elements, userOptions) {
    var doc = (userOptions === null || userOptions === void 0 ? void 0 : userOptions.document) || document;
    var config2 = _objectSpread2({
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      delayInitialFocus: true
    }, userOptions);
    var state = {
      // @type {Array<HTMLElement>}
      containers: [],
      // list of objects identifying the first and last tabbable nodes in all containers/groups in
      //  the trap
      // NOTE: it's possible that a group has no tabbable nodes if nodes get removed while the trap
      //  is active, but the trap should never get to a state where there isn't at least one group
      //  with at least one tabbable node in it (that would lead to an error condition that would
      //  result in an error being thrown)
      // @type {Array<{
      //   container: HTMLElement,
      //   firstTabbableNode: HTMLElement|null,
      //   lastTabbableNode: HTMLElement|null,
      //   nextTabbableNode: (node: HTMLElement, forward: boolean) => HTMLElement|undefined
      // }>}
      tabbableGroups: [],
      nodeFocusedBeforeActivation: null,
      mostRecentlyFocusedNode: null,
      active: false,
      paused: false,
      // timer ID for when delayInitialFocus is true and initial focus in this trap
      //  has been delayed during activation
      delayInitialFocusTimer: void 0
    };
    var trap;
    var getOption = function getOption2(configOverrideOptions, optionName, configOptionName) {
      return configOverrideOptions && configOverrideOptions[optionName] !== void 0 ? configOverrideOptions[optionName] : config2[configOptionName || optionName];
    };
    var containersContain = function containersContain2(element) {
      return !!(element && state.containers.some(function(container) {
        return container.contains(element);
      }));
    };
    var getNodeForOption = function getNodeForOption2(optionName) {
      var optionValue = config2[optionName];
      if (typeof optionValue === "function") {
        for (var _len2 = arguments.length, params = new Array(_len2 > 1 ? _len2 - 1 : 0), _key2 = 1; _key2 < _len2; _key2++) {
          params[_key2 - 1] = arguments[_key2];
        }
        optionValue = optionValue.apply(void 0, params);
      }
      if (!optionValue) {
        if (optionValue === void 0 || optionValue === false) {
          return optionValue;
        }
        throw new Error("`".concat(optionName, "` was specified but was not a node, or did not return a node"));
      }
      var node = optionValue;
      if (typeof optionValue === "string") {
        node = doc.querySelector(optionValue);
        if (!node) {
          throw new Error("`".concat(optionName, "` as selector refers to no known node"));
        }
      }
      return node;
    };
    var getInitialFocusNode = function getInitialFocusNode2() {
      var node = getNodeForOption("initialFocus");
      if (node === false) {
        return false;
      }
      if (node === void 0) {
        if (containersContain(doc.activeElement)) {
          node = doc.activeElement;
        } else {
          var firstTabbableGroup = state.tabbableGroups[0];
          var firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode;
          node = firstTabbableNode || getNodeForOption("fallbackFocus");
        }
      }
      if (!node) {
        throw new Error("Your focus-trap needs to have at least one focusable element");
      }
      return node;
    };
    var updateTabbableNodes = function updateTabbableNodes2() {
      state.tabbableGroups = state.containers.map(function(container) {
        var tabbableNodes = tabbable(container);
        var focusableNodes = focusable(container);
        if (tabbableNodes.length > 0) {
          return {
            container,
            firstTabbableNode: tabbableNodes[0],
            lastTabbableNode: tabbableNodes[tabbableNodes.length - 1],
            /**
             * Finds the __tabbable__ node that follows the given node in the specified direction,
             *  in this container, if any.
             * @param {HTMLElement} node
             * @param {boolean} [forward] True if going in forward tab order; false if going
             *  in reverse.
             * @returns {HTMLElement|undefined} The next tabbable node, if any.
             */
            nextTabbableNode: function nextTabbableNode(node) {
              var forward = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : true;
              var nodeIdx = focusableNodes.findIndex(function(n2) {
                return n2 === node;
              });
              if (forward) {
                return focusableNodes.slice(nodeIdx + 1).find(function(n2) {
                  return isTabbable(n2);
                });
              }
              return focusableNodes.slice(0, nodeIdx).reverse().find(function(n2) {
                return isTabbable(n2);
              });
            }
          };
        }
        return void 0;
      }).filter(function(group) {
        return !!group;
      });
      if (state.tabbableGroups.length <= 0 && !getNodeForOption("fallbackFocus")) {
        throw new Error("Your focus-trap must have at least one container with at least one tabbable node in it at all times");
      }
    };
    var tryFocus = function tryFocus2(node) {
      if (node === false) {
        return;
      }
      if (node === doc.activeElement) {
        return;
      }
      if (!node || !node.focus) {
        tryFocus2(getInitialFocusNode());
        return;
      }
      node.focus({
        preventScroll: !!config2.preventScroll
      });
      state.mostRecentlyFocusedNode = node;
      if (isSelectableInput(node)) {
        node.select();
      }
    };
    var getReturnFocusNode = function getReturnFocusNode2(previousActiveElement) {
      var node = getNodeForOption("setReturnFocus", previousActiveElement);
      return node ? node : node === false ? false : previousActiveElement;
    };
    var checkPointerDown = function checkPointerDown2(e) {
      var target = getActualTarget(e);
      if (containersContain(target)) {
        return;
      }
      if (valueOrHandler(config2.clickOutsideDeactivates, e)) {
        trap.deactivate({
          // if, on deactivation, we should return focus to the node originally-focused
          //  when the trap was activated (or the configured `setReturnFocus` node),
          //  then assume it's also OK to return focus to the outside node that was
          //  just clicked, causing deactivation, as long as that node is focusable;
          //  if it isn't focusable, then return focus to the original node focused
          //  on activation (or the configured `setReturnFocus` node)
          // NOTE: by setting `returnFocus: false`, deactivate() will do nothing,
          //  which will result in the outside click setting focus to the node
          //  that was clicked, whether it's focusable or not; by setting
          //  `returnFocus: true`, we'll attempt to re-focus the node originally-focused
          //  on activation (or the configured `setReturnFocus` node)
          returnFocus: config2.returnFocusOnDeactivate && !isFocusable(target)
        });
        return;
      }
      if (valueOrHandler(config2.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
    };
    var checkFocusIn = function checkFocusIn2(e) {
      var target = getActualTarget(e);
      var targetContained = containersContain(target);
      if (targetContained || target instanceof Document) {
        if (targetContained) {
          state.mostRecentlyFocusedNode = target;
        }
      } else {
        e.stopImmediatePropagation();
        tryFocus(state.mostRecentlyFocusedNode || getInitialFocusNode());
      }
    };
    var checkTab = function checkTab2(e) {
      var target = getActualTarget(e);
      updateTabbableNodes();
      var destinationNode = null;
      if (state.tabbableGroups.length > 0) {
        var containerIndex = findIndex(state.tabbableGroups, function(_ref) {
          var container = _ref.container;
          return container.contains(target);
        });
        var containerGroup = containerIndex >= 0 ? state.tabbableGroups[containerIndex] : void 0;
        if (containerIndex < 0) {
          if (e.shiftKey) {
            destinationNode = state.tabbableGroups[state.tabbableGroups.length - 1].lastTabbableNode;
          } else {
            destinationNode = state.tabbableGroups[0].firstTabbableNode;
          }
        } else if (e.shiftKey) {
          var startOfGroupIndex = findIndex(state.tabbableGroups, function(_ref2) {
            var firstTabbableNode = _ref2.firstTabbableNode;
            return target === firstTabbableNode;
          });
          if (startOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target) && !isTabbable(target) && !containerGroup.nextTabbableNode(target, false))) {
            startOfGroupIndex = containerIndex;
          }
          if (startOfGroupIndex >= 0) {
            var destinationGroupIndex = startOfGroupIndex === 0 ? state.tabbableGroups.length - 1 : startOfGroupIndex - 1;
            var destinationGroup = state.tabbableGroups[destinationGroupIndex];
            destinationNode = destinationGroup.lastTabbableNode;
          }
        } else {
          var lastOfGroupIndex = findIndex(state.tabbableGroups, function(_ref3) {
            var lastTabbableNode = _ref3.lastTabbableNode;
            return target === lastTabbableNode;
          });
          if (lastOfGroupIndex < 0 && (containerGroup.container === target || isFocusable(target) && !isTabbable(target) && !containerGroup.nextTabbableNode(target))) {
            lastOfGroupIndex = containerIndex;
          }
          if (lastOfGroupIndex >= 0) {
            var _destinationGroupIndex = lastOfGroupIndex === state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1;
            var _destinationGroup = state.tabbableGroups[_destinationGroupIndex];
            destinationNode = _destinationGroup.firstTabbableNode;
          }
        }
      } else {
        destinationNode = getNodeForOption("fallbackFocus");
      }
      if (destinationNode) {
        e.preventDefault();
        tryFocus(destinationNode);
      }
    };
    var checkKey = function checkKey2(e) {
      if (isEscapeEvent(e) && valueOrHandler(config2.escapeDeactivates, e) !== false) {
        e.preventDefault();
        trap.deactivate();
        return;
      }
      if (isTabEvent(e)) {
        checkTab(e);
        return;
      }
    };
    var checkClick = function checkClick2(e) {
      if (valueOrHandler(config2.clickOutsideDeactivates, e)) {
        return;
      }
      var target = getActualTarget(e);
      if (containersContain(target)) {
        return;
      }
      if (valueOrHandler(config2.allowOutsideClick, e)) {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation();
    };
    var addListeners = function addListeners2() {
      if (!state.active) {
        return;
      }
      activeFocusTraps.activateTrap(trap);
      state.delayInitialFocusTimer = config2.delayInitialFocus ? delay(function() {
        tryFocus(getInitialFocusNode());
      }) : tryFocus(getInitialFocusNode());
      doc.addEventListener("focusin", checkFocusIn, true);
      doc.addEventListener("mousedown", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc.addEventListener("touchstart", checkPointerDown, {
        capture: true,
        passive: false
      });
      doc.addEventListener("click", checkClick, {
        capture: true,
        passive: false
      });
      doc.addEventListener("keydown", checkKey, {
        capture: true,
        passive: false
      });
      return trap;
    };
    var removeListeners = function removeListeners2() {
      if (!state.active) {
        return;
      }
      doc.removeEventListener("focusin", checkFocusIn, true);
      doc.removeEventListener("mousedown", checkPointerDown, true);
      doc.removeEventListener("touchstart", checkPointerDown, true);
      doc.removeEventListener("click", checkClick, true);
      doc.removeEventListener("keydown", checkKey, true);
      return trap;
    };
    trap = {
      activate: function activate(activateOptions) {
        if (state.active) {
          return this;
        }
        var onActivate = getOption(activateOptions, "onActivate");
        var onPostActivate = getOption(activateOptions, "onPostActivate");
        var checkCanFocusTrap = getOption(activateOptions, "checkCanFocusTrap");
        if (!checkCanFocusTrap) {
          updateTabbableNodes();
        }
        state.active = true;
        state.paused = false;
        state.nodeFocusedBeforeActivation = doc.activeElement;
        if (onActivate) {
          onActivate();
        }
        var finishActivation = function finishActivation2() {
          if (checkCanFocusTrap) {
            updateTabbableNodes();
          }
          addListeners();
          if (onPostActivate) {
            onPostActivate();
          }
        };
        if (checkCanFocusTrap) {
          checkCanFocusTrap(state.containers.concat()).then(finishActivation, finishActivation);
          return this;
        }
        finishActivation();
        return this;
      },
      deactivate: function deactivate(deactivateOptions) {
        if (!state.active) {
          return this;
        }
        clearTimeout(state.delayInitialFocusTimer);
        state.delayInitialFocusTimer = void 0;
        removeListeners();
        state.active = false;
        state.paused = false;
        activeFocusTraps.deactivateTrap(trap);
        var onDeactivate = getOption(deactivateOptions, "onDeactivate");
        var onPostDeactivate = getOption(deactivateOptions, "onPostDeactivate");
        var checkCanReturnFocus = getOption(deactivateOptions, "checkCanReturnFocus");
        if (onDeactivate) {
          onDeactivate();
        }
        var returnFocus = getOption(deactivateOptions, "returnFocus", "returnFocusOnDeactivate");
        var finishDeactivation = function finishDeactivation2() {
          delay(function() {
            if (returnFocus) {
              tryFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation));
            }
            if (onPostDeactivate) {
              onPostDeactivate();
            }
          });
        };
        if (returnFocus && checkCanReturnFocus) {
          checkCanReturnFocus(getReturnFocusNode(state.nodeFocusedBeforeActivation)).then(finishDeactivation, finishDeactivation);
          return this;
        }
        finishDeactivation();
        return this;
      },
      pause: function pause() {
        if (state.paused || !state.active) {
          return this;
        }
        state.paused = true;
        removeListeners();
        return this;
      },
      unpause: function unpause() {
        if (!state.paused || !state.active) {
          return this;
        }
        state.paused = false;
        updateTabbableNodes();
        addListeners();
        return this;
      },
      updateContainerElements: function updateContainerElements(containerElements) {
        var elementsAsArray = [].concat(containerElements).filter(Boolean);
        state.containers = elementsAsArray.map(function(element) {
          return typeof element === "string" ? doc.querySelector(element) : element;
        });
        if (state.active) {
          updateTabbableNodes();
        }
        return this;
      }
    };
    trap.updateContainerElements(elements);
    return trap;
  };
  var scrollLock = { exports: {} };
  (function(module, exports) {
    (function webpackUniversalModuleDefinition(root, factory2) {
      module.exports = factory2();
    })(commonjsGlobal, function() {
      return (
        /******/
        function(modules) {
          var installedModules = {};
          function __webpack_require__(moduleId) {
            if (installedModules[moduleId]) {
              return installedModules[moduleId].exports;
            }
            var module2 = installedModules[moduleId] = {
              /******/
              i: moduleId,
              /******/
              l: false,
              /******/
              exports: {}
              /******/
            };
            modules[moduleId].call(module2.exports, module2, module2.exports, __webpack_require__);
            module2.l = true;
            return module2.exports;
          }
          __webpack_require__.m = modules;
          __webpack_require__.c = installedModules;
          __webpack_require__.d = function(exports2, name, getter) {
            if (!__webpack_require__.o(exports2, name)) {
              Object.defineProperty(exports2, name, { enumerable: true, get: getter });
            }
          };
          __webpack_require__.r = function(exports2) {
            if (typeof Symbol !== "undefined" && Symbol.toStringTag) {
              Object.defineProperty(exports2, Symbol.toStringTag, { value: "Module" });
            }
            Object.defineProperty(exports2, "__esModule", { value: true });
          };
          __webpack_require__.t = function(value, mode) {
            if (mode & 1)
              value = __webpack_require__(value);
            if (mode & 8)
              return value;
            if (mode & 4 && typeof value === "object" && value && value.__esModule)
              return value;
            var ns = /* @__PURE__ */ Object.create(null);
            __webpack_require__.r(ns);
            Object.defineProperty(ns, "default", { enumerable: true, value });
            if (mode & 2 && typeof value != "string")
              for (var key in value)
                __webpack_require__.d(ns, key, (function(key2) {
                  return value[key2];
                }).bind(null, key));
            return ns;
          };
          __webpack_require__.n = function(module2) {
            var getter = module2 && module2.__esModule ? (
              /******/
              function getDefault() {
                return module2["default"];
              }
            ) : (
              /******/
              function getModuleExports() {
                return module2;
              }
            );
            __webpack_require__.d(getter, "a", getter);
            return getter;
          };
          __webpack_require__.o = function(object, property) {
            return Object.prototype.hasOwnProperty.call(object, property);
          };
          __webpack_require__.p = "";
          return __webpack_require__(__webpack_require__.s = 0);
        }([
          /* 0 */
          /***/
          function(module2, __webpack_exports__, __webpack_require__) {
            __webpack_require__.r(__webpack_exports__);
            var argumentAsArray = function argumentAsArray2(argument) {
              return Array.isArray(argument) ? argument : [argument];
            };
            var isElement = function isElement2(target) {
              return target instanceof Node;
            };
            var isElementList = function isElementList2(nodeList) {
              return nodeList instanceof NodeList;
            };
            var eachNode = function eachNode2(nodeList, callback) {
              if (nodeList && callback) {
                nodeList = isElementList(nodeList) ? nodeList : [nodeList];
                for (var i2 = 0; i2 < nodeList.length; i2++) {
                  if (callback(nodeList[i2], i2, nodeList.length) === true) {
                    break;
                  }
                }
              }
            };
            var throwError = function throwError2(message) {
              return console.error("[scroll-lock] ".concat(message));
            };
            var arrayAsSelector = function arrayAsSelector2(array) {
              if (Array.isArray(array)) {
                var selector = array.join(", ");
                return selector;
              }
            };
            var nodeListAsArray = function nodeListAsArray2(nodeList) {
              var nodes = [];
              eachNode(nodeList, function(node) {
                return nodes.push(node);
              });
              return nodes;
            };
            var findParentBySelector = function findParentBySelector2($el, selector) {
              var self2 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : true;
              var $root = arguments.length > 3 && arguments[3] !== void 0 ? arguments[3] : document;
              if (self2 && nodeListAsArray($root.querySelectorAll(selector)).indexOf($el) !== -1) {
                return $el;
              }
              while (($el = $el.parentElement) && nodeListAsArray($root.querySelectorAll(selector)).indexOf($el) === -1) {
              }
              return $el;
            };
            var elementHasSelector = function elementHasSelector2($el, selector) {
              var $root = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : document;
              var has = nodeListAsArray($root.querySelectorAll(selector)).indexOf($el) !== -1;
              return has;
            };
            var elementHasOverflowHidden = function elementHasOverflowHidden2($el) {
              if ($el) {
                var computedStyle = getComputedStyle($el);
                var overflowIsHidden = computedStyle.overflow === "hidden";
                return overflowIsHidden;
              }
            };
            var elementScrollTopOnStart = function elementScrollTopOnStart2($el) {
              if ($el) {
                if (elementHasOverflowHidden($el)) {
                  return true;
                }
                var scrollTop = $el.scrollTop;
                return scrollTop <= 0;
              }
            };
            var elementScrollTopOnEnd = function elementScrollTopOnEnd2($el) {
              if ($el) {
                if (elementHasOverflowHidden($el)) {
                  return true;
                }
                var scrollTop = $el.scrollTop;
                var scrollHeight = $el.scrollHeight;
                var scrollTopWithHeight = scrollTop + $el.offsetHeight;
                return scrollTopWithHeight >= scrollHeight;
              }
            };
            var elementScrollLeftOnStart = function elementScrollLeftOnStart2($el) {
              if ($el) {
                if (elementHasOverflowHidden($el)) {
                  return true;
                }
                var scrollLeft = $el.scrollLeft;
                return scrollLeft <= 0;
              }
            };
            var elementScrollLeftOnEnd = function elementScrollLeftOnEnd2($el) {
              if ($el) {
                if (elementHasOverflowHidden($el)) {
                  return true;
                }
                var scrollLeft = $el.scrollLeft;
                var scrollWidth = $el.scrollWidth;
                var scrollLeftWithWidth = scrollLeft + $el.offsetWidth;
                return scrollLeftWithWidth >= scrollWidth;
              }
            };
            var elementIsScrollableField = function elementIsScrollableField2($el) {
              var selector = 'textarea, [contenteditable="true"]';
              return elementHasSelector($el, selector);
            };
            var elementIsInputRange = function elementIsInputRange2($el) {
              var selector = 'input[type="range"]';
              return elementHasSelector($el, selector);
            };
            __webpack_require__.d(__webpack_exports__, "disablePageScroll", function() {
              return disablePageScroll;
            });
            __webpack_require__.d(__webpack_exports__, "enablePageScroll", function() {
              return enablePageScroll;
            });
            __webpack_require__.d(__webpack_exports__, "getScrollState", function() {
              return getScrollState;
            });
            __webpack_require__.d(__webpack_exports__, "clearQueueScrollLocks", function() {
              return clearQueueScrollLocks;
            });
            __webpack_require__.d(__webpack_exports__, "getTargetScrollBarWidth", function() {
              return scroll_lock_getTargetScrollBarWidth;
            });
            __webpack_require__.d(__webpack_exports__, "getCurrentTargetScrollBarWidth", function() {
              return scroll_lock_getCurrentTargetScrollBarWidth;
            });
            __webpack_require__.d(__webpack_exports__, "getPageScrollBarWidth", function() {
              return getPageScrollBarWidth;
            });
            __webpack_require__.d(__webpack_exports__, "getCurrentPageScrollBarWidth", function() {
              return getCurrentPageScrollBarWidth;
            });
            __webpack_require__.d(__webpack_exports__, "addScrollableTarget", function() {
              return scroll_lock_addScrollableTarget;
            });
            __webpack_require__.d(__webpack_exports__, "removeScrollableTarget", function() {
              return scroll_lock_removeScrollableTarget;
            });
            __webpack_require__.d(__webpack_exports__, "addScrollableSelector", function() {
              return scroll_lock_addScrollableSelector;
            });
            __webpack_require__.d(__webpack_exports__, "removeScrollableSelector", function() {
              return scroll_lock_removeScrollableSelector;
            });
            __webpack_require__.d(__webpack_exports__, "addLockableTarget", function() {
              return scroll_lock_addLockableTarget;
            });
            __webpack_require__.d(__webpack_exports__, "addLockableSelector", function() {
              return scroll_lock_addLockableSelector;
            });
            __webpack_require__.d(__webpack_exports__, "setFillGapMethod", function() {
              return scroll_lock_setFillGapMethod;
            });
            __webpack_require__.d(__webpack_exports__, "addFillGapTarget", function() {
              return scroll_lock_addFillGapTarget;
            });
            __webpack_require__.d(__webpack_exports__, "removeFillGapTarget", function() {
              return scroll_lock_removeFillGapTarget;
            });
            __webpack_require__.d(__webpack_exports__, "addFillGapSelector", function() {
              return scroll_lock_addFillGapSelector;
            });
            __webpack_require__.d(__webpack_exports__, "removeFillGapSelector", function() {
              return scroll_lock_removeFillGapSelector;
            });
            __webpack_require__.d(__webpack_exports__, "refillGaps", function() {
              return refillGaps;
            });
            function _objectSpread(target) {
              for (var i2 = 1; i2 < arguments.length; i2++) {
                var source = arguments[i2] != null ? arguments[i2] : {};
                var ownKeys2 = Object.keys(source);
                if (typeof Object.getOwnPropertySymbols === "function") {
                  ownKeys2 = ownKeys2.concat(Object.getOwnPropertySymbols(source).filter(function(sym) {
                    return Object.getOwnPropertyDescriptor(source, sym).enumerable;
                  }));
                }
                ownKeys2.forEach(function(key) {
                  _defineProperty2(target, key, source[key]);
                });
              }
              return target;
            }
            function _defineProperty2(obj, key, value) {
              if (key in obj) {
                Object.defineProperty(obj, key, { value, enumerable: true, configurable: true, writable: true });
              } else {
                obj[key] = value;
              }
              return obj;
            }
            var FILL_GAP_AVAILABLE_METHODS = ["padding", "margin", "width", "max-width", "none"];
            var TOUCH_DIRECTION_DETECT_OFFSET = 3;
            var state = {
              scroll: true,
              queue: 0,
              scrollableSelectors: ["[data-scroll-lock-scrollable]"],
              lockableSelectors: ["body", "[data-scroll-lock-lockable]"],
              fillGapSelectors: ["body", "[data-scroll-lock-fill-gap]", "[data-scroll-lock-lockable]"],
              fillGapMethod: FILL_GAP_AVAILABLE_METHODS[0],
              //
              startTouchY: 0,
              startTouchX: 0
            };
            var disablePageScroll = function disablePageScroll2(target) {
              if (state.queue <= 0) {
                state.scroll = false;
                scroll_lock_hideLockableOverflow();
                fillGaps();
              }
              scroll_lock_addScrollableTarget(target);
              state.queue++;
            };
            var enablePageScroll = function enablePageScroll2(target) {
              state.queue > 0 && state.queue--;
              if (state.queue <= 0) {
                state.scroll = true;
                scroll_lock_showLockableOverflow();
                unfillGaps();
              }
              scroll_lock_removeScrollableTarget(target);
            };
            var getScrollState = function getScrollState2() {
              return state.scroll;
            };
            var clearQueueScrollLocks = function clearQueueScrollLocks2() {
              state.queue = 0;
            };
            var scroll_lock_getTargetScrollBarWidth = function getTargetScrollBarWidth($target) {
              var onlyExists = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
              if (isElement($target)) {
                var currentOverflowYProperty = $target.style.overflowY;
                if (onlyExists) {
                  if (!getScrollState()) {
                    $target.style.overflowY = $target.getAttribute("data-scroll-lock-saved-overflow-y-property");
                  }
                } else {
                  $target.style.overflowY = "scroll";
                }
                var width = scroll_lock_getCurrentTargetScrollBarWidth($target);
                $target.style.overflowY = currentOverflowYProperty;
                return width;
              } else {
                return 0;
              }
            };
            var scroll_lock_getCurrentTargetScrollBarWidth = function getCurrentTargetScrollBarWidth($target) {
              if (isElement($target)) {
                if ($target === document.body) {
                  var documentWidth = document.documentElement.clientWidth;
                  var windowWidth = window.innerWidth;
                  var currentWidth = windowWidth - documentWidth;
                  return currentWidth;
                } else {
                  var borderLeftWidthCurrentProperty = $target.style.borderLeftWidth;
                  var borderRightWidthCurrentProperty = $target.style.borderRightWidth;
                  $target.style.borderLeftWidth = "0px";
                  $target.style.borderRightWidth = "0px";
                  var _currentWidth = $target.offsetWidth - $target.clientWidth;
                  $target.style.borderLeftWidth = borderLeftWidthCurrentProperty;
                  $target.style.borderRightWidth = borderRightWidthCurrentProperty;
                  return _currentWidth;
                }
              } else {
                return 0;
              }
            };
            var getPageScrollBarWidth = function getPageScrollBarWidth2() {
              var onlyExists = arguments.length > 0 && arguments[0] !== void 0 ? arguments[0] : false;
              return scroll_lock_getTargetScrollBarWidth(document.body, onlyExists);
            };
            var getCurrentPageScrollBarWidth = function getCurrentPageScrollBarWidth2() {
              return scroll_lock_getCurrentTargetScrollBarWidth(document.body);
            };
            var scroll_lock_addScrollableTarget = function addScrollableTarget(target) {
              if (target) {
                var targets = argumentAsArray(target);
                targets.map(function($targets) {
                  eachNode($targets, function($target) {
                    if (isElement($target)) {
                      $target.setAttribute("data-scroll-lock-scrollable", "");
                    } else {
                      throwError('"'.concat($target, '" is not a Element.'));
                    }
                  });
                });
              }
            };
            var scroll_lock_removeScrollableTarget = function removeScrollableTarget(target) {
              if (target) {
                var targets = argumentAsArray(target);
                targets.map(function($targets) {
                  eachNode($targets, function($target) {
                    if (isElement($target)) {
                      $target.removeAttribute("data-scroll-lock-scrollable");
                    } else {
                      throwError('"'.concat($target, '" is not a Element.'));
                    }
                  });
                });
              }
            };
            var scroll_lock_addScrollableSelector = function addScrollableSelector(selector) {
              if (selector) {
                var selectors = argumentAsArray(selector);
                selectors.map(function(selector2) {
                  state.scrollableSelectors.push(selector2);
                });
              }
            };
            var scroll_lock_removeScrollableSelector = function removeScrollableSelector(selector) {
              if (selector) {
                var selectors = argumentAsArray(selector);
                selectors.map(function(selector2) {
                  state.scrollableSelectors = state.scrollableSelectors.filter(function(sSelector) {
                    return sSelector !== selector2;
                  });
                });
              }
            };
            var scroll_lock_addLockableTarget = function addLockableTarget(target) {
              if (target) {
                var targets = argumentAsArray(target);
                targets.map(function($targets) {
                  eachNode($targets, function($target) {
                    if (isElement($target)) {
                      $target.setAttribute("data-scroll-lock-lockable", "");
                    } else {
                      throwError('"'.concat($target, '" is not a Element.'));
                    }
                  });
                });
                if (!getScrollState()) {
                  scroll_lock_hideLockableOverflow();
                }
              }
            };
            var scroll_lock_addLockableSelector = function addLockableSelector(selector) {
              if (selector) {
                var selectors = argumentAsArray(selector);
                selectors.map(function(selector2) {
                  state.lockableSelectors.push(selector2);
                });
                if (!getScrollState()) {
                  scroll_lock_hideLockableOverflow();
                }
                scroll_lock_addFillGapSelector(selector);
              }
            };
            var scroll_lock_setFillGapMethod = function setFillGapMethod(method) {
              if (method) {
                if (FILL_GAP_AVAILABLE_METHODS.indexOf(method) !== -1) {
                  state.fillGapMethod = method;
                  refillGaps();
                } else {
                  var methods = FILL_GAP_AVAILABLE_METHODS.join(", ");
                  throwError('"'.concat(method, '" method is not available!\nAvailable fill gap methods: ').concat(methods, "."));
                }
              }
            };
            var scroll_lock_addFillGapTarget = function addFillGapTarget(target) {
              if (target) {
                var targets = argumentAsArray(target);
                targets.map(function($targets) {
                  eachNode($targets, function($target) {
                    if (isElement($target)) {
                      $target.setAttribute("data-scroll-lock-fill-gap", "");
                      if (!state.scroll) {
                        scroll_lock_fillGapTarget($target);
                      }
                    } else {
                      throwError('"'.concat($target, '" is not a Element.'));
                    }
                  });
                });
              }
            };
            var scroll_lock_removeFillGapTarget = function removeFillGapTarget(target) {
              if (target) {
                var targets = argumentAsArray(target);
                targets.map(function($targets) {
                  eachNode($targets, function($target) {
                    if (isElement($target)) {
                      $target.removeAttribute("data-scroll-lock-fill-gap");
                      if (!state.scroll) {
                        scroll_lock_unfillGapTarget($target);
                      }
                    } else {
                      throwError('"'.concat($target, '" is not a Element.'));
                    }
                  });
                });
              }
            };
            var scroll_lock_addFillGapSelector = function addFillGapSelector(selector) {
              if (selector) {
                var selectors = argumentAsArray(selector);
                selectors.map(function(selector2) {
                  if (state.fillGapSelectors.indexOf(selector2) === -1) {
                    state.fillGapSelectors.push(selector2);
                    if (!state.scroll) {
                      scroll_lock_fillGapSelector(selector2);
                    }
                  }
                });
              }
            };
            var scroll_lock_removeFillGapSelector = function removeFillGapSelector(selector) {
              if (selector) {
                var selectors = argumentAsArray(selector);
                selectors.map(function(selector2) {
                  state.fillGapSelectors = state.fillGapSelectors.filter(function(fSelector) {
                    return fSelector !== selector2;
                  });
                  if (!state.scroll) {
                    scroll_lock_unfillGapSelector(selector2);
                  }
                });
              }
            };
            var refillGaps = function refillGaps2() {
              if (!state.scroll) {
                fillGaps();
              }
            };
            var scroll_lock_hideLockableOverflow = function hideLockableOverflow() {
              var selector = arrayAsSelector(state.lockableSelectors);
              scroll_lock_hideLockableOverflowSelector(selector);
            };
            var scroll_lock_showLockableOverflow = function showLockableOverflow() {
              var selector = arrayAsSelector(state.lockableSelectors);
              scroll_lock_showLockableOverflowSelector(selector);
            };
            var scroll_lock_hideLockableOverflowSelector = function hideLockableOverflowSelector(selector) {
              var $targets = document.querySelectorAll(selector);
              eachNode($targets, function($target) {
                scroll_lock_hideLockableOverflowTarget($target);
              });
            };
            var scroll_lock_showLockableOverflowSelector = function showLockableOverflowSelector(selector) {
              var $targets = document.querySelectorAll(selector);
              eachNode($targets, function($target) {
                scroll_lock_showLockableOverflowTarget($target);
              });
            };
            var scroll_lock_hideLockableOverflowTarget = function hideLockableOverflowTarget($target) {
              if (isElement($target) && $target.getAttribute("data-scroll-lock-locked") !== "true") {
                var computedStyle = window.getComputedStyle($target);
                $target.setAttribute("data-scroll-lock-saved-overflow-y-property", computedStyle.overflowY);
                $target.setAttribute("data-scroll-lock-saved-inline-overflow-property", $target.style.overflow);
                $target.setAttribute("data-scroll-lock-saved-inline-overflow-y-property", $target.style.overflowY);
                $target.style.overflow = "hidden";
                $target.setAttribute("data-scroll-lock-locked", "true");
              }
            };
            var scroll_lock_showLockableOverflowTarget = function showLockableOverflowTarget($target) {
              if (isElement($target) && $target.getAttribute("data-scroll-lock-locked") === "true") {
                $target.style.overflow = $target.getAttribute("data-scroll-lock-saved-inline-overflow-property");
                $target.style.overflowY = $target.getAttribute("data-scroll-lock-saved-inline-overflow-y-property");
                $target.removeAttribute("data-scroll-lock-saved-overflow-property");
                $target.removeAttribute("data-scroll-lock-saved-inline-overflow-property");
                $target.removeAttribute("data-scroll-lock-saved-inline-overflow-y-property");
                $target.removeAttribute("data-scroll-lock-locked");
              }
            };
            var fillGaps = function fillGaps2() {
              state.fillGapSelectors.map(function(selector) {
                scroll_lock_fillGapSelector(selector);
              });
            };
            var unfillGaps = function unfillGaps2() {
              state.fillGapSelectors.map(function(selector) {
                scroll_lock_unfillGapSelector(selector);
              });
            };
            var scroll_lock_fillGapSelector = function fillGapSelector(selector) {
              var $targets = document.querySelectorAll(selector);
              var isLockable = state.lockableSelectors.indexOf(selector) !== -1;
              eachNode($targets, function($target) {
                scroll_lock_fillGapTarget($target, isLockable);
              });
            };
            var scroll_lock_fillGapTarget = function fillGapTarget($target) {
              var isLockable = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
              if (isElement($target)) {
                var scrollBarWidth;
                if ($target.getAttribute("data-scroll-lock-lockable") === "" || isLockable) {
                  scrollBarWidth = scroll_lock_getTargetScrollBarWidth($target, true);
                } else {
                  var $lockableParent = findParentBySelector($target, arrayAsSelector(state.lockableSelectors));
                  scrollBarWidth = scroll_lock_getTargetScrollBarWidth($lockableParent, true);
                }
                if ($target.getAttribute("data-scroll-lock-filled-gap") === "true") {
                  scroll_lock_unfillGapTarget($target);
                }
                var computedStyle = window.getComputedStyle($target);
                $target.setAttribute("data-scroll-lock-filled-gap", "true");
                $target.setAttribute("data-scroll-lock-current-fill-gap-method", state.fillGapMethod);
                if (state.fillGapMethod === "margin") {
                  var currentMargin = parseFloat(computedStyle.marginRight);
                  $target.style.marginRight = "".concat(currentMargin + scrollBarWidth, "px");
                } else if (state.fillGapMethod === "width") {
                  $target.style.width = "calc(100% - ".concat(scrollBarWidth, "px)");
                } else if (state.fillGapMethod === "max-width") {
                  $target.style.maxWidth = "calc(100% - ".concat(scrollBarWidth, "px)");
                } else if (state.fillGapMethod === "padding") {
                  var currentPadding = parseFloat(computedStyle.paddingRight);
                  $target.style.paddingRight = "".concat(currentPadding + scrollBarWidth, "px");
                }
              }
            };
            var scroll_lock_unfillGapSelector = function unfillGapSelector(selector) {
              var $targets = document.querySelectorAll(selector);
              eachNode($targets, function($target) {
                scroll_lock_unfillGapTarget($target);
              });
            };
            var scroll_lock_unfillGapTarget = function unfillGapTarget($target) {
              if (isElement($target)) {
                if ($target.getAttribute("data-scroll-lock-filled-gap") === "true") {
                  var currentFillGapMethod = $target.getAttribute("data-scroll-lock-current-fill-gap-method");
                  $target.removeAttribute("data-scroll-lock-filled-gap");
                  $target.removeAttribute("data-scroll-lock-current-fill-gap-method");
                  if (currentFillGapMethod === "margin") {
                    $target.style.marginRight = "";
                  } else if (currentFillGapMethod === "width") {
                    $target.style.width = "";
                  } else if (currentFillGapMethod === "max-width") {
                    $target.style.maxWidth = "";
                  } else if (currentFillGapMethod === "padding") {
                    $target.style.paddingRight = "";
                  }
                }
              }
            };
            var onResize = function onResize2(e) {
              refillGaps();
            };
            var onTouchStart = function onTouchStart2(e) {
              if (!state.scroll) {
                state.startTouchY = e.touches[0].clientY;
                state.startTouchX = e.touches[0].clientX;
              }
            };
            var scroll_lock_onTouchMove = function onTouchMove(e) {
              if (!state.scroll) {
                var startTouchY = state.startTouchY, startTouchX = state.startTouchX;
                var currentClientY = e.touches[0].clientY;
                var currentClientX = e.touches[0].clientX;
                if (e.touches.length < 2) {
                  var selector = arrayAsSelector(state.scrollableSelectors);
                  var direction = {
                    up: startTouchY < currentClientY,
                    down: startTouchY > currentClientY,
                    left: startTouchX < currentClientX,
                    right: startTouchX > currentClientX
                  };
                  var directionWithOffset = {
                    up: startTouchY + TOUCH_DIRECTION_DETECT_OFFSET < currentClientY,
                    down: startTouchY - TOUCH_DIRECTION_DETECT_OFFSET > currentClientY,
                    left: startTouchX + TOUCH_DIRECTION_DETECT_OFFSET < currentClientX,
                    right: startTouchX - TOUCH_DIRECTION_DETECT_OFFSET > currentClientX
                  };
                  var handle = function handle2($el) {
                    var skip = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : false;
                    if ($el) {
                      var parentScrollableEl = findParentBySelector($el, selector, false);
                      if (elementIsInputRange($el)) {
                        return false;
                      }
                      if (skip || elementIsScrollableField($el) && findParentBySelector($el, selector) || elementHasSelector($el, selector)) {
                        var prevent = false;
                        if (elementScrollLeftOnStart($el) && elementScrollLeftOnEnd($el)) {
                          if (direction.up && elementScrollTopOnStart($el) || direction.down && elementScrollTopOnEnd($el)) {
                            prevent = true;
                          }
                        } else if (elementScrollTopOnStart($el) && elementScrollTopOnEnd($el)) {
                          if (direction.left && elementScrollLeftOnStart($el) || direction.right && elementScrollLeftOnEnd($el)) {
                            prevent = true;
                          }
                        } else if (directionWithOffset.up && elementScrollTopOnStart($el) || directionWithOffset.down && elementScrollTopOnEnd($el) || directionWithOffset.left && elementScrollLeftOnStart($el) || directionWithOffset.right && elementScrollLeftOnEnd($el)) {
                          prevent = true;
                        }
                        if (prevent) {
                          if (parentScrollableEl) {
                            handle2(parentScrollableEl, true);
                          } else {
                            if (e.cancelable) {
                              e.preventDefault();
                            }
                          }
                        }
                      } else {
                        handle2(parentScrollableEl);
                      }
                    } else {
                      if (e.cancelable) {
                        e.preventDefault();
                      }
                    }
                  };
                  handle(e.target);
                }
              }
            };
            var onTouchEnd = function onTouchEnd2(e) {
              if (!state.scroll) {
                state.startTouchY = 0;
                state.startTouchX = 0;
              }
            };
            if (typeof window !== "undefined") {
              window.addEventListener("resize", onResize);
            }
            if (typeof document !== "undefined") {
              document.addEventListener("touchstart", onTouchStart);
              document.addEventListener("touchmove", scroll_lock_onTouchMove, {
                passive: false
              });
              document.addEventListener("touchend", onTouchEnd);
            }
            var deprecatedMethods = {
              hide: function hide(target) {
                throwError('"hide" is deprecated! Use "disablePageScroll" instead. \n https://github.com/FL3NKEY/scroll-lock#disablepagescrollscrollabletarget');
                disablePageScroll(target);
              },
              show: function show(target) {
                throwError('"show" is deprecated! Use "enablePageScroll" instead. \n https://github.com/FL3NKEY/scroll-lock#enablepagescrollscrollabletarget');
                enablePageScroll(target);
              },
              toggle: function toggle(target) {
                throwError('"toggle" is deprecated! Do not use it.');
                if (getScrollState()) {
                  disablePageScroll();
                } else {
                  enablePageScroll(target);
                }
              },
              getState: function getState() {
                throwError('"getState" is deprecated! Use "getScrollState" instead. \n https://github.com/FL3NKEY/scroll-lock#getscrollstate');
                return getScrollState();
              },
              getWidth: function getWidth() {
                throwError('"getWidth" is deprecated! Use "getPageScrollBarWidth" instead. \n https://github.com/FL3NKEY/scroll-lock#getpagescrollbarwidth');
                return getPageScrollBarWidth();
              },
              getCurrentWidth: function getCurrentWidth() {
                throwError('"getCurrentWidth" is deprecated! Use "getCurrentPageScrollBarWidth" instead. \n https://github.com/FL3NKEY/scroll-lock#getcurrentpagescrollbarwidth');
                return getCurrentPageScrollBarWidth();
              },
              setScrollableTargets: function setScrollableTargets(target) {
                throwError('"setScrollableTargets" is deprecated! Use "addScrollableTarget" instead. \n https://github.com/FL3NKEY/scroll-lock#addscrollabletargetscrollabletarget');
                scroll_lock_addScrollableTarget(target);
              },
              setFillGapSelectors: function setFillGapSelectors(selector) {
                throwError('"setFillGapSelectors" is deprecated! Use "addFillGapSelector" instead. \n https://github.com/FL3NKEY/scroll-lock#addfillgapselectorfillgapselector');
                scroll_lock_addFillGapSelector(selector);
              },
              setFillGapTargets: function setFillGapTargets(target) {
                throwError('"setFillGapTargets" is deprecated! Use "addFillGapTarget" instead. \n https://github.com/FL3NKEY/scroll-lock#addfillgaptargetfillgaptarget');
                scroll_lock_addFillGapTarget(target);
              },
              clearQueue: function clearQueue() {
                throwError('"clearQueue" is deprecated! Use "clearQueueScrollLocks" instead. \n https://github.com/FL3NKEY/scroll-lock#clearqueuescrolllocks');
                clearQueueScrollLocks();
              }
            };
            var scrollLock2 = _objectSpread({
              disablePageScroll,
              enablePageScroll,
              getScrollState,
              clearQueueScrollLocks,
              getTargetScrollBarWidth: scroll_lock_getTargetScrollBarWidth,
              getCurrentTargetScrollBarWidth: scroll_lock_getCurrentTargetScrollBarWidth,
              getPageScrollBarWidth,
              getCurrentPageScrollBarWidth,
              addScrollableSelector: scroll_lock_addScrollableSelector,
              removeScrollableSelector: scroll_lock_removeScrollableSelector,
              addScrollableTarget: scroll_lock_addScrollableTarget,
              removeScrollableTarget: scroll_lock_removeScrollableTarget,
              addLockableSelector: scroll_lock_addLockableSelector,
              addLockableTarget: scroll_lock_addLockableTarget,
              addFillGapSelector: scroll_lock_addFillGapSelector,
              removeFillGapSelector: scroll_lock_removeFillGapSelector,
              addFillGapTarget: scroll_lock_addFillGapTarget,
              removeFillGapTarget: scroll_lock_removeFillGapTarget,
              setFillGapMethod: scroll_lock_setFillGapMethod,
              refillGaps,
              _state: state
            }, deprecatedMethods);
            __webpack_exports__["default"] = scrollLock2;
          }
          /******/
        ])["default"]
      );
    });
  })(scrollLock);
  var scrollLockExports = scrollLock.exports;
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a2, b2) => {
    for (var prop in b2 || (b2 = {}))
      if (__hasOwnProp.call(b2, prop))
        __defNormalProp(a2, prop, b2[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b2)) {
        if (__propIsEnum.call(b2, prop))
          __defNormalProp(a2, prop, b2[prop]);
      }
    return a2;
  };
  var __spreadProps = (a2, b2) => __defProps(a2, __getOwnPropDescs(b2));
  function isArray$1(value) {
    return Array.isArray(value);
  }
  function isObject(value) {
    const type = typeof value;
    return value != null && (type === "object" || type === "function") && !isArray$1(value);
  }
  function isFunction$1(value) {
    return typeof value === "function";
  }
  function isString(value) {
    return Object.prototype.toString.call(value) === "[object String]";
  }
  function callHandler(handler, event) {
    if (handler) {
      if (isFunction$1(handler)) {
        handler(event);
      } else {
        handler[0](handler[1], event);
      }
    }
    return event == null ? void 0 : event.defaultPrevented;
  }
  function chainHandlers(...fns) {
    return function(event) {
      fns.some((fn) => {
        return callHandler(fn, event);
      });
    };
  }
  const hasLocalStorageSupport = () => typeof Storage !== "undefined";
  const COLOR_MODE_STORAGE_KEY = "hope-ui-color-mode";
  const colorModeClassNames = {
    light: "hope-ui-light",
    dark: "hope-ui-dark"
  };
  function getColorModeFromLocalStorage() {
    if (!hasLocalStorageSupport()) {
      return null;
    }
    try {
      return localStorage.getItem(COLOR_MODE_STORAGE_KEY);
    } catch (error) {
      return null;
    }
  }
  function saveColorModeToLocalStorage(value) {
    if (!hasLocalStorageSupport()) {
      return;
    }
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, value);
    } catch (error) {
    }
  }
  function getDefaultColorMode(fallbackValue) {
    const persistedPreference = getColorModeFromLocalStorage();
    if (persistedPreference) {
      return persistedPreference;
    } else if (fallbackValue === "system") {
      const isSystemDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      return isSystemDark ? "dark" : "light";
    } else {
      return fallbackValue;
    }
  }
  function getColorModeClassName(isDark) {
    return isDark ? colorModeClassNames.dark : colorModeClassNames.light;
  }
  function syncBodyColorModeClassName(isDark) {
    const body = document.body;
    body.classList.add(getColorModeClassName(isDark));
    body.classList.remove(isDark ? colorModeClassNames.light : colorModeClassNames.dark);
  }
  const space = {
    px: "1px",
    "0_5": "0.125rem",
    "1": "0.25rem",
    "1_5": "0.375rem",
    "2": "0.5rem",
    "2_5": "0.625rem",
    "3": "0.75rem",
    "3_5": "0.875rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem",
    "12": "3rem",
    "14": "3.5rem",
    "16": "4rem",
    "20": "5rem",
    "24": "6rem",
    "28": "7rem",
    "32": "8rem",
    "36": "9rem",
    "40": "10rem",
    "44": "11rem",
    "48": "12rem",
    "52": "13rem",
    "56": "14rem",
    "60": "15rem",
    "64": "16rem",
    "72": "18rem",
    "80": "20rem",
    "96": "24rem"
  };
  const sizes = __spreadProps(__spreadValues({}, space), {
    prose: "65ch",
    max: "max-content",
    min: "min-content",
    full: "100%",
    screenW: "100vw",
    screenH: "100vh",
    xs: "20rem",
    sm: "24rem",
    md: "28rem",
    lg: "32rem",
    xl: "36rem",
    "2xl": "42rem",
    "3xl": "48rem",
    "4xl": "56rem",
    "5xl": "64rem",
    "6xl": "72rem",
    "7xl": "80rem",
    "8xl": "90rem",
    containerSm: "640px",
    containerMd: "768px",
    containerLg: "1024px",
    containerXl: "1280px",
    container2xl: "1536px"
  });
  const baseMedia = {
    sm: `(min-width: ${sizes.containerSm})`,
    md: `(min-width: ${sizes.containerMd})`,
    lg: `(min-width: ${sizes.containerLg})`,
    xl: `(min-width: ${sizes.containerXl})`,
    "2xl": `(min-width: ${sizes.container2xl})`,
    "reduce-motion": "(prefers-reduced-motion: reduce)",
    light: "(prefers-color-scheme: light)",
    dark: "(prefers-color-scheme: dark)"
  };
  const background = {
    bg: (value) => ({ background: value }),
    bgColor: (value) => ({ backgroundColor: value })
  };
  const border = {
    borderX: (value) => ({
      borderLeft: value,
      borderRight: value
    }),
    borderY: (value) => ({
      borderTop: value,
      borderBottom: value
    })
  };
  const display = {
    d: (value) => ({ display: value })
  };
  const margin = {
    m: (value) => ({ margin: value }),
    mt: (value) => ({ marginTop: value }),
    mr: (value) => ({ marginRight: value }),
    marginStart: (value) => ({ marginInlineStart: value }),
    ms: (value) => ({ marginInlineStart: value }),
    mb: (value) => ({ marginBottom: value }),
    ml: (value) => ({ marginLeft: value }),
    marginEnd: (value) => ({ marginInlineEnd: value }),
    me: (value) => ({ marginInlineEnd: value }),
    mx: (value) => ({
      marginInlineStart: value,
      marginInlineEnd: value
    }),
    my: (value) => ({ marginTop: value, marginBottom: value }),
    spaceX: (value) => ({
      "& > * + *": {
        marginLeft: value
      }
    }),
    spaceY: (value) => ({
      "& > * + *": {
        marginTop: value
      }
    })
  };
  const padding = {
    p: (value) => ({ padding: value }),
    pt: (value) => ({ paddingTop: value }),
    pr: (value) => ({ paddingRight: value }),
    paddingStart: (value) => ({ paddingInlineStart: value }),
    ps: (value) => ({ paddingInlineStart: value }),
    pb: (value) => ({ paddingBottom: value }),
    pl: (value) => ({ paddingLeft: value }),
    pe: (value) => ({ paddingInlineEnd: value }),
    paddingEnd: (value) => ({ paddingInlineEnd: value }),
    px: (value) => ({
      paddingInlineStart: value,
      paddingInlineEnd: value
    }),
    py: (value) => ({ paddingTop: value, paddingBottom: value })
  };
  const position = {
    pos: (value) => ({ position: value })
  };
  function createGroupSelector(...selectors) {
    return selectors.map((item) => `[role=group]${item} &, [data-group]${item} &, .group${item} &`).join(", ");
  }
  function createPeerSelector(...selectors) {
    return selectors.map((item) => `[data-peer]${item} ~ &, .peer${item} ~ &`).join(", ");
  }
  const pseudoSelectors = {
    _hover: (value) => ({
      "&:hover, &[data-hover]": value
    }),
    _active: (value) => ({
      "&:active, &[data-active]": value
    }),
    _focus: (value) => ({
      "&:focus, &[data-focus]": value
    }),
    _highlighted: (value) => ({
      "&[data-highlighted]": value
    }),
    _focusWithin: (value) => ({
      "&:focus-within": value
    }),
    _focusVisible: (value) => ({
      "&:focus-visible": value
    }),
    _disabled: (value) => ({
      "&[disabled], &[aria-disabled=true], &[data-disabled]": value
    }),
    _readOnly: (value) => ({
      "&[aria-readonly=true], &[readonly], &[data-readonly]": value
    }),
    _before: (value) => ({
      "&::before": value
    }),
    _after: (value) => ({
      "&::after": value
    }),
    _empty: (value) => ({
      "&:empty": value
    }),
    _expanded: (value) => ({
      "&[aria-expanded=true], &[data-expanded]": value
    }),
    _checked: (value) => ({
      "&[aria-checked=true], &[data-checked]": value
    }),
    _grabbed: (value) => ({
      "&[aria-grabbed=true], &[data-grabbed]": value
    }),
    _pressed: (value) => ({
      "&[aria-pressed=true], &[data-pressed]": value
    }),
    _invalid: (value) => ({
      "&[aria-invalid=true], &[data-invalid]": value
    }),
    _valid: (value) => ({
      "&[data-valid], &[data-state=valid]": value
    }),
    _loading: (value) => ({
      "&[data-loading], &[aria-busy=true]": value
    }),
    _selected: (value) => ({
      "&[aria-selected=true], &[data-selected]": value
    }),
    _hidden: (value) => ({
      "&[hidden], &[data-hidden]": value
    }),
    _even: (value) => ({
      "&:nth-of-type(even)": value
    }),
    _odd: (value) => ({
      "&:nth-of-type(odd)": value
    }),
    _first: (value) => ({
      "&:first-of-type": value
    }),
    _last: (value) => ({
      "&:last-of-type": value
    }),
    _notFirst: (value) => ({
      "&:not(:first-of-type)": value
    }),
    _notLast: (value) => ({
      "&:not(:last-of-type)": value
    }),
    _visited: (value) => ({
      "&:visited": value
    }),
    _activeLink: (value) => ({
      "&[aria-current=page]": value
    }),
    _activeStep: (value) => ({
      "&[aria-current=step]": value
    }),
    _indeterminate: (value) => ({
      "&:indeterminate, &[aria-checked=mixed], &[data-indeterminate]": value
    }),
    _groupHover: (value) => ({
      [createGroupSelector(":hover", "[data-hover]")]: value
    }),
    _peerHover: (value) => ({
      [createPeerSelector(":hover", "[data-hover]")]: value
    }),
    _groupFocus: (value) => ({
      [createGroupSelector(":focus", "[data-focus]")]: value
    }),
    _peerFocus: (value) => ({
      [createPeerSelector(":focus", "[data-focus]")]: value
    }),
    _groupFocusVisible: (value) => ({
      [createGroupSelector(":focus-visible")]: value
    }),
    _peerFocusVisible: (value) => ({
      [createPeerSelector(":focus-visible")]: value
    }),
    _groupActive: (value) => ({
      [createGroupSelector(":active", "[data-active]")]: value
    }),
    _peerActive: (value) => ({
      [createPeerSelector(":active", "[data-active]")]: value
    }),
    _groupSelected: (value) => ({
      [createGroupSelector("[aria-selected=true]", "[data-selected]")]: value
    }),
    _peerSelected: (value) => ({
      [createPeerSelector("[aria-selected=true]", "[data-selected]")]: value
    }),
    _groupDisabled: (value) => ({
      [createGroupSelector(":disabled", "[data-disabled]")]: value
    }),
    _peerDisabled: (value) => ({
      [createPeerSelector(":disabled", "[data-disabled]")]: value
    }),
    _groupInvalid: (value) => ({
      [createGroupSelector(":invalid", "[data-invalid]")]: value
    }),
    _peerInvalid: (value) => ({
      [createPeerSelector(":invalid", "[data-invalid]")]: value
    }),
    _groupChecked: (value) => ({
      [createGroupSelector(":checked", "[data-checked]")]: value
    }),
    _peerChecked: (value) => ({
      [createPeerSelector(":checked", "[data-checked]")]: value
    }),
    _groupFocusWithin: (value) => ({
      [createGroupSelector(":focus-within")]: value
    }),
    _peerFocusWithin: (value) => ({
      [createPeerSelector(":focus-within")]: value
    }),
    _peerPlaceholderShown: (value) => ({
      [createPeerSelector(":placeholder-shown")]: value
    }),
    _placeholder: (value) => ({
      "&::placeholder": value
    }),
    _placeholderShown: (value) => ({
      "&:placeholder-shown": value
    }),
    _fullScreen: (value) => ({
      "&:fullscreen": value
    }),
    _selection: (value) => ({
      "&::selection": value
    }),
    _mediaDark: (value) => ({
      "@media (prefers-color-scheme: dark)": value
    }),
    _mediaReduceMotion: (value) => ({
      "@media (prefers-reduced-motion: reduce)": value
    }),
    _dark: (value) => ({
      ".hope-ui-dark &": value
    }),
    _light: (value) => ({
      ".hope-ui-light &": value
    })
  };
  const radii$1 = {
    borderTopRadius: (value) => ({
      borderTopLeftRadius: value,
      borderTopRightRadius: value
    }),
    borderRightRadius: (value) => ({
      borderTopRightRadius: value,
      borderBottomRightRadius: value
    }),
    borderStartRadius: (value) => ({
      borderStartStartRadius: value,
      borderEndStartRadius: value
    }),
    borderBottomRadius: (value) => ({
      borderBottomLeftRadius: value,
      borderBottomRightRadius: value
    }),
    borderLeftRadius: (value) => ({
      borderTopLeftRadius: value,
      borderBottomLeftRadius: value
    }),
    borderEndRadius: (value) => ({
      borderStartEndRadius: value,
      borderEndEndRadius: value
    }),
    rounded: (value) => ({
      borderRadius: value
    }),
    roundedTop: (value) => ({
      borderTopLeftRadius: value,
      borderTopRightRadius: value
    }),
    roundedRight: (value) => ({
      borderTopRightRadius: value,
      borderBottomRightRadius: value
    }),
    roundedStart: (value) => ({
      borderStartStartRadius: value,
      borderEndStartRadius: value
    }),
    roundedBottom: (value) => ({
      borderBottomLeftRadius: value,
      borderBottomRightRadius: value
    }),
    roundedLeft: (value) => ({
      borderTopLeftRadius: value,
      borderBottomLeftRadius: value
    }),
    roundedEnd: (value) => ({
      borderStartEndRadius: value,
      borderEndEndRadius: value
    })
  };
  const shadow = {
    shadow: (value) => ({ boxShadow: value })
  };
  const size = {
    w: (value) => ({ width: value }),
    minW: (value) => ({ minWidth: value }),
    maxW: (value) => ({ maxWidth: value }),
    h: (value) => ({ height: value }),
    minH: (value) => ({ minHeight: value }),
    maxH: (value) => ({ maxHeight: value }),
    boxSize: (value) => ({ width: value, height: value })
  };
  const typography = {
    noOfLines: (value) => ({
      overflow: "hidden",
      display: "-webkit-box",
      "-webkit-box-orient": "vertical",
      "-webkit-line-clamp": value
    })
  };
  const utils$1 = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, background), border), display), position), pseudoSelectors), radii$1), margin), padding), shadow), size), typography);
  const blackAlpha = {
    blackAlpha1: "#00000003",
    blackAlpha2: "#00000007",
    blackAlpha3: "#0000000c",
    blackAlpha4: "#00000012",
    blackAlpha5: "#00000017",
    blackAlpha6: "#0000001d",
    blackAlpha7: "#00000024",
    blackAlpha8: "#00000038",
    blackAlpha9: "#00000070",
    blackAlpha10: "#0000007a",
    blackAlpha11: "#00000090",
    blackAlpha12: "#000000e8"
  };
  const whiteAlpha = {
    whiteAlpha1: "#ffffff00",
    whiteAlpha2: "#ffffff03",
    whiteAlpha3: "#ffffff09",
    whiteAlpha4: "#ffffff0e",
    whiteAlpha5: "#ffffff16",
    whiteAlpha6: "#ffffff20",
    whiteAlpha7: "#ffffff2d",
    whiteAlpha8: "#ffffff3f",
    whiteAlpha9: "#ffffff62",
    whiteAlpha10: "#ffffff72",
    whiteAlpha11: "#ffffff97",
    whiteAlpha12: "#ffffffeb"
  };
  const commonColors = __spreadValues(__spreadValues({}, blackAlpha), whiteAlpha);
  const primary = {
    primary1: "#fafdfe",
    primary2: "#f2fcfd",
    primary3: "#e7f9fb",
    primary4: "#d8f3f6",
    primary5: "#c4eaef",
    primary6: "#aadee6",
    primary7: "#84cdda",
    primary8: "#3db9cf",
    primary9: "#05a2c2",
    primary10: "#0894b3",
    primary11: "#0c7792",
    primary12: "#04313c"
  };
  const accent = {
    accent1: "#fdfcfe",
    accent2: "#fbfaff",
    accent3: "#f5f2ff",
    accent4: "#ede9fe",
    accent5: "#e4defc",
    accent6: "#d7cff9",
    accent7: "#c4b8f3",
    accent8: "#aa99ec",
    accent9: "#6e56cf",
    accent10: "#644fc1",
    accent11: "#5746af",
    accent12: "#20134b"
  };
  const neutral = {
    neutral1: "#fbfcfd",
    neutral2: "#f8f9fa",
    neutral3: "#f1f3f5",
    neutral4: "#eceef0",
    neutral5: "#e6e8eb",
    neutral6: "#dfe3e6",
    neutral7: "#d7dbdf",
    neutral8: "#c1c8cd",
    neutral9: "#889096",
    neutral10: "#7e868c",
    neutral11: "#687076",
    neutral12: "#11181c"
  };
  const success = {
    success1: "#fbfefc",
    success2: "#f2fcf5",
    success3: "#e9f9ee",
    success4: "#ddf3e4",
    success5: "#ccebd7",
    success6: "#b4dfc4",
    success7: "#92ceac",
    success8: "#5bb98c",
    success9: "#30a46c",
    success10: "#299764",
    success11: "#18794e",
    success12: "#153226"
  };
  const info = {
    info1: "#fbfdff",
    info2: "#f5faff",
    info3: "#edf6ff",
    info4: "#e1f0ff",
    info5: "#cee7fe",
    info6: "#b7d9f8",
    info7: "#96c7f2",
    info8: "#5eb0ef",
    info9: "#0091ff",
    info10: "#0081f1",
    info11: "#006adc",
    info12: "#00254d"
  };
  const warning = {
    warning1: "#fefdfb",
    warning2: "#fff9ed",
    warning3: "#fff4d5",
    warning4: "#ffecbc",
    warning5: "#ffe3a2",
    warning6: "#ffd386",
    warning7: "#f3ba63",
    warning8: "#ee9d2b",
    warning9: "#ffb224",
    warning10: "#ffa01c",
    warning11: "#ad5700",
    warning12: "#4e2009"
  };
  const danger = {
    danger1: "#fffcfc",
    danger2: "#fff8f8",
    danger3: "#ffefef",
    danger4: "#ffe5e5",
    danger5: "#fdd8d8",
    danger6: "#f9c6c6",
    danger7: "#f3aeaf",
    danger8: "#eb9091",
    danger9: "#e5484d",
    danger10: "#dc3d43",
    danger11: "#cd2b31",
    danger12: "#381316"
  };
  const semanticColors = {
    loContrast: "white",
    background: "$loContrast",
    focusRing: "#96c7f2",
    closeButtonHoverBackground: "$blackAlpha4",
    closeButtonActiveBackground: "$blackAlpha5",
    progressStripe: "$whiteAlpha6"
  };
  const lightColors = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, primary), accent), neutral), success), info), warning), danger), semanticColors);
  const primaryDark = {
    primary1: "#07191d",
    primary2: "#061e24",
    primary3: "#072830",
    primary4: "#07303b",
    primary5: "#073844",
    primary6: "#064150",
    primary7: "#045063",
    primary8: "#00647d",
    primary9: "#05a2c2",
    primary10: "#00b1cc",
    primary11: "#00c2d7",
    primary12: "#e1f8fa"
  };
  const accentDark = {
    accent1: "#17151f",
    accent2: "#1c172b",
    accent3: "#251e40",
    accent4: "#2c2250",
    accent5: "#32275f",
    accent6: "#392c72",
    accent7: "#443592",
    accent8: "#5842c3",
    accent9: "#6e56cf",
    accent10: "#7c66dc",
    accent11: "#9e8cfc",
    accent12: "#f1eefe"
  };
  const neutralDark = {
    neutral1: "#151718",
    neutral2: "#1a1d1e",
    neutral3: "#202425",
    neutral4: "#26292b",
    neutral5: "#2b2f31",
    neutral6: "#313538",
    neutral7: "#3a3f42",
    neutral8: "#4c5155",
    neutral9: "#697177",
    neutral10: "#787f85",
    neutral11: "#9ba1a6",
    neutral12: "#ecedee"
  };
  const successDark = {
    success1: "#0d1912",
    success2: "#0c1f17",
    success3: "#0f291e",
    success4: "#113123",
    success5: "#133929",
    success6: "#164430",
    success7: "#1b543a",
    success8: "#236e4a",
    success9: "#30a46c",
    success10: "#3cb179",
    success11: "#4cc38a",
    success12: "#e5fbeb"
  };
  const infoDark = {
    info1: "#0f1720",
    info2: "#0f1b2d",
    info3: "#10243e",
    info4: "#102a4c",
    info5: "#0f3058",
    info6: "#0d3868",
    info7: "#0a4481",
    info8: "#0954a5",
    info9: "#0091ff",
    info10: "#369eff",
    info11: "#52a9ff",
    info12: "#eaf6ff"
  };
  const warningDark = {
    warning1: "#1f1300",
    warning2: "#271700",
    warning3: "#341c00",
    warning4: "#3f2200",
    warning5: "#4a2900",
    warning6: "#573300",
    warning7: "#693f05",
    warning8: "#824e00",
    warning9: "#ffb224",
    warning10: "#ffcb47",
    warning11: "#f1a10d",
    warning12: "#fef3dd"
  };
  const dangerDark = {
    danger1: "#1f1315",
    danger2: "#291415",
    danger3: "#3c181a",
    danger4: "#481a1d",
    danger5: "#541b1f",
    danger6: "#671e22",
    danger7: "#822025",
    danger8: "#aa2429",
    danger9: "#e5484d",
    danger10: "#f2555a",
    danger11: "#ff6369",
    danger12: "#feecee"
  };
  const semanticDarkColors = {
    loContrast: "$neutral1",
    background: "$loContrast",
    focusRing: "#0a4481",
    closeButtonHoverBackground: "$whiteAlpha4",
    closeButtonActiveBackground: "$whiteAlpha5",
    progressStripe: "$blackAlpha6"
  };
  const darkColors = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, primaryDark), accentDark), neutralDark), successDark), infoDark), warningDark), dangerDark), semanticDarkColors);
  const radii = {
    none: "0",
    xs: "0.125rem",
    sm: "0.25rem",
    md: "0.375rem",
    lg: "0.5rem",
    xl: "0.75rem",
    "2xl": "1rem",
    "3xl": "1.5rem",
    full: "9999px"
  };
  const shadows = {
    none: "0 0 #0000",
    xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    sm: "0 1px 3px 0 rgb(0 0 0 / 0.09), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.09), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.09), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.09), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    "2xl": "0 25px 50px -12px rgb(0 0 0 / 0.24)",
    inner: "inset 0 2px 4px 0 rgb(0 0 0 / 0.06)",
    outline: "0 0 0 3px $colors$focusRing"
  };
  const darkShadows = {
    lg: "rgba(0, 0, 0, 0.1) 0px 0px 0px 1px, rgba(0, 0, 0, 0.2) 0px 5px 10px, rgba(0, 0, 0, 0.4) 0px 15px 40px"
  };
  const fonts = {
    sans: 'ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, "Noto Sans", sans-serif, "Apple Color Emoji", "Segoe UI Emoji", "Segoe UI Symbol","Noto Color Emoji"',
    serif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
    mono: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace'
  };
  const fontSizes = {
    "2xs": "0.625rem",
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
    "5xl": "3rem",
    "6xl": "3.75rem",
    "7xl": "4.5rem",
    "8xl": "6rem",
    "9xl": "8rem"
  };
  const fontWeights = {
    hairline: 100,
    thin: 200,
    light: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
    black: 900
  };
  const lineHeights = {
    normal: "normal",
    none: 1,
    shorter: 1.25,
    short: 1.375,
    base: 1.5,
    tall: 1.625,
    taller: 2,
    "3": ".75rem",
    "4": "1rem",
    "5": "1.25rem",
    "6": "1.5rem",
    "7": "1.75rem",
    "8": "2rem",
    "9": "2.25rem",
    "10": "2.5rem"
  };
  const letterSpacings = {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
    widest: "0.1em"
  };
  const zIndices = {
    hide: -1,
    auto: "auto",
    base: 0,
    docked: 10,
    sticky: 1e3,
    banner: 1100,
    overlay: 1200,
    modal: 1300,
    dropdown: 1400,
    popover: 1500,
    tooltip: 1600,
    skipLink: 1700,
    notification: 1800
  };
  const baseThemeTokens = {
    colors: __spreadValues(__spreadValues({}, commonColors), lightColors),
    space,
    sizes,
    fonts,
    fontSizes,
    fontWeights,
    letterSpacings,
    lineHeights,
    radii,
    shadows,
    zIndices
  };
  const baseDarkThemeTokens = {
    colors: darkColors,
    shadows: darkShadows
  };
  const {
    theme: baseTheme,
    css,
    globalCss,
    config,
    createTheme,
    getCssText,
    keyframes
  } = X({
    prefix: "hope",
    themeMap: __spreadProps(__spreadValues({}, i), {
      borderWidth: "sizes",
      borderTopWidth: "sizes",
      borderRightWidth: "sizes",
      borderBottomWidth: "sizes",
      borderLeftWidth: "sizes",
      strokeWidth: "sizes"
    }),
    theme: baseThemeTokens,
    media: baseMedia,
    utils: utils$1
  });
  const modalTransitionName = {
    fade: "hope-modal-fade-transition",
    fadeInBottom: "hope-modal-fade-in-bottom-transition",
    scale: "hope-modal-scale-transition"
  };
  const modalTransitionStyles = globalCss({
    [`.${modalTransitionName.fade}-enter, .${modalTransitionName.fade}-exit-to`]: {
      opacity: 0
    },
    [`.${modalTransitionName.fade}-enter-to, .${modalTransitionName.fade}-exit`]: {
      opacity: 1
    },
    [`.${modalTransitionName.fade}-enter-active`]: {
      transition: "opacity 300ms ease-out"
    },
    [`.${modalTransitionName.fade}-exit-active`]: {
      transition: "opacity 200ms ease-in"
    },
    [`.${modalTransitionName.fadeInBottom}-enter, .${modalTransitionName.fadeInBottom}-exit-to`]: {
      opacity: 0,
      transform: "translateY(16px)"
    },
    [`.${modalTransitionName.fadeInBottom}-enter-to, .${modalTransitionName.fadeInBottom}-exit`]: {
      opacity: 1,
      transform: "translateY(0)"
    },
    [`.${modalTransitionName.fadeInBottom}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out"
    },
    [`.${modalTransitionName.fadeInBottom}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease-in"
    },
    [`.${modalTransitionName.scale}-enter, .${modalTransitionName.scale}-exit-to`]: {
      opacity: 0,
      transform: "scale(0.95)"
    },
    [`.${modalTransitionName.scale}-enter-to, .${modalTransitionName.scale}-exit`]: {
      opacity: 1,
      transform: "scale(1)"
    },
    [`.${modalTransitionName.scale}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease-out"
    },
    [`.${modalTransitionName.scale}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease-in"
    }
  });
  const modalOverlayStyles = css({
    zIndex: "$overlay",
    position: "fixed",
    top: 0,
    left: 0,
    width: "100vw",
    height: "100vh",
    backgroundColor: "hsl(0 0% 0% / 65%)"
  });
  const baseModalContainerStyles = css({
    zIndex: "$modal",
    position: "fixed",
    top: 0,
    left: 0,
    display: "flex",
    width: "100vw",
    height: "100vh",
    "@supports(height: -webkit-fill-available)": {
      height: "-webkit-fill-available"
    },
    outline: "none",
    "&:focus": {
      outline: "none"
    }
  });
  const modalContainerStyles = css(baseModalContainerStyles, {
    justifyContent: "center",
    variants: {
      centered: {
        true: {
          alignItems: "center"
        },
        false: {
          alignItems: "flex-start"
        }
      },
      scrollBehavior: {
        inside: {
          overflow: "hidden"
        },
        outside: {
          overflow: "auto"
        }
      }
    }
  });
  const baseDialogStyles = css({
    zIndex: "$modal",
    position: "relative",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    outline: "none",
    boxShadow: "$lg",
    backgroundColor: "$loContrast",
    color: "inherit",
    "&:focus": {
      outline: "none"
    }
  });
  const modalDialogStyles = css(baseDialogStyles, {
    justifyContent: "center",
    my: "3.75rem",
    borderRadius: "$sm",
    variants: {
      size: {
        xs: {
          maxWidth: "$xs"
        },
        sm: {
          maxWidth: "$sm"
        },
        md: {
          maxWidth: "$md"
        },
        lg: {
          maxWidth: "$lg"
        },
        xl: {
          maxWidth: "$xl"
        },
        "2xl": {
          maxWidth: "$2xl"
        },
        "3xl": {
          maxWidth: "$3xl"
        },
        "4xl": {
          maxWidth: "$4xl"
        },
        "5xl": {
          maxWidth: "$5xl"
        },
        "6xl": {
          maxWidth: "$6xl"
        },
        "7xl": {
          maxWidth: "$7xl"
        },
        "8xl": {
          maxWidth: "$8xl"
        },
        full: {
          maxWidth: "100vw",
          minHeight: "100vh",
          "@supports(min-height: -webkit-fill-available)": {
            minHeight: "-webkit-fill-available"
          },
          my: 0,
          borderRadius: "$none"
        }
      },
      scrollBehavior: {
        inside: {
          maxHeight: "calc(100% - 7.5rem)"
        },
        outside: {
          maxHeight: "none"
        }
      }
    }
  });
  const modalHeaderStyles = css({
    flex: 0,
    pt: "$5",
    px: "$5",
    pb: "$3",
    fontSize: "$lg",
    fontWeight: "$medium"
  });
  const modalBodyStyles = css({
    flex: 1,
    px: "$5",
    py: "$2",
    variants: {
      scrollBehavior: {
        inside: {
          overflow: "auto"
        },
        outside: {
          overflow: void 0
        }
      }
    }
  });
  css({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    pt: "$3",
    px: "$5",
    pb: "$5"
  });
  const modalCloseButtonStyles = css({
    position: "absolute",
    top: "$4",
    insetInlineEnd: "$4"
  });
  const drawerTransitionName = {
    fade: "hope-drawer-fade-transition",
    slideInTop: "hope-drawer-slide-in-top-transition",
    slideInRight: "hope-drawer-slide-in-right-transition",
    slideInBottom: "hope-drawer-slide-in-bottom-transition",
    slideInLeft: "hope-drawer-slide-in-left-transition"
  };
  const drawerTransitionStyles = globalCss({
    [`.${drawerTransitionName.fade}-enter, .${drawerTransitionName.fade}-exit-to`]: {
      opacity: 0
    },
    [`.${drawerTransitionName.fade}-enter-to, .${drawerTransitionName.fade}-exit`]: {
      opacity: 1
    },
    [`.${drawerTransitionName.fade}-enter-active, .${drawerTransitionName.fade}-exit-active`]: {
      transition: "opacity 500ms ease-in-out"
    },
    [`.${drawerTransitionName.slideInTop}-enter-active, .${drawerTransitionName.slideInTop}-exit-active,
    .${drawerTransitionName.slideInRight}-enter-active, .${drawerTransitionName.slideInRight}-exit-active,
    .${drawerTransitionName.slideInBottom}-enter-active, .${drawerTransitionName.slideInBottom}-exit-active,
    .${drawerTransitionName.slideInLeft}-enter-active, .${drawerTransitionName.slideInLeft}-exit-active`]: {
      transition: "transform 500ms ease-in-out"
    },
    [`.${drawerTransitionName.slideInTop}-enter, .${drawerTransitionName.slideInTop}-exit-to`]: {
      transform: "translateY(-100%)"
    },
    [`.${drawerTransitionName.slideInTop}-enter-to, .${drawerTransitionName.slideInTop}-exit`]: {
      transform: "translateY(0)"
    },
    [`.${drawerTransitionName.slideInRight}-enter, .${drawerTransitionName.slideInRight}-exit-to`]: {
      transform: "translateX(100%)"
    },
    [`.${drawerTransitionName.slideInRight}-enter-to, .${drawerTransitionName.slideInRight}-exit`]: {
      transform: "translateX(0)"
    },
    [`.${drawerTransitionName.slideInBottom}-enter, .${drawerTransitionName.slideInBottom}-exit-to`]: {
      transform: "translateY(100%)"
    },
    [`.${drawerTransitionName.slideInBottom}-enter-to, .${drawerTransitionName.slideInBottom}-exit`]: {
      transform: "translateY(0)"
    },
    [`.${drawerTransitionName.slideInLeft}-enter, .${drawerTransitionName.slideInLeft}-exit-to`]: {
      transform: "translateX(-100%)"
    },
    [`.${drawerTransitionName.slideInLeft}-enter-to, .${drawerTransitionName.slideInLeft}-exit`]: {
      transform: "translateX(0)"
    }
  });
  css(baseModalContainerStyles, {
    overflow: "hidden",
    variants: {
      placement: {
        top: {
          alignItems: "flex-start",
          justifyContent: "stretch"
        },
        right: {
          alignItems: "stretch",
          justifyContent: "flex-end"
        },
        bottom: {
          alignItems: "flex-end",
          justifyContent: "stretch"
        },
        left: {
          alignItems: "stretch",
          justifyContent: "flex-start"
        }
      }
    }
  });
  css(baseDialogStyles, {
    maxHeight: "100vh",
    variants: {
      size: {
        xs: {
          maxWidth: "$xs"
        },
        sm: {
          maxWidth: "$md"
        },
        md: {
          maxWidth: "$lg"
        },
        lg: {
          maxWidth: "$2xl"
        },
        xl: {
          maxWidth: "$4xl"
        },
        full: {
          maxWidth: "100vw",
          height: "100vh"
        }
      },
      placement: {
        top: {},
        right: {},
        bottom: {},
        left: {}
      },
      fullHeight: {
        true: {
          height: "100vh"
        },
        false: {}
      }
    },
    compoundVariants: [
      { placement: "top", size: "xs", css: { maxWidth: "100vw" } },
      { placement: "top", size: "sm", css: { maxWidth: "100vw" } },
      { placement: "top", size: "md", css: { maxWidth: "100vw" } },
      { placement: "top", size: "lg", css: { maxWidth: "100vw" } },
      { placement: "top", size: "xl", css: { maxWidth: "100vw" } },
      { placement: "bottom", size: "xs", css: { maxWidth: "100vw" } },
      { placement: "bottom", size: "sm", css: { maxWidth: "100vw" } },
      { placement: "bottom", size: "md", css: { maxWidth: "100vw" } },
      { placement: "bottom", size: "lg", css: { maxWidth: "100vw" } },
      { placement: "bottom", size: "xl", css: { maxWidth: "100vw" } }
    ]
  });
  const menuTransitionName = {
    scaleTopLeft: "hope-menu-scale-top-left-transition",
    scaleTopRight: "hope-menu-scale-top-right-transition",
    scaleBottomLeft: "hope-menu-scale-bottom-left-transition",
    scaleBottomRight: "hope-menu-scale-bottom-right-transition"
  };
  function createMenuScaleTransition(name, transformOrigin) {
    return {
      [`.${name}-enter, .${name}-exit-to`]: {
        opacity: 0,
        transform: "scale(0.8)"
      },
      [`.${name}-enter-to, .${name}-exit`]: {
        opacity: 1,
        transform: "scale(1)"
      },
      [`.${name}-enter-active`]: {
        transformOrigin,
        transitionProperty: "opacity, transform",
        transitionDuration: "200ms",
        transitionTimingFunction: "ease-out"
      },
      [`.${name}-exit-active`]: {
        transformOrigin,
        transitionProperty: "opacity, transform",
        transitionDuration: "100ms",
        transitionTimingFunction: "ease-in"
      }
    };
  }
  const menuTransitionStyles = globalCss(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, createMenuScaleTransition(menuTransitionName.scaleTopLeft, "top left")), createMenuScaleTransition(menuTransitionName.scaleTopRight, "top right")), createMenuScaleTransition(menuTransitionName.scaleBottomLeft, "bottom left")), createMenuScaleTransition(menuTransitionName.scaleBottomRight, "bottom right")));
  css({
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    outline: "none"
  });
  css({
    zIndex: "$dropdown",
    position: "absolute",
    left: 0,
    top: "100%",
    display: "flex",
    flexDirection: "column",
    minWidth: "$56",
    overflowY: "auto",
    outline: "none",
    margin: 0,
    boxShadow: "$md",
    border: "1px solid $colors$neutral7",
    borderRadius: "$sm",
    backgroundColor: "$loContrast",
    px: 0,
    py: "$1",
    "&:focus": {
      outline: "none"
    }
  });
  css({});
  css({
    display: "flex",
    alignItems: "center",
    mx: "$1",
    py: "$2",
    px: "$3",
    color: "$neutral11",
    fontSize: "$xs",
    fontWeight: "$medium",
    lineHeight: "$4"
  });
  function createColorVariant$1(config2) {
    return {
      color: config2.color,
      [`&[data-active]`]: {
        backgroundColor: config2.bgColorActive
      }
    };
  }
  css({
    position: "relative",
    display: "flex",
    alignItems: "center",
    mx: "$1",
    borderRadius: "$sm",
    py: "$2",
    px: "$3",
    fontSize: "$base",
    fontWeight: "$normal",
    lineHeight: "$6",
    cursor: "pointer",
    userSelect: "none",
    transition: "color 250ms, background-color 250ms",
    "&[data-disabled]": {
      color: "$neutral8",
      cursor: "not-allowed"
    },
    variants: {
      colorScheme: {
        primary: createColorVariant$1({ color: "$primary11", bgColorActive: "$primary3" }),
        accent: createColorVariant$1({ color: "$accent11", bgColorActive: "$accent3" }),
        neutral: createColorVariant$1({ color: "$neutral12", bgColorActive: "$neutral4" }),
        success: createColorVariant$1({ color: "$success11", bgColorActive: "$success3" }),
        info: createColorVariant$1({ color: "$info11", bgColorActive: "$info3" }),
        warning: createColorVariant$1({ color: "$warning11", bgColorActive: "$warning3" }),
        danger: createColorVariant$1({ color: "$danger11", bgColorActive: "$danger3" })
      }
    },
    defaultVariants: {
      colorScheme: "neutral"
    }
  });
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0
  });
  css({
    flexGrow: 1
  });
  css({
    flexShrink: 0,
    color: "$neutral11",
    fontSize: "$sm",
    lineHeight: "$none"
  });
  const spin = keyframes({
    from: { transform: "rotate(0deg)" },
    to: { transform: "rotate(360deg)" }
  });
  keyframes({
    from: { opacity: 0 },
    to: { opacity: 1 }
  });
  const notificationTransitionName = {
    slideInTop: "hope-notification-slide-in-top-transition",
    slideInRight: "hope-notification-slide-in-right-transition",
    slideInBottom: "hope-notification-slide-in-bottom-transition",
    slideInLeft: "hope-notification-slide-in-left-transition"
  };
  function createNotificationSlideTransition(config2) {
    return {
      [`.${config2.name}-enter, .${config2.name}-exit-to`]: {
        opacity: 0,
        transform: config2.enterTransform
      },
      [`.${config2.name}-enter-to, .${config2.name}-exit`]: {
        opacity: 1,
        transform: config2.leaveTransform
      },
      [`.${config2.name}-enter-active`]: {
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "cubic-bezier(.51,.3,0,1.21)",
        transitionDuration: "300ms"
      },
      [`.${config2.name}-exit-active`]: {
        transitionProperty: "opacity, transform",
        transitionTimingFunction: "ease-in",
        transitionDuration: "200ms"
      }
    };
  }
  const notificationTransitionStyles = globalCss(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, createNotificationSlideTransition({
    name: notificationTransitionName.slideInTop,
    enterTransform: "translateY(-100%)",
    leaveTransform: "translateY(0)"
  })), createNotificationSlideTransition({
    name: notificationTransitionName.slideInRight,
    enterTransform: "translateX(100%)",
    leaveTransform: "translateX(0)"
  })), createNotificationSlideTransition({
    name: notificationTransitionName.slideInBottom,
    enterTransform: "translateY(100%)",
    leaveTransform: "translateY(0)"
  })), createNotificationSlideTransition({
    name: notificationTransitionName.slideInLeft,
    enterTransform: "translateX(-100%)",
    leaveTransform: "translateX(0)"
  })));
  css({
    position: "fixed",
    zIndex: "$notification",
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-end",
    gap: "$4",
    width: "calc(100% - 32px)",
    maxWidth: "$md",
    variants: {
      placement: {
        "top-start": {
          top: "$4",
          left: "$4"
        },
        top: {
          top: "$4",
          left: "50%",
          transform: "translateX(-50%)"
        },
        "top-end": {
          top: "$4",
          right: "$4"
        },
        "bottom-start": {
          bottom: "$4",
          left: "$4"
        },
        bottom: {
          bottom: "$4",
          left: "50%",
          transform: "translateX(-50%)"
        },
        "bottom-end": {
          bottom: "$4",
          right: "$4"
        }
      }
    },
    defaultVariants: {
      placement: "top-end"
    }
  });
  css({
    position: "relative",
    display: "flex",
    alignItems: "center",
    width: "100%",
    maxWidth: "$md",
    borderRadius: "$sm",
    border: "1px solid $colors$neutral5",
    boxShadow: "$lg",
    backgroundColor: "$loContrast",
    padding: "$3",
    fontSize: "$sm",
    lineHeight: "$5",
    variants: {
      status: {
        success: {},
        info: {},
        warning: {},
        danger: {}
      }
    }
  });
  css({
    animation: `1s linear infinite ${spin}`
  });
  css({
    flexShrink: 0,
    variants: {
      status: {
        success: { color: "$success9" },
        info: { color: "$info9" },
        warning: { color: "$warning9" },
        danger: { color: "$danger9" }
      }
    }
  });
  css({
    fontWeight: "$medium"
  });
  css({
    display: "inline-block",
    color: "$neutral11"
  });
  const popoverTransitionName = {
    scale: "hope-popover-scale-transition"
  };
  const popoverTransitionStyles = globalCss({
    [`.${popoverTransitionName.scale}-enter, .${popoverTransitionName.scale}-exit-to`]: {
      opacity: 0,
      transform: "scale(0.95)"
    },
    [`.${popoverTransitionName.scale}-enter-to, .${popoverTransitionName.scale}-exit`]: {
      opacity: 1,
      transform: "scale(1)"
    },
    [`.${popoverTransitionName.scale}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "300ms",
      transitionTimingFunction: "ease"
    },
    [`.${popoverTransitionName.scale}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease-in-out"
    }
  });
  css({
    zIndex: "$popover",
    position: "absolute",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    width: "100%",
    maxWidth: "$xs",
    outline: "none",
    boxShadow: "$md",
    border: "1px solid $colors$neutral7",
    borderRadius: "$sm",
    backgroundColor: "$loContrast",
    color: "inherit",
    "&:focus": {
      outline: "none"
    }
  });
  css({
    display: "flex",
    alignItems: "center",
    flex: 0,
    borderColor: "inherit",
    borderBottomWidth: "1px",
    px: "$3",
    py: "$2",
    fontSize: "$base",
    fontWeight: "$medium"
  });
  css({
    flex: 1,
    px: "$3",
    py: "$2"
  });
  css({
    display: "flex",
    alignItems: "center",
    borderColor: "inherit",
    borderTopWidth: "1px",
    px: "$3",
    py: "$2"
  });
  css({
    position: "absolute",
    top: "$2",
    insetInlineEnd: "$2"
  });
  css({
    zIndex: "$popover",
    position: "absolute",
    boxSize: "8px",
    borderWidth: "1px",
    borderStyle: "solid",
    borderColor: "inherit",
    backgroundColor: "inherit",
    transform: "rotate(45deg)",
    variants: {
      popoverPlacement: {
        left: {
          borderLeft: 0,
          borderBottom: 0
        },
        top: {
          borderLeft: 0,
          borderTop: 0
        },
        right: {
          borderTop: 0,
          borderRight: 0
        },
        bottom: {
          borderRight: 0,
          borderBottom: 0
        }
      }
    }
  });
  function createInputSizeVariant(config2) {
    return {
      minHeight: config2.minHeight,
      fontSize: config2.fontSize,
      lineHeight: config2.lineHeight
    };
  }
  const inputSizes = {
    xs: createInputSizeVariant({ fontSize: "$xs", lineHeight: "$4", minHeight: "$6" }),
    sm: createInputSizeVariant({ fontSize: "$sm", lineHeight: "$5", minHeight: "$8" }),
    md: createInputSizeVariant({ fontSize: "$base", lineHeight: "$6", minHeight: "$10" }),
    lg: createInputSizeVariant({ fontSize: "$lg", lineHeight: "$7", minHeight: "$12" })
  };
  const commonOutlineAndFilledStyles = {
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed"
    },
    "&:focus": {
      boxShadow: "0 0 0 3px $colors$primary5",
      borderColor: "$primary8"
    },
    "&[aria-invalid=true]": {
      borderColor: "$danger8"
    },
    "&[aria-invalid=true]:focus": {
      boxShadow: "0 0 0 3px $colors$danger5"
    }
  };
  const baseInputResetStyles = css({
    appearance: "none",
    position: "relative",
    width: "100%",
    minWidth: 0,
    outline: "none",
    borderRadius: "$sm",
    backgroundColor: "transparent",
    padding: 0,
    color: "$neutral12",
    fontSize: "$base",
    lineHeight: "$base",
    transition: "color 250ms, border-color 250ms, background-color 250ms, box-shadow 250ms",
    "&[readonly]": {
      boxShadow: "none !important",
      userSelect: "all",
      cursor: "default"
    },
    "&::placeholder": {
      color: "$neutral9",
      opacity: 1
    },
    variants: {
      variant: {
        outline: __spreadValues({
          border: "1px solid $neutral7",
          backgroundColor: "transparent",
          "&:hover": {
            borderColor: "$neutral8"
          }
        }, commonOutlineAndFilledStyles),
        filled: __spreadValues({
          border: "1px solid transparent",
          backgroundColor: "$neutral3",
          "&:hover, &:focus": {
            backgroundColor: "$neutral4"
          }
        }, commonOutlineAndFilledStyles),
        unstyled: {
          border: "1px solid transparent",
          backgroundColor: "transparent"
        }
      },
      size: __spreadValues({}, inputSizes)
    }
  });
  function createVariantAndSizeCompoundVariant(config2) {
    return [
      {
        variant: config2.variant,
        size: config2.size,
        css: { px: config2.paddingX }
      },
      {
        withLeftElement: true,
        variant: config2.variant,
        size: config2.size,
        css: { paddingInlineStart: config2.paddingWithElement }
      },
      {
        withRightElement: true,
        variant: config2.variant,
        size: config2.size,
        css: { paddingInlineEnd: config2.paddingWithElement }
      }
    ];
  }
  const inputStyles = css(baseInputResetStyles, {
    variants: {
      withLeftElement: {
        true: {}
      },
      withRightElement: {
        true: {}
      },
      withLeftAddon: {
        true: {
          borderLeftRadius: 0
        }
      },
      withRightAddon: {
        true: {
          borderRightRadius: 0
        }
      }
    },
    compoundVariants: [
      ...createVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "xs",
        paddingX: "$2",
        paddingWithElement: "$6"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "sm",
        paddingX: "$2_5",
        paddingWithElement: "$8"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "md",
        paddingX: "$3",
        paddingWithElement: "$10"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "lg",
        paddingX: "$4",
        paddingWithElement: "$12"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "xs",
        paddingX: "$2",
        paddingWithElement: "$6"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "sm",
        paddingX: "$2_5",
        paddingWithElement: "$8"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "md",
        paddingX: "$3",
        paddingWithElement: "$10"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "lg",
        paddingX: "$4",
        paddingWithElement: "$12"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "xs",
        paddingX: 0,
        paddingWithElement: "$6"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "sm",
        paddingX: 0,
        paddingWithElement: "$8"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "md",
        paddingX: 0,
        paddingWithElement: "$10"
      }),
      ...createVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "lg",
        paddingX: 0,
        paddingWithElement: "$12"
      })
    ]
  });
  css({
    position: "relative",
    display: "flex",
    width: "100%"
  });
  css({
    position: "absolute",
    top: "0",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    variants: {
      placement: {
        left: { insetInlineStart: "0" },
        right: { insetInlineEnd: "0" }
      },
      size: {
        xs: __spreadProps(__spreadValues({}, inputSizes.xs), {
          width: inputSizes.xs.minHeight
        }),
        sm: __spreadProps(__spreadValues({}, inputSizes.sm), {
          width: inputSizes.sm.minHeight
        }),
        md: __spreadProps(__spreadValues({}, inputSizes.md), {
          width: inputSizes.md.minHeight
        }),
        lg: __spreadProps(__spreadValues({}, inputSizes.lg), {
          width: inputSizes.lg.minHeight
        })
      }
    }
  });
  function createInputAddonVariantAndSizeCompoundVariant(config2) {
    return {
      variant: config2.variant,
      size: config2.size,
      css: { px: config2.paddingX }
    };
  }
  css({
    display: "flex",
    alignItems: "center",
    flex: "0 0 auto",
    width: "auto",
    whiteSpace: "nowrap",
    variants: {
      placement: {
        left: {
          marginEnd: "-1px"
        },
        right: {
          marginStart: "-1px"
        }
      },
      variant: {
        outline: {
          borderRadius: "$sm",
          border: "1px solid $neutral7",
          backgroundColor: "$neutral3",
          color: "$neutral12"
        },
        filled: {
          borderRadius: "$sm",
          border: "1px solid transparent",
          backgroundColor: "$neutral3",
          color: "$neutral12"
        },
        unstyled: {
          border: "1px solid transparent",
          backgroundColor: "transparent"
        }
      },
      size: __spreadValues({}, inputSizes)
    },
    compoundVariants: [
      {
        variant: "outline",
        placement: "left",
        css: {
          borderRightRadius: 0,
          borderInlineEndColor: "transparent"
        }
      },
      {
        variant: "outline",
        placement: "right",
        css: {
          borderLeftRadius: 0,
          borderInlineStartColor: "transparent"
        }
      },
      {
        variant: "filled",
        placement: "left",
        css: {
          borderStartEndRadius: 0,
          borderEndEndRadius: 0,
          borderInlineEndColor: "transparent"
        }
      },
      {
        variant: "filled",
        placement: "right",
        css: {
          borderStartStartRadius: 0,
          borderEndStartRadius: 0,
          borderInlineStartColor: "transparent"
        }
      },
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "xs",
        paddingX: "$2"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "sm",
        paddingX: "$2_5"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "md",
        paddingX: "$3"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "outline",
        size: "lg",
        paddingX: "$4"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "xs",
        paddingX: "$2"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "sm",
        paddingX: "$2_5"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "md",
        paddingX: "$3"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "filled",
        size: "lg",
        paddingX: "$4"
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "xs",
        paddingX: 0
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "sm",
        paddingX: 0
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "md",
        paddingX: 0
      }),
      createInputAddonVariantAndSizeCompoundVariant({
        variant: "unstyled",
        size: "lg",
        paddingX: 0
      })
    ]
  });
  const selectTransitionName = {
    fadeInTop: "hope-select-fade-in-top-transition"
  };
  const selectTransitionStyles = globalCss({
    [`.${selectTransitionName.fadeInTop}-enter, .${selectTransitionName.fadeInTop}-exit-to`]: {
      opacity: 0,
      transform: "translateY(-16px)"
    },
    [`.${selectTransitionName.fadeInTop}-enter-to, .${selectTransitionName.fadeInTop}-exit`]: {
      opacity: 1,
      transform: "translateY(0)"
    },
    [`.${selectTransitionName.fadeInTop}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease-out"
    },
    [`.${selectTransitionName.fadeInTop}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "100ms",
      transitionTimingFunction: "ease-in"
    }
  });
  function createVariantAndSizeCompoundVariants$1(variant, paddingStart, paddingEnd) {
    return Object.entries({
      xs: {
        start: paddingStart != null ? paddingStart : "$2",
        end: paddingEnd != null ? paddingEnd : "$1"
      },
      sm: {
        start: paddingStart != null ? paddingStart : "$2_5",
        end: paddingEnd != null ? paddingEnd : "$1_5"
      },
      md: {
        start: paddingStart != null ? paddingStart : "$3",
        end: paddingEnd != null ? paddingEnd : "$2"
      },
      lg: {
        start: paddingStart != null ? paddingStart : "$4",
        end: paddingEnd != null ? paddingEnd : "$3"
      }
    }).map(([key, value]) => ({
      variant,
      size: key,
      css: {
        paddingInlineStart: value.start,
        paddingInlineEnd: value.end
      }
    }));
  }
  css(baseInputResetStyles, {
    appearance: "none",
    display: "inline-flex",
    alignItems: "center",
    outline: "none",
    cursor: "pointer",
    "&:focus": {
      outline: "none"
    },
    compoundVariants: [
      ...createVariantAndSizeCompoundVariants$1("outline"),
      ...createVariantAndSizeCompoundVariants$1("filled"),
      ...createVariantAndSizeCompoundVariants$1("unstyled", 0, 0)
    ]
  });
  const selectSingleValueStyles = css({
    flexGrow: 1,
    flexShrink: 1,
    textAlign: "start",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap"
  });
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexWrap: "wrap",
    flexGrow: 1,
    flexShrink: 1,
    variants: {
      size: {
        xs: {
          gap: "$0_5",
          py: "$0_5"
        },
        sm: {
          gap: "$1",
          py: "$1"
        },
        md: {
          gap: "$1_5",
          py: "$1_5"
        },
        lg: {
          gap: "$2",
          py: "$2"
        }
      }
    }
  });
  css({
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "$0_5",
    borderRadius: "$sm",
    py: 0,
    pl: "$2",
    lineHeight: "$none",
    variants: {
      variant: {
        subtle: {
          backgroundColor: "$neutral4",
          color: "$neutral12"
        },
        outline: {
          border: "1px solid $colors$neutral7",
          backgroundColor: "$loContrast",
          color: "$neutral12"
        }
      },
      size: {
        xs: {
          height: "$4",
          fontSize: "$2xs"
        },
        sm: {
          height: "$5",
          fontSize: "$xs"
        },
        md: {
          height: "$6",
          fontSize: "$sm"
        },
        lg: {
          height: "$7",
          fontSize: "$base"
        }
      }
    }
  });
  css({
    appearance: "none",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100%",
    outline: "none",
    borderRightRadius: "$sm",
    backgroundColor: "transparent",
    px: "$1",
    color: "inherit",
    lineHeight: "$none",
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
    transition: "color 250ms, background-color 250ms, box-shadow 250ms",
    "&:hover": {
      backgroundColor: "$neutral7"
    },
    "&:focus": {
      outline: "none",
      boxShadow: "$outline"
    }
  });
  css(selectSingleValueStyles, {
    color: "$neutral9",
    opacity: 1
  });
  css({
    flexGrow: 0,
    flexShrink: 0,
    marginInlineStart: "auto",
    color: "$neutral11",
    fontSize: "1.25em",
    pointerEvents: "none",
    transition: "transform 250ms",
    transformOrigin: "center",
    variants: {
      opened: {
        true: {
          transform: "rotate(-180deg)"
        }
      }
    }
  });
  css({
    zIndex: "$dropdown",
    position: "absolute",
    left: 0,
    top: "100%",
    display: "flex",
    flexDirection: "column",
    width: "100%",
    overflow: "hidden",
    margin: 0,
    boxShadow: "$md",
    border: "1px solid $colors$neutral7",
    borderRadius: "$sm",
    backgroundColor: "$loContrast",
    padding: 0
  });
  css({
    position: "relative",
    display: "flex",
    flexDirection: "column",
    maxHeight: "$60",
    width: "100%",
    overflowY: "auto",
    margin: 0,
    padding: "$1",
    listStyle: "none"
  });
  css({});
  css({
    display: "flex",
    alignItems: "center",
    py: "$2",
    px: "$3",
    color: "$neutral11",
    fontSize: "$xs",
    lineHeight: "$4"
  });
  css({
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "$sm",
    color: "$neutral12",
    fontSize: "$base",
    fontWeight: "$normal",
    lineHeight: "$6",
    cursor: "pointer",
    userSelect: "none",
    "&[data-disabled]": {
      color: "$neutral8",
      cursor: "not-allowed"
    },
    [`&[data-active]`]: {
      backgroundColor: "$neutral4"
    }
  });
  css({
    display: "inline-flex",
    alignItems: "center",
    py: "$2",
    paddingInlineStart: "$3",
    paddingInlineEnd: "$6"
  });
  css({
    position: "absolute",
    top: 0,
    bottom: 0,
    right: 0,
    display: "flex",
    alignItems: "center",
    paddingInlineEnd: "$3",
    color: "$primary10",
    pointerEvents: "none"
  });
  const tooltipTransitionName = {
    scale: "hope-tooltip-scale-transition"
  };
  const tooltipTransitionStyles = globalCss({
    [`.${tooltipTransitionName.scale}-enter, .${tooltipTransitionName.scale}-exit-to`]: {
      opacity: 0,
      transform: "scale(0.90)"
    },
    [`.${tooltipTransitionName.scale}-enter-to, .${tooltipTransitionName.scale}-exit`]: {
      opacity: 1,
      transform: "scale(1)"
    },
    [`.${tooltipTransitionName.scale}-enter-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "200ms",
      transitionTimingFunction: "ease"
    },
    [`.${tooltipTransitionName.scale}-exit-active`]: {
      transitionProperty: "opacity, transform",
      transitionDuration: "150ms",
      transitionTimingFunction: "ease-in-out"
    }
  });
  css({
    zIndex: "$tooltip",
    position: "absolute",
    maxWidth: "$96",
    boxShadow: "$md",
    borderRadius: "$sm",
    backgroundColor: "$neutral12",
    px: "$2",
    py: "$1",
    color: "$neutral1",
    fontSize: "$sm",
    fontWeight: "$normal",
    lineHeight: "$4"
  });
  css({
    zIndex: "$tooltip",
    position: "absolute",
    boxSize: "8px",
    backgroundColor: "inherit",
    transform: "rotate(45deg)"
  });
  const globalResetStyles = globalCss({
    "*, ::before, ::after": {
      boxSizing: "border-box",
      borderWidth: "0",
      borderStyle: "solid"
    },
    "*": {
      margin: 0
    },
    "html, body": {
      height: "100%"
    },
    html: {
      fontFamily: "$sans",
      lineHeight: "$base",
      fontSize: "16px"
    },
    body: {
      backgroundColor: "$background",
      color: "$neutral12",
      fontFamily: "inherit",
      lineHeight: "inherit",
      "-webkit-font-smoothing": "antialiased",
      "-moz-osx-font-smoothing": "grayscale"
    },
    "h1, h2, h3, h4, h5, h6": {
      fontSize: "inherit",
      fontWeight: "inherit"
    },
    "p, h1, h2, h3, h4, h5, h6": {
      overflowWrap: "break-word"
    },
    "img, picture, video, canvas, svg": {
      display: "block",
      maxWidth: "100%"
    },
    "button, input, textarea, select, optgroup": {
      fontFamily: "inherit",
      fontSize: "100%"
    },
    "button:focus": {
      outline: "5px auto -webkit-focus-ring-color"
    },
    fieldset: {
      margin: 0,
      padding: 0
    },
    "ol, ul": {
      margin: 0,
      padding: 0
    },
    a: {
      backgroundColor: "transparent",
      color: "inherit",
      textDecoration: "inherit"
    }
  });
  function mergeStyleObject(sourceStyleObject, destStyleObject, destResponsiveStyleObject) {
    Object.entries(sourceStyleObject).forEach(([key, value]) => {
      if (isObject(value)) {
        if (key in destResponsiveStyleObject) {
          const atMediaRule = key;
          destResponsiveStyleObject[atMediaRule] = __spreadValues(__spreadValues({}, destResponsiveStyleObject[atMediaRule]), value);
        } else {
          destStyleObject[key] = __spreadValues(__spreadValues({}, destStyleObject[key]), value);
        }
      } else {
        destStyleObject[key] = value;
      }
    });
  }
  function toCssObject(props, baseStyles) {
    const destStyleObject = {};
    const destResponsiveStyleObject = {
      "@sm": {},
      "@md": {},
      "@lg": {},
      "@xl": {},
      "@2xl": {},
      "@reduce-motion": {},
      "@light": {},
      "@dark": {}
    };
    baseStyles == null ? void 0 : baseStyles.forEach((styles) => styles && mergeStyleObject(styles, destStyleObject, destResponsiveStyleObject));
    Object.entries(props).forEach(([prop, value]) => {
      if (value === null || value === void 0) {
        return;
      }
      if (prop === "css") {
        return;
      }
      if (prop.startsWith("_")) {
        destStyleObject[prop] = value;
      } else if (isObject(value)) {
        Object.keys(value).forEach((key) => {
          if (key === "@initial") {
            destStyleObject[prop] = value[key];
          } else if (key in destResponsiveStyleObject) {
            const atMediaRule = key;
            destResponsiveStyleObject[atMediaRule] = __spreadProps(__spreadValues({}, destResponsiveStyleObject[atMediaRule]), {
              [prop]: value[atMediaRule]
            });
          }
        });
      } else {
        destStyleObject[prop] = value;
      }
    });
    props.css && mergeStyleObject(props.css, destStyleObject, destResponsiveStyleObject);
    return __spreadValues(__spreadValues({}, destStyleObject), destResponsiveStyleObject);
  }
  function extendBaseTheme(type, themeConfig) {
    const isDark = type === "dark";
    const className2 = isDark ? colorModeClassNames.dark : colorModeClassNames.light;
    const finalConfig = isDark ? merge({}, baseDarkThemeTokens, themeConfig) : themeConfig;
    const customTheme = createTheme(className2, finalConfig);
    return merge({}, baseTheme, customTheme);
  }
  css({
    position: "absolute",
    width: "1px",
    height: "1px",
    padding: "0",
    margin: "-1px",
    overflow: "hidden",
    clip: "rect(0, 0, 0, 0)",
    whiteSpace: "nowrap",
    borderWidth: "0"
  });
  const HopeContext = createContext();
  function applyGlobalTransitionStyles() {
    drawerTransitionStyles();
    menuTransitionStyles();
    modalTransitionStyles();
    notificationTransitionStyles();
    popoverTransitionStyles();
    selectTransitionStyles();
    tooltipTransitionStyles();
  }
  function HopeProvider(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const defaultProps = {
      enableCssReset: true
    };
    props = mergeProps(defaultProps, props);
    const lightTheme = extendBaseTheme("light", (_b = (_a = props.config) == null ? void 0 : _a.lightTheme) != null ? _b : {});
    const darkTheme = extendBaseTheme("dark", (_d = (_c = props.config) == null ? void 0 : _c.darkTheme) != null ? _d : {});
    const defaultColorMode = getDefaultColorMode((_f = (_e = props.config) == null ? void 0 : _e.initialColorMode) != null ? _f : "light");
    const defaultTheme = defaultColorMode === "dark" ? darkTheme : lightTheme;
    const [colorMode, rawSetColorMode] = createSignal(defaultColorMode);
    const [theme, setTheme] = createSignal(defaultTheme);
    const isDarkMode = () => colorMode() === "dark";
    const setColorMode = (value) => {
      rawSetColorMode(value);
      saveColorModeToLocalStorage(value);
    };
    const toggleColorMode = () => {
      setColorMode(isDarkMode() ? "light" : "dark");
    };
    const context = {
      components: (_h = (_g = props.config) == null ? void 0 : _g.components) != null ? _h : {},
      theme,
      colorMode,
      setColorMode,
      toggleColorMode
    };
    createEffect(() => {
      setTheme(isDarkMode() ? darkTheme : lightTheme);
      syncBodyColorModeClassName(isDarkMode());
    });
    if (props.enableCssReset) {
      globalResetStyles();
    }
    applyGlobalTransitionStyles();
    return createComponent(HopeContext.Provider, {
      value: context,
      get children() {
        return props.children;
      }
    });
  }
  function useStyleConfig() {
    const context = useContext(HopeContext);
    if (!context) {
      throw new Error("[Hope UI]: useStyleConfig must be used within a HopeProvider");
    }
    return context.components;
  }
  function createClassSelector(className2) {
    return `.${className2}`;
  }
  function classNames(...classNames2) {
    return classNames2.filter(Boolean).join(" ");
  }
  const borderPropNames = {
    border: true,
    borderWidth: true,
    borderStyle: true,
    borderColor: true,
    borderTop: true,
    borderTopWidth: true,
    borderTopStyle: true,
    borderTopColor: true,
    borderRight: true,
    borderRightWidth: true,
    borderRightStyle: true,
    borderRightColor: true,
    borderBottom: true,
    borderBottomWidth: true,
    borderBottomStyle: true,
    borderBottomColor: true,
    borderLeft: true,
    borderLeftWidth: true,
    borderLeftStyle: true,
    borderLeftColor: true,
    borderX: true,
    borderY: true
  };
  const colorPropNames = {
    color: true,
    background: true,
    bg: true,
    backgroundColor: true,
    bgColor: true,
    opacity: true
  };
  const cssPropName = { css: true };
  const flexboxPropNames = {
    alignItems: true,
    alignContent: true,
    alignSelf: true,
    justifyItems: true,
    justifyContent: true,
    justifySelf: true,
    flexDirection: true,
    flexWrap: true,
    flex: true,
    flexGrow: true,
    flexShrink: true,
    flexBasis: true,
    order: true
  };
  const gridLayoutPropNames = {
    gridTemplate: true,
    gridTemplateColumns: true,
    gridTemplateRows: true,
    gridTemplateAreas: true,
    gridArea: true,
    gridRow: true,
    gridRowStart: true,
    gridRowEnd: true,
    gridColumn: true,
    gridColumnStart: true,
    gridColumnEnd: true,
    gridAutoFlow: true,
    gridAutoColumns: true,
    gridAutoRows: true,
    placeItems: true,
    placeContent: true,
    placeSelf: true,
    gap: true,
    rowGap: true,
    columnGap: true
  };
  const interactivityPropNames = {
    appearance: true,
    userSelect: true,
    pointerEvents: true,
    resize: true,
    cursor: true,
    outline: true,
    outlineOffset: true,
    outlineColor: true
  };
  const layoutPropNames = {
    display: true,
    d: true,
    verticalAlign: true,
    overflow: true,
    overflowX: true,
    overflowY: true,
    objectFit: true,
    objectPosition: true
  };
  const marginPropNames = {
    margin: true,
    m: true,
    marginTop: true,
    mt: true,
    marginRight: true,
    mr: true,
    marginStart: true,
    ms: true,
    marginBottom: true,
    mb: true,
    marginLeft: true,
    ml: true,
    marginEnd: true,
    me: true,
    mx: true,
    my: true
  };
  const paddingPropNames = {
    padding: true,
    p: true,
    paddingTop: true,
    pt: true,
    paddingRight: true,
    pr: true,
    paddingStart: true,
    ps: true,
    paddingBottom: true,
    pb: true,
    paddingLeft: true,
    pl: true,
    paddingEnd: true,
    pe: true,
    px: true,
    py: true
  };
  const positionPropNames = {
    position: true,
    pos: true,
    zIndex: true,
    top: true,
    right: true,
    bottom: true,
    left: true
  };
  const pseudoSelectorPropNames = {
    _hover: true,
    _active: true,
    _focus: true,
    _highlighted: true,
    _focusWithin: true,
    _focusVisible: true,
    _disabled: true,
    _readOnly: true,
    _before: true,
    _after: true,
    _empty: true,
    _expanded: true,
    _checked: true,
    _grabbed: true,
    _pressed: true,
    _invalid: true,
    _valid: true,
    _loading: true,
    _selected: true,
    _hidden: true,
    _even: true,
    _odd: true,
    _first: true,
    _last: true,
    _notFirst: true,
    _notLast: true,
    _visited: true,
    _activeLink: true,
    _activeStep: true,
    _indeterminate: true,
    _groupHover: true,
    _peerHover: true,
    _groupFocus: true,
    _peerFocus: true,
    _groupFocusVisible: true,
    _peerFocusVisible: true,
    _groupActive: true,
    _peerActive: true,
    _groupSelected: true,
    _peerSelected: true,
    _groupDisabled: true,
    _peerDisabled: true,
    _groupInvalid: true,
    _peerInvalid: true,
    _groupChecked: true,
    _peerChecked: true,
    _groupFocusWithin: true,
    _peerFocusWithin: true,
    _peerPlaceholderShown: true,
    _placeholder: true,
    _placeholderShown: true,
    _fullScreen: true,
    _selection: true,
    _mediaDark: true,
    _mediaReduceMotion: true,
    _dark: true,
    _light: true
  };
  const radiiPropNames = {
    borderRadius: true,
    borderTopRightRadius: true,
    borderTopLeftRadius: true,
    borderBottomRightRadius: true,
    borderBottomLeftRadius: true,
    borderTopRadius: true,
    borderRightRadius: true,
    borderStartRadius: true,
    borderBottomRadius: true,
    borderLeftRadius: true,
    borderEndRadius: true,
    rounded: true,
    roundedTop: true,
    roundedRight: true,
    roundedStart: true,
    roundedBottom: true,
    roundedLeft: true,
    roundedEnd: true
  };
  const shadowPropNames = {
    textShadow: true,
    boxShadow: true,
    shadow: true
  };
  const sizePropNames = {
    width: true,
    w: true,
    minWidth: true,
    minW: true,
    maxWidth: true,
    maxW: true,
    height: true,
    h: true,
    minHeight: true,
    minH: true,
    maxHeight: true,
    maxH: true,
    boxSize: true
  };
  const transformPropNames = {
    transform: true,
    transformOrigin: true,
    clipPath: true
  };
  const transitionPropNames = {
    transition: true,
    transitionProperty: true,
    transitionTimingFunction: true,
    transitionDuration: true,
    transitionDelay: true,
    animation: true,
    willChange: true
  };
  const typographyPropNames = {
    fontFamily: true,
    fontSize: true,
    fontWeight: true,
    lineHeight: true,
    letterSpacing: true,
    textAlign: true,
    fontStyle: true,
    textTransform: true,
    textDecoration: true,
    noOfLines: true
  };
  const stylePropNames = __spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues(__spreadValues({}, borderPropNames), colorPropNames), flexboxPropNames), gridLayoutPropNames), interactivityPropNames), layoutPropNames), marginPropNames), paddingPropNames), positionPropNames), radiiPropNames), shadowPropNames), sizePropNames), transformPropNames), transitionPropNames), typographyPropNames), pseudoSelectorPropNames), cssPropName);
  const styledSystemStyles = css({});
  function createStyledSystemClass(props, baseStyles) {
    return styledSystemStyles({ css: toCssObject(props, baseStyles) });
  }
  function getUsedStylePropNames(props) {
    return Object.keys(props).filter((key) => key in stylePropNames);
  }
  const styled = (component, styleOptions) => {
    const hopeComponent = (props) => {
      const usedStylePropNames = getUsedStylePropNames(props);
      const propsWithDefault = mergeProps({
        as: component
      }, props);
      const [local, styleProps, others] = splitProps(propsWithDefault, ["as", "class", "className", "__baseStyle"], usedStylePropNames);
      const __baseStyles = createMemo(() => {
        const factoryBaseStyle = isFunction$1(styleOptions == null ? void 0 : styleOptions.baseStyle) ? styleOptions == null ? void 0 : styleOptions.baseStyle(props) : styleOptions == null ? void 0 : styleOptions.baseStyle;
        return [factoryBaseStyle, local.__baseStyle];
      });
      const classes = () => {
        return classNames(styleOptions == null ? void 0 : styleOptions.baseClass, local.class, local.className, createStyledSystemClass(styleProps, __baseStyles()));
      };
      return createComponent(Dynamic, mergeProps({
        get component() {
          var _a;
          return (_a = local.as) != null ? _a : "div";
        },
        get ["class"]() {
          return classes();
        }
      }, others));
    };
    hopeComponent.toString = () => (styleOptions == null ? void 0 : styleOptions.baseClass) ? createClassSelector(styleOptions.baseClass) : "";
    return hopeComponent;
  };
  function factory() {
    const cache = /* @__PURE__ */ new Map();
    return new Proxy(styled, {
      apply(target, thisArg, argArray) {
        return styled(...argArray);
      },
      get(_, element) {
        if (!cache.has(element)) {
          cache.set(element, styled(element));
        }
        return cache.get(element);
      }
    });
  }
  const hope = factory();
  const Box = hope.div;
  css({
    borderTopWidth: "1px",
    borderColor: "$neutral7",
    overflowAnchor: "none",
    "&:last-of-type": {
      borderBottomWidth: "1px"
    }
  });
  css({
    appearance: "none",
    display: "flex",
    alignItems: "center",
    width: "100%",
    outline: "none",
    backgroundColor: "transparent",
    px: "$4",
    py: "$2",
    color: "inherit",
    fontSize: "$base",
    lineHeight: "$6",
    cursor: "pointer",
    transition: "background-color 250ms",
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed"
    },
    "&:hover": {
      backgroundColor: "$neutral4"
    },
    "&:focus": {
      outline: "none",
      boxShadow: "$outline"
    }
  });
  css({
    flexGrow: 0,
    flexShrink: 0,
    fontSize: "1.25em",
    pointerEvents: "none",
    transition: "transform 250ms",
    transformOrigin: "center",
    variants: {
      expanded: {
        true: {
          transform: "rotate(-180deg)"
        }
      },
      disabled: {
        true: {
          opacity: 0.4
        }
      }
    }
  });
  css({
    pt: "$2",
    px: "$4",
    pb: "$4"
  });
  const iconStyles = css({
    display: "inline-block",
    flexShrink: 0,
    boxSize: "1em",
    color: "currentColor",
    lineHeight: "1em",
    verticalAlign: "middle"
  });
  const _tmpl$$i = /* @__PURE__ */ template$1(`<svg><path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>`, 4, true);
  const fallbackIcon = {
    viewBox: "0 0 24 24",
    path: () => _tmpl$$i.cloneNode(true)
  };
  const hopeIconClass = "hope-icon";
  function Icon(props) {
    const defaultProps = {
      viewBox: fallbackIcon.viewBox
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefault, ["as", "class", "children", "viewBox"]);
    const classes = () => classNames(local.class, hopeIconClass, iconStyles());
    const shouldRenderComponent = () => local.as && !isString(local.as);
    return createComponent(Show, {
      get when() {
        return shouldRenderComponent();
      },
      get fallback() {
        return createComponent(hope.svg, mergeProps({
          get ["class"]() {
            return classes();
          },
          get viewBox() {
            return local.viewBox;
          }
        }, others, {
          get children() {
            return createComponent(Show, {
              get when() {
                return local.children;
              },
              get fallback() {
                return fallbackIcon.path;
              },
              get children() {
                return local.children;
              }
            });
          }
        }));
      },
      get children() {
        return createComponent(Box, mergeProps({
          get as() {
            return local.as;
          },
          get ["class"]() {
            return classes();
          }
        }, others));
      }
    });
  }
  Icon.toString = () => createClassSelector(hopeIconClass);
  function createIcon(options) {
    const {
      viewBox = "0 0 24 24",
      defaultProps = {}
    } = options;
    const IconComponent = (props) => {
      return createComponent(Icon, mergeProps({
        viewBox
      }, defaultProps, props, {
        get children() {
          return options.path;
        }
      }));
    };
    IconComponent.toString = () => createClassSelector(hopeIconClass);
    return IconComponent;
  }
  const _tmpl$$h = /* @__PURE__ */ template$1(`<svg><path d="M4.18179 6.18181C4.35753 6.00608 4.64245 6.00608 4.81819 6.18181L7.49999 8.86362L10.1818 6.18181C10.3575 6.00608 10.6424 6.00608 10.8182 6.18181C10.9939 6.35755 10.9939 6.64247 10.8182 6.81821L7.81819 9.81821C7.73379 9.9026 7.61934 9.95001 7.49999 9.95001C7.38064 9.95001 7.26618 9.9026 7.18179 9.81821L4.18179 6.81821C4.00605 6.64247 4.00605 6.35755 4.18179 6.18181Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$h.cloneNode(true)
  });
  css({
    overflow: "hidden"
  });
  const alertIconStyles = css({
    flexShrink: 0
  });
  css({
    fontWeight: "$semibold"
  });
  css({
    display: "inline-block"
  });
  css({
    position: "relative",
    display: "flex",
    alignItems: "center",
    borderRadius: "$sm",
    px: "$4",
    py: "$3",
    fontSize: "$base",
    lineHeight: "$6",
    variants: {
      variant: {
        solid: {},
        subtle: {},
        "left-accent": {
          borderLeftStyle: "solid",
          borderLeftWidth: "$sizes$1"
        },
        "top-accent": {
          borderTopStyle: "solid",
          borderTopWidth: "$sizes$1"
        }
      },
      status: {
        success: {},
        info: {},
        warning: {},
        danger: {}
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        status: "success",
        css: {
          backgroundColor: "$success9",
          color: "white"
        }
      },
      {
        variant: "solid",
        status: "info",
        css: {
          backgroundColor: "$info9",
          color: "white"
        }
      },
      {
        variant: "solid",
        status: "warning",
        css: {
          backgroundColor: "$warning9",
          color: "$blackAlpha12"
        }
      },
      {
        variant: "solid",
        status: "danger",
        css: {
          backgroundColor: "$danger9",
          color: "white"
        }
      },
      {
        variant: "subtle",
        status: "success",
        css: {
          backgroundColor: "$success3",
          color: "$success11",
          [`& .${alertIconStyles}`]: {
            color: "$success9"
          }
        }
      },
      {
        variant: "subtle",
        status: "info",
        css: {
          backgroundColor: "$info3",
          color: "$info11",
          [`& .${alertIconStyles}`]: {
            color: "$info9"
          }
        }
      },
      {
        variant: "subtle",
        status: "warning",
        css: {
          backgroundColor: "$warning3",
          color: "$warning11",
          [`& .${alertIconStyles}`]: {
            color: "$warning9"
          }
        }
      },
      {
        variant: "subtle",
        status: "danger",
        css: {
          backgroundColor: "$danger3",
          color: "$danger11",
          [`& .${alertIconStyles}`]: {
            color: "$danger9"
          }
        }
      },
      {
        variant: "left-accent",
        status: "success",
        css: {
          borderLeftColor: "$success9",
          backgroundColor: "$success3",
          color: "$success11",
          [`& .${alertIconStyles}`]: {
            color: "$success9"
          }
        }
      },
      {
        variant: "left-accent",
        status: "info",
        css: {
          borderLeftColor: "$info9",
          backgroundColor: "$info3",
          color: "$info11",
          [`& .${alertIconStyles}`]: {
            color: "$info9"
          }
        }
      },
      {
        variant: "left-accent",
        status: "warning",
        css: {
          borderLeftColor: "$warning9",
          backgroundColor: "$warning3",
          color: "$warning11",
          [`& .${alertIconStyles}`]: {
            color: "$warning9"
          }
        }
      },
      {
        variant: "left-accent",
        status: "danger",
        css: {
          borderLeftColor: "$danger9",
          backgroundColor: "$danger3",
          color: "$danger11",
          [`& .${alertIconStyles}`]: {
            color: "$danger9"
          }
        }
      },
      {
        variant: "top-accent",
        status: "success",
        css: {
          borderTopColor: "$success9",
          backgroundColor: "$success3",
          color: "$success11",
          [`& .${alertIconStyles}`]: {
            color: "$success9"
          }
        }
      },
      {
        variant: "top-accent",
        status: "info",
        css: {
          borderTopColor: "$info9",
          backgroundColor: "$info3",
          color: "$info11",
          [`& .${alertIconStyles}`]: {
            color: "$info9"
          }
        }
      },
      {
        variant: "top-accent",
        status: "warning",
        css: {
          borderTopColor: "$warning9",
          backgroundColor: "$warning3",
          color: "$warning11",
          [`& .${alertIconStyles}`]: {
            color: "$warning9"
          }
        }
      },
      {
        variant: "top-accent",
        status: "danger",
        css: {
          borderTopColor: "$danger9",
          backgroundColor: "$danger3",
          color: "$danger11",
          [`& .${alertIconStyles}`]: {
            color: "$danger9"
          }
        }
      }
    ]
  });
  const _tmpl$$g = /* @__PURE__ */ template$1(`<svg><path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm-2 19.59l-5-5L10.59 15L14 18.41L21.41 11l1.596 1.586Z"></path></svg>`, 4, true), _tmpl$2$3 = /* @__PURE__ */ template$1(`<svg><path fill="none" d="m14 21.591l-5-5L10.591 15L14 18.409L21.41 11l1.595 1.585L14 21.591z"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 32 32",
    path: () => [_tmpl$$g.cloneNode(true), _tmpl$2$3.cloneNode(true)]
  });
  const _tmpl$$f = /* @__PURE__ */ template$1(`<svg><path fill="currentColor" d="M16 2C8.3 2 2 8.3 2 16s6.3 14 14 14s14-6.3 14-14S23.7 2 16 2zm-1.1 6h2.2v11h-2.2V8zM16 25c-.8 0-1.5-.7-1.5-1.5S15.2 22 16 22s1.5.7 1.5 1.5S16.8 25 16 25z"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 32 32",
    path: () => _tmpl$$f.cloneNode(true)
  });
  const _tmpl$$e = /* @__PURE__ */ template$1(`<svg><path fill="currentColor" fill-rule="evenodd" clip-rule="evenodd" d="M29.4898 29.8706C29.3402 29.9548 29.1713 29.9991 28.9996 29.9993H2.99961C2.82787 29.9991 2.65905 29.9548 2.5094 29.8706C2.35976 29.7864 2.23433 29.665 2.14521 29.5182C2.05608 29.3713 2.00626 29.2041 2.00055 29.0325C1.99485 28.8608 2.03344 28.6907 2.1126 28.5382L15.1126 3.53821C15.1971 3.37598 15.3245 3.23999 15.4808 3.14514C15.6372 3.05017 15.8167 3 15.9996 3C16.1825 3 16.362 3.05017 16.5184 3.14514C16.6748 3.23999 16.8021 3.37598 16.8866 3.53821L29.8866 28.5382C29.9658 28.6907 30.0044 28.8608 29.9986 29.0325C29.9929 29.2041 29.9431 29.3713 29.854 29.5182C29.7649 29.665 29.6395 29.7864 29.4898 29.8706ZM16.0016 6.16919V6.17029H15.9976V6.16919H16.0016ZM15.9996 25.9993C15.7029 25.9993 15.4129 25.9113 15.1662 25.7465C14.9196 25.5817 14.7273 25.3474 14.6138 25.0734C14.5996 25.0391 14.5867 25.0044 14.5752 24.9694C14.4942 24.724 14.4778 24.4613 14.5284 24.2067C14.5863 23.9156 14.7292 23.6484 14.9389 23.4386C14.9652 23.4124 14.9923 23.3872 15.0202 23.3632C15.2159 23.1945 15.4524 23.0787 15.707 23.0281C15.7433 23.0209 15.7799 23.015 15.8165 23.0105C16.0723 22.979 16.3326 23.014 16.572 23.1129L16.5736 23.1135C16.8477 23.2271 17.082 23.4193 17.2468 23.6659C17.2674 23.6968 17.2868 23.7283 17.305 23.7604C17.4322 23.9852 17.4996 24.2397 17.4996 24.4993C17.4996 24.8971 17.3416 25.2787 17.0603 25.5599C16.7789 25.8413 16.3974 25.9993 15.9996 25.9993ZM17.1246 20.9993H14.8746V11.9993H17.1246V20.9993Z"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 32 32",
    path: () => _tmpl$$e.cloneNode(true)
  });
  const _tmpl$$d = /* @__PURE__ */ template$1(`<svg><path fill="none" d="M16 8a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 16 8Zm4 13.875h-2.875v-8H13v2.25h1.875v5.75H12v2.25h8Z"></path></svg>`, 4, true), _tmpl$2$2 = /* @__PURE__ */ template$1(`<svg><path fill="currentColor" d="M16 2a14 14 0 1 0 14 14A14 14 0 0 0 16 2Zm0 6a1.5 1.5 0 1 1-1.5 1.5A1.5 1.5 0 0 1 16 8Zm4 16.125h-8v-2.25h2.875v-5.75H13v-2.25h4.125v8H20Z"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 32 32",
    path: () => [_tmpl$$d.cloneNode(true), _tmpl$2$2.cloneNode(true)]
  });
  css({
    position: "relative",
    outline: "none",
    backgroundColor: "transparent",
    textDecoration: "none",
    cursor: "pointer",
    transition: "text-decoration 250ms",
    "&:hover": {
      textDecoration: "underline"
    },
    "&:focus": {
      boxShadow: "$outline"
    }
  });
  css({
    position: "relative",
    "&::before": {
      height: 0,
      content: "''",
      display: "block"
    },
    "& > *:not(style)": {
      overflow: "hidden",
      position: "absolute",
      top: "0",
      right: "0",
      bottom: "0",
      left: "0",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      width: "100%",
      height: "100%"
    },
    "& > img, & > video": {
      objectFit: "cover"
    }
  });
  const hopeIconButtonClass = "hope-icon-button";
  const buttonIconStyles = css({
    display: "inline-flex",
    alignSelf: "center",
    flexShrink: 0
  });
  const buttonLoaderStyles = css({
    position: "absolute",
    display: "flex",
    alignItems: "center",
    flexShrink: 0,
    fontSize: "1em",
    lineHeight: "$normal",
    variants: {
      withLoadingText: {
        true: {
          position: "relative"
        }
      }
    }
  });
  const buttonIconSpinnerStyles = css({
    fontSize: "1.3em",
    animation: `1s linear infinite ${spin}`
  });
  function createSizeVariant$1(config2) {
    return {
      height: config2.height,
      py: 0,
      px: config2.paddingX,
      fontSize: config2.fontSize,
      [`&.${hopeIconButtonClass}`]: {
        width: config2.height,
        padding: "0"
      }
    };
  }
  function createCompactSizeCompoundVariant(config2) {
    return {
      height: config2.height,
      py: 0,
      px: config2.paddingX,
      [`&.${hopeIconButtonClass}`]: {
        width: config2.height,
        padding: "0"
      }
    };
  }
  function createSolidCompoundVariant(config2) {
    return {
      backgroundColor: config2.bgColor,
      color: config2.color,
      "&:hover": {
        backgroundColor: config2.bgColorHover
      }
    };
  }
  function createSubtleCompoundVariant(config2) {
    return {
      backgroundColor: config2.bgColor,
      color: config2.color,
      "&:hover": {
        backgroundColor: config2.bgColorHover
      },
      "&:active": {
        backgroundColor: config2.bgColorActive
      }
    };
  }
  function createOutlineCompoundVariant(config2) {
    return {
      borderColor: config2.borderColor,
      color: config2.color,
      "&:hover": {
        borderColor: config2.borderColorHover,
        backgroundColor: config2.bgColorHover
      },
      "&:active": {
        backgroundColor: config2.bgColorActive
      }
    };
  }
  function createGhostCompoundVariant(config2) {
    return {
      color: config2.color,
      "&:hover": {
        backgroundColor: config2.bgColorHover
      },
      "&:active": {
        backgroundColor: config2.bgColorActive
      }
    };
  }
  const buttonStyles = css({
    appearance: "none",
    position: "relative",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    outline: "none",
    borderRadius: "$sm",
    padding: "0",
    fontWeight: "$medium",
    lineHeight: "$none",
    textDecoration: "none",
    cursor: "pointer",
    userSelect: "none",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    transition: "color 250ms, background-color 250ms, box-shadow 250ms",
    "&:focus": {
      outline: "none",
      boxShadow: "$outline"
    },
    "&:disabled, &:hover:disabled": {
      color: "$neutral7",
      cursor: "not-allowed"
    },
    variants: {
      variant: {
        solid: {
          border: "1px solid transparent",
          "&:disabled, &:hover:disabled": {
            backgroundColor: "$neutral3"
          }
        },
        subtle: {
          border: "1px solid transparent",
          "&:disabled, &:hover:disabled": {
            backgroundColor: "$neutral3"
          }
        },
        outline: {
          borderStyle: "solid",
          borderWidth: "1px",
          backgroundColor: "transparent",
          "&:disabled, &:hover:disabled": {
            borderColor: "$neutral3"
          }
        },
        dashed: {
          borderStyle: "dashed",
          borderWidth: "1px",
          backgroundColor: "transparent",
          "&:disabled, &:hover:disabled": {
            borderColor: "$neutral3"
          }
        },
        ghost: {
          border: "1px solid transparent",
          backgroundColor: "transparent"
        }
      },
      colorScheme: {
        primary: {},
        accent: {},
        neutral: {},
        success: {},
        info: {},
        warning: {},
        danger: {}
      },
      size: {
        xs: createSizeVariant$1({
          height: "$6",
          paddingX: "$2",
          fontSize: "$xs",
          spacing: "$1"
        }),
        sm: createSizeVariant$1({
          height: "$8",
          paddingX: "$3",
          fontSize: "$sm",
          spacing: "$1_5"
        }),
        md: createSizeVariant$1({
          height: "$10",
          paddingX: "$4",
          fontSize: "$base",
          spacing: "$1_5"
        }),
        lg: createSizeVariant$1({
          height: "$12",
          paddingX: "$6",
          fontSize: "$lg",
          spacing: "$2"
        }),
        xl: createSizeVariant$1({
          height: "$16",
          paddingX: "$10",
          fontSize: "$xl",
          spacing: "$2"
        })
      },
      compact: {
        true: {},
        false: {}
      },
      fullWidth: {
        true: {
          display: "flex",
          width: "100%"
        },
        false: {
          display: "inline-flex",
          width: "auto"
        }
      },
      loading: {
        true: {
          opacity: "0.75",
          cursor: "default",
          pointerEvents: "none"
        },
        false: {}
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        colorScheme: "primary",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$primary9",
          bgColorHover: "$primary10"
        })
      },
      {
        variant: "solid",
        colorScheme: "accent",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$accent9",
          bgColorHover: "$accent10"
        })
      },
      {
        variant: "solid",
        colorScheme: "neutral",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$neutral9",
          bgColorHover: "$neutral10"
        })
      },
      {
        variant: "solid",
        colorScheme: "success",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$success9",
          bgColorHover: "$success10"
        })
      },
      {
        variant: "solid",
        colorScheme: "info",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$info9",
          bgColorHover: "$info10"
        })
      },
      {
        variant: "solid",
        colorScheme: "warning",
        css: createSolidCompoundVariant({
          color: "$blackAlpha12",
          bgColor: "$warning9",
          bgColorHover: "$warning10"
        })
      },
      {
        variant: "solid",
        colorScheme: "danger",
        css: createSolidCompoundVariant({
          color: "white",
          bgColor: "$danger9",
          bgColorHover: "$danger10"
        })
      },
      {
        variant: "subtle",
        colorScheme: "primary",
        css: createSubtleCompoundVariant({
          color: "$primary11",
          bgColor: "$primary4",
          bgColorHover: "$primary5",
          bgColorActive: "$primary6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "accent",
        css: createSubtleCompoundVariant({
          color: "$accent11",
          bgColor: "$accent4",
          bgColorHover: "$accent5",
          bgColorActive: "$accent6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "neutral",
        css: createSubtleCompoundVariant({
          color: "$neutral12",
          bgColor: "$neutral4",
          bgColorHover: "$neutral5",
          bgColorActive: "$neutral6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "success",
        css: createSubtleCompoundVariant({
          color: "$success11",
          bgColor: "$success4",
          bgColorHover: "$success5",
          bgColorActive: "$success6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "info",
        css: createSubtleCompoundVariant({
          color: "$info11",
          bgColor: "$info4",
          bgColorHover: "$info5",
          bgColorActive: "$info6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "warning",
        css: createSubtleCompoundVariant({
          color: "$warning11",
          bgColor: "$warning4",
          bgColorHover: "$warning5",
          bgColorActive: "$warning6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "danger",
        css: createSubtleCompoundVariant({
          color: "$danger11",
          bgColor: "$danger4",
          bgColorHover: "$danger5",
          bgColorActive: "$danger6"
        })
      },
      {
        variant: "outline",
        colorScheme: "primary",
        css: createOutlineCompoundVariant({
          color: "$primary11",
          borderColor: "$primary7",
          borderColorHover: "$primary8",
          bgColorHover: "$primary4",
          bgColorActive: "$primary5"
        })
      },
      {
        variant: "outline",
        colorScheme: "accent",
        css: createOutlineCompoundVariant({
          color: "$accent11",
          borderColor: "$accent7",
          borderColorHover: "$accent8",
          bgColorHover: "$accent4",
          bgColorActive: "$accent5"
        })
      },
      {
        variant: "outline",
        colorScheme: "neutral",
        css: createOutlineCompoundVariant({
          color: "$neutral12",
          borderColor: "$neutral7",
          borderColorHover: "$neutral8",
          bgColorHover: "$neutral4",
          bgColorActive: "$neutral5"
        })
      },
      {
        variant: "outline",
        colorScheme: "success",
        css: createOutlineCompoundVariant({
          color: "$success11",
          borderColor: "$success7",
          borderColorHover: "$success8",
          bgColorHover: "$success4",
          bgColorActive: "$success5"
        })
      },
      {
        variant: "outline",
        colorScheme: "info",
        css: createOutlineCompoundVariant({
          color: "$info11",
          borderColor: "$info7",
          borderColorHover: "$info8",
          bgColorHover: "$info4",
          bgColorActive: "$info5"
        })
      },
      {
        variant: "outline",
        colorScheme: "warning",
        css: createOutlineCompoundVariant({
          color: "$warning11",
          borderColor: "$warning7",
          borderColorHover: "$warning8",
          bgColorHover: "$warning4",
          bgColorActive: "$warning5"
        })
      },
      {
        variant: "outline",
        colorScheme: "danger",
        css: createOutlineCompoundVariant({
          color: "$danger11",
          borderColor: "$danger7",
          borderColorHover: "$danger8",
          bgColorHover: "$danger4",
          bgColorActive: "$danger5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "primary",
        css: createOutlineCompoundVariant({
          color: "$primary11",
          borderColor: "$primary7",
          borderColorHover: "$primary8",
          bgColorHover: "$primary4",
          bgColorActive: "$primary5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "accent",
        css: createOutlineCompoundVariant({
          color: "$accent11",
          borderColor: "$accent7",
          borderColorHover: "$accent8",
          bgColorHover: "$accent4",
          bgColorActive: "$accent5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "neutral",
        css: createOutlineCompoundVariant({
          color: "$neutral12",
          borderColor: "$neutral7",
          borderColorHover: "$neutral8",
          bgColorHover: "$neutral4",
          bgColorActive: "$neutral5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "success",
        css: createOutlineCompoundVariant({
          color: "$success11",
          borderColor: "$success7",
          borderColorHover: "$success8",
          bgColorHover: "$success4",
          bgColorActive: "$success5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "info",
        css: createOutlineCompoundVariant({
          color: "$info11",
          borderColor: "$info7",
          borderColorHover: "$info8",
          bgColorHover: "$info4",
          bgColorActive: "$info5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "warning",
        css: createOutlineCompoundVariant({
          color: "$warning11",
          borderColor: "$warning7",
          borderColorHover: "$warning8",
          bgColorHover: "$warning4",
          bgColorActive: "$warning5"
        })
      },
      {
        variant: "dashed",
        colorScheme: "danger",
        css: createOutlineCompoundVariant({
          color: "$danger11",
          borderColor: "$danger7",
          borderColorHover: "$danger8",
          bgColorHover: "$danger4",
          bgColorActive: "$danger5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "primary",
        css: createGhostCompoundVariant({
          color: "$primary11",
          bgColorHover: "$primary4",
          bgColorActive: "$primary5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "accent",
        css: createGhostCompoundVariant({
          color: "$accent11",
          bgColorHover: "$accent4",
          bgColorActive: "$accent5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "neutral",
        css: createGhostCompoundVariant({
          color: "$neutral12",
          bgColorHover: "$neutral4",
          bgColorActive: "$neutral5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "success",
        css: createGhostCompoundVariant({
          color: "$success11",
          bgColorHover: "$success4",
          bgColorActive: "$success5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "info",
        css: createGhostCompoundVariant({
          color: "$info11",
          bgColorHover: "$info4",
          bgColorActive: "$info5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "warning",
        css: createGhostCompoundVariant({
          color: "$warning11",
          bgColorHover: "$warning4",
          bgColorActive: "$warning5"
        })
      },
      {
        variant: "ghost",
        colorScheme: "danger",
        css: createGhostCompoundVariant({
          color: "$danger11",
          bgColorHover: "$danger4",
          bgColorActive: "$danger5"
        })
      },
      {
        size: "xs",
        compact: "true",
        css: createCompactSizeCompoundVariant({ height: "$5", paddingX: "$1" })
      },
      {
        size: "sm",
        compact: "true",
        css: createCompactSizeCompoundVariant({ height: "$6", paddingX: "$1_5" })
      },
      {
        size: "md",
        compact: "true",
        css: createCompactSizeCompoundVariant({ height: "$7", paddingX: "$2" })
      },
      {
        size: "lg",
        compact: "true",
        css: createCompactSizeCompoundVariant({ height: "$8", paddingX: "$2_5" })
      },
      {
        size: "xl",
        compact: "true",
        css: createCompactSizeCompoundVariant({ height: "$10", paddingX: "$3_5" })
      }
    ]
  });
  css({
    display: "inline-flex",
    [`& .${buttonStyles}:focus`]: {
      zIndex: 1
    }
  });
  const ButtonGroupContext = createContext();
  function useButtonGroupContext() {
    return useContext(ButtonGroupContext);
  }
  const hopeButtonIconClass = "hope-button__icon";
  function ButtonIcon(props) {
    const [local, others] = splitProps(props, ["class", "children"]);
    const classes = () => classNames(local.class, hopeButtonIconClass, buttonIconStyles());
    return createComponent(hope.span, mergeProps({
      get ["class"]() {
        return classes();
      }
    }, others, {
      get children() {
        return local.children;
      }
    }));
  }
  ButtonIcon.toString = () => createClassSelector(hopeButtonIconClass);
  const _tmpl$$c = /* @__PURE__ */ template$1(`<svg><g fill="none"><path opacity=".2" fill-rule="evenodd" clip-rule="evenodd" d="M12 19a7 7 0 1 0 0-14a7 7 0 0 0 0 14zm0 3c5.523 0 10-4.477 10-10S17.523 2 12 2S2 6.477 2 12s4.477 10 10 10z" fill="currentColor"></path><path d="M2 12C2 6.477 6.477 2 12 2v3a7 7 0 0 0-7 7H2z" fill="currentColor"></path></g></svg>`, 8, true);
  const IconSpinner = createIcon({
    path: () => _tmpl$$c.cloneNode(true)
  });
  const hopeButtonLoaderClass = "hope-button__loader";
  function ButtonLoader(props) {
    const defaultProps = {
      spacing: "0.5rem",
      children: createComponent(IconSpinner, {
        get ["class"]() {
          return buttonIconSpinnerStyles();
        }
      })
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefault, ["class", "children", "withLoadingText", "placement", "spacing"]);
    const marginProp = () => local.placement === "start" ? "marginEnd" : "marginStart";
    const loaderStyles = () => ({
      [marginProp()]: local.withLoadingText ? local.spacing : 0
    });
    const classes = () => {
      return classNames(local.class, hopeButtonLoaderClass, buttonLoaderStyles({
        withLoadingText: local.withLoadingText
      }));
    };
    return createComponent(hope.div, mergeProps({
      get ["class"]() {
        return classes();
      }
    }, loaderStyles, others, {
      get children() {
        return local.children;
      }
    }));
  }
  ButtonLoader.toString = () => createClassSelector(hopeButtonLoaderClass);
  const hopeButtonClass = "hope-button";
  function Button(props) {
    var _a, _b, _c;
    const theme = useStyleConfig().Button;
    const buttonGroupContext = useButtonGroupContext();
    const defaultProps = {
      loaderPlacement: (_c = (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.loaderPlacement) != null ? _c : "start",
      iconSpacing: "0.5rem",
      type: "button",
      role: "button"
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, contentProps, others] = splitProps(propsWithDefault, ["class", "disabled", "loadingText", "loader", "loaderPlacement", "variant", "colorScheme", "size", "loading", "compact", "fullWidth"], ["children", "iconSpacing", "leftIcon", "rightIcon"]);
    const disabled = () => {
      var _a2;
      return (_a2 = local.disabled) != null ? _a2 : buttonGroupContext == null ? void 0 : buttonGroupContext.state.disabled;
    };
    const classes = () => {
      var _a2, _b2, _c2, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n, _o;
      return classNames(local.class, hopeButtonClass, buttonStyles({
        variant: (_e = (_d = (_a2 = local.variant) != null ? _a2 : buttonGroupContext == null ? void 0 : buttonGroupContext.state.variant) != null ? _d : (_c2 = (_b2 = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _b2.root) == null ? void 0 : _c2.variant) != null ? _e : "solid",
        colorScheme: (_j = (_i = (_f = local.colorScheme) != null ? _f : buttonGroupContext == null ? void 0 : buttonGroupContext.state.colorScheme) != null ? _i : (_h = (_g = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _g.root) == null ? void 0 : _h.colorScheme) != null ? _j : "primary",
        size: (_o = (_n = (_k = local.size) != null ? _k : buttonGroupContext == null ? void 0 : buttonGroupContext.state.size) != null ? _n : (_m = (_l = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _l.root) == null ? void 0 : _m.size) != null ? _o : "md",
        loading: local.loading,
        compact: local.compact,
        fullWidth: local.fullWidth
      }));
    };
    return createComponent(hope.button, mergeProps({
      get ["class"]() {
        return classes();
      },
      get disabled() {
        return disabled();
      },
      get __baseStyle() {
        var _a2;
        return (_a2 = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a2.root;
      }
    }, others, {
      get children() {
        return [createComponent(Show, {
          get when() {
            return local.loading && local.loaderPlacement === "start";
          },
          get children() {
            return createComponent(ButtonLoader, {
              "class": "hope-button__loader--start",
              get withLoadingText() {
                return !!local.loadingText;
              },
              placement: "start",
              get spacing() {
                return contentProps.iconSpacing;
              },
              get children() {
                return local.loader;
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return local.loading;
          },
          get fallback() {
            return createComponent(ButtonContent, contentProps);
          },
          get children() {
            return createComponent(Show, {
              get when() {
                return local.loadingText;
              },
              get fallback() {
                return createComponent(hope.span, {
                  opacity: 0,
                  get children() {
                    return createComponent(ButtonContent, contentProps);
                  }
                });
              },
              get children() {
                return local.loadingText;
              }
            });
          }
        }), createComponent(Show, {
          get when() {
            return local.loading && local.loaderPlacement === "end";
          },
          get children() {
            return createComponent(ButtonLoader, {
              "class": "hope-button__loader--end",
              get withLoadingText() {
                return !!local.loadingText;
              },
              placement: "end",
              get spacing() {
                return contentProps.iconSpacing;
              },
              get children() {
                return local.loader;
              }
            });
          }
        })];
      }
    }));
  }
  Button.toString = () => createClassSelector(hopeButtonClass);
  function ButtonContent(props) {
    return [createComponent(Show, {
      get when() {
        return props.leftIcon;
      },
      get children() {
        return createComponent(ButtonIcon, {
          get marginEnd() {
            return props.iconSpacing;
          },
          get children() {
            return props.leftIcon;
          }
        });
      }
    }), createMemo(() => props.children), createComponent(Show, {
      get when() {
        return props.rightIcon;
      },
      get children() {
        return createComponent(ButtonIcon, {
          get marginStart() {
            return props.iconSpacing;
          },
          get children() {
            return props.rightIcon;
          }
        });
      }
    })];
  }
  function createSizeVariant(size2) {
    return {
      boxSize: size2,
      fontSize: `calc(${size2} / 2.5)`,
      lineHeight: size2
    };
  }
  const avatarStyles = css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    borderRadius: "$full",
    borderColor: "$loContrast",
    backgroundColor: "$neutral8",
    color: "$neutral12",
    fontWeight: "$medium",
    textAlign: "center",
    textTransform: "uppercase",
    verticalAlign: "top",
    variants: {
      size: {
        "2xs": createSizeVariant("$sizes$4"),
        xs: createSizeVariant("$sizes$6"),
        sm: createSizeVariant("$sizes$8"),
        md: createSizeVariant("$sizes$12"),
        lg: createSizeVariant("$sizes$16"),
        xl: createSizeVariant("$sizes$24"),
        "2xl": createSizeVariant("$sizes$32"),
        full: {
          boxSize: "$full",
          fontSize: "calc($sizes$full / 2.5)"
        }
      },
      withBorder: {
        true: {}
      }
    },
    compoundVariants: [
      {
        withBorder: true,
        size: "2xs",
        css: { borderWidth: "1px" }
      },
      {
        withBorder: true,
        size: "xs",
        css: { borderWidth: "1px" }
      },
      {
        withBorder: true,
        size: "sm",
        css: { borderWidth: "2px" }
      },
      {
        withBorder: true,
        size: "md",
        css: { borderWidth: "2px" }
      },
      {
        withBorder: true,
        size: "lg",
        css: { borderWidth: "3px" }
      },
      {
        withBorder: true,
        size: "xl",
        css: { borderWidth: "4px" }
      },
      {
        withBorder: true,
        size: "2xl",
        css: { borderWidth: "5px" }
      },
      {
        withBorder: true,
        size: "full",
        css: { borderWidth: "2px" }
      }
    ]
  });
  css(avatarStyles);
  css({
    boxSize: "$full",
    borderRadius: "$full",
    objectFit: "cover"
  });
  css({
    position: "absolute",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "$full",
    borderWidth: "0.2em",
    borderStyle: "solid",
    borderColor: "$loContrast",
    variants: {
      placement: {
        "top-start": {
          insetInlineStart: "0",
          top: "0",
          transform: "translate(-25%, -25%)"
        },
        "top-end": {
          insetInlineEnd: "0",
          top: "0",
          transform: "translate(25%, -25%)"
        },
        "bottom-start": {
          insetInlineStart: "0",
          bottom: "0",
          transform: "translate(-25%, 25%)"
        },
        "bottom-end": {
          insetInlineEnd: "0",
          bottom: "0",
          transform: "translate(25%, 25%)"
        }
      }
    }
  });
  css({
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-start",
    flexDirection: "row",
    [`& .${avatarStyles}:first-child`]: {
      marginStart: "0"
    }
  });
  css({
    display: "inline-block",
    borderRadius: "$sm",
    py: "$0_5",
    px: "$1",
    fontSize: "$xs",
    fontWeight: "$bold",
    lineHeight: "$none",
    letterSpacing: "$wide",
    textTransform: "uppercase",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    variants: {
      variant: {
        solid: {
          border: "1px solid transparent",
          color: "white"
        },
        subtle: {
          border: "1px solid transparent"
        },
        outline: {
          borderStyle: "solid",
          borderWidth: "1px",
          backgroundColor: "transparent"
        }
      },
      colorScheme: {
        primary: {},
        accent: {},
        neutral: {},
        success: {},
        info: {},
        warning: {},
        danger: {}
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        colorScheme: "primary",
        css: {
          color: "white",
          bgColor: "$primary9"
        }
      },
      {
        variant: "solid",
        colorScheme: "accent",
        css: {
          color: "white",
          bgColor: "$accent9"
        }
      },
      {
        variant: "solid",
        colorScheme: "neutral",
        css: {
          color: "white",
          bgColor: "$neutral9"
        }
      },
      {
        variant: "solid",
        colorScheme: "success",
        css: {
          color: "white",
          bgColor: "$success9"
        }
      },
      {
        variant: "solid",
        colorScheme: "info",
        css: {
          color: "white",
          bgColor: "$info9"
        }
      },
      {
        variant: "solid",
        colorScheme: "warning",
        css: {
          color: "$blackAlpha12",
          bgColor: "$warning9"
        }
      },
      {
        variant: "solid",
        colorScheme: "danger",
        css: {
          color: "white",
          bgColor: "$danger9"
        }
      },
      {
        variant: "subtle",
        colorScheme: "primary",
        css: {
          color: "$primary11",
          bgColor: "$primary4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "accent",
        css: {
          color: "$accent11",
          bgColor: "$accent4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "neutral",
        css: {
          color: "$neutral12",
          bgColor: "$neutral4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "success",
        css: {
          color: "$success11",
          bgColor: "$success4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "info",
        css: {
          color: "$info11",
          bgColor: "$info4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "warning",
        css: {
          color: "$warning11",
          bgColor: "$warning4"
        }
      },
      {
        variant: "subtle",
        colorScheme: "danger",
        css: {
          color: "$danger11",
          bgColor: "$danger4"
        }
      },
      {
        variant: "outline",
        colorScheme: "primary",
        css: {
          color: "$primary11",
          borderColor: "$primary7"
        }
      },
      {
        variant: "outline",
        colorScheme: "accent",
        css: {
          color: "$accent11",
          borderColor: "$accent7"
        }
      },
      {
        variant: "outline",
        colorScheme: "neutral",
        css: {
          color: "$neutral12",
          borderColor: "$neutral7"
        }
      },
      {
        variant: "outline",
        colorScheme: "success",
        css: {
          color: "$success11",
          borderColor: "$success7"
        }
      },
      {
        variant: "outline",
        colorScheme: "info",
        css: {
          color: "$info11",
          borderColor: "$info7"
        }
      },
      {
        variant: "outline",
        colorScheme: "warning",
        css: {
          color: "$warning11",
          borderColor: "$warning7"
        }
      },
      {
        variant: "outline",
        colorScheme: "danger",
        css: {
          color: "$danger11",
          borderColor: "$danger7"
        }
      }
    ]
  });
  css({
    display: "block",
    fontSize: "$base",
    lineHeight: "$6"
  });
  css({
    display: "flex",
    alignItems: "center",
    margin: 0,
    padding: 0,
    listStyle: "none"
  });
  css({
    display: "inline-flex",
    alignItems: "center"
  });
  css({
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center"
  });
  css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    outline: "none",
    backgroundColor: "transparent",
    color: "$neutral11",
    textDecoration: "none",
    cursor: "pointer",
    transition: "color 250ms, text-decoration 250ms",
    "&:focus": {
      boxShadow: "$outline"
    },
    variants: {
      currentPage: {
        true: {
          color: "$neutral12",
          cursor: "default"
        },
        false: {
          "&:hover": {
            color: "$primary11"
          }
        }
      }
    }
  });
  css({
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  });
  function createColorVariant(config2) {
    return {
      color: config2.color,
      "&[data-disabled]": {
        color: "$neutral10"
      },
      "&[data-focus]": {
        boxShadow: `0 0 0 3px $colors${config2.boxShadowColorFocus}`,
        borderColor: config2.borderColorFocus
      }
    };
  }
  const toggleWrapperStyles = css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    gap: "$2",
    cursor: "pointer",
    userSelect: "none",
    "&[data-disabled]": {
      opacity: "0.5",
      cursor: "not-allowed"
    },
    variants: {
      size: {
        sm: {
          fontSize: "$sm",
          lineHeight: "$5"
        },
        md: {
          fontSize: "$base",
          lineHeight: "$6"
        },
        lg: {
          fontSize: "$lg",
          lineHeight: "$7"
        }
      }
    }
  });
  const toggleControlLabelStyles = css({
    cursor: "pointer",
    userSelect: "none",
    "&[data-disabled]": {
      opacity: "0.5",
      cursor: "not-allowed"
    }
  });
  const toggleControlStyles = css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    height: "100%",
    outline: "none",
    padding: 0,
    verticalAlign: "middle",
    cursor: "pointer",
    userSelect: "none",
    transition: "border-color 250ms, box-shadow 250ms",
    "&[data-disabled]": {
      opacity: "0.5",
      cursor: "not-allowed"
    },
    "&[data-invalid]": {
      borderColor: "$danger8",
      color: "$danger9"
    },
    "&[data-focus][data-invalid]": {
      boxShadow: "0 0 0 3px $colors$danger5",
      borderColor: "$danger8"
    },
    "&[data-checked], &[data-focus][data-checked]": {
      borderColor: "transparent",
      backgroundColor: "currentColor"
    },
    variants: {
      variant: {
        outline: {
          border: "1px solid $colors$neutral8",
          backgroundColor: "transparent"
        },
        filled: {
          border: "1px solid transparent",
          backgroundColor: "$neutral7"
        }
      },
      colorScheme: {
        primary: createColorVariant({
          color: "$primary9",
          boxShadowColorFocus: "$primary5",
          borderColorFocus: "$primary8"
        }),
        accent: createColorVariant({
          color: "$accent9",
          boxShadowColorFocus: "$accent5",
          borderColorFocus: "$accent8"
        }),
        neutral: createColorVariant({
          color: "$neutral9",
          boxShadowColorFocus: "$neutral5",
          borderColorFocus: "$neutral8"
        }),
        success: createColorVariant({
          color: "$success9",
          boxShadowColorFocus: "$success5",
          borderColorFocus: "$success8"
        }),
        info: createColorVariant({
          color: "$info9",
          boxShadowColorFocus: "$info5",
          borderColorFocus: "$info8"
        }),
        warning: createColorVariant({
          color: "$warning9",
          boxShadowColorFocus: "$warning5",
          borderColorFocus: "$warning8"
        }),
        danger: createColorVariant({
          color: "$danger9",
          boxShadowColorFocus: "$danger5",
          borderColorFocus: "$danger8"
        })
      },
      size: {
        sm: {
          boxSize: "$3"
        },
        md: {
          boxSize: "$4"
        },
        lg: {
          boxSize: "$5"
        }
      }
    }
  });
  css(toggleWrapperStyles, {
    variants: {
      labelPlacement: {
        start: {
          flexDirection: "row-reverse"
        },
        end: {
          flexDirection: "row"
        }
      }
    }
  });
  css(toggleControlLabelStyles);
  css(toggleControlStyles, {
    borderRadius: "$sm",
    "& svg": {
      color: "$loContrast"
    },
    "&[data-indeterminate], &[data-focus][data-indeterminate]": {
      borderColor: "transparent",
      backgroundColor: "currentColor"
    }
  });
  const formControlStyles = css({
    position: "relative",
    width: "$full"
  });
  const formLabelStyles = css({
    display: "inline-block",
    marginBottom: "$1",
    color: "$neutral12",
    fontWeight: "$medium",
    fontSize: "$sm",
    lineHeight: "$5",
    textAlign: "start",
    opacity: 1,
    "&[data-disabled]": {
      opacity: 0.4,
      cursor: "not-allowed"
    }
  });
  const requiredIndicatorStyles = css({
    marginInlineStart: "$1",
    color: "$danger9",
    fontSize: "$base"
  });
  const formHelperTextStyles = css({
    display: "inline-block",
    marginTop: "$1",
    color: "$neutral11",
    fontWeight: "$normal",
    fontSize: "$sm",
    lineHeight: "$5",
    textAlign: "start",
    opacity: 1,
    "&[data-disabled]": {
      opacity: 0.4,
      cursor: "not-allowed"
    }
  });
  css({
    display: "inline-block",
    marginTop: "$1",
    color: "$danger9",
    fontWeight: "$normal",
    fontSize: "$sm",
    lineHeight: "$5",
    textAlign: "start",
    opacity: 1,
    "&[data-disabled]": {
      opacity: 0.4,
      cursor: "not-allowed"
    }
  });
  const FormControlContext = createContext();
  const hopeFormControlClass = "hope-form-control";
  function FormControl(props) {
    const defaultId = `hope-field-${createUniqueId()}`;
    const theme = useStyleConfig().FormControl;
    const [state, setState] = createStore({
      get id() {
        var _a;
        return (_a = props.id) != null ? _a : defaultId;
      },
      get labelId() {
        return `${this.id}-label`;
      },
      get helperTextId() {
        return `${this.id}-helper-text`;
      },
      get errorMessageId() {
        return `${this.id}-error-message`;
      },
      get required() {
        return props.required;
      },
      get disabled() {
        return props.disabled;
      },
      get invalid() {
        return props.invalid;
      },
      get readOnly() {
        return props.readOnly;
      },
      get ["data-focus"]() {
        return this.isFocused ? "" : void 0;
      },
      get ["data-disabled"]() {
        return this.disabled ? "" : void 0;
      },
      get ["data-invalid"]() {
        return this.invalid ? "" : void 0;
      },
      get ["data-readonly"]() {
        return this.readOnly ? "" : void 0;
      },
      hasHelperText: false,
      hasErrorMessage: false,
      isFocused: false
    });
    const [local, others] = splitProps(props, ["id", "required", "disabled", "invalid", "readOnly", "class"]);
    const setHasHelperText = (value) => setState("hasHelperText", value);
    const setHasErrorMessage = (value) => setState("hasErrorMessage", value);
    const onFocus = () => setState("isFocused", true);
    const onBlur = () => setState("isFocused", false);
    const context = () => ({
      state,
      setHasHelperText,
      setHasErrorMessage,
      onFocus,
      onBlur
    });
    const classes = () => classNames(local.class, hopeFormControlClass, formControlStyles());
    return createComponent(FormControlContext.Provider, {
      get value() {
        return context();
      },
      get children() {
        return createComponent(Box, mergeProps({
          role: "group",
          get ["class"]() {
            return classes();
          },
          get __baseStyle() {
            var _a;
            return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.root;
          }
        }, others));
      }
    });
  }
  FormControl.toString = () => createClassSelector(hopeFormControlClass);
  function useFormControlContext() {
    return useContext(FormControlContext);
  }
  function useFormControl(props) {
    const formControl = useFormControlContext();
    const focusHandler = createMemo(() => {
      return chainHandlers(formControl == null ? void 0 : formControl.onFocus, props.onFocus);
    });
    const blurHandler = createMemo(() => {
      return chainHandlers(formControl == null ? void 0 : formControl.onBlur, props.onBlur);
    });
    const [state] = createStore({
      get id() {
        var _a;
        return (_a = props.id) != null ? _a : formControl == null ? void 0 : formControl.state.id;
      },
      get required() {
        var _a;
        return (_a = props.required) != null ? _a : formControl == null ? void 0 : formControl.state.required;
      },
      get disabled() {
        var _a;
        return (_a = props.disabled) != null ? _a : formControl == null ? void 0 : formControl.state.disabled;
      },
      get invalid() {
        var _a;
        return (_a = props.invalid) != null ? _a : formControl == null ? void 0 : formControl.state.invalid;
      },
      get readOnly() {
        var _a;
        return (_a = props.readOnly) != null ? _a : formControl == null ? void 0 : formControl.state.readOnly;
      },
      get ["aria-required"]() {
        return this.required ? true : void 0;
      },
      get ["aria-disabled"]() {
        return this.disabled ? true : void 0;
      },
      get ["aria-invalid"]() {
        return this.invalid ? true : void 0;
      },
      get ["aria-readonly"]() {
        return this.readOnly ? true : void 0;
      },
      get ["aria-describedby"]() {
        const labelIds = props["aria-describedby"] ? [props["aria-describedby"]] : [];
        if ((formControl == null ? void 0 : formControl.state.hasErrorMessage) && (formControl == null ? void 0 : formControl.state.invalid)) {
          labelIds.push(formControl.state.errorMessageId);
        }
        if (formControl == null ? void 0 : formControl.state.hasHelperText) {
          labelIds.push(formControl.state.helperTextId);
        }
        return labelIds.join(" ") || void 0;
      },
      get onFocus() {
        return focusHandler;
      },
      get onBlur() {
        return blurHandler;
      }
    });
    return state;
  }
  const _tmpl$$9 = /* @__PURE__ */ template$1(`<svg><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" stroke="currentColor" stroke-width="1" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`, 4, true), _tmpl$2$1 = /* @__PURE__ */ template$1(`<svg><path d="M2.25 7.5C2.25 7.22386 2.47386 7 2.75 7H12.25C12.5261 7 12.75 7.22386 12.75 7.5C12.75 7.77614 12.5261 8 12.25 8H2.75C2.47386 8 2.25 7.77614 2.25 7.5Z" fill="currentColor" stroke="currentColor" stroke-width="1" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$9.cloneNode(true)
  });
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$2$1.cloneNode(true)
  });
  const growAndShrink = keyframes({
    "0%": {
      strokeDasharray: "1, 400",
      strokeDashoffset: "0"
    },
    "50%": {
      strokeDasharray: "400, 400",
      strokeDashoffset: "-100"
    },
    "100%": {
      strokeDasharray: "400, 400",
      strokeDashoffset: "-260"
    }
  });
  css({
    position: "relative",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    verticalAlign: "middle"
  });
  css({
    fill: "transparent",
    stroke: "currentColor"
  });
  css({
    position: "absolute",
    top: 0,
    left: 0,
    variants: {
      spin: {
        true: {
          animation: `${spin} 2s linear infinite`
        }
      }
    }
  });
  css({
    fill: "transparent",
    stroke: "currentColor",
    opacity: 1,
    variants: {
      hidden: {
        true: {
          opacity: 0
        }
      },
      withRoundCaps: {
        true: { strokeLinecap: "round" }
      },
      indeterminate: {
        true: {
          animation: `${growAndShrink} 2s linear infinite`
        },
        false: {
          strokeDashoffset: 66,
          transitionProperty: "stroke-dasharray, stroke, opacity",
          transitionDuration: "600ms",
          transitionTimingFunction: "ease"
        }
      }
    }
  });
  css({
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    color: "$neutral12",
    fontSize: "$xs",
    lineHeight: "$none",
    fontWeight: "$bold",
    textAlign: "center",
    transform: "translate(-50%, -50%)"
  });
  const _tmpl$$8 = /* @__PURE__ */ template$1(`<svg><path fill="currentColor" d="M2.64 1.27L7.5 6.13l4.84-4.84A.92.92 0 0 1 13 1a1 1 0 0 1 1 1a.9.9 0 0 1-.27.66L8.84 7.5l4.89 4.89A.9.9 0 0 1 14 13a1 1 0 0 1-1 1a.92.92 0 0 1-.69-.27L7.5 8.87l-4.85 4.85A.92.92 0 0 1 2 14a1 1 0 0 1-1-1a.9.9 0 0 1 .27-.66L6.16 7.5L1.27 2.61A.9.9 0 0 1 1 2a1 1 0 0 1 1-1c.24.003.47.1.64.27z"></path></svg>`, 4, true);
  const IconClose = createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$8.cloneNode(true)
  });
  const closeButtonStyles = css({
    appearance: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
    outline: "none",
    borderWidth: 0,
    borderRadius: "$sm",
    backgroundColor: "transparent",
    padding: 0,
    color: "currentColor",
    cursor: "pointer",
    userSelect: "none",
    transition: "color 250ms, background-color 250ms",
    "&:disbaled": {
      opacity: "0.5",
      cursor: "not-allowed",
      boxShadow: "none"
    },
    "&:hover": {
      backgroundColor: "$closeButtonHoverBackground"
    },
    "&:active": {
      backgroundColor: "$closeButtonActiveBackground"
    },
    "&:focus": {
      outline: "none",
      boxShadow: "$outline"
    },
    variants: {
      size: {
        sm: {
          boxSize: "24px",
          fontSize: "10px"
        },
        md: {
          boxSize: "32px",
          fontSize: "12px"
        },
        lg: {
          boxSize: "40px",
          fontSize: "16px"
        }
      }
    }
  });
  const hopeCloseButtonClass = "hope-close-button";
  function CloseButton(props) {
    var _a, _b, _c, _d, _e, _f;
    const theme = useStyleConfig().CloseButton;
    const defaultProps = {
      "aria-label": (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a["aria-label"]) != null ? _b : "Close",
      icon: (_d = (_c = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _c.icon) != null ? _d : createComponent(IconClose, {}),
      size: (_f = (_e = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _e.size) != null ? _f : "md"
    };
    const propsWithDefaults = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefaults, ["class", "children", "size", "icon"]);
    const classes = () => {
      return classNames(local.class, hopeCloseButtonClass, closeButtonStyles({
        size: local.size
      }));
    };
    return createComponent(hope.button, mergeProps({
      type: "button",
      get ["class"]() {
        return classes();
      },
      get __baseStyle() {
        return theme == null ? void 0 : theme.baseStyle;
      }
    }, others, {
      get children() {
        return createComponent(Show, {
          get when() {
            return local.children;
          },
          get fallback() {
            return local.icon;
          },
          get children() {
            return local.children;
          }
        });
      }
    }));
  }
  CloseButton.toString = () => createClassSelector(hopeCloseButtonClass);
  css({
    width: "100%",
    "@sm": { maxWidth: "$containerSm" },
    "@md": { maxWidth: "$containerMd" },
    "@lg": { maxWidth: "$containerLg" },
    "@xl": { maxWidth: "$containerXl" },
    "@2xl": { maxWidth: "$container2xl" },
    variants: {
      centered: {
        true: {
          mx: "auto"
        }
      },
      centerContent: {
        true: {
          display: "flex",
          flexDirection: "column",
          alignItems: "center"
        }
      }
    }
  });
  const dividerStyles = css({
    border: 0,
    borderColor: "currentColor",
    variants: {
      variant: {
        solid: {
          borderStyle: "solid"
        },
        dashed: {
          borderStyle: "dashed"
        },
        dotted: {
          borderStyle: "dotted"
        }
      },
      orientation: {
        vertical: {
          height: "100%"
        },
        horizontal: {
          width: "100%"
        }
      }
    }
  });
  const hopeDividerClass = "hope-divider";
  function Divider(props) {
    const defaultProps = {
      as: "div",
      variant: "solid",
      orientation: "horizontal",
      color: "$neutral6",
      thickness: "1px"
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefault, ["class", "variant", "orientation", "thickness"]);
    const classes = () => {
      return classNames(local.class, hopeDividerClass, dividerStyles({
        variant: local.variant,
        orientation: local.orientation,
        css: {
          borderLeftWidth: local.orientation === "vertical" ? local.thickness : 0,
          borderBottomWidth: local.orientation === "horizontal" ? local.thickness : 0
        }
      }));
    };
    return createComponent(Box, mergeProps({
      get ["class"]() {
        return classes();
      }
    }, others));
  }
  Divider.toString = () => createClassSelector(hopeDividerClass);
  function Modal(props) {
    const defaultDialogId = `hope-modal-${createUniqueId()}`;
    const theme = useStyleConfig().Modal;
    const [state, setState] = createStore({
      headerMounted: false,
      bodyMounted: false,
      get opened() {
        return props.opened;
      },
      get dialogId() {
        var _a;
        return (_a = props.id) != null ? _a : defaultDialogId;
      },
      get headerId() {
        return `${this.dialogId}--header`;
      },
      get bodyId() {
        return `${this.dialogId}--body`;
      },
      get initialFocus() {
        return props.initialFocus;
      },
      get motionPreset() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.motionPreset) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.motionPreset) != null ? _d : "scale";
      },
      get size() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.size) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.size) != null ? _d : "md";
      },
      get centered() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.centered) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.centered) != null ? _d : false;
      },
      get scrollBehavior() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.scrollBehavior) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.scrollBehavior) != null ? _d : "outside";
      },
      get closeOnOverlayClick() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.closeOnOverlayClick) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.closeOnOverlayClick) != null ? _d : true;
      },
      get closeOnEsc() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.closeOnEsc) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.closeOnEsc) != null ? _d : true;
      },
      get trapFocus() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.trapFocus) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.trapFocus) != null ? _d : true;
      },
      get blockScrollOnMount() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.blockScrollOnMount) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.blockScrollOnMount) != null ? _d : true;
      },
      get preserveScrollBarGap() {
        var _a, _b, _c, _d;
        return (_d = (_c = props.preserveScrollBarGap) != null ? _c : (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.root) == null ? void 0 : _b.preserveScrollBarGap) != null ? _d : false;
      }
    });
    const [isPortalMounted, setIsPortalMounted] = createSignal(false);
    createEffect(() => {
      if (state.opened) {
        setIsPortalMounted(true);
      } else {
        state.motionPreset === "none" && setIsPortalMounted(false);
      }
    });
    const unmountPortal = () => setIsPortalMounted(false);
    const onClose = () => props.onClose();
    const setHeaderMounted = (value) => setState("headerMounted", value);
    const setBodyMounted = (value) => setState("bodyMounted", value);
    let mouseDownTarget = null;
    const onMouseDown = (event) => {
      mouseDownTarget = event.target;
    };
    const onKeyDown = (event) => {
      var _a;
      if (event.key === "Escape") {
        event.stopPropagation();
        if (state.closeOnEsc) {
          onClose();
        }
        (_a = props.onEsc) == null ? void 0 : _a.call(props);
      }
    };
    const onOverlayClick = (event) => {
      var _a;
      event.stopPropagation();
      if (mouseDownTarget !== event.target) {
        return;
      }
      if (state.closeOnOverlayClick) {
        onClose();
      }
      (_a = props.onOverlayClick) == null ? void 0 : _a.call(props);
    };
    const context = {
      state,
      unmountPortal,
      onClose,
      onMouseDown,
      onKeyDown,
      onOverlayClick,
      setHeaderMounted,
      setBodyMounted
    };
    return createComponent(Show, {
      get when() {
        return isPortalMounted();
      },
      get children() {
        return createComponent(ModalContext.Provider, {
          value: context,
          get children() {
            return createComponent(Portal, {
              get children() {
                return props.children;
              }
            });
          }
        });
      }
    });
  }
  const ModalContext = createContext();
  function useModalContext() {
    const context = useContext(ModalContext);
    if (!context) {
      throw new Error("[Hope UI]: useModalContext must be used within a `<Modal />` component");
    }
    return context;
  }
  const hopeModalBodyClass = "hope-modal__body";
  function ModalBody(props) {
    const theme = useStyleConfig().Modal;
    const modalContext = useModalContext();
    const [local, others] = splitProps(props, ["class"]);
    const classes = () => {
      return classNames(local.class, hopeModalBodyClass, modalBodyStyles({
        scrollBehavior: modalContext.state.scrollBehavior
      }));
    };
    onMount(() => modalContext.setBodyMounted(true));
    onCleanup(() => modalContext.setBodyMounted(false));
    return createComponent(Box, mergeProps({
      get ["class"]() {
        return classes();
      },
      get id() {
        return modalContext.state.bodyId;
      },
      get __baseStyle() {
        var _a;
        return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.body;
      }
    }, others));
  }
  ModalBody.toString = () => createClassSelector(hopeModalBodyClass);
  const hopeModalCloseButtonClass = "hope-modal__close-button";
  function ModalCloseButton(props) {
    var _a, _b, _c, _d, _e, _f, _g, _h;
    const theme = useStyleConfig().Modal;
    const modalContext = useModalContext();
    const defaultProps = {
      "aria-label": (_c = (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.closeButton) == null ? void 0 : _b["aria-label"]) != null ? _c : "Close modal",
      size: (_f = (_e = (_d = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _d.closeButton) == null ? void 0 : _e.size) != null ? _f : "md",
      icon: (_h = (_g = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _g.closeButton) == null ? void 0 : _h.icon
    };
    const propsWithDefaults = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefaults, ["class", "onClick"]);
    const classes = () => classNames(local.class, hopeModalCloseButtonClass, modalCloseButtonStyles());
    const onClick = (event) => {
      chainHandlers(local.onClick, (e) => {
        e.stopPropagation();
        modalContext.onClose();
      })(event);
    };
    return createComponent(CloseButton, mergeProps({
      get ["class"]() {
        return classes();
      },
      get __baseStyle() {
        var _a2;
        return (_a2 = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a2.closeButton;
      },
      onClick
    }, others));
  }
  ModalCloseButton.toString = () => createClassSelector(hopeModalCloseButtonClass);
  const hopeModalHeaderClass = "hope-modal__header";
  function ModalHeader(props) {
    const theme = useStyleConfig().Modal;
    const modalContext = useModalContext();
    const [local, others] = splitProps(props, ["class"]);
    const classes = () => classNames(local.class, hopeModalHeaderClass, modalHeaderStyles());
    onMount(() => modalContext.setHeaderMounted(true));
    onCleanup(() => modalContext.setHeaderMounted(false));
    return createComponent(Box, mergeProps({
      get ["class"]() {
        return classes();
      },
      get id() {
        return modalContext.state.headerId;
      },
      get __baseStyle() {
        var _a;
        return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.header;
      }
    }, others));
  }
  ModalHeader.toString = () => createClassSelector(hopeModalHeaderClass);
  function createModal(props) {
    const modalContext = useModalContext();
    let containerRef;
    let focusTrap;
    const assignContainerRef = (el) => {
      containerRef = el;
    };
    const ariaLabelledBy = () => {
      return modalContext.state.headerMounted ? modalContext.state.headerId : void 0;
    };
    const ariaDescribedBy = () => {
      return modalContext.state.bodyMounted ? modalContext.state.bodyId : void 0;
    };
    const onDialogClick = (event) => {
      chainHandlers(props.onClick, (e) => e.stopPropagation())(event);
    };
    const dialogSelector = () => `[id='${modalContext.state.dialogId}']`;
    const childOfDialogSelector = () => `${dialogSelector()} *`;
    const enableFocusTrapAndScrollLock = () => {
      if (!containerRef) {
        return;
      }
      if (modalContext.state.trapFocus) {
        focusTrap = createFocusTrap(containerRef, {
          initialFocus: modalContext.state.initialFocus,
          fallbackFocus: dialogSelector(),
          allowOutsideClick: true
        });
        focusTrap.activate();
      }
      if (modalContext.state.blockScrollOnMount) {
        scrollLockExports.addScrollableSelector(childOfDialogSelector());
        scrollLockExports.disablePageScroll(containerRef);
      }
    };
    const disableFocusTrapAndScrollLock = () => {
      focusTrap == null ? void 0 : focusTrap.deactivate();
      scrollLockExports.removeScrollableSelector(childOfDialogSelector());
      scrollLockExports.clearQueueScrollLocks();
      scrollLockExports.enablePageScroll();
    };
    onMount(() => {
      enableFocusTrapAndScrollLock();
    });
    onCleanup(() => {
      disableFocusTrapAndScrollLock();
    });
    return {
      assignContainerRef,
      ariaLabelledBy,
      ariaDescribedBy,
      onDialogClick
    };
  }
  const hopeModalContainerClass = "hope-modal__content-container";
  const hopeModalContentClass = "hope-modal__content";
  function ModalContent(props) {
    const theme = useStyleConfig().Modal;
    const modalContext = useModalContext();
    const [local, others] = splitProps(props, ["ref", "class", "role", "aria-labelledby", "aria-describedby", "onClick"]);
    const {
      assignContainerRef,
      ariaLabelledBy,
      ariaDescribedBy,
      onDialogClick
    } = createModal(local);
    const containerClasses = () => {
      const containerClass = modalContainerStyles({
        centered: modalContext.state.centered,
        scrollBehavior: modalContext.state.scrollBehavior
      });
      return classNames(hopeModalContainerClass, containerClass);
    };
    const dialogClasses = () => {
      const dialogClass = modalDialogStyles({
        size: modalContext.state.size,
        scrollBehavior: modalContext.state.scrollBehavior
      });
      return classNames(local.class, hopeModalContentClass, dialogClass);
    };
    const transitionName = () => {
      switch (modalContext.state.motionPreset) {
        case "fade-in-bottom":
          return modalTransitionName.fadeInBottom;
        case "scale":
          return modalTransitionName.scale;
        case "none":
          return "hope-none";
      }
    };
    return createComponent(Transition, {
      get name() {
        return transitionName();
      },
      appear: true,
      get onAfterExit() {
        return modalContext.unmountPortal;
      },
      get children() {
        return createComponent(Show, {
          get when() {
            return modalContext.state.opened;
          },
          get children() {
            return createComponent(Box, {
              ref: assignContainerRef,
              get ["class"]() {
                return containerClasses();
              },
              tabIndex: -1,
              get onMouseDown() {
                return modalContext.onMouseDown;
              },
              get onKeyDown() {
                return modalContext.onKeyDown;
              },
              get onClick() {
                return modalContext.onOverlayClick;
              },
              get children() {
                return createComponent(hope.section, mergeProps({
                  get ["class"]() {
                    return dialogClasses();
                  },
                  get __baseStyle() {
                    var _a;
                    return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.content;
                  },
                  get id() {
                    return modalContext.state.dialogId;
                  },
                  get role() {
                    var _a;
                    return (_a = local.role) != null ? _a : "dialog";
                  },
                  tabIndex: -1,
                  "aria-modal": true,
                  get ["aria-labelledby"]() {
                    return ariaLabelledBy();
                  },
                  get ["aria-describedby"]() {
                    return ariaDescribedBy();
                  },
                  onClick: onDialogClick
                }, others));
              }
            });
          }
        });
      }
    });
  }
  ModalContent.toString = () => createClassSelector(hopeModalContentClass);
  const hopeModalOverlayClass = "hope-modal__overlay";
  function ModalOverlay(props) {
    const theme = useStyleConfig().Modal;
    const modalContext = useModalContext();
    const [local, others] = splitProps(props, ["class"]);
    const classes = () => classNames(local.class, hopeModalOverlayClass, modalOverlayStyles());
    const transitionName = () => {
      return modalContext.state.motionPreset === "none" ? "hope-none" : modalTransitionName.fade;
    };
    return createComponent(Transition, {
      get name() {
        return transitionName();
      },
      appear: true,
      get children() {
        return createComponent(Show, {
          get when() {
            return modalContext.state.opened;
          },
          get children() {
            return createComponent(Box, mergeProps({
              get ["class"]() {
                return classes();
              },
              get __baseStyle() {
                var _a;
                return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.overlay;
              }
            }, others));
          }
        });
      }
    });
  }
  ModalOverlay.toString = () => createClassSelector(hopeModalOverlayClass);
  const hopeFormHelperTextClass = "hope-form-helper-text";
  function FormHelperText(props) {
    const theme = useStyleConfig().FormControl;
    const formControl = useFormControlContext();
    const [local, others] = splitProps(props, ["ref", "id", "class"]);
    const id2 = () => {
      var _a;
      return (_a = local.id) != null ? _a : formControl == null ? void 0 : formControl.state.helperTextId;
    };
    const classes = () => classNames(local.class, hopeFormHelperTextClass, formHelperTextStyles());
    onMount(() => formControl == null ? void 0 : formControl.setHasHelperText(true));
    onCleanup(() => formControl == null ? void 0 : formControl.setHasHelperText(false));
    return createComponent(Box, mergeProps({
      get id() {
        return id2();
      },
      get ["class"]() {
        return classes();
      },
      get __baseStyle() {
        var _a;
        return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.helperText;
      },
      get ["data-disabled"]() {
        return formControl == null ? void 0 : formControl.state["data-disabled"];
      },
      get ["data-readonly"]() {
        return formControl == null ? void 0 : formControl.state["data-readonly"];
      }
    }, others));
  }
  FormHelperText.toString = () => createClassSelector(hopeFormHelperTextClass);
  const _tmpl$$7 = /* @__PURE__ */ template$1(`<span role="presentation" aria-hidden="true">*</span>`, 2);
  const hopeFormLabelClass = "hope-form-label";
  function FormLabel(props) {
    var _a, _b, _c;
    const theme = useStyleConfig().FormControl;
    const formControl = useFormControlContext();
    const defaultProps = {
      withRequiredIndicator: (_c = (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.label) == null ? void 0 : _b.withRequiredIndicator) != null ? _c : true
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefault, ["id", "for", "class", "children", "withRequiredIndicator"]);
    const id2 = () => {
      var _a2;
      return (_a2 = local.id) != null ? _a2 : formControl == null ? void 0 : formControl.state.labelId;
    };
    const htmlFor = () => {
      var _a2;
      return (_a2 = local.for) != null ? _a2 : formControl == null ? void 0 : formControl.state.id;
    };
    const classes = () => classNames(local.class, hopeFormLabelClass, formLabelStyles());
    return createComponent(hope.label, mergeProps({
      get id() {
        return id2();
      },
      get ["for"]() {
        return htmlFor();
      },
      get ["class"]() {
        return classes();
      },
      get __baseStyle() {
        var _a2;
        return (_a2 = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a2.label;
      },
      get ["data-focus"]() {
        return formControl == null ? void 0 : formControl.state["data-focus"];
      },
      get ["data-disabled"]() {
        return formControl == null ? void 0 : formControl.state["data-disabled"];
      },
      get ["data-invalid"]() {
        return formControl == null ? void 0 : formControl.state["data-invalid"];
      },
      get ["data-readonly"]() {
        return formControl == null ? void 0 : formControl.state["data-readonly"];
      }
    }, others, {
      get children() {
        return [createMemo(() => local.children), createComponent(Show, {
          get when() {
            return (formControl == null ? void 0 : formControl.state.required) && local.withRequiredIndicator;
          },
          get children() {
            const _el$ = _tmpl$$7.cloneNode(true);
            createRenderEffect(() => _el$.className = requiredIndicatorStyles());
            return _el$;
          }
        })];
      }
    }));
  }
  FormLabel.toString = () => createClassSelector(hopeFormLabelClass);
  const textStyles = css({
    variants: {
      size: {
        xs: {
          fontSize: "$xs",
          lineHeight: "$4"
        },
        sm: {
          fontSize: "$sm",
          lineHeight: "$5"
        },
        base: {
          fontSize: "$base",
          lineHeight: "$6"
        },
        lg: {
          fontSize: "$lg",
          lineHeight: "$7"
        },
        xl: {
          fontSize: "$xl",
          lineHeight: "$7"
        },
        "2xl": {
          fontSize: "$2xl",
          lineHeight: "$8"
        },
        "3xl": {
          fontSize: "$3xl",
          lineHeight: "$9"
        },
        "4xl": {
          fontSize: "$4xl",
          lineHeight: "$10"
        },
        "5xl": {
          fontSize: "$5xl",
          lineHeight: "$none"
        },
        "6xl": {
          fontSize: "$6xl",
          lineHeight: "$none"
        },
        "7xl": {
          fontSize: "$7xl",
          lineHeight: "$none"
        },
        "8xl": {
          fontSize: "$8xl",
          lineHeight: "$none"
        },
        "9xl": {
          fontSize: "$9xl",
          lineHeight: "$none"
        }
      }
    }
  });
  css(textStyles, {
    fontWeight: "$semibold"
  });
  const InputGroupContext = createContext();
  function useInputGroupContext() {
    return useContext(InputGroupContext);
  }
  const hopeInputClass = "hope-input";
  function Input(props) {
    const theme = useStyleConfig().Input;
    const inputGroup = useInputGroupContext();
    const formControlProps = useFormControl(props);
    const [local, others] = splitProps(props, ["class", "htmlSize", "variant", "size"]);
    const classes = () => {
      var _a, _b, _c, _d, _e, _f, _g, _h, _i, _j, _k, _l, _m, _n;
      return classNames(local.class, hopeInputClass, inputStyles({
        variant: (_e = (_d = (_a = local.variant) != null ? _a : inputGroup == null ? void 0 : inputGroup.state.variant) != null ? _d : (_c = (_b = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _b.input) == null ? void 0 : _c.variant) != null ? _e : "outline",
        size: (_j = (_i = (_f = local.size) != null ? _f : inputGroup == null ? void 0 : inputGroup.state.size) != null ? _i : (_h = (_g = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _g.input) == null ? void 0 : _h.size) != null ? _j : "md",
        withLeftElement: (_k = inputGroup == null ? void 0 : inputGroup.state.hasLeftElement) != null ? _k : false,
        withRightElement: (_l = inputGroup == null ? void 0 : inputGroup.state.hasRightElement) != null ? _l : false,
        withLeftAddon: (_m = inputGroup == null ? void 0 : inputGroup.state.hasLeftAddon) != null ? _m : false,
        withRightAddon: (_n = inputGroup == null ? void 0 : inputGroup.state.hasRightAddon) != null ? _n : false
      }));
    };
    return createComponent(hope.input, mergeProps({
      type: "text",
      get ["class"]() {
        return classes();
      },
      get size() {
        return local.htmlSize;
      },
      get __baseStyle() {
        var _a;
        return (_a = theme == null ? void 0 : theme.baseStyle) == null ? void 0 : _a.input;
      }
    }, formControlProps, others));
  }
  Input.toString = () => createClassSelector(hopeInputClass);
  css({
    borderRadius: "$md",
    borderColor: "$neutral7",
    borderWidth: "1px",
    borderBottomWidth: "3px",
    backgroundColor: "$neutral2",
    px: "0.4em",
    fontFamily: "$mono",
    fontSize: "0.8em",
    fontWeight: "$bold",
    lineHeight: "$normal",
    whiteSpace: "nowrap"
  });
  css({
    listStyleType: "none"
  });
  css({
    marginEnd: "0.5rem"
  });
  const stackStyles = css({
    display: "flex"
  });
  const hopeStackClass = "hope-stack";
  function Stack(props) {
    const [local, others] = splitProps(props, ["class", "direction", "wrap", "spacing"]);
    const classes = () => classNames(local.class, hopeStackClass, stackStyles());
    return createComponent(Box, mergeProps({
      get ["class"]() {
        return classes();
      },
      get flexDirection() {
        return local.direction;
      },
      get flexWrap() {
        return local.wrap;
      },
      get gap() {
        return local.spacing;
      }
    }, others));
  }
  Stack.toString = () => createClassSelector(hopeStackClass);
  function HStack(props) {
    const [local, others] = splitProps(props, ["spacing"]);
    return createComponent(Stack, mergeProps({
      direction: "row",
      alignItems: "center",
      get columnGap() {
        return local.spacing;
      }
    }, others));
  }
  HStack.toString = () => createClassSelector(hopeStackClass);
  function VStack(props) {
    const [local, others] = splitProps(props, ["spacing"]);
    return createComponent(Stack, mergeProps({
      direction: "column",
      alignItems: "center",
      get rowGap() {
        return local.spacing;
      }
    }, others));
  }
  VStack.toString = () => createClassSelector(hopeStackClass);
  const indeterminateProgress = keyframes({
    "0%": { left: "-40%" },
    "100%": { left: "100%" }
  });
  const stripe = keyframes({
    from: { backgroundPosition: "1rem 0" },
    to: { backgroundPosition: "0 0" }
  });
  css({
    position: "relative",
    overflow: "hidden",
    variants: {
      size: {
        xs: {
          height: "$1",
          fontSize: "4px"
        },
        sm: {
          height: "$2",
          fontSize: "6px"
        },
        md: {
          height: "$3",
          fontSize: "8px"
        },
        lg: {
          height: "$4",
          fontSize: "10px"
        }
      }
    }
  });
  css({
    position: "relative",
    height: "100%",
    transition: "width 600ms ease",
    variants: {
      striped: {
        true: {}
      },
      animated: {
        true: {}
      },
      indeterminate: {
        true: {
          position: "absolute",
          willChange: "left",
          minWidth: "50%",
          animation: `${indeterminateProgress} 1200ms ease infinite normal none running`
        }
      }
    },
    compoundVariants: [
      {
        indeterminate: false,
        striped: true,
        css: {
          backgroundImage: "linear-gradient(45deg, $colors$progressStripe 25%, transparent 25%, transparent 50%, $colors$progressStripe 50%,  $colors$progressStripe 75%, transparent 75%, transparent)",
          backgroundSize: "1rem 1rem"
        }
      },
      {
        indeterminate: false,
        striped: true,
        animated: true,
        css: {
          animation: `${stripe} 750ms linear infinite`
        }
      }
    ]
  });
  css({
    position: "absolute",
    top: "50%",
    left: "50%",
    width: "100%",
    color: "$neutral12",
    lineHeight: "$none",
    fontWeight: "$bold",
    textAlign: "center",
    transform: "translate(-50%, -50%)"
  });
  css(toggleWrapperStyles, {
    variants: {
      labelPlacement: {
        start: {
          flexDirection: "row-reverse"
        },
        end: {
          flexDirection: "row"
        }
      }
    }
  });
  css(toggleControlLabelStyles);
  css(toggleControlStyles, {
    borderRadius: "$full",
    "&[data-checked]::before": {
      content: "",
      display: "inline-block",
      position: "relative",
      boxSize: "calc(50% + 1px)",
      borderRadius: "$full",
      backgroundColor: "$loContrast"
    }
  });
  const _tmpl$$5 = /* @__PURE__ */ template$1(`<svg><path d="M4.93179 5.43179C4.75605 5.60753 4.75605 5.89245 4.93179 6.06819C5.10753 6.24392 5.39245 6.24392 5.56819 6.06819L7.49999 4.13638L9.43179 6.06819C9.60753 6.24392 9.89245 6.24392 10.0682 6.06819C10.2439 5.89245 10.2439 5.60753 10.0682 5.43179L7.81819 3.18179C7.73379 3.0974 7.61933 3.04999 7.49999 3.04999C7.38064 3.04999 7.26618 3.0974 7.18179 3.18179L4.93179 5.43179ZM10.0682 9.56819C10.2439 9.39245 10.2439 9.10753 10.0682 8.93179C9.89245 8.75606 9.60753 8.75606 9.43179 8.93179L7.49999 10.8636L5.56819 8.93179C5.39245 8.75606 5.10753 8.75606 4.93179 8.93179C4.75605 9.10753 4.75605 9.39245 4.93179 9.56819L7.18179 11.8182C7.35753 11.9939 7.64245 11.9939 7.81819 11.8182L10.0682 9.56819Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></svg>`, 4, true);
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$5.cloneNode(true)
  });
  const _tmpl$$4 = /* @__PURE__ */ template$1(`<svg><g fill="none"><path d="M11.4669 3.72684C11.7558 3.91574 11.8369 4.30308 11.648 4.59198L7.39799 11.092C7.29783 11.2452 7.13556 11.3467 6.95402 11.3699C6.77247 11.3931 6.58989 11.3355 6.45446 11.2124L3.70446 8.71241C3.44905 8.48022 3.43023 8.08494 3.66242 7.82953C3.89461 7.57412 4.28989 7.55529 4.5453 7.78749L6.75292 9.79441L10.6018 3.90792C10.7907 3.61902 11.178 3.53795 11.4669 3.72684Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></g></svg>`, 6, true);
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$4.cloneNode(true)
  });
  const _tmpl$$3 = /* @__PURE__ */ template$1(`<svg><g fill="none"><path d="M11.7816 4.03157C12.0062 3.80702 12.0062 3.44295 11.7816 3.2184C11.5571 2.99385 11.193 2.99385 10.9685 3.2184L7.50005 6.68682L4.03164 3.2184C3.80708 2.99385 3.44301 2.99385 3.21846 3.2184C2.99391 3.44295 2.99391 3.80702 3.21846 4.03157L6.68688 7.49999L3.21846 10.9684C2.99391 11.193 2.99391 11.557 3.21846 11.7816C3.44301 12.0061 3.80708 12.0061 4.03164 11.7816L7.50005 8.31316L10.9685 11.7816C11.193 12.0061 11.5571 12.0061 11.7816 11.7816C12.0062 11.557 12.0062 11.193 11.7816 10.9684L8.31322 7.49999L11.7816 4.03157Z" fill="currentColor" fill-rule="evenodd" clip-rule="evenodd"></path></g></svg>`, 6, true);
  createIcon({
    viewBox: "0 0 15 15",
    path: () => _tmpl$$3.cloneNode(true)
  });
  const skeletonColorFade = keyframes({
    from: {
      borderColor: "$$startColor",
      background: "$$startColor"
    },
    to: {
      borderColor: "$$endColor",
      background: "$$endColor"
    }
  });
  css({
    $$startColor: "$colors$neutral2",
    $$endColor: "$colors$neutral8",
    opacity: "0.7",
    borderRadius: "2px",
    borderColor: "$$startColor",
    boxShadow: "$none",
    background: "$$endColor",
    backgroundClip: "padding-box",
    color: "transparent",
    cursor: "default",
    pointerEvents: "none",
    userSelect: "none",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    animationDirection: "alternate",
    animationName: `${skeletonColorFade()}`,
    "&::before, &::after, *": {
      visibility: "hidden"
    }
  });
  css({
    flex: 1,
    justifySelf: "stretch",
    alignSelf: "stretch"
  });
  css({
    display: "inline-block",
    borderColor: "currentColor",
    borderStyle: "solid",
    borderRadius: "$full",
    borderWidth: "2px",
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    animationName: `${spin}`,
    animationDuration: "0.45s",
    animationTimingFunction: "linear",
    animationIterationCount: "infinite",
    variants: {
      size: {
        xs: {
          boxSize: "0.75rem"
        },
        sm: {
          boxSize: "1rem"
        },
        md: {
          boxSize: "1.5rem"
        },
        lg: {
          boxSize: "2rem"
        },
        xl: {
          boxSize: "3rem"
        }
      }
    }
  });
  css(toggleWrapperStyles, {
    variants: {
      labelPlacement: {
        start: {
          flexDirection: "row"
        },
        end: {
          flexDirection: "row-reverse"
        }
      }
    }
  });
  css(toggleControlLabelStyles);
  css(toggleControlStyles, {
    borderRadius: "$full",
    transition: "background-color 250ms, border-color 250ms, box-shadow 250ms",
    "&::before": {
      content: "''",
      position: "absolute",
      top: "2px",
      left: "2px",
      zIndex: "1",
      borderRadius: "$full",
      boxShadow: "$sm",
      transition: "250ms"
    },
    variants: {
      variant: {
        outline: {
          "&::before": {
            backgroundColor: "$neutral7"
          },
          "&[data-checked]::before": {
            backgroundColor: "$loContrast"
          }
        },
        filled: {
          "&::before": {
            backgroundColor: "$loContrast"
          }
        }
      },
      size: {
        sm: {
          height: "16px",
          width: "26px",
          "&::before": {
            boxSize: "10px"
          },
          "&[data-checked]::before": {
            transform: "translateX(10px)"
          }
        },
        md: {
          columnGap: "2px",
          height: "20px",
          width: "34px",
          "&::before": {
            boxSize: "14px"
          },
          "&[data-checked]::before": {
            transform: "translateX(14px)"
          }
        },
        lg: {
          columnGap: "4px",
          height: "28px",
          width: "50px",
          "&::before": {
            boxSize: "22px"
          },
          "&[data-checked]::before": {
            transform: "translateX(22px)"
          }
        }
      }
    }
  });
  css({
    width: "100%",
    borderCollapse: "collapse",
    fontVariantNumeric: "lining-nums tabular-nums"
  });
  css({
    px: "$6",
    py: "$4",
    color: "$neutral11",
    fontSize: "$sm",
    fontWeight: "$medium",
    lineHeight: "$5",
    textAlign: "center",
    variants: {
      dense: {
        true: {
          px: "$4",
          py: "$3",
          fontSize: "$xs",
          lineHeight: "$4"
        }
      },
      placement: {
        top: {
          captionSide: "top"
        },
        bottom: {
          captionSide: "bottom"
        }
      }
    }
  });
  function createStripedStyles(stripedRow) {
    return {
      "& td": {
        borderBottomWidth: 0
      },
      "& tr:last-of-type td": {
        borderBottomWidth: "1px"
      },
      [`& tr:nth-of-type(${stripedRow}) td`]: {
        backgroundColor: "$neutral3"
      }
    };
  }
  css({
    variants: {
      striped: {
        odd: createStripedStyles("odd"),
        even: createStripedStyles("even")
      },
      highlightOnHover: {
        true: {
          "& tr:hover td": {
            backgroundColor: "$neutral4"
          }
        }
      }
    },
    compoundVariants: [
      {
        striped: "odd",
        highlightOnHover: true,
        css: {
          "& tr:nth-of-type(odd):hover td": {
            backgroundColor: "$neutral4"
          }
        }
      },
      {
        striped: "even",
        highlightOnHover: true,
        css: {
          "& tr:nth-of-type(even):hover td": {
            backgroundColor: "$neutral4"
          }
        }
      }
    ]
  });
  css({
    "& tr:last-of-type th": {
      borderBottomWidth: 0
    }
  });
  css({
    borderBottom: "1px solid $colors$neutral6",
    px: "$6",
    py: "$3",
    fontSize: "$xs",
    fontWeight: "$semibold",
    lineHeight: "$4",
    letterSpacing: "$wider",
    textAlign: "start",
    textTransform: "uppercase",
    variants: {
      dense: {
        true: {
          px: "$4",
          py: "$1_5"
        }
      },
      numeric: {
        true: {
          textAlign: "end"
        }
      }
    }
  });
  css({
    borderBottom: "1px solid $colors$neutral6",
    px: "$6",
    py: "$4",
    fontSize: "$base",
    lineHeight: "$6",
    textAlign: "start",
    transition: "background-color 250ms",
    variants: {
      dense: {
        true: {
          px: "$4",
          py: "$2",
          fontSize: "$sm",
          lineHeight: "$5"
        }
      },
      numeric: {
        true: {
          textAlign: "end"
        }
      }
    }
  });
  css({
    variants: {
      orientation: {
        horizontal: {
          display: "block"
        },
        vertical: {
          display: "flex"
        }
      }
    }
  });
  css({
    display: "flex",
    color: "$neutral11",
    fontWeight: "$normal",
    variants: {
      variant: {
        underline: {
          borderWidth: 0,
          borderStyle: "solid",
          borderColor: "$neutral7"
        },
        outline: {
          borderStyle: "solid",
          borderColor: "$neutral7"
        },
        cards: {
          borderStyle: "solid",
          borderColor: "$neutral7"
        },
        pills: {
          gap: "$1_5"
        }
      },
      alignment: {
        start: {
          justifyContent: "flex-start"
        },
        end: {
          justifyContent: "flex-end"
        },
        center: {
          justifyContent: "center"
        },
        apart: {
          justifyContent: "space-between"
        }
      },
      orientation: {
        horizontal: {
          flexDirection: "row"
        },
        vertical: {
          flexDirection: "column"
        }
      }
    },
    compoundVariants: [
      {
        variant: "underline",
        orientation: "horizontal",
        css: {
          borderBottomWidth: "1px"
        }
      },
      {
        variant: "underline",
        orientation: "vertical",
        css: {
          borderInlineEndWidth: "1px"
        }
      },
      {
        variant: "outline",
        orientation: "horizontal",
        css: {
          mb: "-1px",
          borderBottomWidth: "1px"
        }
      },
      {
        variant: "outline",
        orientation: "vertical",
        css: {
          marginInlineEnd: "-1px",
          borderInlineEndWidth: "1px"
        }
      },
      {
        variant: "cards",
        orientation: "horizontal",
        css: {
          mb: "-1px",
          borderBottomWidth: "1px"
        }
      },
      {
        variant: "cards",
        orientation: "vertical",
        css: {
          marginInlineEnd: "-1px",
          borderInlineEndWidth: "1px"
        }
      }
    ]
  });
  function createSelectedColorVariant(color) {
    return {
      "&[aria-selected='true']": {
        color
      }
    };
  }
  function createPillsAndColorVariant(config2) {
    return {
      "&[aria-selected='true']": {
        color: config2.color,
        backgroundColor: config2.bgColor
      },
      "&[aria-selected='true']:hover": {
        backgroundColor: config2.bgColorHover
      }
    };
  }
  css({
    appearance: "none",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    outline: "none",
    border: "$none",
    backgroundColor: "transparent",
    px: "$4",
    color: "inherit",
    fontWeight: "inherit",
    cursor: "pointer",
    transitionProperty: "background-color, border-color, color, fill, stroke, opacity, box-shadow, transform",
    transitionDuration: "250ms",
    "&:focus": {
      zIndex: 1,
      outline: "none",
      boxShadow: "$outline"
    },
    "&:disabled": {
      opacity: 0.4,
      cursor: "not-allowed"
    },
    variants: {
      variant: {
        underline: {
          borderWidth: 0,
          borderStyle: "solid",
          borderColor: "transparent",
          "&[aria-selected='true']": {
            borderColor: "currentColor"
          },
          "&:active": {
            backgroundColor: "$neutral4"
          }
        },
        outline: {
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "transparent",
          "&[aria-selected='true']": {
            borderColor: "inherit"
          }
        },
        cards: {
          borderWidth: "1px",
          borderStyle: "solid",
          borderColor: "inherit",
          backgroundColor: "$neutral3",
          "&[aria-selected='true']": {
            borderColor: "inherit",
            backgroundColor: "$loContrast"
          }
        },
        pills: {
          borderRadius: "$sm",
          "&:hover": {
            backgroundColor: "$neutral3"
          },
          "&:hover:disabled": {
            backgroundColor: "transparent"
          }
        }
      },
      colorScheme: {
        primary: {},
        accent: {},
        neutral: {},
        success: {},
        info: {},
        warning: {},
        danger: {}
      },
      size: {
        sm: {
          py: "$1",
          fontSize: "$sm"
        },
        md: {
          py: "$2",
          fontSize: "$base"
        },
        lg: {
          py: "$3",
          fontSize: "$lg"
        }
      },
      orientation: {
        horizontal: {},
        vertical: {}
      },
      fitted: {
        true: {
          flex: 1
        }
      }
    },
    compoundVariants: [
      {
        variant: "underline",
        colorScheme: "primary",
        css: createSelectedColorVariant("$primary11")
      },
      {
        variant: "underline",
        colorScheme: "accent",
        css: createSelectedColorVariant("$accent11")
      },
      {
        variant: "underline",
        colorScheme: "neutral",
        css: createSelectedColorVariant("$neutral12")
      },
      {
        variant: "underline",
        colorScheme: "success",
        css: createSelectedColorVariant("$success11")
      },
      {
        variant: "underline",
        colorScheme: "info",
        css: createSelectedColorVariant("$info11")
      },
      {
        variant: "underline",
        colorScheme: "warning",
        css: createSelectedColorVariant("$warning11")
      },
      {
        variant: "underline",
        colorScheme: "danger",
        css: createSelectedColorVariant("$danger11")
      },
      {
        variant: "outline",
        colorScheme: "primary",
        css: createSelectedColorVariant("$primary11")
      },
      {
        variant: "outline",
        colorScheme: "accent",
        css: createSelectedColorVariant("$accent11")
      },
      {
        variant: "outline",
        colorScheme: "neutral",
        css: createSelectedColorVariant("$neutral12")
      },
      {
        variant: "outline",
        colorScheme: "success",
        css: createSelectedColorVariant("$success11")
      },
      {
        variant: "outline",
        colorScheme: "info",
        css: createSelectedColorVariant("$info11")
      },
      {
        variant: "outline",
        colorScheme: "warning",
        css: createSelectedColorVariant("$warning11")
      },
      {
        variant: "outline",
        colorScheme: "danger",
        css: createSelectedColorVariant("$danger11")
      },
      {
        variant: "cards",
        colorScheme: "primary",
        css: createSelectedColorVariant("$primary11")
      },
      {
        variant: "cards",
        colorScheme: "accent",
        css: createSelectedColorVariant("$accent11")
      },
      {
        variant: "cards",
        colorScheme: "neutral",
        css: createSelectedColorVariant("$neutral12")
      },
      {
        variant: "cards",
        colorScheme: "success",
        css: createSelectedColorVariant("$success11")
      },
      {
        variant: "cards",
        colorScheme: "info",
        css: createSelectedColorVariant("$info11")
      },
      {
        variant: "cards",
        colorScheme: "warning",
        css: createSelectedColorVariant("$warning11")
      },
      {
        variant: "cards",
        colorScheme: "danger",
        css: createSelectedColorVariant("$danger11")
      },
      {
        variant: "pills",
        colorScheme: "primary",
        css: createPillsAndColorVariant({
          color: "$primary11",
          bgColor: "$primary3",
          bgColorHover: "$primary4"
        })
      },
      {
        variant: "pills",
        colorScheme: "accent",
        css: createPillsAndColorVariant({
          color: "$accent11",
          bgColor: "$accent3",
          bgColorHover: "$accent4"
        })
      },
      {
        variant: "pills",
        colorScheme: "neutral",
        css: createPillsAndColorVariant({
          color: "$neutral12",
          bgColor: "$neutral3",
          bgColorHover: "$neutral4"
        })
      },
      {
        variant: "pills",
        colorScheme: "success",
        css: createPillsAndColorVariant({
          color: "$success11",
          bgColor: "$success3",
          bgColorHover: "$success4"
        })
      },
      {
        variant: "pills",
        colorScheme: "info",
        css: createPillsAndColorVariant({
          color: "$info11",
          bgColor: "$info3",
          bgColorHover: "$info4"
        })
      },
      {
        variant: "pills",
        colorScheme: "warning",
        css: createPillsAndColorVariant({
          color: "$warning11",
          bgColor: "$warning3",
          bgColorHover: "$warning4"
        })
      },
      {
        variant: "pills",
        colorScheme: "danger",
        css: createPillsAndColorVariant({
          color: "$danger11",
          bgColor: "$danger3",
          bgColorHover: "$danger4"
        })
      },
      {
        variant: "underline",
        orientation: "horizontal",
        css: {
          borderBottomWidth: "2px",
          marginBottom: "-1px"
        }
      },
      {
        variant: "underline",
        orientation: "vertical",
        css: {
          borderInlineEndWidth: "2px",
          marginInlineEnd: "-1px"
        }
      },
      {
        variant: "outline",
        orientation: "horizontal",
        css: {
          mb: "-1px",
          borderTopRadius: "$sm",
          "&[aria-selected='true']": {
            borderBottomColor: "$loContrast"
          }
        }
      },
      {
        variant: "outline",
        orientation: "vertical",
        css: {
          marginInlineEnd: "-1px",
          borderStartRadius: "$radii$sm",
          "&[aria-selected='true']": {
            borderInlineEndColor: "$colors$loContrast"
          }
        }
      },
      {
        variant: "cards",
        orientation: "horizontal",
        css: {
          mb: "-1px",
          borderBottomWidth: "1px",
          "&:not(:last-of-type)": {
            marginInlineEnd: "-1px"
          },
          "&[aria-selected='true']": {
            borderTopColor: "currentColor",
            borderBottomColor: "transparent"
          }
        }
      },
      {
        variant: "cards",
        orientation: "vertical",
        css: {
          marginInlineEnd: "-1px",
          borderInlineEndWidth: "1px",
          "&:not(:last-of-type)": {
            mb: "-1px"
          },
          "&[aria-selected='true']": {
            borderInlineStartColor: "currentColor",
            borderInlineEndColor: "transparent"
          }
        }
      }
    ]
  });
  css({
    outline: "none",
    padding: "$4"
  });
  css({
    marginInlineStart: "$2"
  });
  css({
    marginInlineEnd: "$2"
  });
  css({
    noOfLines: 1
  });
  const tagCloseButtonStyles = css({
    appearance: "none",
    position: "relative",
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    outline: "none",
    border: "1px solid transparent",
    borderRadius: "$full",
    backgroundColor: "transparent",
    padding: "0",
    lineHeight: "$none",
    textDecoration: "none",
    color: "inherit",
    cursor: "pointer",
    userSelect: "none",
    transition: "color 250ms, background-color 250ms, opacity 250ms, box-shadow 250ms",
    "&:focus": {
      outline: "none",
      boxShadow: "$outline"
    },
    "&:disabled": {
      border: "1px solid transparent",
      backgroundColor: "transparent",
      color: "$neutral3",
      cursor: "not-allowed"
    },
    variants: {
      size: {
        sm: {
          marginInlineStart: "0.35rem",
          marginInlineEnd: "-3px"
        },
        md: {
          marginInlineStart: "$1_5",
          marginInlineEnd: "calc(0.15rem * -1)"
        },
        lg: {
          marginInlineStart: "$1_5",
          marginInlineEnd: "calc($1 * -1)"
        }
      }
    }
  });
  function createTagSizeVariant(config2) {
    return {
      height: config2.height,
      py: 0,
      px: config2.paddingX,
      fontSize: config2.fontSize,
      lineHeight: config2.lineHeight,
      [`& .${tagCloseButtonStyles}`]: {
        boxSize: config2.closeButtonSize
      }
    };
  }
  function createTagSolidCompoundVariant(config2) {
    return {
      backgroundColor: config2.bgColor,
      color: config2.color,
      [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
        backgroundColor: config2.closeButtonBgColorHover
      }
    };
  }
  function createTagSubtleCompoundVariant(config2) {
    return {
      backgroundColor: config2.bgColor,
      color: config2.color,
      [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
        backgroundColor: config2.closeButtonBgColorHover
      }
    };
  }
  function createTagOutlineCompoundVariant(config2) {
    return {
      borderColor: config2.borderColor,
      color: config2.color,
      [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
        backgroundColor: config2.closeButtonBgColorHover
      }
    };
  }
  function createTagDotAndSizeCompoundVariant(size2) {
    return {
      "&::before,  &::after": {
        boxSize: size2
      },
      "&::before": {
        marginRight: size2
      },
      "&::after": {
        marginLeft: size2
      }
    };
  }
  css({
    display: "inline-flex",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: "$full",
    fontWeight: "$medium",
    lineHeight: "$none",
    variants: {
      variant: {
        solid: {
          border: "1px solid transparent",
          color: "white"
        },
        subtle: {
          border: "1px solid transparent"
        },
        outline: {
          borderStyle: "solid",
          borderWidth: "1px",
          backgroundColor: "transparent"
        },
        dot: {
          border: "1px solid $neutral7",
          backgroundColor: "transparent",
          color: "$neutral12",
          "&::before,  &::after": {
            content: "''",
            borderRadius: "$full"
          },
          "&::before": {
            display: "block"
          },
          "&::after": {
            display: "none"
          },
          [`& .${tagCloseButtonStyles}:not(:disabled):hover`]: {
            backgroundColor: "$neutral4"
          },
          [`& .${tagCloseButtonStyles}:not(:disabled):active`]: {
            backgroundColor: "$neutral5"
          }
        }
      },
      colorScheme: {
        primary: {},
        accent: {},
        neutral: {},
        success: {},
        info: {},
        warning: {},
        danger: {}
      },
      size: {
        sm: createTagSizeVariant({
          height: "$5",
          paddingX: "$2",
          fontSize: "$xs",
          lineHeight: "$4",
          closeButtonSize: "$4"
        }),
        md: createTagSizeVariant({
          height: "$6",
          paddingX: "$2",
          fontSize: "$sm",
          lineHeight: "$5",
          closeButtonSize: "$5"
        }),
        lg: createTagSizeVariant({
          height: "$8",
          paddingX: "$3",
          fontSize: "$base",
          lineHeight: "$6",
          closeButtonSize: "$6"
        })
      },
      dotPlacement: {
        start: {},
        end: {}
      }
    },
    compoundVariants: [
      {
        variant: "solid",
        colorScheme: "primary",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$primary9",
          closeButtonBgColorHover: "$primary10"
        })
      },
      {
        variant: "solid",
        colorScheme: "accent",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$accent9",
          closeButtonBgColorHover: "$accent10"
        })
      },
      {
        variant: "solid",
        colorScheme: "neutral",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$neutral9",
          closeButtonBgColorHover: "$neutral11"
        })
      },
      {
        variant: "solid",
        colorScheme: "success",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$success9",
          closeButtonBgColorHover: "$success10"
        })
      },
      {
        variant: "solid",
        colorScheme: "info",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$info9",
          closeButtonBgColorHover: "$info10"
        })
      },
      {
        variant: "solid",
        colorScheme: "warning",
        css: createTagSolidCompoundVariant({
          color: "$blackAlpha12",
          bgColor: "$warning9",
          closeButtonBgColorHover: "$warning10"
        })
      },
      {
        variant: "solid",
        colorScheme: "danger",
        css: createTagSolidCompoundVariant({
          color: "white",
          bgColor: "$danger9",
          closeButtonBgColorHover: "$danger10"
        })
      },
      {
        variant: "subtle",
        colorScheme: "primary",
        css: createTagSubtleCompoundVariant({
          color: "$primary11",
          bgColor: "$primary4",
          closeButtonBgColorHover: "$primary6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "accent",
        css: createTagSubtleCompoundVariant({
          color: "$accent11",
          bgColor: "$accent4",
          closeButtonBgColorHover: "$accent6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "neutral",
        css: createTagSubtleCompoundVariant({
          color: "$neutral12",
          bgColor: "$neutral4",
          closeButtonBgColorHover: "$neutral7"
        })
      },
      {
        variant: "subtle",
        colorScheme: "success",
        css: createTagSubtleCompoundVariant({
          color: "$success11",
          bgColor: "$success4",
          closeButtonBgColorHover: "$success6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "info",
        css: createTagSubtleCompoundVariant({
          color: "$info11",
          bgColor: "$info4",
          closeButtonBgColorHover: "$info6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "warning",
        css: createTagSubtleCompoundVariant({
          color: "$warning11",
          bgColor: "$warning4",
          closeButtonBgColorHover: "$warning6"
        })
      },
      {
        variant: "subtle",
        colorScheme: "danger",
        css: createTagSubtleCompoundVariant({
          color: "$danger11",
          bgColor: "$danger4",
          closeButtonBgColorHover: "$danger6"
        })
      },
      {
        variant: "outline",
        colorScheme: "primary",
        css: createTagOutlineCompoundVariant({
          color: "$primary11",
          borderColor: "$primary7",
          closeButtonBgColorHover: "$primary4"
        })
      },
      {
        variant: "outline",
        colorScheme: "accent",
        css: createTagOutlineCompoundVariant({
          color: "$accent11",
          borderColor: "$accent7",
          closeButtonBgColorHover: "$accent4"
        })
      },
      {
        variant: "outline",
        colorScheme: "neutral",
        css: createTagOutlineCompoundVariant({
          color: "$neutral12",
          borderColor: "$neutral7",
          closeButtonBgColorHover: "$neutral4"
        })
      },
      {
        variant: "outline",
        colorScheme: "success",
        css: createTagOutlineCompoundVariant({
          color: "$success11",
          borderColor: "$success7",
          closeButtonBgColorHover: "$success4"
        })
      },
      {
        variant: "outline",
        colorScheme: "info",
        css: createTagOutlineCompoundVariant({
          color: "$info11",
          borderColor: "$info7",
          closeButtonBgColorHover: "$info4"
        })
      },
      {
        variant: "outline",
        colorScheme: "warning",
        css: createTagOutlineCompoundVariant({
          color: "$warning11",
          borderColor: "$warning7",
          closeButtonBgColorHover: "$warning4"
        })
      },
      {
        variant: "outline",
        colorScheme: "danger",
        css: createTagOutlineCompoundVariant({
          color: "$danger11",
          borderColor: "$danger7",
          closeButtonBgColorHover: "$danger4"
        })
      },
      {
        variant: "dot",
        colorScheme: "primary",
        css: {
          "&::before, &::after": {
            backgroundColor: "$primary9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "accent",
        css: {
          "&::before, &::after": {
            backgroundColor: "$accent9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "neutral",
        css: {
          "&::before, &::after": {
            backgroundColor: "$neutral9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "success",
        css: {
          "&::before, &::after": {
            backgroundColor: "$success9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "info",
        css: {
          "&::before, &::after": {
            backgroundColor: "$info9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "warning",
        css: {
          "&::before, &::after": {
            backgroundColor: "$warning9"
          }
        }
      },
      {
        variant: "dot",
        colorScheme: "danger",
        css: {
          "&::before, &::after": {
            backgroundColor: "$danger9"
          }
        }
      },
      {
        variant: "dot",
        size: "sm",
        css: createTagDotAndSizeCompoundVariant("$1_5")
      },
      {
        variant: "dot",
        size: "md",
        css: createTagDotAndSizeCompoundVariant("$2")
      },
      {
        variant: "dot",
        size: "lg",
        css: createTagDotAndSizeCompoundVariant("$2_5")
      },
      {
        variant: "dot",
        dotPlacement: "start",
        css: {
          "&::before": {
            display: "block"
          },
          "&::after": {
            display: "none"
          }
        }
      },
      {
        variant: "dot",
        dotPlacement: "end",
        css: {
          "&::before": {
            display: "none"
          },
          "&::after": {
            display: "block"
          }
        }
      }
    ]
  });
  function createVariantAndSizeCompoundVariants(variant, paddingX) {
    return Object.entries({
      xs: paddingX != null ? paddingX : "$2",
      sm: paddingX != null ? paddingX : "$2_5",
      md: paddingX != null ? paddingX : "$3",
      lg: paddingX != null ? paddingX : "$4"
    }).map(([key, value]) => ({
      variant,
      size: key,
      css: { px: value }
    }));
  }
  const textareaStyles = css(baseInputResetStyles, {
    minHeight: "80px",
    py: "$2",
    compoundVariants: [
      ...createVariantAndSizeCompoundVariants("outline"),
      ...createVariantAndSizeCompoundVariants("filled"),
      ...createVariantAndSizeCompoundVariants("unstyled", 0)
    ]
  });
  const hopeTextareaClass = "hope-textarea";
  function Textarea(props) {
    var _a, _b, _c, _d;
    const theme = useStyleConfig().Textarea;
    const defaultProps = {
      variant: (_b = (_a = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _a.variant) != null ? _b : "outline",
      size: (_d = (_c = theme == null ? void 0 : theme.defaultProps) == null ? void 0 : _c.size) != null ? _d : "md"
    };
    const propsWithDefault = mergeProps(defaultProps, props);
    const [local, others] = splitProps(propsWithDefault, ["class", "variant", "size"]);
    const formControlProps = useFormControl(props);
    const classes = () => {
      return classNames(local.class, hopeTextareaClass, textareaStyles({
        variant: local.variant,
        size: local.size
      }));
    };
    return createComponent(Box, mergeProps({
      as: "textarea",
      get ["class"]() {
        return classes();
      },
      get __baseStyle() {
        return theme == null ? void 0 : theme.baseStyle;
      }
    }, formControlProps, others));
  }
  Textarea.toString = () => createClassSelector(hopeTextareaClass);
  function createDisclosure(props = {}) {
    const id2 = `disclosure-${createUniqueId()}`;
    const [isOpenState, setIsOpenState] = createSignal(props.defaultIsOpen || false);
    const isControlled = () => props.isOpen !== void 0;
    const isOpen = () => isControlled() ? !!props.isOpen : isOpenState();
    const onClose = () => {
      var _a;
      if (!isControlled()) {
        setIsOpenState(false);
      }
      (_a = props.onClose) == null ? void 0 : _a.call(props);
    };
    const onOpen = () => {
      var _a;
      if (!isControlled()) {
        setIsOpenState(true);
      }
      (_a = props.onOpen) == null ? void 0 : _a.call(props);
    };
    const onToggle = () => {
      isOpen() ? onClose() : onOpen();
    };
    const triggerProps = () => ({
      "aria-expanded": isOpen(),
      "aria-controls": id2
    });
    const disclosureProps = () => ({
      id: id2,
      hidden: !isOpen()
    });
    return {
      isControlled,
      isOpen,
      onOpen,
      onClose,
      onToggle,
      triggerProps,
      disclosureProps
    };
  }
  var FileSaver_min = { exports: {} };
  (function(module, exports) {
    (function(a2, b2) {
      b2();
    })(commonjsGlobal, function() {
      function b2(a3, b3) {
        return "undefined" == typeof b3 ? b3 = { autoBom: false } : "object" != typeof b3 && (console.warn("Deprecated: Expected third argument to be a object"), b3 = { autoBom: !b3 }), b3.autoBom && /^\s*(?:text\/\S*|application\/xml|\S*\/\S*\+xml)\s*;.*charset\s*=\s*utf-8/i.test(a3.type) ? new Blob(["\uFEFF", a3], { type: a3.type }) : a3;
      }
      function c2(a3, b3, c3) {
        var d3 = new XMLHttpRequest();
        d3.open("GET", a3), d3.responseType = "blob", d3.onload = function() {
          g2(d3.response, b3, c3);
        }, d3.onerror = function() {
          console.error("could not download file");
        }, d3.send();
      }
      function d2(a3) {
        var b3 = new XMLHttpRequest();
        b3.open("HEAD", a3, false);
        try {
          b3.send();
        } catch (a4) {
        }
        return 200 <= b3.status && 299 >= b3.status;
      }
      function e(a3) {
        try {
          a3.dispatchEvent(new MouseEvent("click"));
        } catch (c3) {
          var b3 = document.createEvent("MouseEvents");
          b3.initMouseEvent("click", true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null), a3.dispatchEvent(b3);
        }
      }
      var f2 = "object" == typeof window && window.window === window ? window : "object" == typeof self && self.self === self ? self : "object" == typeof commonjsGlobal && commonjsGlobal.global === commonjsGlobal ? commonjsGlobal : void 0, a2 = f2.navigator && /Macintosh/.test(navigator.userAgent) && /AppleWebKit/.test(navigator.userAgent) && !/Safari/.test(navigator.userAgent), g2 = f2.saveAs || ("object" != typeof window || window !== f2 ? function() {
      } : "download" in HTMLAnchorElement.prototype && !a2 ? function(b3, g3, h2) {
        var i2 = f2.URL || f2.webkitURL, j2 = document.createElement("a");
        g3 = g3 || b3.name || "download", j2.download = g3, j2.rel = "noopener", "string" == typeof b3 ? (j2.href = b3, j2.origin === location.origin ? e(j2) : d2(j2.href) ? c2(b3, g3, h2) : e(j2, j2.target = "_blank")) : (j2.href = i2.createObjectURL(b3), setTimeout(function() {
          i2.revokeObjectURL(j2.href);
        }, 4e4), setTimeout(function() {
          e(j2);
        }, 0));
      } : "msSaveOrOpenBlob" in navigator ? function(f3, g3, h2) {
        if (g3 = g3 || f3.name || "download", "string" != typeof f3)
          navigator.msSaveOrOpenBlob(b2(f3, h2), g3);
        else if (d2(f3))
          c2(f3, g3, h2);
        else {
          var i2 = document.createElement("a");
          i2.href = f3, i2.target = "_blank", setTimeout(function() {
            e(i2);
          });
        }
      } : function(b3, d3, e2, g3) {
        if (g3 = g3 || open("", "_blank"), g3 && (g3.document.title = g3.document.body.innerText = "downloading..."), "string" == typeof b3)
          return c2(b3, d3, e2);
        var h2 = "application/octet-stream" === b3.type, i2 = /constructor/i.test(f2.HTMLElement) || f2.safari, j2 = /CriOS\/[\d]+/.test(navigator.userAgent);
        if ((j2 || h2 && i2 || a2) && "undefined" != typeof FileReader) {
          var k2 = new FileReader();
          k2.onloadend = function() {
            var a3 = k2.result;
            a3 = j2 ? a3 : a3.replace(/^data:[^;]*;/, "data:attachment/file;"), g3 ? g3.location.href = a3 : location = a3, g3 = null;
          }, k2.readAsDataURL(b3);
        } else {
          var l2 = f2.URL || f2.webkitURL, m2 = l2.createObjectURL(b3);
          g3 ? g3.location = m2 : location.href = m2, g3 = null, setTimeout(function() {
            l2.revokeObjectURL(m2);
          }, 4e4);
        }
      });
      f2.saveAs = g2.saveAs = g2, module.exports = g2;
    });
  })(FileSaver_min);
  var FileSaver_minExports = FileSaver_min.exports;
  const __uno = "";
  var handlebars = { exports: {} };
  var handlebars_runtime = { exports: {} };
  var base$1 = {};
  var utils = {};
  utils.__esModule = true;
  utils.extend = extend;
  utils.indexOf = indexOf;
  utils.escapeExpression = escapeExpression;
  utils.isEmpty = isEmpty;
  utils.createFrame = createFrame;
  utils.blockParams = blockParams;
  utils.appendContextPath = appendContextPath;
  var escape = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#x27;",
    "`": "&#x60;",
    "=": "&#x3D;"
  };
  var badChars = /[&<>"'`=]/g, possible = /[&<>"'`=]/;
  function escapeChar(chr) {
    return escape[chr];
  }
  function extend(obj) {
    for (var i2 = 1; i2 < arguments.length; i2++) {
      for (var key in arguments[i2]) {
        if (Object.prototype.hasOwnProperty.call(arguments[i2], key)) {
          obj[key] = arguments[i2][key];
        }
      }
    }
    return obj;
  }
  var toString = Object.prototype.toString;
  utils.toString = toString;
  var isFunction = function isFunction2(value) {
    return typeof value === "function";
  };
  if (isFunction(/x/)) {
    utils.isFunction = isFunction = function(value) {
      return typeof value === "function" && toString.call(value) === "[object Function]";
    };
  }
  utils.isFunction = isFunction;
  var isArray = Array.isArray || function(value) {
    return value && typeof value === "object" ? toString.call(value) === "[object Array]" : false;
  };
  utils.isArray = isArray;
  function indexOf(array, value) {
    for (var i2 = 0, len = array.length; i2 < len; i2++) {
      if (array[i2] === value) {
        return i2;
      }
    }
    return -1;
  }
  function escapeExpression(string) {
    if (typeof string !== "string") {
      if (string && string.toHTML) {
        return string.toHTML();
      } else if (string == null) {
        return "";
      } else if (!string) {
        return string + "";
      }
      string = "" + string;
    }
    if (!possible.test(string)) {
      return string;
    }
    return string.replace(badChars, escapeChar);
  }
  function isEmpty(value) {
    if (!value && value !== 0) {
      return true;
    } else if (isArray(value) && value.length === 0) {
      return true;
    } else {
      return false;
    }
  }
  function createFrame(object) {
    var frame = extend({}, object);
    frame._parent = object;
    return frame;
  }
  function blockParams(params, ids) {
    params.path = ids;
    return params;
  }
  function appendContextPath(contextPath, id2) {
    return (contextPath ? contextPath + "." : "") + id2;
  }
  var exception = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var errorProps = ["description", "fileName", "lineNumber", "endLineNumber", "message", "name", "number", "stack"];
    function Exception(message, node) {
      var loc = node && node.loc, line = void 0, endLineNumber = void 0, column = void 0, endColumn = void 0;
      if (loc) {
        line = loc.start.line;
        endLineNumber = loc.end.line;
        column = loc.start.column;
        endColumn = loc.end.column;
        message += " - " + line + ":" + column;
      }
      var tmp = Error.prototype.constructor.call(this, message);
      for (var idx = 0; idx < errorProps.length; idx++) {
        this[errorProps[idx]] = tmp[errorProps[idx]];
      }
      if (Error.captureStackTrace) {
        Error.captureStackTrace(this, Exception);
      }
      try {
        if (loc) {
          this.lineNumber = line;
          this.endLineNumber = endLineNumber;
          if (Object.defineProperty) {
            Object.defineProperty(this, "column", {
              value: column,
              enumerable: true
            });
            Object.defineProperty(this, "endColumn", {
              value: endColumn,
              enumerable: true
            });
          } else {
            this.column = column;
            this.endColumn = endColumn;
          }
        }
      } catch (nop) {
      }
    }
    Exception.prototype = new Error();
    exports["default"] = Exception;
    module.exports = exports["default"];
  })(exception, exception.exports);
  var exceptionExports = exception.exports;
  var helpers$1 = {};
  var blockHelperMissing = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var _utils2 = utils;
    exports["default"] = function(instance) {
      instance.registerHelper("blockHelperMissing", function(context, options) {
        var inverse = options.inverse, fn = options.fn;
        if (context === true) {
          return fn(this);
        } else if (context === false || context == null) {
          return inverse(this);
        } else if (_utils2.isArray(context)) {
          if (context.length > 0) {
            if (options.ids) {
              options.ids = [options.name];
            }
            return instance.helpers.each(context, options);
          } else {
            return inverse(this);
          }
        } else {
          if (options.data && options.ids) {
            var data = _utils2.createFrame(options.data);
            data.contextPath = _utils2.appendContextPath(options.data.contextPath, options.name);
            options = { data };
          }
          return fn(context, options);
        }
      });
    };
    module.exports = exports["default"];
  })(blockHelperMissing, blockHelperMissing.exports);
  var blockHelperMissingExports = blockHelperMissing.exports;
  var each = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils2 = utils;
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    exports["default"] = function(instance) {
      instance.registerHelper("each", function(context, options) {
        if (!options) {
          throw new _exception22["default"]("Must pass iterator to #each");
        }
        var fn = options.fn, inverse = options.inverse, i2 = 0, ret = "", data = void 0, contextPath = void 0;
        if (options.data && options.ids) {
          contextPath = _utils2.appendContextPath(options.data.contextPath, options.ids[0]) + ".";
        }
        if (_utils2.isFunction(context)) {
          context = context.call(this);
        }
        if (options.data) {
          data = _utils2.createFrame(options.data);
        }
        function execIteration(field, index, last) {
          if (data) {
            data.key = field;
            data.index = index;
            data.first = index === 0;
            data.last = !!last;
            if (contextPath) {
              data.contextPath = contextPath + field;
            }
          }
          ret = ret + fn(context[field], {
            data,
            blockParams: _utils2.blockParams([context[field], field], [contextPath + field, null])
          });
        }
        if (context && typeof context === "object") {
          if (_utils2.isArray(context)) {
            for (var j2 = context.length; i2 < j2; i2++) {
              if (i2 in context) {
                execIteration(i2, i2, i2 === context.length - 1);
              }
            }
          } else if (typeof Symbol === "function" && context[Symbol.iterator]) {
            var newContext = [];
            var iterator = context[Symbol.iterator]();
            for (var it = iterator.next(); !it.done; it = iterator.next()) {
              newContext.push(it.value);
            }
            context = newContext;
            for (var j2 = context.length; i2 < j2; i2++) {
              execIteration(i2, i2, i2 === context.length - 1);
            }
          } else {
            (function() {
              var priorKey = void 0;
              Object.keys(context).forEach(function(key) {
                if (priorKey !== void 0) {
                  execIteration(priorKey, i2 - 1);
                }
                priorKey = key;
                i2++;
              });
              if (priorKey !== void 0) {
                execIteration(priorKey, i2 - 1, true);
              }
            })();
          }
        }
        if (i2 === 0) {
          ret = inverse(this);
        }
        return ret;
      });
    };
    module.exports = exports["default"];
  })(each, each.exports);
  var eachExports = each.exports;
  var helperMissing = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    exports["default"] = function(instance) {
      instance.registerHelper("helperMissing", function() {
        if (arguments.length === 1) {
          return void 0;
        } else {
          throw new _exception22["default"]('Missing helper: "' + arguments[arguments.length - 1].name + '"');
        }
      });
    };
    module.exports = exports["default"];
  })(helperMissing, helperMissing.exports);
  var helperMissingExports = helperMissing.exports;
  var _if = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils2 = utils;
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    exports["default"] = function(instance) {
      instance.registerHelper("if", function(conditional, options) {
        if (arguments.length != 2) {
          throw new _exception22["default"]("#if requires exactly one argument");
        }
        if (_utils2.isFunction(conditional)) {
          conditional = conditional.call(this);
        }
        if (!options.hash.includeZero && !conditional || _utils2.isEmpty(conditional)) {
          return options.inverse(this);
        } else {
          return options.fn(this);
        }
      });
      instance.registerHelper("unless", function(conditional, options) {
        if (arguments.length != 2) {
          throw new _exception22["default"]("#unless requires exactly one argument");
        }
        return instance.helpers["if"].call(this, conditional, {
          fn: options.inverse,
          inverse: options.fn,
          hash: options.hash
        });
      });
    };
    module.exports = exports["default"];
  })(_if, _if.exports);
  var _ifExports = _if.exports;
  var log$1 = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    exports["default"] = function(instance) {
      instance.registerHelper("log", function() {
        var args = [void 0], options = arguments[arguments.length - 1];
        for (var i2 = 0; i2 < arguments.length - 1; i2++) {
          args.push(arguments[i2]);
        }
        var level = 1;
        if (options.hash.level != null) {
          level = options.hash.level;
        } else if (options.data && options.data.level != null) {
          level = options.data.level;
        }
        args[0] = level;
        instance.log.apply(instance, args);
      });
    };
    module.exports = exports["default"];
  })(log$1, log$1.exports);
  var logExports = log$1.exports;
  var lookup = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    exports["default"] = function(instance) {
      instance.registerHelper("lookup", function(obj, field, options) {
        if (!obj) {
          return obj;
        }
        return options.lookupProperty(obj, field);
      });
    };
    module.exports = exports["default"];
  })(lookup, lookup.exports);
  var lookupExports = lookup.exports;
  var _with = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _utils2 = utils;
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    exports["default"] = function(instance) {
      instance.registerHelper("with", function(context, options) {
        if (arguments.length != 2) {
          throw new _exception22["default"]("#with requires exactly one argument");
        }
        if (_utils2.isFunction(context)) {
          context = context.call(this);
        }
        var fn = options.fn;
        if (!_utils2.isEmpty(context)) {
          var data = options.data;
          if (options.data && options.ids) {
            data = _utils2.createFrame(options.data);
            data.contextPath = _utils2.appendContextPath(options.data.contextPath, options.ids[0]);
          }
          return fn(context, {
            data,
            blockParams: _utils2.blockParams([context], [data && data.contextPath])
          });
        } else {
          return options.inverse(this);
        }
      });
    };
    module.exports = exports["default"];
  })(_with, _with.exports);
  var _withExports = _with.exports;
  helpers$1.__esModule = true;
  helpers$1.registerDefaultHelpers = registerDefaultHelpers;
  helpers$1.moveHelperToHooks = moveHelperToHooks;
  function _interopRequireDefault$7(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _helpersBlockHelperMissing = blockHelperMissingExports;
  var _helpersBlockHelperMissing2 = _interopRequireDefault$7(_helpersBlockHelperMissing);
  var _helpersEach = eachExports;
  var _helpersEach2 = _interopRequireDefault$7(_helpersEach);
  var _helpersHelperMissing = helperMissingExports;
  var _helpersHelperMissing2 = _interopRequireDefault$7(_helpersHelperMissing);
  var _helpersIf = _ifExports;
  var _helpersIf2 = _interopRequireDefault$7(_helpersIf);
  var _helpersLog = logExports;
  var _helpersLog2 = _interopRequireDefault$7(_helpersLog);
  var _helpersLookup = lookupExports;
  var _helpersLookup2 = _interopRequireDefault$7(_helpersLookup);
  var _helpersWith = _withExports;
  var _helpersWith2 = _interopRequireDefault$7(_helpersWith);
  function registerDefaultHelpers(instance) {
    _helpersBlockHelperMissing2["default"](instance);
    _helpersEach2["default"](instance);
    _helpersHelperMissing2["default"](instance);
    _helpersIf2["default"](instance);
    _helpersLog2["default"](instance);
    _helpersLookup2["default"](instance);
    _helpersWith2["default"](instance);
  }
  function moveHelperToHooks(instance, helperName, keepHelper) {
    if (instance.helpers[helperName]) {
      instance.hooks[helperName] = instance.helpers[helperName];
      if (!keepHelper) {
        delete instance.helpers[helperName];
      }
    }
  }
  var decorators = {};
  var inline = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var _utils2 = utils;
    exports["default"] = function(instance) {
      instance.registerDecorator("inline", function(fn, props, container, options) {
        var ret = fn;
        if (!props.partials) {
          props.partials = {};
          ret = function(context, options2) {
            var original = container.partials;
            container.partials = _utils2.extend({}, original, props.partials);
            var ret2 = fn(context, options2);
            container.partials = original;
            return ret2;
          };
        }
        props.partials[options.args[0]] = options.fn;
        return ret;
      });
    };
    module.exports = exports["default"];
  })(inline, inline.exports);
  var inlineExports = inline.exports;
  decorators.__esModule = true;
  decorators.registerDefaultDecorators = registerDefaultDecorators;
  function _interopRequireDefault$6(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _decoratorsInline = inlineExports;
  var _decoratorsInline2 = _interopRequireDefault$6(_decoratorsInline);
  function registerDefaultDecorators(instance) {
    _decoratorsInline2["default"](instance);
  }
  var logger = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var _utils2 = utils;
    var logger2 = {
      methodMap: ["debug", "info", "warn", "error"],
      level: "info",
      // Maps a given level value to the `methodMap` indexes above.
      lookupLevel: function lookupLevel(level) {
        if (typeof level === "string") {
          var levelMap = _utils2.indexOf(logger2.methodMap, level.toLowerCase());
          if (levelMap >= 0) {
            level = levelMap;
          } else {
            level = parseInt(level, 10);
          }
        }
        return level;
      },
      // Can be overridden in the host environment
      log: function log2(level) {
        level = logger2.lookupLevel(level);
        if (typeof console !== "undefined" && logger2.lookupLevel(logger2.level) <= level) {
          var method = logger2.methodMap[level];
          if (!console[method]) {
            method = "log";
          }
          for (var _len = arguments.length, message = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
            message[_key - 1] = arguments[_key];
          }
          console[method].apply(console, message);
        }
      }
    };
    exports["default"] = logger2;
    module.exports = exports["default"];
  })(logger, logger.exports);
  var loggerExports = logger.exports;
  var protoAccess = {};
  var createNewLookupObject$1 = {};
  createNewLookupObject$1.__esModule = true;
  createNewLookupObject$1.createNewLookupObject = createNewLookupObject;
  var _utils$4 = utils;
  function createNewLookupObject() {
    for (var _len = arguments.length, sources = Array(_len), _key = 0; _key < _len; _key++) {
      sources[_key] = arguments[_key];
    }
    return _utils$4.extend.apply(void 0, [/* @__PURE__ */ Object.create(null)].concat(sources));
  }
  protoAccess.__esModule = true;
  protoAccess.createProtoAccessControl = createProtoAccessControl;
  protoAccess.resultIsAllowed = resultIsAllowed;
  protoAccess.resetLoggedProperties = resetLoggedProperties;
  function _interopRequireDefault$5(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _createNewLookupObject = createNewLookupObject$1;
  var _logger$1 = loggerExports;
  var _logger2$1 = _interopRequireDefault$5(_logger$1);
  var loggedProperties = /* @__PURE__ */ Object.create(null);
  function createProtoAccessControl(runtimeOptions) {
    var defaultMethodWhiteList = /* @__PURE__ */ Object.create(null);
    defaultMethodWhiteList["constructor"] = false;
    defaultMethodWhiteList["__defineGetter__"] = false;
    defaultMethodWhiteList["__defineSetter__"] = false;
    defaultMethodWhiteList["__lookupGetter__"] = false;
    var defaultPropertyWhiteList = /* @__PURE__ */ Object.create(null);
    defaultPropertyWhiteList["__proto__"] = false;
    return {
      properties: {
        whitelist: _createNewLookupObject.createNewLookupObject(defaultPropertyWhiteList, runtimeOptions.allowedProtoProperties),
        defaultValue: runtimeOptions.allowProtoPropertiesByDefault
      },
      methods: {
        whitelist: _createNewLookupObject.createNewLookupObject(defaultMethodWhiteList, runtimeOptions.allowedProtoMethods),
        defaultValue: runtimeOptions.allowProtoMethodsByDefault
      }
    };
  }
  function resultIsAllowed(result, protoAccessControl, propertyName) {
    if (typeof result === "function") {
      return checkWhiteList(protoAccessControl.methods, propertyName);
    } else {
      return checkWhiteList(protoAccessControl.properties, propertyName);
    }
  }
  function checkWhiteList(protoAccessControlForType, propertyName) {
    if (protoAccessControlForType.whitelist[propertyName] !== void 0) {
      return protoAccessControlForType.whitelist[propertyName] === true;
    }
    if (protoAccessControlForType.defaultValue !== void 0) {
      return protoAccessControlForType.defaultValue;
    }
    logUnexpecedPropertyAccessOnce(propertyName);
    return false;
  }
  function logUnexpecedPropertyAccessOnce(propertyName) {
    if (loggedProperties[propertyName] !== true) {
      loggedProperties[propertyName] = true;
      _logger2$1["default"].log("error", 'Handlebars: Access has been denied to resolve the property "' + propertyName + '" because it is not an "own property" of its parent.\nYou can add a runtime option to disable the check or this warning:\nSee https://handlebarsjs.com/api-reference/runtime-options.html#options-to-control-prototype-access for details');
    }
  }
  function resetLoggedProperties() {
    Object.keys(loggedProperties).forEach(function(propertyName) {
      delete loggedProperties[propertyName];
    });
  }
  base$1.__esModule = true;
  base$1.HandlebarsEnvironment = HandlebarsEnvironment;
  function _interopRequireDefault$4(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _utils$3 = utils;
  var _exception$3 = exceptionExports;
  var _exception2$3 = _interopRequireDefault$4(_exception$3);
  var _helpers$2 = helpers$1;
  var _decorators = decorators;
  var _logger = loggerExports;
  var _logger2 = _interopRequireDefault$4(_logger);
  var _internalProtoAccess$1 = protoAccess;
  var VERSION = "4.7.8";
  base$1.VERSION = VERSION;
  var COMPILER_REVISION = 8;
  base$1.COMPILER_REVISION = COMPILER_REVISION;
  var LAST_COMPATIBLE_COMPILER_REVISION = 7;
  base$1.LAST_COMPATIBLE_COMPILER_REVISION = LAST_COMPATIBLE_COMPILER_REVISION;
  var REVISION_CHANGES = {
    1: "<= 1.0.rc.2",
    // 1.0.rc.2 is actually rev2 but doesn't report it
    2: "== 1.0.0-rc.3",
    3: "== 1.0.0-rc.4",
    4: "== 1.x.x",
    5: "== 2.0.0-alpha.x",
    6: ">= 2.0.0-beta.1",
    7: ">= 4.0.0 <4.3.0",
    8: ">= 4.3.0"
  };
  base$1.REVISION_CHANGES = REVISION_CHANGES;
  var objectType = "[object Object]";
  function HandlebarsEnvironment(helpers2, partials, decorators2) {
    this.helpers = helpers2 || {};
    this.partials = partials || {};
    this.decorators = decorators2 || {};
    _helpers$2.registerDefaultHelpers(this);
    _decorators.registerDefaultDecorators(this);
  }
  HandlebarsEnvironment.prototype = {
    constructor: HandlebarsEnvironment,
    logger: _logger2["default"],
    log: _logger2["default"].log,
    registerHelper: function registerHelper(name, fn) {
      if (_utils$3.toString.call(name) === objectType) {
        if (fn) {
          throw new _exception2$3["default"]("Arg not supported with multiple helpers");
        }
        _utils$3.extend(this.helpers, name);
      } else {
        this.helpers[name] = fn;
      }
    },
    unregisterHelper: function unregisterHelper(name) {
      delete this.helpers[name];
    },
    registerPartial: function registerPartial(name, partial) {
      if (_utils$3.toString.call(name) === objectType) {
        _utils$3.extend(this.partials, name);
      } else {
        if (typeof partial === "undefined") {
          throw new _exception2$3["default"]('Attempting to register a partial called "' + name + '" as undefined');
        }
        this.partials[name] = partial;
      }
    },
    unregisterPartial: function unregisterPartial(name) {
      delete this.partials[name];
    },
    registerDecorator: function registerDecorator(name, fn) {
      if (_utils$3.toString.call(name) === objectType) {
        if (fn) {
          throw new _exception2$3["default"]("Arg not supported with multiple decorators");
        }
        _utils$3.extend(this.decorators, name);
      } else {
        this.decorators[name] = fn;
      }
    },
    unregisterDecorator: function unregisterDecorator(name) {
      delete this.decorators[name];
    },
    /**
     * Reset the memory of illegal property accesses that have already been logged.
     * @deprecated should only be used in handlebars test-cases
     */
    resetLoggedPropertyAccesses: function resetLoggedPropertyAccesses() {
      _internalProtoAccess$1.resetLoggedProperties();
    }
  };
  var log = _logger2["default"].log;
  base$1.log = log;
  base$1.createFrame = _utils$3.createFrame;
  base$1.logger = _logger2["default"];
  var safeString = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function SafeString(string) {
      this.string = string;
    }
    SafeString.prototype.toString = SafeString.prototype.toHTML = function() {
      return "" + this.string;
    };
    exports["default"] = SafeString;
    module.exports = exports["default"];
  })(safeString, safeString.exports);
  var safeStringExports = safeString.exports;
  var runtime = {};
  var wrapHelper$1 = {};
  wrapHelper$1.__esModule = true;
  wrapHelper$1.wrapHelper = wrapHelper;
  function wrapHelper(helper, transformOptionsFn) {
    if (typeof helper !== "function") {
      return helper;
    }
    var wrapper = function wrapper2() {
      var options = arguments[arguments.length - 1];
      arguments[arguments.length - 1] = transformOptionsFn(options);
      return helper.apply(this, arguments);
    };
    return wrapper;
  }
  runtime.__esModule = true;
  runtime.checkRevision = checkRevision;
  runtime.template = template;
  runtime.wrapProgram = wrapProgram;
  runtime.resolvePartial = resolvePartial;
  runtime.invokePartial = invokePartial;
  runtime.noop = noop;
  function _interopRequireDefault$3(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  function _interopRequireWildcard$1(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj["default"] = obj;
      return newObj;
    }
  }
  var _utils$2 = utils;
  var Utils = _interopRequireWildcard$1(_utils$2);
  var _exception$2 = exceptionExports;
  var _exception2$2 = _interopRequireDefault$3(_exception$2);
  var _base = base$1;
  var _helpers$1 = helpers$1;
  var _internalWrapHelper = wrapHelper$1;
  var _internalProtoAccess = protoAccess;
  function checkRevision(compilerInfo) {
    var compilerRevision = compilerInfo && compilerInfo[0] || 1, currentRevision = _base.COMPILER_REVISION;
    if (compilerRevision >= _base.LAST_COMPATIBLE_COMPILER_REVISION && compilerRevision <= _base.COMPILER_REVISION) {
      return;
    }
    if (compilerRevision < _base.LAST_COMPATIBLE_COMPILER_REVISION) {
      var runtimeVersions = _base.REVISION_CHANGES[currentRevision], compilerVersions = _base.REVISION_CHANGES[compilerRevision];
      throw new _exception2$2["default"]("Template was precompiled with an older version of Handlebars than the current runtime. Please update your precompiler to a newer version (" + runtimeVersions + ") or downgrade your runtime to an older version (" + compilerVersions + ").");
    } else {
      throw new _exception2$2["default"]("Template was precompiled with a newer version of Handlebars than the current runtime. Please update your runtime to a newer version (" + compilerInfo[1] + ").");
    }
  }
  function template(templateSpec, env) {
    if (!env) {
      throw new _exception2$2["default"]("No environment passed to template");
    }
    if (!templateSpec || !templateSpec.main) {
      throw new _exception2$2["default"]("Unknown template object: " + typeof templateSpec);
    }
    templateSpec.main.decorator = templateSpec.main_d;
    env.VM.checkRevision(templateSpec.compiler);
    var templateWasPrecompiledWithCompilerV7 = templateSpec.compiler && templateSpec.compiler[0] === 7;
    function invokePartialWrapper(partial, context, options) {
      if (options.hash) {
        context = Utils.extend({}, context, options.hash);
        if (options.ids) {
          options.ids[0] = true;
        }
      }
      partial = env.VM.resolvePartial.call(this, partial, context, options);
      var extendedOptions = Utils.extend({}, options, {
        hooks: this.hooks,
        protoAccessControl: this.protoAccessControl
      });
      var result = env.VM.invokePartial.call(this, partial, context, extendedOptions);
      if (result == null && env.compile) {
        options.partials[options.name] = env.compile(partial, templateSpec.compilerOptions, env);
        result = options.partials[options.name](context, extendedOptions);
      }
      if (result != null) {
        if (options.indent) {
          var lines = result.split("\n");
          for (var i2 = 0, l2 = lines.length; i2 < l2; i2++) {
            if (!lines[i2] && i2 + 1 === l2) {
              break;
            }
            lines[i2] = options.indent + lines[i2];
          }
          result = lines.join("\n");
        }
        return result;
      } else {
        throw new _exception2$2["default"]("The partial " + options.name + " could not be compiled when running in runtime-only mode");
      }
    }
    var container = {
      strict: function strict(obj, name, loc) {
        if (!obj || !(name in obj)) {
          throw new _exception2$2["default"]('"' + name + '" not defined in ' + obj, {
            loc
          });
        }
        return container.lookupProperty(obj, name);
      },
      lookupProperty: function lookupProperty(parent, propertyName) {
        var result = parent[propertyName];
        if (result == null) {
          return result;
        }
        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {
          return result;
        }
        if (_internalProtoAccess.resultIsAllowed(result, container.protoAccessControl, propertyName)) {
          return result;
        }
        return void 0;
      },
      lookup: function lookup2(depths, name) {
        var len = depths.length;
        for (var i2 = 0; i2 < len; i2++) {
          var result = depths[i2] && container.lookupProperty(depths[i2], name);
          if (result != null) {
            return depths[i2][name];
          }
        }
      },
      lambda: function lambda(current, context) {
        return typeof current === "function" ? current.call(context) : current;
      },
      escapeExpression: Utils.escapeExpression,
      invokePartial: invokePartialWrapper,
      fn: function fn(i2) {
        var ret2 = templateSpec[i2];
        ret2.decorator = templateSpec[i2 + "_d"];
        return ret2;
      },
      programs: [],
      program: function program(i2, data, declaredBlockParams, blockParams2, depths) {
        var programWrapper = this.programs[i2], fn = this.fn(i2);
        if (data || depths || blockParams2 || declaredBlockParams) {
          programWrapper = wrapProgram(this, i2, fn, data, declaredBlockParams, blockParams2, depths);
        } else if (!programWrapper) {
          programWrapper = this.programs[i2] = wrapProgram(this, i2, fn);
        }
        return programWrapper;
      },
      data: function data(value, depth) {
        while (value && depth--) {
          value = value._parent;
        }
        return value;
      },
      mergeIfNeeded: function mergeIfNeeded(param, common) {
        var obj = param || common;
        if (param && common && param !== common) {
          obj = Utils.extend({}, common, param);
        }
        return obj;
      },
      // An empty object to use as replacement for null-contexts
      nullContext: Object.seal({}),
      noop: env.VM.noop,
      compilerInfo: templateSpec.compiler
    };
    function ret(context) {
      var options = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
      var data = options.data;
      ret._setup(options);
      if (!options.partial && templateSpec.useData) {
        data = initData(context, data);
      }
      var depths = void 0, blockParams2 = templateSpec.useBlockParams ? [] : void 0;
      if (templateSpec.useDepths) {
        if (options.depths) {
          depths = context != options.depths[0] ? [context].concat(options.depths) : options.depths;
        } else {
          depths = [context];
        }
      }
      function main(context2) {
        return "" + templateSpec.main(container, context2, container.helpers, container.partials, data, blockParams2, depths);
      }
      main = executeDecorators(templateSpec.main, main, container, options.depths || [], data, blockParams2);
      return main(context, options);
    }
    ret.isTop = true;
    ret._setup = function(options) {
      if (!options.partial) {
        var mergedHelpers = Utils.extend({}, env.helpers, options.helpers);
        wrapHelpersToPassLookupProperty(mergedHelpers, container);
        container.helpers = mergedHelpers;
        if (templateSpec.usePartial) {
          container.partials = container.mergeIfNeeded(options.partials, env.partials);
        }
        if (templateSpec.usePartial || templateSpec.useDecorators) {
          container.decorators = Utils.extend({}, env.decorators, options.decorators);
        }
        container.hooks = {};
        container.protoAccessControl = _internalProtoAccess.createProtoAccessControl(options);
        var keepHelperInHelpers = options.allowCallsToHelperMissing || templateWasPrecompiledWithCompilerV7;
        _helpers$1.moveHelperToHooks(container, "helperMissing", keepHelperInHelpers);
        _helpers$1.moveHelperToHooks(container, "blockHelperMissing", keepHelperInHelpers);
      } else {
        container.protoAccessControl = options.protoAccessControl;
        container.helpers = options.helpers;
        container.partials = options.partials;
        container.decorators = options.decorators;
        container.hooks = options.hooks;
      }
    };
    ret._child = function(i2, data, blockParams2, depths) {
      if (templateSpec.useBlockParams && !blockParams2) {
        throw new _exception2$2["default"]("must pass block params");
      }
      if (templateSpec.useDepths && !depths) {
        throw new _exception2$2["default"]("must pass parent depths");
      }
      return wrapProgram(container, i2, templateSpec[i2], data, 0, blockParams2, depths);
    };
    return ret;
  }
  function wrapProgram(container, i2, fn, data, declaredBlockParams, blockParams2, depths) {
    function prog(context) {
      var options = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
      var currentDepths = depths;
      if (depths && context != depths[0] && !(context === container.nullContext && depths[0] === null)) {
        currentDepths = [context].concat(depths);
      }
      return fn(container, context, container.helpers, container.partials, options.data || data, blockParams2 && [options.blockParams].concat(blockParams2), currentDepths);
    }
    prog = executeDecorators(fn, prog, container, depths, data, blockParams2);
    prog.program = i2;
    prog.depth = depths ? depths.length : 0;
    prog.blockParams = declaredBlockParams || 0;
    return prog;
  }
  function resolvePartial(partial, context, options) {
    if (!partial) {
      if (options.name === "@partial-block") {
        partial = options.data["partial-block"];
      } else {
        partial = options.partials[options.name];
      }
    } else if (!partial.call && !options.name) {
      options.name = partial;
      partial = options.partials[partial];
    }
    return partial;
  }
  function invokePartial(partial, context, options) {
    var currentPartialBlock = options.data && options.data["partial-block"];
    options.partial = true;
    if (options.ids) {
      options.data.contextPath = options.ids[0] || options.data.contextPath;
    }
    var partialBlock = void 0;
    if (options.fn && options.fn !== noop) {
      (function() {
        options.data = _base.createFrame(options.data);
        var fn = options.fn;
        partialBlock = options.data["partial-block"] = function partialBlockWrapper(context2) {
          var options2 = arguments.length <= 1 || arguments[1] === void 0 ? {} : arguments[1];
          options2.data = _base.createFrame(options2.data);
          options2.data["partial-block"] = currentPartialBlock;
          return fn(context2, options2);
        };
        if (fn.partials) {
          options.partials = Utils.extend({}, options.partials, fn.partials);
        }
      })();
    }
    if (partial === void 0 && partialBlock) {
      partial = partialBlock;
    }
    if (partial === void 0) {
      throw new _exception2$2["default"]("The partial " + options.name + " could not be found");
    } else if (partial instanceof Function) {
      return partial(context, options);
    }
  }
  function noop() {
    return "";
  }
  function initData(context, data) {
    if (!data || !("root" in data)) {
      data = data ? _base.createFrame(data) : {};
      data.root = context;
    }
    return data;
  }
  function executeDecorators(fn, prog, container, depths, data, blockParams2) {
    if (fn.decorator) {
      var props = {};
      prog = fn.decorator(prog, props, container, depths && depths[0], data, blockParams2, depths);
      Utils.extend(prog, props);
    }
    return prog;
  }
  function wrapHelpersToPassLookupProperty(mergedHelpers, container) {
    Object.keys(mergedHelpers).forEach(function(helperName) {
      var helper = mergedHelpers[helperName];
      mergedHelpers[helperName] = passLookupPropertyOption(helper, container);
    });
  }
  function passLookupPropertyOption(helper, container) {
    var lookupProperty = container.lookupProperty;
    return _internalWrapHelper.wrapHelper(helper, function(options) {
      return Utils.extend({ lookupProperty }, options);
    });
  }
  var noConflict = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    exports["default"] = function(Handlebars2) {
      (function() {
        if (typeof globalThis === "object")
          return;
        Object.prototype.__defineGetter__("__magic__", function() {
          return this;
        });
        __magic__.globalThis = __magic__;
        delete Object.prototype.__magic__;
      })();
      var $Handlebars = globalThis.Handlebars;
      Handlebars2.noConflict = function() {
        if (globalThis.Handlebars === Handlebars2) {
          globalThis.Handlebars = $Handlebars;
        }
        return Handlebars2;
      };
    };
    module.exports = exports["default"];
  })(noConflict, noConflict.exports);
  var noConflictExports = noConflict.exports;
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    function _interopRequireWildcard2(obj) {
      if (obj && obj.__esModule) {
        return obj;
      } else {
        var newObj = {};
        if (obj != null) {
          for (var key in obj) {
            if (Object.prototype.hasOwnProperty.call(obj, key))
              newObj[key] = obj[key];
          }
        }
        newObj["default"] = obj;
        return newObj;
      }
    }
    var _handlebarsBase = base$1;
    var base2 = _interopRequireWildcard2(_handlebarsBase);
    var _handlebarsSafeString = safeStringExports;
    var _handlebarsSafeString2 = _interopRequireDefault2(_handlebarsSafeString);
    var _handlebarsException = exceptionExports;
    var _handlebarsException2 = _interopRequireDefault2(_handlebarsException);
    var _handlebarsUtils = utils;
    var Utils2 = _interopRequireWildcard2(_handlebarsUtils);
    var _handlebarsRuntime = runtime;
    var runtime$1 = _interopRequireWildcard2(_handlebarsRuntime);
    var _handlebarsNoConflict = noConflictExports;
    var _handlebarsNoConflict2 = _interopRequireDefault2(_handlebarsNoConflict);
    function create() {
      var hb = new base2.HandlebarsEnvironment();
      Utils2.extend(hb, base2);
      hb.SafeString = _handlebarsSafeString2["default"];
      hb.Exception = _handlebarsException2["default"];
      hb.Utils = Utils2;
      hb.escapeExpression = Utils2.escapeExpression;
      hb.VM = runtime$1;
      hb.template = function(spec) {
        return runtime$1.template(spec, hb);
      };
      return hb;
    }
    var inst = create();
    inst.create = create;
    _handlebarsNoConflict2["default"](inst);
    inst["default"] = inst;
    exports["default"] = inst;
    module.exports = exports["default"];
  })(handlebars_runtime, handlebars_runtime.exports);
  var handlebars_runtimeExports = handlebars_runtime.exports;
  var ast = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var AST = {
      // Public API used to evaluate derived attributes regarding AST nodes
      helpers: {
        // a mustache is definitely a helper if:
        // * it is an eligible helper, and
        // * it has at least one parameter or hash segment
        helperExpression: function helperExpression(node) {
          return node.type === "SubExpression" || (node.type === "MustacheStatement" || node.type === "BlockStatement") && !!(node.params && node.params.length || node.hash);
        },
        scopedId: function scopedId(path) {
          return /^\.|this\b/.test(path.original);
        },
        // an ID is simple if it only has one part, and that part is not
        // `..` or `this`.
        simpleId: function simpleId(path) {
          return path.parts.length === 1 && !AST.helpers.scopedId(path) && !path.depth;
        }
      }
    };
    exports["default"] = AST;
    module.exports = exports["default"];
  })(ast, ast.exports);
  var astExports = ast.exports;
  var base = {};
  var parser = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    var handlebars2 = function() {
      var parser2 = {
        trace: function trace() {
        },
        yy: {},
        symbols_: { "error": 2, "root": 3, "program": 4, "EOF": 5, "program_repetition0": 6, "statement": 7, "mustache": 8, "block": 9, "rawBlock": 10, "partial": 11, "partialBlock": 12, "content": 13, "COMMENT": 14, "CONTENT": 15, "openRawBlock": 16, "rawBlock_repetition0": 17, "END_RAW_BLOCK": 18, "OPEN_RAW_BLOCK": 19, "helperName": 20, "openRawBlock_repetition0": 21, "openRawBlock_option0": 22, "CLOSE_RAW_BLOCK": 23, "openBlock": 24, "block_option0": 25, "closeBlock": 26, "openInverse": 27, "block_option1": 28, "OPEN_BLOCK": 29, "openBlock_repetition0": 30, "openBlock_option0": 31, "openBlock_option1": 32, "CLOSE": 33, "OPEN_INVERSE": 34, "openInverse_repetition0": 35, "openInverse_option0": 36, "openInverse_option1": 37, "openInverseChain": 38, "OPEN_INVERSE_CHAIN": 39, "openInverseChain_repetition0": 40, "openInverseChain_option0": 41, "openInverseChain_option1": 42, "inverseAndProgram": 43, "INVERSE": 44, "inverseChain": 45, "inverseChain_option0": 46, "OPEN_ENDBLOCK": 47, "OPEN": 48, "mustache_repetition0": 49, "mustache_option0": 50, "OPEN_UNESCAPED": 51, "mustache_repetition1": 52, "mustache_option1": 53, "CLOSE_UNESCAPED": 54, "OPEN_PARTIAL": 55, "partialName": 56, "partial_repetition0": 57, "partial_option0": 58, "openPartialBlock": 59, "OPEN_PARTIAL_BLOCK": 60, "openPartialBlock_repetition0": 61, "openPartialBlock_option0": 62, "param": 63, "sexpr": 64, "OPEN_SEXPR": 65, "sexpr_repetition0": 66, "sexpr_option0": 67, "CLOSE_SEXPR": 68, "hash": 69, "hash_repetition_plus0": 70, "hashSegment": 71, "ID": 72, "EQUALS": 73, "blockParams": 74, "OPEN_BLOCK_PARAMS": 75, "blockParams_repetition_plus0": 76, "CLOSE_BLOCK_PARAMS": 77, "path": 78, "dataName": 79, "STRING": 80, "NUMBER": 81, "BOOLEAN": 82, "UNDEFINED": 83, "NULL": 84, "DATA": 85, "pathSegments": 86, "SEP": 87, "$accept": 0, "$end": 1 },
        terminals_: { 2: "error", 5: "EOF", 14: "COMMENT", 15: "CONTENT", 18: "END_RAW_BLOCK", 19: "OPEN_RAW_BLOCK", 23: "CLOSE_RAW_BLOCK", 29: "OPEN_BLOCK", 33: "CLOSE", 34: "OPEN_INVERSE", 39: "OPEN_INVERSE_CHAIN", 44: "INVERSE", 47: "OPEN_ENDBLOCK", 48: "OPEN", 51: "OPEN_UNESCAPED", 54: "CLOSE_UNESCAPED", 55: "OPEN_PARTIAL", 60: "OPEN_PARTIAL_BLOCK", 65: "OPEN_SEXPR", 68: "CLOSE_SEXPR", 72: "ID", 73: "EQUALS", 75: "OPEN_BLOCK_PARAMS", 77: "CLOSE_BLOCK_PARAMS", 80: "STRING", 81: "NUMBER", 82: "BOOLEAN", 83: "UNDEFINED", 84: "NULL", 85: "DATA", 87: "SEP" },
        productions_: [0, [3, 2], [4, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [7, 1], [13, 1], [10, 3], [16, 5], [9, 4], [9, 4], [24, 6], [27, 6], [38, 6], [43, 2], [45, 3], [45, 1], [26, 3], [8, 5], [8, 5], [11, 5], [12, 3], [59, 5], [63, 1], [63, 1], [64, 5], [69, 1], [71, 3], [74, 3], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [20, 1], [56, 1], [56, 1], [79, 2], [78, 1], [86, 3], [86, 1], [6, 0], [6, 2], [17, 0], [17, 2], [21, 0], [21, 2], [22, 0], [22, 1], [25, 0], [25, 1], [28, 0], [28, 1], [30, 0], [30, 2], [31, 0], [31, 1], [32, 0], [32, 1], [35, 0], [35, 2], [36, 0], [36, 1], [37, 0], [37, 1], [40, 0], [40, 2], [41, 0], [41, 1], [42, 0], [42, 1], [46, 0], [46, 1], [49, 0], [49, 2], [50, 0], [50, 1], [52, 0], [52, 2], [53, 0], [53, 1], [57, 0], [57, 2], [58, 0], [58, 1], [61, 0], [61, 2], [62, 0], [62, 1], [66, 0], [66, 2], [67, 0], [67, 1], [70, 1], [70, 2], [76, 1], [76, 2]],
        performAction: function anonymous(yytext, yyleng, yylineno, yy2, yystate, $$, _$) {
          var $0 = $$.length - 1;
          switch (yystate) {
            case 1:
              return $$[$0 - 1];
            case 2:
              this.$ = yy2.prepareProgram($$[$0]);
              break;
            case 3:
              this.$ = $$[$0];
              break;
            case 4:
              this.$ = $$[$0];
              break;
            case 5:
              this.$ = $$[$0];
              break;
            case 6:
              this.$ = $$[$0];
              break;
            case 7:
              this.$ = $$[$0];
              break;
            case 8:
              this.$ = $$[$0];
              break;
            case 9:
              this.$ = {
                type: "CommentStatement",
                value: yy2.stripComment($$[$0]),
                strip: yy2.stripFlags($$[$0], $$[$0]),
                loc: yy2.locInfo(this._$)
              };
              break;
            case 10:
              this.$ = {
                type: "ContentStatement",
                original: $$[$0],
                value: $$[$0],
                loc: yy2.locInfo(this._$)
              };
              break;
            case 11:
              this.$ = yy2.prepareRawBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
              break;
            case 12:
              this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1] };
              break;
            case 13:
              this.$ = yy2.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], false, this._$);
              break;
            case 14:
              this.$ = yy2.prepareBlock($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0], true, this._$);
              break;
            case 15:
              this.$ = { open: $$[$0 - 5], path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy2.stripFlags($$[$0 - 5], $$[$0]) };
              break;
            case 16:
              this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy2.stripFlags($$[$0 - 5], $$[$0]) };
              break;
            case 17:
              this.$ = { path: $$[$0 - 4], params: $$[$0 - 3], hash: $$[$0 - 2], blockParams: $$[$0 - 1], strip: yy2.stripFlags($$[$0 - 5], $$[$0]) };
              break;
            case 18:
              this.$ = { strip: yy2.stripFlags($$[$0 - 1], $$[$0 - 1]), program: $$[$0] };
              break;
            case 19:
              var inverse = yy2.prepareBlock($$[$0 - 2], $$[$0 - 1], $$[$0], $$[$0], false, this._$), program = yy2.prepareProgram([inverse], $$[$0 - 1].loc);
              program.chained = true;
              this.$ = { strip: $$[$0 - 2].strip, program, chain: true };
              break;
            case 20:
              this.$ = $$[$0];
              break;
            case 21:
              this.$ = { path: $$[$0 - 1], strip: yy2.stripFlags($$[$0 - 2], $$[$0]) };
              break;
            case 22:
              this.$ = yy2.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy2.stripFlags($$[$0 - 4], $$[$0]), this._$);
              break;
            case 23:
              this.$ = yy2.prepareMustache($$[$0 - 3], $$[$0 - 2], $$[$0 - 1], $$[$0 - 4], yy2.stripFlags($$[$0 - 4], $$[$0]), this._$);
              break;
            case 24:
              this.$ = {
                type: "PartialStatement",
                name: $$[$0 - 3],
                params: $$[$0 - 2],
                hash: $$[$0 - 1],
                indent: "",
                strip: yy2.stripFlags($$[$0 - 4], $$[$0]),
                loc: yy2.locInfo(this._$)
              };
              break;
            case 25:
              this.$ = yy2.preparePartialBlock($$[$0 - 2], $$[$0 - 1], $$[$0], this._$);
              break;
            case 26:
              this.$ = { path: $$[$0 - 3], params: $$[$0 - 2], hash: $$[$0 - 1], strip: yy2.stripFlags($$[$0 - 4], $$[$0]) };
              break;
            case 27:
              this.$ = $$[$0];
              break;
            case 28:
              this.$ = $$[$0];
              break;
            case 29:
              this.$ = {
                type: "SubExpression",
                path: $$[$0 - 3],
                params: $$[$0 - 2],
                hash: $$[$0 - 1],
                loc: yy2.locInfo(this._$)
              };
              break;
            case 30:
              this.$ = { type: "Hash", pairs: $$[$0], loc: yy2.locInfo(this._$) };
              break;
            case 31:
              this.$ = { type: "HashPair", key: yy2.id($$[$0 - 2]), value: $$[$0], loc: yy2.locInfo(this._$) };
              break;
            case 32:
              this.$ = yy2.id($$[$0 - 1]);
              break;
            case 33:
              this.$ = $$[$0];
              break;
            case 34:
              this.$ = $$[$0];
              break;
            case 35:
              this.$ = { type: "StringLiteral", value: $$[$0], original: $$[$0], loc: yy2.locInfo(this._$) };
              break;
            case 36:
              this.$ = { type: "NumberLiteral", value: Number($$[$0]), original: Number($$[$0]), loc: yy2.locInfo(this._$) };
              break;
            case 37:
              this.$ = { type: "BooleanLiteral", value: $$[$0] === "true", original: $$[$0] === "true", loc: yy2.locInfo(this._$) };
              break;
            case 38:
              this.$ = { type: "UndefinedLiteral", original: void 0, value: void 0, loc: yy2.locInfo(this._$) };
              break;
            case 39:
              this.$ = { type: "NullLiteral", original: null, value: null, loc: yy2.locInfo(this._$) };
              break;
            case 40:
              this.$ = $$[$0];
              break;
            case 41:
              this.$ = $$[$0];
              break;
            case 42:
              this.$ = yy2.preparePath(true, $$[$0], this._$);
              break;
            case 43:
              this.$ = yy2.preparePath(false, $$[$0], this._$);
              break;
            case 44:
              $$[$0 - 2].push({ part: yy2.id($$[$0]), original: $$[$0], separator: $$[$0 - 1] });
              this.$ = $$[$0 - 2];
              break;
            case 45:
              this.$ = [{ part: yy2.id($$[$0]), original: $$[$0] }];
              break;
            case 46:
              this.$ = [];
              break;
            case 47:
              $$[$0 - 1].push($$[$0]);
              break;
            case 48:
              this.$ = [];
              break;
            case 49:
              $$[$0 - 1].push($$[$0]);
              break;
            case 50:
              this.$ = [];
              break;
            case 51:
              $$[$0 - 1].push($$[$0]);
              break;
            case 58:
              this.$ = [];
              break;
            case 59:
              $$[$0 - 1].push($$[$0]);
              break;
            case 64:
              this.$ = [];
              break;
            case 65:
              $$[$0 - 1].push($$[$0]);
              break;
            case 70:
              this.$ = [];
              break;
            case 71:
              $$[$0 - 1].push($$[$0]);
              break;
            case 78:
              this.$ = [];
              break;
            case 79:
              $$[$0 - 1].push($$[$0]);
              break;
            case 82:
              this.$ = [];
              break;
            case 83:
              $$[$0 - 1].push($$[$0]);
              break;
            case 86:
              this.$ = [];
              break;
            case 87:
              $$[$0 - 1].push($$[$0]);
              break;
            case 90:
              this.$ = [];
              break;
            case 91:
              $$[$0 - 1].push($$[$0]);
              break;
            case 94:
              this.$ = [];
              break;
            case 95:
              $$[$0 - 1].push($$[$0]);
              break;
            case 98:
              this.$ = [$$[$0]];
              break;
            case 99:
              $$[$0 - 1].push($$[$0]);
              break;
            case 100:
              this.$ = [$$[$0]];
              break;
            case 101:
              $$[$0 - 1].push($$[$0]);
              break;
          }
        },
        table: [{ 3: 1, 4: 2, 5: [2, 46], 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 1: [3] }, { 5: [1, 4] }, { 5: [2, 2], 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: [1, 12], 15: [1, 20], 16: 17, 19: [1, 23], 24: 15, 27: 16, 29: [1, 21], 34: [1, 22], 39: [2, 2], 44: [2, 2], 47: [2, 2], 48: [1, 13], 51: [1, 14], 55: [1, 18], 59: 19, 60: [1, 24] }, { 1: [2, 1] }, { 5: [2, 47], 14: [2, 47], 15: [2, 47], 19: [2, 47], 29: [2, 47], 34: [2, 47], 39: [2, 47], 44: [2, 47], 47: [2, 47], 48: [2, 47], 51: [2, 47], 55: [2, 47], 60: [2, 47] }, { 5: [2, 3], 14: [2, 3], 15: [2, 3], 19: [2, 3], 29: [2, 3], 34: [2, 3], 39: [2, 3], 44: [2, 3], 47: [2, 3], 48: [2, 3], 51: [2, 3], 55: [2, 3], 60: [2, 3] }, { 5: [2, 4], 14: [2, 4], 15: [2, 4], 19: [2, 4], 29: [2, 4], 34: [2, 4], 39: [2, 4], 44: [2, 4], 47: [2, 4], 48: [2, 4], 51: [2, 4], 55: [2, 4], 60: [2, 4] }, { 5: [2, 5], 14: [2, 5], 15: [2, 5], 19: [2, 5], 29: [2, 5], 34: [2, 5], 39: [2, 5], 44: [2, 5], 47: [2, 5], 48: [2, 5], 51: [2, 5], 55: [2, 5], 60: [2, 5] }, { 5: [2, 6], 14: [2, 6], 15: [2, 6], 19: [2, 6], 29: [2, 6], 34: [2, 6], 39: [2, 6], 44: [2, 6], 47: [2, 6], 48: [2, 6], 51: [2, 6], 55: [2, 6], 60: [2, 6] }, { 5: [2, 7], 14: [2, 7], 15: [2, 7], 19: [2, 7], 29: [2, 7], 34: [2, 7], 39: [2, 7], 44: [2, 7], 47: [2, 7], 48: [2, 7], 51: [2, 7], 55: [2, 7], 60: [2, 7] }, { 5: [2, 8], 14: [2, 8], 15: [2, 8], 19: [2, 8], 29: [2, 8], 34: [2, 8], 39: [2, 8], 44: [2, 8], 47: [2, 8], 48: [2, 8], 51: [2, 8], 55: [2, 8], 60: [2, 8] }, { 5: [2, 9], 14: [2, 9], 15: [2, 9], 19: [2, 9], 29: [2, 9], 34: [2, 9], 39: [2, 9], 44: [2, 9], 47: [2, 9], 48: [2, 9], 51: [2, 9], 55: [2, 9], 60: [2, 9] }, { 20: 25, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 36, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 37, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 4: 38, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 15: [2, 48], 17: 39, 18: [2, 48] }, { 20: 41, 56: 40, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 44, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 5: [2, 10], 14: [2, 10], 15: [2, 10], 18: [2, 10], 19: [2, 10], 29: [2, 10], 34: [2, 10], 39: [2, 10], 44: [2, 10], 47: [2, 10], 48: [2, 10], 51: [2, 10], 55: [2, 10], 60: [2, 10] }, { 20: 45, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 46, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 47, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 41, 56: 48, 64: 42, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [2, 78], 49: 49, 65: [2, 78], 72: [2, 78], 80: [2, 78], 81: [2, 78], 82: [2, 78], 83: [2, 78], 84: [2, 78], 85: [2, 78] }, { 23: [2, 33], 33: [2, 33], 54: [2, 33], 65: [2, 33], 68: [2, 33], 72: [2, 33], 75: [2, 33], 80: [2, 33], 81: [2, 33], 82: [2, 33], 83: [2, 33], 84: [2, 33], 85: [2, 33] }, { 23: [2, 34], 33: [2, 34], 54: [2, 34], 65: [2, 34], 68: [2, 34], 72: [2, 34], 75: [2, 34], 80: [2, 34], 81: [2, 34], 82: [2, 34], 83: [2, 34], 84: [2, 34], 85: [2, 34] }, { 23: [2, 35], 33: [2, 35], 54: [2, 35], 65: [2, 35], 68: [2, 35], 72: [2, 35], 75: [2, 35], 80: [2, 35], 81: [2, 35], 82: [2, 35], 83: [2, 35], 84: [2, 35], 85: [2, 35] }, { 23: [2, 36], 33: [2, 36], 54: [2, 36], 65: [2, 36], 68: [2, 36], 72: [2, 36], 75: [2, 36], 80: [2, 36], 81: [2, 36], 82: [2, 36], 83: [2, 36], 84: [2, 36], 85: [2, 36] }, { 23: [2, 37], 33: [2, 37], 54: [2, 37], 65: [2, 37], 68: [2, 37], 72: [2, 37], 75: [2, 37], 80: [2, 37], 81: [2, 37], 82: [2, 37], 83: [2, 37], 84: [2, 37], 85: [2, 37] }, { 23: [2, 38], 33: [2, 38], 54: [2, 38], 65: [2, 38], 68: [2, 38], 72: [2, 38], 75: [2, 38], 80: [2, 38], 81: [2, 38], 82: [2, 38], 83: [2, 38], 84: [2, 38], 85: [2, 38] }, { 23: [2, 39], 33: [2, 39], 54: [2, 39], 65: [2, 39], 68: [2, 39], 72: [2, 39], 75: [2, 39], 80: [2, 39], 81: [2, 39], 82: [2, 39], 83: [2, 39], 84: [2, 39], 85: [2, 39] }, { 23: [2, 43], 33: [2, 43], 54: [2, 43], 65: [2, 43], 68: [2, 43], 72: [2, 43], 75: [2, 43], 80: [2, 43], 81: [2, 43], 82: [2, 43], 83: [2, 43], 84: [2, 43], 85: [2, 43], 87: [1, 50] }, { 72: [1, 35], 86: 51 }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 52: 52, 54: [2, 82], 65: [2, 82], 72: [2, 82], 80: [2, 82], 81: [2, 82], 82: [2, 82], 83: [2, 82], 84: [2, 82], 85: [2, 82] }, { 25: 53, 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 54, 47: [2, 54] }, { 28: 59, 43: 60, 44: [1, 58], 47: [2, 56] }, { 13: 62, 15: [1, 20], 18: [1, 61] }, { 33: [2, 86], 57: 63, 65: [2, 86], 72: [2, 86], 80: [2, 86], 81: [2, 86], 82: [2, 86], 83: [2, 86], 84: [2, 86], 85: [2, 86] }, { 33: [2, 40], 65: [2, 40], 72: [2, 40], 80: [2, 40], 81: [2, 40], 82: [2, 40], 83: [2, 40], 84: [2, 40], 85: [2, 40] }, { 33: [2, 41], 65: [2, 41], 72: [2, 41], 80: [2, 41], 81: [2, 41], 82: [2, 41], 83: [2, 41], 84: [2, 41], 85: [2, 41] }, { 20: 64, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 65, 47: [1, 66] }, { 30: 67, 33: [2, 58], 65: [2, 58], 72: [2, 58], 75: [2, 58], 80: [2, 58], 81: [2, 58], 82: [2, 58], 83: [2, 58], 84: [2, 58], 85: [2, 58] }, { 33: [2, 64], 35: 68, 65: [2, 64], 72: [2, 64], 75: [2, 64], 80: [2, 64], 81: [2, 64], 82: [2, 64], 83: [2, 64], 84: [2, 64], 85: [2, 64] }, { 21: 69, 23: [2, 50], 65: [2, 50], 72: [2, 50], 80: [2, 50], 81: [2, 50], 82: [2, 50], 83: [2, 50], 84: [2, 50], 85: [2, 50] }, { 33: [2, 90], 61: 70, 65: [2, 90], 72: [2, 90], 80: [2, 90], 81: [2, 90], 82: [2, 90], 83: [2, 90], 84: [2, 90], 85: [2, 90] }, { 20: 74, 33: [2, 80], 50: 71, 63: 72, 64: 75, 65: [1, 43], 69: 73, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 72: [1, 79] }, { 23: [2, 42], 33: [2, 42], 54: [2, 42], 65: [2, 42], 68: [2, 42], 72: [2, 42], 75: [2, 42], 80: [2, 42], 81: [2, 42], 82: [2, 42], 83: [2, 42], 84: [2, 42], 85: [2, 42], 87: [1, 50] }, { 20: 74, 53: 80, 54: [2, 84], 63: 81, 64: 75, 65: [1, 43], 69: 82, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 26: 83, 47: [1, 66] }, { 47: [2, 55] }, { 4: 84, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 39: [2, 46], 44: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 47: [2, 20] }, { 20: 85, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 4: 86, 6: 3, 14: [2, 46], 15: [2, 46], 19: [2, 46], 29: [2, 46], 34: [2, 46], 47: [2, 46], 48: [2, 46], 51: [2, 46], 55: [2, 46], 60: [2, 46] }, { 26: 87, 47: [1, 66] }, { 47: [2, 57] }, { 5: [2, 11], 14: [2, 11], 15: [2, 11], 19: [2, 11], 29: [2, 11], 34: [2, 11], 39: [2, 11], 44: [2, 11], 47: [2, 11], 48: [2, 11], 51: [2, 11], 55: [2, 11], 60: [2, 11] }, { 15: [2, 49], 18: [2, 49] }, { 20: 74, 33: [2, 88], 58: 88, 63: 89, 64: 75, 65: [1, 43], 69: 90, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 65: [2, 94], 66: 91, 68: [2, 94], 72: [2, 94], 80: [2, 94], 81: [2, 94], 82: [2, 94], 83: [2, 94], 84: [2, 94], 85: [2, 94] }, { 5: [2, 25], 14: [2, 25], 15: [2, 25], 19: [2, 25], 29: [2, 25], 34: [2, 25], 39: [2, 25], 44: [2, 25], 47: [2, 25], 48: [2, 25], 51: [2, 25], 55: [2, 25], 60: [2, 25] }, { 20: 92, 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 31: 93, 33: [2, 60], 63: 94, 64: 75, 65: [1, 43], 69: 95, 70: 76, 71: 77, 72: [1, 78], 75: [2, 60], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 66], 36: 96, 63: 97, 64: 75, 65: [1, 43], 69: 98, 70: 76, 71: 77, 72: [1, 78], 75: [2, 66], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 22: 99, 23: [2, 52], 63: 100, 64: 75, 65: [1, 43], 69: 101, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 20: 74, 33: [2, 92], 62: 102, 63: 103, 64: 75, 65: [1, 43], 69: 104, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 105] }, { 33: [2, 79], 65: [2, 79], 72: [2, 79], 80: [2, 79], 81: [2, 79], 82: [2, 79], 83: [2, 79], 84: [2, 79], 85: [2, 79] }, { 33: [2, 81] }, { 23: [2, 27], 33: [2, 27], 54: [2, 27], 65: [2, 27], 68: [2, 27], 72: [2, 27], 75: [2, 27], 80: [2, 27], 81: [2, 27], 82: [2, 27], 83: [2, 27], 84: [2, 27], 85: [2, 27] }, { 23: [2, 28], 33: [2, 28], 54: [2, 28], 65: [2, 28], 68: [2, 28], 72: [2, 28], 75: [2, 28], 80: [2, 28], 81: [2, 28], 82: [2, 28], 83: [2, 28], 84: [2, 28], 85: [2, 28] }, { 23: [2, 30], 33: [2, 30], 54: [2, 30], 68: [2, 30], 71: 106, 72: [1, 107], 75: [2, 30] }, { 23: [2, 98], 33: [2, 98], 54: [2, 98], 68: [2, 98], 72: [2, 98], 75: [2, 98] }, { 23: [2, 45], 33: [2, 45], 54: [2, 45], 65: [2, 45], 68: [2, 45], 72: [2, 45], 73: [1, 108], 75: [2, 45], 80: [2, 45], 81: [2, 45], 82: [2, 45], 83: [2, 45], 84: [2, 45], 85: [2, 45], 87: [2, 45] }, { 23: [2, 44], 33: [2, 44], 54: [2, 44], 65: [2, 44], 68: [2, 44], 72: [2, 44], 75: [2, 44], 80: [2, 44], 81: [2, 44], 82: [2, 44], 83: [2, 44], 84: [2, 44], 85: [2, 44], 87: [2, 44] }, { 54: [1, 109] }, { 54: [2, 83], 65: [2, 83], 72: [2, 83], 80: [2, 83], 81: [2, 83], 82: [2, 83], 83: [2, 83], 84: [2, 83], 85: [2, 83] }, { 54: [2, 85] }, { 5: [2, 13], 14: [2, 13], 15: [2, 13], 19: [2, 13], 29: [2, 13], 34: [2, 13], 39: [2, 13], 44: [2, 13], 47: [2, 13], 48: [2, 13], 51: [2, 13], 55: [2, 13], 60: [2, 13] }, { 38: 55, 39: [1, 57], 43: 56, 44: [1, 58], 45: 111, 46: 110, 47: [2, 76] }, { 33: [2, 70], 40: 112, 65: [2, 70], 72: [2, 70], 75: [2, 70], 80: [2, 70], 81: [2, 70], 82: [2, 70], 83: [2, 70], 84: [2, 70], 85: [2, 70] }, { 47: [2, 18] }, { 5: [2, 14], 14: [2, 14], 15: [2, 14], 19: [2, 14], 29: [2, 14], 34: [2, 14], 39: [2, 14], 44: [2, 14], 47: [2, 14], 48: [2, 14], 51: [2, 14], 55: [2, 14], 60: [2, 14] }, { 33: [1, 113] }, { 33: [2, 87], 65: [2, 87], 72: [2, 87], 80: [2, 87], 81: [2, 87], 82: [2, 87], 83: [2, 87], 84: [2, 87], 85: [2, 87] }, { 33: [2, 89] }, { 20: 74, 63: 115, 64: 75, 65: [1, 43], 67: 114, 68: [2, 96], 69: 116, 70: 76, 71: 77, 72: [1, 78], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 33: [1, 117] }, { 32: 118, 33: [2, 62], 74: 119, 75: [1, 120] }, { 33: [2, 59], 65: [2, 59], 72: [2, 59], 75: [2, 59], 80: [2, 59], 81: [2, 59], 82: [2, 59], 83: [2, 59], 84: [2, 59], 85: [2, 59] }, { 33: [2, 61], 75: [2, 61] }, { 33: [2, 68], 37: 121, 74: 122, 75: [1, 120] }, { 33: [2, 65], 65: [2, 65], 72: [2, 65], 75: [2, 65], 80: [2, 65], 81: [2, 65], 82: [2, 65], 83: [2, 65], 84: [2, 65], 85: [2, 65] }, { 33: [2, 67], 75: [2, 67] }, { 23: [1, 123] }, { 23: [2, 51], 65: [2, 51], 72: [2, 51], 80: [2, 51], 81: [2, 51], 82: [2, 51], 83: [2, 51], 84: [2, 51], 85: [2, 51] }, { 23: [2, 53] }, { 33: [1, 124] }, { 33: [2, 91], 65: [2, 91], 72: [2, 91], 80: [2, 91], 81: [2, 91], 82: [2, 91], 83: [2, 91], 84: [2, 91], 85: [2, 91] }, { 33: [2, 93] }, { 5: [2, 22], 14: [2, 22], 15: [2, 22], 19: [2, 22], 29: [2, 22], 34: [2, 22], 39: [2, 22], 44: [2, 22], 47: [2, 22], 48: [2, 22], 51: [2, 22], 55: [2, 22], 60: [2, 22] }, { 23: [2, 99], 33: [2, 99], 54: [2, 99], 68: [2, 99], 72: [2, 99], 75: [2, 99] }, { 73: [1, 108] }, { 20: 74, 63: 125, 64: 75, 65: [1, 43], 72: [1, 35], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 23], 14: [2, 23], 15: [2, 23], 19: [2, 23], 29: [2, 23], 34: [2, 23], 39: [2, 23], 44: [2, 23], 47: [2, 23], 48: [2, 23], 51: [2, 23], 55: [2, 23], 60: [2, 23] }, { 47: [2, 19] }, { 47: [2, 77] }, { 20: 74, 33: [2, 72], 41: 126, 63: 127, 64: 75, 65: [1, 43], 69: 128, 70: 76, 71: 77, 72: [1, 78], 75: [2, 72], 78: 26, 79: 27, 80: [1, 28], 81: [1, 29], 82: [1, 30], 83: [1, 31], 84: [1, 32], 85: [1, 34], 86: 33 }, { 5: [2, 24], 14: [2, 24], 15: [2, 24], 19: [2, 24], 29: [2, 24], 34: [2, 24], 39: [2, 24], 44: [2, 24], 47: [2, 24], 48: [2, 24], 51: [2, 24], 55: [2, 24], 60: [2, 24] }, { 68: [1, 129] }, { 65: [2, 95], 68: [2, 95], 72: [2, 95], 80: [2, 95], 81: [2, 95], 82: [2, 95], 83: [2, 95], 84: [2, 95], 85: [2, 95] }, { 68: [2, 97] }, { 5: [2, 21], 14: [2, 21], 15: [2, 21], 19: [2, 21], 29: [2, 21], 34: [2, 21], 39: [2, 21], 44: [2, 21], 47: [2, 21], 48: [2, 21], 51: [2, 21], 55: [2, 21], 60: [2, 21] }, { 33: [1, 130] }, { 33: [2, 63] }, { 72: [1, 132], 76: 131 }, { 33: [1, 133] }, { 33: [2, 69] }, { 15: [2, 12], 18: [2, 12] }, { 14: [2, 26], 15: [2, 26], 19: [2, 26], 29: [2, 26], 34: [2, 26], 47: [2, 26], 48: [2, 26], 51: [2, 26], 55: [2, 26], 60: [2, 26] }, { 23: [2, 31], 33: [2, 31], 54: [2, 31], 68: [2, 31], 72: [2, 31], 75: [2, 31] }, { 33: [2, 74], 42: 134, 74: 135, 75: [1, 120] }, { 33: [2, 71], 65: [2, 71], 72: [2, 71], 75: [2, 71], 80: [2, 71], 81: [2, 71], 82: [2, 71], 83: [2, 71], 84: [2, 71], 85: [2, 71] }, { 33: [2, 73], 75: [2, 73] }, { 23: [2, 29], 33: [2, 29], 54: [2, 29], 65: [2, 29], 68: [2, 29], 72: [2, 29], 75: [2, 29], 80: [2, 29], 81: [2, 29], 82: [2, 29], 83: [2, 29], 84: [2, 29], 85: [2, 29] }, { 14: [2, 15], 15: [2, 15], 19: [2, 15], 29: [2, 15], 34: [2, 15], 39: [2, 15], 44: [2, 15], 47: [2, 15], 48: [2, 15], 51: [2, 15], 55: [2, 15], 60: [2, 15] }, { 72: [1, 137], 77: [1, 136] }, { 72: [2, 100], 77: [2, 100] }, { 14: [2, 16], 15: [2, 16], 19: [2, 16], 29: [2, 16], 34: [2, 16], 44: [2, 16], 47: [2, 16], 48: [2, 16], 51: [2, 16], 55: [2, 16], 60: [2, 16] }, { 33: [1, 138] }, { 33: [2, 75] }, { 33: [2, 32] }, { 72: [2, 101], 77: [2, 101] }, { 14: [2, 17], 15: [2, 17], 19: [2, 17], 29: [2, 17], 34: [2, 17], 39: [2, 17], 44: [2, 17], 47: [2, 17], 48: [2, 17], 51: [2, 17], 55: [2, 17], 60: [2, 17] }],
        defaultActions: { 4: [2, 1], 54: [2, 55], 56: [2, 20], 60: [2, 57], 73: [2, 81], 82: [2, 85], 86: [2, 18], 90: [2, 89], 101: [2, 53], 104: [2, 93], 110: [2, 19], 111: [2, 77], 116: [2, 97], 119: [2, 63], 122: [2, 69], 135: [2, 75], 136: [2, 32] },
        parseError: function parseError(str, hash) {
          throw new Error(str);
        },
        parse: function parse2(input) {
          var self2 = this, stack = [0], vstack = [null], lstack = [], table = this.table, yytext = "", yylineno = 0, yyleng = 0;
          this.lexer.setInput(input);
          this.lexer.yy = this.yy;
          this.yy.lexer = this.lexer;
          this.yy.parser = this;
          if (typeof this.lexer.yylloc == "undefined")
            this.lexer.yylloc = {};
          var yyloc = this.lexer.yylloc;
          lstack.push(yyloc);
          var ranges = this.lexer.options && this.lexer.options.ranges;
          if (typeof this.yy.parseError === "function")
            this.parseError = this.yy.parseError;
          function lex() {
            var token;
            token = self2.lexer.lex() || 1;
            if (typeof token !== "number") {
              token = self2.symbols_[token] || token;
            }
            return token;
          }
          var symbol, state, action, r2, yyval = {}, p2, len, newState, expected;
          while (true) {
            state = stack[stack.length - 1];
            if (this.defaultActions[state]) {
              action = this.defaultActions[state];
            } else {
              if (symbol === null || typeof symbol == "undefined") {
                symbol = lex();
              }
              action = table[state] && table[state][symbol];
            }
            if (typeof action === "undefined" || !action.length || !action[0]) {
              var errStr = "";
              {
                expected = [];
                for (p2 in table[state])
                  if (this.terminals_[p2] && p2 > 2) {
                    expected.push("'" + this.terminals_[p2] + "'");
                  }
                if (this.lexer.showPosition) {
                  errStr = "Parse error on line " + (yylineno + 1) + ":\n" + this.lexer.showPosition() + "\nExpecting " + expected.join(", ") + ", got '" + (this.terminals_[symbol] || symbol) + "'";
                } else {
                  errStr = "Parse error on line " + (yylineno + 1) + ": Unexpected " + (symbol == 1 ? "end of input" : "'" + (this.terminals_[symbol] || symbol) + "'");
                }
                this.parseError(errStr, { text: this.lexer.match, token: this.terminals_[symbol] || symbol, line: this.lexer.yylineno, loc: yyloc, expected });
              }
            }
            if (action[0] instanceof Array && action.length > 1) {
              throw new Error("Parse Error: multiple actions possible at state: " + state + ", token: " + symbol);
            }
            switch (action[0]) {
              case 1:
                stack.push(symbol);
                vstack.push(this.lexer.yytext);
                lstack.push(this.lexer.yylloc);
                stack.push(action[1]);
                symbol = null;
                {
                  yyleng = this.lexer.yyleng;
                  yytext = this.lexer.yytext;
                  yylineno = this.lexer.yylineno;
                  yyloc = this.lexer.yylloc;
                }
                break;
              case 2:
                len = this.productions_[action[1]][1];
                yyval.$ = vstack[vstack.length - len];
                yyval._$ = { first_line: lstack[lstack.length - (len || 1)].first_line, last_line: lstack[lstack.length - 1].last_line, first_column: lstack[lstack.length - (len || 1)].first_column, last_column: lstack[lstack.length - 1].last_column };
                if (ranges) {
                  yyval._$.range = [lstack[lstack.length - (len || 1)].range[0], lstack[lstack.length - 1].range[1]];
                }
                r2 = this.performAction.call(yyval, yytext, yyleng, yylineno, this.yy, action[1], vstack, lstack);
                if (typeof r2 !== "undefined") {
                  return r2;
                }
                if (len) {
                  stack = stack.slice(0, -1 * len * 2);
                  vstack = vstack.slice(0, -1 * len);
                  lstack = lstack.slice(0, -1 * len);
                }
                stack.push(this.productions_[action[1]][0]);
                vstack.push(yyval.$);
                lstack.push(yyval._$);
                newState = table[stack[stack.length - 2]][stack[stack.length - 1]];
                stack.push(newState);
                break;
              case 3:
                return true;
            }
          }
          return true;
        }
      };
      var lexer = function() {
        var lexer2 = {
          EOF: 1,
          parseError: function parseError(str, hash) {
            if (this.yy.parser) {
              this.yy.parser.parseError(str, hash);
            } else {
              throw new Error(str);
            }
          },
          setInput: function setInput(input) {
            this._input = input;
            this._more = this._less = this.done = false;
            this.yylineno = this.yyleng = 0;
            this.yytext = this.matched = this.match = "";
            this.conditionStack = ["INITIAL"];
            this.yylloc = { first_line: 1, first_column: 0, last_line: 1, last_column: 0 };
            if (this.options.ranges)
              this.yylloc.range = [0, 0];
            this.offset = 0;
            return this;
          },
          input: function input() {
            var ch = this._input[0];
            this.yytext += ch;
            this.yyleng++;
            this.offset++;
            this.match += ch;
            this.matched += ch;
            var lines = ch.match(/(?:\r\n?|\n).*/g);
            if (lines) {
              this.yylineno++;
              this.yylloc.last_line++;
            } else {
              this.yylloc.last_column++;
            }
            if (this.options.ranges)
              this.yylloc.range[1]++;
            this._input = this._input.slice(1);
            return ch;
          },
          unput: function unput(ch) {
            var len = ch.length;
            var lines = ch.split(/(?:\r\n?|\n)/g);
            this._input = ch + this._input;
            this.yytext = this.yytext.substr(0, this.yytext.length - len - 1);
            this.offset -= len;
            var oldLines = this.match.split(/(?:\r\n?|\n)/g);
            this.match = this.match.substr(0, this.match.length - 1);
            this.matched = this.matched.substr(0, this.matched.length - 1);
            if (lines.length - 1)
              this.yylineno -= lines.length - 1;
            var r2 = this.yylloc.range;
            this.yylloc = {
              first_line: this.yylloc.first_line,
              last_line: this.yylineno + 1,
              first_column: this.yylloc.first_column,
              last_column: lines ? (lines.length === oldLines.length ? this.yylloc.first_column : 0) + oldLines[oldLines.length - lines.length].length - lines[0].length : this.yylloc.first_column - len
            };
            if (this.options.ranges) {
              this.yylloc.range = [r2[0], r2[0] + this.yyleng - len];
            }
            return this;
          },
          more: function more() {
            this._more = true;
            return this;
          },
          less: function less(n2) {
            this.unput(this.match.slice(n2));
          },
          pastInput: function pastInput() {
            var past = this.matched.substr(0, this.matched.length - this.match.length);
            return (past.length > 20 ? "..." : "") + past.substr(-20).replace(/\n/g, "");
          },
          upcomingInput: function upcomingInput() {
            var next = this.match;
            if (next.length < 20) {
              next += this._input.substr(0, 20 - next.length);
            }
            return (next.substr(0, 20) + (next.length > 20 ? "..." : "")).replace(/\n/g, "");
          },
          showPosition: function showPosition() {
            var pre = this.pastInput();
            var c2 = new Array(pre.length + 1).join("-");
            return pre + this.upcomingInput() + "\n" + c2 + "^";
          },
          next: function next() {
            if (this.done) {
              return this.EOF;
            }
            if (!this._input)
              this.done = true;
            var token, match, tempMatch, index, lines;
            if (!this._more) {
              this.yytext = "";
              this.match = "";
            }
            var rules = this._currentRules();
            for (var i2 = 0; i2 < rules.length; i2++) {
              tempMatch = this._input.match(this.rules[rules[i2]]);
              if (tempMatch && (!match || tempMatch[0].length > match[0].length)) {
                match = tempMatch;
                index = i2;
                if (!this.options.flex)
                  break;
              }
            }
            if (match) {
              lines = match[0].match(/(?:\r\n?|\n).*/g);
              if (lines)
                this.yylineno += lines.length;
              this.yylloc = {
                first_line: this.yylloc.last_line,
                last_line: this.yylineno + 1,
                first_column: this.yylloc.last_column,
                last_column: lines ? lines[lines.length - 1].length - lines[lines.length - 1].match(/\r?\n?/)[0].length : this.yylloc.last_column + match[0].length
              };
              this.yytext += match[0];
              this.match += match[0];
              this.matches = match;
              this.yyleng = this.yytext.length;
              if (this.options.ranges) {
                this.yylloc.range = [this.offset, this.offset += this.yyleng];
              }
              this._more = false;
              this._input = this._input.slice(match[0].length);
              this.matched += match[0];
              token = this.performAction.call(this, this.yy, this, rules[index], this.conditionStack[this.conditionStack.length - 1]);
              if (this.done && this._input)
                this.done = false;
              if (token)
                return token;
              else
                return;
            }
            if (this._input === "") {
              return this.EOF;
            } else {
              return this.parseError("Lexical error on line " + (this.yylineno + 1) + ". Unrecognized text.\n" + this.showPosition(), { text: "", token: null, line: this.yylineno });
            }
          },
          lex: function lex() {
            var r2 = this.next();
            if (typeof r2 !== "undefined") {
              return r2;
            } else {
              return this.lex();
            }
          },
          begin: function begin(condition) {
            this.conditionStack.push(condition);
          },
          popState: function popState() {
            return this.conditionStack.pop();
          },
          _currentRules: function _currentRules() {
            return this.conditions[this.conditionStack[this.conditionStack.length - 1]].rules;
          },
          topState: function topState() {
            return this.conditionStack[this.conditionStack.length - 2];
          },
          pushState: function begin(condition) {
            this.begin(condition);
          }
        };
        lexer2.options = {};
        lexer2.performAction = function anonymous(yy2, yy_, $avoiding_name_collisions, YY_START) {
          function strip(start, end) {
            return yy_.yytext = yy_.yytext.substring(start, yy_.yyleng - end + start);
          }
          switch ($avoiding_name_collisions) {
            case 0:
              if (yy_.yytext.slice(-2) === "\\\\") {
                strip(0, 1);
                this.begin("mu");
              } else if (yy_.yytext.slice(-1) === "\\") {
                strip(0, 1);
                this.begin("emu");
              } else {
                this.begin("mu");
              }
              if (yy_.yytext)
                return 15;
              break;
            case 1:
              return 15;
            case 2:
              this.popState();
              return 15;
            case 3:
              this.begin("raw");
              return 15;
            case 4:
              this.popState();
              if (this.conditionStack[this.conditionStack.length - 1] === "raw") {
                return 15;
              } else {
                strip(5, 9);
                return "END_RAW_BLOCK";
              }
            case 5:
              return 15;
            case 6:
              this.popState();
              return 14;
            case 7:
              return 65;
            case 8:
              return 68;
            case 9:
              return 19;
            case 10:
              this.popState();
              this.begin("raw");
              return 23;
            case 11:
              return 55;
            case 12:
              return 60;
            case 13:
              return 29;
            case 14:
              return 47;
            case 15:
              this.popState();
              return 44;
            case 16:
              this.popState();
              return 44;
            case 17:
              return 34;
            case 18:
              return 39;
            case 19:
              return 51;
            case 20:
              return 48;
            case 21:
              this.unput(yy_.yytext);
              this.popState();
              this.begin("com");
              break;
            case 22:
              this.popState();
              return 14;
            case 23:
              return 48;
            case 24:
              return 73;
            case 25:
              return 72;
            case 26:
              return 72;
            case 27:
              return 87;
            case 28:
              break;
            case 29:
              this.popState();
              return 54;
            case 30:
              this.popState();
              return 33;
            case 31:
              yy_.yytext = strip(1, 2).replace(/\\"/g, '"');
              return 80;
            case 32:
              yy_.yytext = strip(1, 2).replace(/\\'/g, "'");
              return 80;
            case 33:
              return 85;
            case 34:
              return 82;
            case 35:
              return 82;
            case 36:
              return 83;
            case 37:
              return 84;
            case 38:
              return 81;
            case 39:
              return 75;
            case 40:
              return 77;
            case 41:
              return 72;
            case 42:
              yy_.yytext = yy_.yytext.replace(/\\([\\\]])/g, "$1");
              return 72;
            case 43:
              return "INVALID";
            case 44:
              return 5;
          }
        };
        lexer2.rules = [/^(?:[^\x00]*?(?=(\{\{)))/, /^(?:[^\x00]+)/, /^(?:[^\x00]{2,}?(?=(\{\{|\\\{\{|\\\\\{\{|$)))/, /^(?:\{\{\{\{(?=[^/]))/, /^(?:\{\{\{\{\/[^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=[=}\s\/.])\}\}\}\})/, /^(?:[^\x00]+?(?=(\{\{\{\{)))/, /^(?:[\s\S]*?--(~)?\}\})/, /^(?:\()/, /^(?:\))/, /^(?:\{\{\{\{)/, /^(?:\}\}\}\})/, /^(?:\{\{(~)?>)/, /^(?:\{\{(~)?#>)/, /^(?:\{\{(~)?#\*?)/, /^(?:\{\{(~)?\/)/, /^(?:\{\{(~)?\^\s*(~)?\}\})/, /^(?:\{\{(~)?\s*else\s*(~)?\}\})/, /^(?:\{\{(~)?\^)/, /^(?:\{\{(~)?\s*else\b)/, /^(?:\{\{(~)?\{)/, /^(?:\{\{(~)?&)/, /^(?:\{\{(~)?!--)/, /^(?:\{\{(~)?![\s\S]*?\}\})/, /^(?:\{\{(~)?\*?)/, /^(?:=)/, /^(?:\.\.)/, /^(?:\.(?=([=~}\s\/.)|])))/, /^(?:[\/.])/, /^(?:\s+)/, /^(?:\}(~)?\}\})/, /^(?:(~)?\}\})/, /^(?:"(\\["]|[^"])*")/, /^(?:'(\\[']|[^'])*')/, /^(?:@)/, /^(?:true(?=([~}\s)])))/, /^(?:false(?=([~}\s)])))/, /^(?:undefined(?=([~}\s)])))/, /^(?:null(?=([~}\s)])))/, /^(?:-?[0-9]+(?:\.[0-9]+)?(?=([~}\s)])))/, /^(?:as\s+\|)/, /^(?:\|)/, /^(?:([^\s!"#%-,\.\/;->@\[-\^`\{-~]+(?=([=~}\s\/.)|]))))/, /^(?:\[(\\\]|[^\]])*\])/, /^(?:.)/, /^(?:$)/];
        lexer2.conditions = { "mu": { "rules": [7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44], "inclusive": false }, "emu": { "rules": [2], "inclusive": false }, "com": { "rules": [6], "inclusive": false }, "raw": { "rules": [3, 4, 5], "inclusive": false }, "INITIAL": { "rules": [0, 1, 44], "inclusive": true } };
        return lexer2;
      }();
      parser2.lexer = lexer;
      function Parser() {
        this.yy = {};
      }
      Parser.prototype = parser2;
      parser2.Parser = Parser;
      return new Parser();
    }();
    exports["default"] = handlebars2;
    module.exports = exports["default"];
  })(parser, parser.exports);
  var parserExports = parser.exports;
  var whitespaceControl = { exports: {} };
  var visitor = { exports: {} };
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    function Visitor() {
      this.parents = [];
    }
    Visitor.prototype = {
      constructor: Visitor,
      mutating: false,
      // Visits a given value. If mutating, will replace the value if necessary.
      acceptKey: function acceptKey(node, name) {
        var value = this.accept(node[name]);
        if (this.mutating) {
          if (value && !Visitor.prototype[value.type]) {
            throw new _exception22["default"]('Unexpected node type "' + value.type + '" found when accepting ' + name + " on " + node.type);
          }
          node[name] = value;
        }
      },
      // Performs an accept operation with added sanity check to ensure
      // required keys are not removed.
      acceptRequired: function acceptRequired(node, name) {
        this.acceptKey(node, name);
        if (!node[name]) {
          throw new _exception22["default"](node.type + " requires " + name);
        }
      },
      // Traverses a given array. If mutating, empty respnses will be removed
      // for child elements.
      acceptArray: function acceptArray(array) {
        for (var i2 = 0, l2 = array.length; i2 < l2; i2++) {
          this.acceptKey(array, i2);
          if (!array[i2]) {
            array.splice(i2, 1);
            i2--;
            l2--;
          }
        }
      },
      accept: function accept(object) {
        if (!object) {
          return;
        }
        if (!this[object.type]) {
          throw new _exception22["default"]("Unknown type: " + object.type, object);
        }
        if (this.current) {
          this.parents.unshift(this.current);
        }
        this.current = object;
        var ret = this[object.type](object);
        this.current = this.parents.shift();
        if (!this.mutating || ret) {
          return ret;
        } else if (ret !== false) {
          return object;
        }
      },
      Program: function Program(program) {
        this.acceptArray(program.body);
      },
      MustacheStatement: visitSubExpression,
      Decorator: visitSubExpression,
      BlockStatement: visitBlock,
      DecoratorBlock: visitBlock,
      PartialStatement: visitPartial,
      PartialBlockStatement: function PartialBlockStatement(partial) {
        visitPartial.call(this, partial);
        this.acceptKey(partial, "program");
      },
      ContentStatement: function ContentStatement() {
      },
      CommentStatement: function CommentStatement() {
      },
      SubExpression: visitSubExpression,
      PathExpression: function PathExpression() {
      },
      StringLiteral: function StringLiteral() {
      },
      NumberLiteral: function NumberLiteral() {
      },
      BooleanLiteral: function BooleanLiteral() {
      },
      UndefinedLiteral: function UndefinedLiteral() {
      },
      NullLiteral: function NullLiteral() {
      },
      Hash: function Hash(hash) {
        this.acceptArray(hash.pairs);
      },
      HashPair: function HashPair(pair) {
        this.acceptRequired(pair, "value");
      }
    };
    function visitSubExpression(mustache) {
      this.acceptRequired(mustache, "path");
      this.acceptArray(mustache.params);
      this.acceptKey(mustache, "hash");
    }
    function visitBlock(block) {
      visitSubExpression.call(this, block);
      this.acceptKey(block, "program");
      this.acceptKey(block, "inverse");
    }
    function visitPartial(partial) {
      this.acceptRequired(partial, "name");
      this.acceptArray(partial.params);
      this.acceptKey(partial, "hash");
    }
    exports["default"] = Visitor;
    module.exports = exports["default"];
  })(visitor, visitor.exports);
  var visitorExports = visitor.exports;
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _visitor = visitorExports;
    var _visitor2 = _interopRequireDefault2(_visitor);
    function WhitespaceControl() {
      var options = arguments.length <= 0 || arguments[0] === void 0 ? {} : arguments[0];
      this.options = options;
    }
    WhitespaceControl.prototype = new _visitor2["default"]();
    WhitespaceControl.prototype.Program = function(program) {
      var doStandalone = !this.options.ignoreStandalone;
      var isRoot = !this.isRootSeen;
      this.isRootSeen = true;
      var body = program.body;
      for (var i2 = 0, l2 = body.length; i2 < l2; i2++) {
        var current = body[i2], strip = this.accept(current);
        if (!strip) {
          continue;
        }
        var _isPrevWhitespace = isPrevWhitespace(body, i2, isRoot), _isNextWhitespace = isNextWhitespace(body, i2, isRoot), openStandalone = strip.openStandalone && _isPrevWhitespace, closeStandalone = strip.closeStandalone && _isNextWhitespace, inlineStandalone = strip.inlineStandalone && _isPrevWhitespace && _isNextWhitespace;
        if (strip.close) {
          omitRight(body, i2, true);
        }
        if (strip.open) {
          omitLeft(body, i2, true);
        }
        if (doStandalone && inlineStandalone) {
          omitRight(body, i2);
          if (omitLeft(body, i2)) {
            if (current.type === "PartialStatement") {
              current.indent = /([ \t]+$)/.exec(body[i2 - 1].original)[1];
            }
          }
        }
        if (doStandalone && openStandalone) {
          omitRight((current.program || current.inverse).body);
          omitLeft(body, i2);
        }
        if (doStandalone && closeStandalone) {
          omitRight(body, i2);
          omitLeft((current.inverse || current.program).body);
        }
      }
      return program;
    };
    WhitespaceControl.prototype.BlockStatement = WhitespaceControl.prototype.DecoratorBlock = WhitespaceControl.prototype.PartialBlockStatement = function(block) {
      this.accept(block.program);
      this.accept(block.inverse);
      var program = block.program || block.inverse, inverse = block.program && block.inverse, firstInverse = inverse, lastInverse = inverse;
      if (inverse && inverse.chained) {
        firstInverse = inverse.body[0].program;
        while (lastInverse.chained) {
          lastInverse = lastInverse.body[lastInverse.body.length - 1].program;
        }
      }
      var strip = {
        open: block.openStrip.open,
        close: block.closeStrip.close,
        // Determine the standalone candiacy. Basically flag our content as being possibly standalone
        // so our parent can determine if we actually are standalone
        openStandalone: isNextWhitespace(program.body),
        closeStandalone: isPrevWhitespace((firstInverse || program).body)
      };
      if (block.openStrip.close) {
        omitRight(program.body, null, true);
      }
      if (inverse) {
        var inverseStrip = block.inverseStrip;
        if (inverseStrip.open) {
          omitLeft(program.body, null, true);
        }
        if (inverseStrip.close) {
          omitRight(firstInverse.body, null, true);
        }
        if (block.closeStrip.open) {
          omitLeft(lastInverse.body, null, true);
        }
        if (!this.options.ignoreStandalone && isPrevWhitespace(program.body) && isNextWhitespace(firstInverse.body)) {
          omitLeft(program.body);
          omitRight(firstInverse.body);
        }
      } else if (block.closeStrip.open) {
        omitLeft(program.body, null, true);
      }
      return strip;
    };
    WhitespaceControl.prototype.Decorator = WhitespaceControl.prototype.MustacheStatement = function(mustache) {
      return mustache.strip;
    };
    WhitespaceControl.prototype.PartialStatement = WhitespaceControl.prototype.CommentStatement = function(node) {
      var strip = node.strip || {};
      return {
        inlineStandalone: true,
        open: strip.open,
        close: strip.close
      };
    };
    function isPrevWhitespace(body, i2, isRoot) {
      if (i2 === void 0) {
        i2 = body.length;
      }
      var prev = body[i2 - 1], sibling = body[i2 - 2];
      if (!prev) {
        return isRoot;
      }
      if (prev.type === "ContentStatement") {
        return (sibling || !isRoot ? /\r?\n\s*?$/ : /(^|\r?\n)\s*?$/).test(prev.original);
      }
    }
    function isNextWhitespace(body, i2, isRoot) {
      if (i2 === void 0) {
        i2 = -1;
      }
      var next = body[i2 + 1], sibling = body[i2 + 2];
      if (!next) {
        return isRoot;
      }
      if (next.type === "ContentStatement") {
        return (sibling || !isRoot ? /^\s*?\r?\n/ : /^\s*?(\r?\n|$)/).test(next.original);
      }
    }
    function omitRight(body, i2, multiple) {
      var current = body[i2 == null ? 0 : i2 + 1];
      if (!current || current.type !== "ContentStatement" || !multiple && current.rightStripped) {
        return;
      }
      var original = current.value;
      current.value = current.value.replace(multiple ? /^\s+/ : /^[ \t]*\r?\n?/, "");
      current.rightStripped = current.value !== original;
    }
    function omitLeft(body, i2, multiple) {
      var current = body[i2 == null ? body.length - 1 : i2 - 1];
      if (!current || current.type !== "ContentStatement" || !multiple && current.leftStripped) {
        return;
      }
      var original = current.value;
      current.value = current.value.replace(multiple ? /\s+$/ : /[ \t]+$/, "");
      current.leftStripped = current.value !== original;
      return current.leftStripped;
    }
    exports["default"] = WhitespaceControl;
    module.exports = exports["default"];
  })(whitespaceControl, whitespaceControl.exports);
  var whitespaceControlExports = whitespaceControl.exports;
  var helpers = {};
  helpers.__esModule = true;
  helpers.SourceLocation = SourceLocation;
  helpers.id = id;
  helpers.stripFlags = stripFlags;
  helpers.stripComment = stripComment;
  helpers.preparePath = preparePath;
  helpers.prepareMustache = prepareMustache;
  helpers.prepareRawBlock = prepareRawBlock;
  helpers.prepareBlock = prepareBlock;
  helpers.prepareProgram = prepareProgram;
  helpers.preparePartialBlock = preparePartialBlock;
  function _interopRequireDefault$2(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _exception$1 = exceptionExports;
  var _exception2$1 = _interopRequireDefault$2(_exception$1);
  function validateClose(open2, close) {
    close = close.path ? close.path.original : close;
    if (open2.path.original !== close) {
      var errorNode = { loc: open2.path.loc };
      throw new _exception2$1["default"](open2.path.original + " doesn't match " + close, errorNode);
    }
  }
  function SourceLocation(source, locInfo) {
    this.source = source;
    this.start = {
      line: locInfo.first_line,
      column: locInfo.first_column
    };
    this.end = {
      line: locInfo.last_line,
      column: locInfo.last_column
    };
  }
  function id(token) {
    if (/^\[.*\]$/.test(token)) {
      return token.substring(1, token.length - 1);
    } else {
      return token;
    }
  }
  function stripFlags(open2, close) {
    return {
      open: open2.charAt(2) === "~",
      close: close.charAt(close.length - 3) === "~"
    };
  }
  function stripComment(comment) {
    return comment.replace(/^\{\{~?!-?-?/, "").replace(/-?-?~?\}\}$/, "");
  }
  function preparePath(data, parts, loc) {
    loc = this.locInfo(loc);
    var original = data ? "@" : "", dig = [], depth = 0;
    for (var i2 = 0, l2 = parts.length; i2 < l2; i2++) {
      var part = parts[i2].part, isLiteral = parts[i2].original !== part;
      original += (parts[i2].separator || "") + part;
      if (!isLiteral && (part === ".." || part === "." || part === "this")) {
        if (dig.length > 0) {
          throw new _exception2$1["default"]("Invalid path: " + original, { loc });
        } else if (part === "..") {
          depth++;
        }
      } else {
        dig.push(part);
      }
    }
    return {
      type: "PathExpression",
      data,
      depth,
      parts: dig,
      original,
      loc
    };
  }
  function prepareMustache(path, params, hash, open2, strip, locInfo) {
    var escapeFlag = open2.charAt(3) || open2.charAt(2), escaped = escapeFlag !== "{" && escapeFlag !== "&";
    var decorator = /\*/.test(open2);
    return {
      type: decorator ? "Decorator" : "MustacheStatement",
      path,
      params,
      hash,
      escaped,
      strip,
      loc: this.locInfo(locInfo)
    };
  }
  function prepareRawBlock(openRawBlock, contents, close, locInfo) {
    validateClose(openRawBlock, close);
    locInfo = this.locInfo(locInfo);
    var program = {
      type: "Program",
      body: contents,
      strip: {},
      loc: locInfo
    };
    return {
      type: "BlockStatement",
      path: openRawBlock.path,
      params: openRawBlock.params,
      hash: openRawBlock.hash,
      program,
      openStrip: {},
      inverseStrip: {},
      closeStrip: {},
      loc: locInfo
    };
  }
  function prepareBlock(openBlock, program, inverseAndProgram, close, inverted, locInfo) {
    if (close && close.path) {
      validateClose(openBlock, close);
    }
    var decorator = /\*/.test(openBlock.open);
    program.blockParams = openBlock.blockParams;
    var inverse = void 0, inverseStrip = void 0;
    if (inverseAndProgram) {
      if (decorator) {
        throw new _exception2$1["default"]("Unexpected inverse block on decorator", inverseAndProgram);
      }
      if (inverseAndProgram.chain) {
        inverseAndProgram.program.body[0].closeStrip = close.strip;
      }
      inverseStrip = inverseAndProgram.strip;
      inverse = inverseAndProgram.program;
    }
    if (inverted) {
      inverted = inverse;
      inverse = program;
      program = inverted;
    }
    return {
      type: decorator ? "DecoratorBlock" : "BlockStatement",
      path: openBlock.path,
      params: openBlock.params,
      hash: openBlock.hash,
      program,
      inverse,
      openStrip: openBlock.strip,
      inverseStrip,
      closeStrip: close && close.strip,
      loc: this.locInfo(locInfo)
    };
  }
  function prepareProgram(statements, loc) {
    if (!loc && statements.length) {
      var firstLoc = statements[0].loc, lastLoc = statements[statements.length - 1].loc;
      if (firstLoc && lastLoc) {
        loc = {
          source: firstLoc.source,
          start: {
            line: firstLoc.start.line,
            column: firstLoc.start.column
          },
          end: {
            line: lastLoc.end.line,
            column: lastLoc.end.column
          }
        };
      }
    }
    return {
      type: "Program",
      body: statements,
      strip: {},
      loc
    };
  }
  function preparePartialBlock(open2, program, close, locInfo) {
    validateClose(open2, close);
    return {
      type: "PartialBlockStatement",
      name: open2.path,
      params: open2.params,
      hash: open2.hash,
      program,
      openStrip: open2.strip,
      closeStrip: close && close.strip,
      loc: this.locInfo(locInfo)
    };
  }
  base.__esModule = true;
  base.parseWithoutProcessing = parseWithoutProcessing;
  base.parse = parse;
  function _interopRequireWildcard(obj) {
    if (obj && obj.__esModule) {
      return obj;
    } else {
      var newObj = {};
      if (obj != null) {
        for (var key in obj) {
          if (Object.prototype.hasOwnProperty.call(obj, key))
            newObj[key] = obj[key];
        }
      }
      newObj["default"] = obj;
      return newObj;
    }
  }
  function _interopRequireDefault$1(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _parser = parserExports;
  var _parser2 = _interopRequireDefault$1(_parser);
  var _whitespaceControl = whitespaceControlExports;
  var _whitespaceControl2 = _interopRequireDefault$1(_whitespaceControl);
  var _helpers = helpers;
  var Helpers = _interopRequireWildcard(_helpers);
  var _utils$1 = utils;
  base.parser = _parser2["default"];
  var yy = {};
  _utils$1.extend(yy, Helpers);
  function parseWithoutProcessing(input, options) {
    if (input.type === "Program") {
      return input;
    }
    _parser2["default"].yy = yy;
    yy.locInfo = function(locInfo) {
      return new yy.SourceLocation(options && options.srcName, locInfo);
    };
    var ast2 = _parser2["default"].parse(input);
    return ast2;
  }
  function parse(input, options) {
    var ast2 = parseWithoutProcessing(input, options);
    var strip = new _whitespaceControl2["default"](options);
    return strip.accept(ast2);
  }
  var compiler = {};
  compiler.__esModule = true;
  compiler.Compiler = Compiler;
  compiler.precompile = precompile;
  compiler.compile = compile;
  function _interopRequireDefault(obj) {
    return obj && obj.__esModule ? obj : { "default": obj };
  }
  var _exception = exceptionExports;
  var _exception2 = _interopRequireDefault(_exception);
  var _utils = utils;
  var _ast = astExports;
  var _ast2 = _interopRequireDefault(_ast);
  var slice = [].slice;
  function Compiler() {
  }
  Compiler.prototype = {
    compiler: Compiler,
    equals: function equals(other) {
      var len = this.opcodes.length;
      if (other.opcodes.length !== len) {
        return false;
      }
      for (var i2 = 0; i2 < len; i2++) {
        var opcode = this.opcodes[i2], otherOpcode = other.opcodes[i2];
        if (opcode.opcode !== otherOpcode.opcode || !argEquals(opcode.args, otherOpcode.args)) {
          return false;
        }
      }
      len = this.children.length;
      for (var i2 = 0; i2 < len; i2++) {
        if (!this.children[i2].equals(other.children[i2])) {
          return false;
        }
      }
      return true;
    },
    guid: 0,
    compile: function compile2(program, options) {
      this.sourceNode = [];
      this.opcodes = [];
      this.children = [];
      this.options = options;
      this.stringParams = options.stringParams;
      this.trackIds = options.trackIds;
      options.blockParams = options.blockParams || [];
      options.knownHelpers = _utils.extend(/* @__PURE__ */ Object.create(null), {
        helperMissing: true,
        blockHelperMissing: true,
        each: true,
        "if": true,
        unless: true,
        "with": true,
        log: true,
        lookup: true
      }, options.knownHelpers);
      return this.accept(program);
    },
    compileProgram: function compileProgram(program) {
      var childCompiler = new this.compiler(), result = childCompiler.compile(program, this.options), guid = this.guid++;
      this.usePartial = this.usePartial || result.usePartial;
      this.children[guid] = result;
      this.useDepths = this.useDepths || result.useDepths;
      return guid;
    },
    accept: function accept(node) {
      if (!this[node.type]) {
        throw new _exception2["default"]("Unknown type: " + node.type, node);
      }
      this.sourceNode.unshift(node);
      var ret = this[node.type](node);
      this.sourceNode.shift();
      return ret;
    },
    Program: function Program(program) {
      this.options.blockParams.unshift(program.blockParams);
      var body = program.body, bodyLength = body.length;
      for (var i2 = 0; i2 < bodyLength; i2++) {
        this.accept(body[i2]);
      }
      this.options.blockParams.shift();
      this.isSimple = bodyLength === 1;
      this.blockParams = program.blockParams ? program.blockParams.length : 0;
      return this;
    },
    BlockStatement: function BlockStatement(block) {
      transformLiteralToPath(block);
      var program = block.program, inverse = block.inverse;
      program = program && this.compileProgram(program);
      inverse = inverse && this.compileProgram(inverse);
      var type = this.classifySexpr(block);
      if (type === "helper") {
        this.helperSexpr(block, program, inverse);
      } else if (type === "simple") {
        this.simpleSexpr(block);
        this.opcode("pushProgram", program);
        this.opcode("pushProgram", inverse);
        this.opcode("emptyHash");
        this.opcode("blockValue", block.path.original);
      } else {
        this.ambiguousSexpr(block, program, inverse);
        this.opcode("pushProgram", program);
        this.opcode("pushProgram", inverse);
        this.opcode("emptyHash");
        this.opcode("ambiguousBlockValue");
      }
      this.opcode("append");
    },
    DecoratorBlock: function DecoratorBlock(decorator) {
      var program = decorator.program && this.compileProgram(decorator.program);
      var params = this.setupFullMustacheParams(decorator, program, void 0), path = decorator.path;
      this.useDecorators = true;
      this.opcode("registerDecorator", params.length, path.original);
    },
    PartialStatement: function PartialStatement(partial) {
      this.usePartial = true;
      var program = partial.program;
      if (program) {
        program = this.compileProgram(partial.program);
      }
      var params = partial.params;
      if (params.length > 1) {
        throw new _exception2["default"]("Unsupported number of partial arguments: " + params.length, partial);
      } else if (!params.length) {
        if (this.options.explicitPartialContext) {
          this.opcode("pushLiteral", "undefined");
        } else {
          params.push({ type: "PathExpression", parts: [], depth: 0 });
        }
      }
      var partialName = partial.name.original, isDynamic = partial.name.type === "SubExpression";
      if (isDynamic) {
        this.accept(partial.name);
      }
      this.setupFullMustacheParams(partial, program, void 0, true);
      var indent = partial.indent || "";
      if (this.options.preventIndent && indent) {
        this.opcode("appendContent", indent);
        indent = "";
      }
      this.opcode("invokePartial", isDynamic, partialName, indent);
      this.opcode("append");
    },
    PartialBlockStatement: function PartialBlockStatement(partialBlock) {
      this.PartialStatement(partialBlock);
    },
    MustacheStatement: function MustacheStatement(mustache) {
      this.SubExpression(mustache);
      if (mustache.escaped && !this.options.noEscape) {
        this.opcode("appendEscaped");
      } else {
        this.opcode("append");
      }
    },
    Decorator: function Decorator(decorator) {
      this.DecoratorBlock(decorator);
    },
    ContentStatement: function ContentStatement(content) {
      if (content.value) {
        this.opcode("appendContent", content.value);
      }
    },
    CommentStatement: function CommentStatement() {
    },
    SubExpression: function SubExpression(sexpr) {
      transformLiteralToPath(sexpr);
      var type = this.classifySexpr(sexpr);
      if (type === "simple") {
        this.simpleSexpr(sexpr);
      } else if (type === "helper") {
        this.helperSexpr(sexpr);
      } else {
        this.ambiguousSexpr(sexpr);
      }
    },
    ambiguousSexpr: function ambiguousSexpr(sexpr, program, inverse) {
      var path = sexpr.path, name = path.parts[0], isBlock = program != null || inverse != null;
      this.opcode("getContext", path.depth);
      this.opcode("pushProgram", program);
      this.opcode("pushProgram", inverse);
      path.strict = true;
      this.accept(path);
      this.opcode("invokeAmbiguous", name, isBlock);
    },
    simpleSexpr: function simpleSexpr(sexpr) {
      var path = sexpr.path;
      path.strict = true;
      this.accept(path);
      this.opcode("resolvePossibleLambda");
    },
    helperSexpr: function helperSexpr(sexpr, program, inverse) {
      var params = this.setupFullMustacheParams(sexpr, program, inverse), path = sexpr.path, name = path.parts[0];
      if (this.options.knownHelpers[name]) {
        this.opcode("invokeKnownHelper", params.length, name);
      } else if (this.options.knownHelpersOnly) {
        throw new _exception2["default"]("You specified knownHelpersOnly, but used the unknown helper " + name, sexpr);
      } else {
        path.strict = true;
        path.falsy = true;
        this.accept(path);
        this.opcode("invokeHelper", params.length, path.original, _ast2["default"].helpers.simpleId(path));
      }
    },
    PathExpression: function PathExpression(path) {
      this.addDepth(path.depth);
      this.opcode("getContext", path.depth);
      var name = path.parts[0], scoped = _ast2["default"].helpers.scopedId(path), blockParamId = !path.depth && !scoped && this.blockParamIndex(name);
      if (blockParamId) {
        this.opcode("lookupBlockParam", blockParamId, path.parts);
      } else if (!name) {
        this.opcode("pushContext");
      } else if (path.data) {
        this.options.data = true;
        this.opcode("lookupData", path.depth, path.parts, path.strict);
      } else {
        this.opcode("lookupOnContext", path.parts, path.falsy, path.strict, scoped);
      }
    },
    StringLiteral: function StringLiteral(string) {
      this.opcode("pushString", string.value);
    },
    NumberLiteral: function NumberLiteral(number) {
      this.opcode("pushLiteral", number.value);
    },
    BooleanLiteral: function BooleanLiteral(bool) {
      this.opcode("pushLiteral", bool.value);
    },
    UndefinedLiteral: function UndefinedLiteral() {
      this.opcode("pushLiteral", "undefined");
    },
    NullLiteral: function NullLiteral() {
      this.opcode("pushLiteral", "null");
    },
    Hash: function Hash(hash) {
      var pairs = hash.pairs, i2 = 0, l2 = pairs.length;
      this.opcode("pushHash");
      for (; i2 < l2; i2++) {
        this.pushParam(pairs[i2].value);
      }
      while (i2--) {
        this.opcode("assignToHash", pairs[i2].key);
      }
      this.opcode("popHash");
    },
    // HELPERS
    opcode: function opcode(name) {
      this.opcodes.push({
        opcode: name,
        args: slice.call(arguments, 1),
        loc: this.sourceNode[0].loc
      });
    },
    addDepth: function addDepth(depth) {
      if (!depth) {
        return;
      }
      this.useDepths = true;
    },
    classifySexpr: function classifySexpr(sexpr) {
      var isSimple = _ast2["default"].helpers.simpleId(sexpr.path);
      var isBlockParam = isSimple && !!this.blockParamIndex(sexpr.path.parts[0]);
      var isHelper = !isBlockParam && _ast2["default"].helpers.helperExpression(sexpr);
      var isEligible = !isBlockParam && (isHelper || isSimple);
      if (isEligible && !isHelper) {
        var _name = sexpr.path.parts[0], options = this.options;
        if (options.knownHelpers[_name]) {
          isHelper = true;
        } else if (options.knownHelpersOnly) {
          isEligible = false;
        }
      }
      if (isHelper) {
        return "helper";
      } else if (isEligible) {
        return "ambiguous";
      } else {
        return "simple";
      }
    },
    pushParams: function pushParams(params) {
      for (var i2 = 0, l2 = params.length; i2 < l2; i2++) {
        this.pushParam(params[i2]);
      }
    },
    pushParam: function pushParam(val) {
      var value = val.value != null ? val.value : val.original || "";
      if (this.stringParams) {
        if (value.replace) {
          value = value.replace(/^(\.?\.\/)*/g, "").replace(/\//g, ".");
        }
        if (val.depth) {
          this.addDepth(val.depth);
        }
        this.opcode("getContext", val.depth || 0);
        this.opcode("pushStringParam", value, val.type);
        if (val.type === "SubExpression") {
          this.accept(val);
        }
      } else {
        if (this.trackIds) {
          var blockParamIndex = void 0;
          if (val.parts && !_ast2["default"].helpers.scopedId(val) && !val.depth) {
            blockParamIndex = this.blockParamIndex(val.parts[0]);
          }
          if (blockParamIndex) {
            var blockParamChild = val.parts.slice(1).join(".");
            this.opcode("pushId", "BlockParam", blockParamIndex, blockParamChild);
          } else {
            value = val.original || value;
            if (value.replace) {
              value = value.replace(/^this(?:\.|$)/, "").replace(/^\.\//, "").replace(/^\.$/, "");
            }
            this.opcode("pushId", val.type, value);
          }
        }
        this.accept(val);
      }
    },
    setupFullMustacheParams: function setupFullMustacheParams(sexpr, program, inverse, omitEmpty) {
      var params = sexpr.params;
      this.pushParams(params);
      this.opcode("pushProgram", program);
      this.opcode("pushProgram", inverse);
      if (sexpr.hash) {
        this.accept(sexpr.hash);
      } else {
        this.opcode("emptyHash", omitEmpty);
      }
      return params;
    },
    blockParamIndex: function blockParamIndex(name) {
      for (var depth = 0, len = this.options.blockParams.length; depth < len; depth++) {
        var blockParams2 = this.options.blockParams[depth], param = blockParams2 && _utils.indexOf(blockParams2, name);
        if (blockParams2 && param >= 0) {
          return [depth, param];
        }
      }
    }
  };
  function precompile(input, options, env) {
    if (input == null || typeof input !== "string" && input.type !== "Program") {
      throw new _exception2["default"]("You must pass a string or Handlebars AST to Handlebars.precompile. You passed " + input);
    }
    options = options || {};
    if (!("data" in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }
    var ast2 = env.parse(input, options), environment = new env.Compiler().compile(ast2, options);
    return new env.JavaScriptCompiler().compile(environment, options);
  }
  function compile(input, options, env) {
    if (options === void 0)
      options = {};
    if (input == null || typeof input !== "string" && input.type !== "Program") {
      throw new _exception2["default"]("You must pass a string or Handlebars AST to Handlebars.compile. You passed " + input);
    }
    options = _utils.extend({}, options);
    if (!("data" in options)) {
      options.data = true;
    }
    if (options.compat) {
      options.useDepths = true;
    }
    var compiled = void 0;
    function compileInput() {
      var ast2 = env.parse(input, options), environment = new env.Compiler().compile(ast2, options), templateSpec = new env.JavaScriptCompiler().compile(environment, options, void 0, true);
      return env.template(templateSpec);
    }
    function ret(context, execOptions) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled.call(this, context, execOptions);
    }
    ret._setup = function(setupOptions) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._setup(setupOptions);
    };
    ret._child = function(i2, data, blockParams2, depths) {
      if (!compiled) {
        compiled = compileInput();
      }
      return compiled._child(i2, data, blockParams2, depths);
    };
    return ret;
  }
  function argEquals(a2, b2) {
    if (a2 === b2) {
      return true;
    }
    if (_utils.isArray(a2) && _utils.isArray(b2) && a2.length === b2.length) {
      for (var i2 = 0; i2 < a2.length; i2++) {
        if (!argEquals(a2[i2], b2[i2])) {
          return false;
        }
      }
      return true;
    }
  }
  function transformLiteralToPath(sexpr) {
    if (!sexpr.path.parts) {
      var literal = sexpr.path;
      sexpr.path = {
        type: "PathExpression",
        data: false,
        depth: 0,
        parts: [literal.original + ""],
        original: literal.original + "",
        loc: literal.loc
      };
    }
  }
  var javascriptCompiler = { exports: {} };
  var codeGen = { exports: {} };
  var sourceMap = {};
  var sourceMapGenerator = {};
  var base64Vlq = {};
  var base64 = {};
  var hasRequiredBase64;
  function requireBase64() {
    if (hasRequiredBase64)
      return base64;
    hasRequiredBase64 = 1;
    var intToCharMap = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/".split("");
    base64.encode = function(number) {
      if (0 <= number && number < intToCharMap.length) {
        return intToCharMap[number];
      }
      throw new TypeError("Must be between 0 and 63: " + number);
    };
    base64.decode = function(charCode) {
      var bigA = 65;
      var bigZ = 90;
      var littleA = 97;
      var littleZ = 122;
      var zero = 48;
      var nine = 57;
      var plus = 43;
      var slash = 47;
      var littleOffset = 26;
      var numberOffset = 52;
      if (bigA <= charCode && charCode <= bigZ) {
        return charCode - bigA;
      }
      if (littleA <= charCode && charCode <= littleZ) {
        return charCode - littleA + littleOffset;
      }
      if (zero <= charCode && charCode <= nine) {
        return charCode - zero + numberOffset;
      }
      if (charCode == plus) {
        return 62;
      }
      if (charCode == slash) {
        return 63;
      }
      return -1;
    };
    return base64;
  }
  var hasRequiredBase64Vlq;
  function requireBase64Vlq() {
    if (hasRequiredBase64Vlq)
      return base64Vlq;
    hasRequiredBase64Vlq = 1;
    var base642 = requireBase64();
    var VLQ_BASE_SHIFT = 5;
    var VLQ_BASE = 1 << VLQ_BASE_SHIFT;
    var VLQ_BASE_MASK = VLQ_BASE - 1;
    var VLQ_CONTINUATION_BIT = VLQ_BASE;
    function toVLQSigned(aValue) {
      return aValue < 0 ? (-aValue << 1) + 1 : (aValue << 1) + 0;
    }
    function fromVLQSigned(aValue) {
      var isNegative = (aValue & 1) === 1;
      var shifted = aValue >> 1;
      return isNegative ? -shifted : shifted;
    }
    base64Vlq.encode = function base64VLQ_encode(aValue) {
      var encoded = "";
      var digit;
      var vlq = toVLQSigned(aValue);
      do {
        digit = vlq & VLQ_BASE_MASK;
        vlq >>>= VLQ_BASE_SHIFT;
        if (vlq > 0) {
          digit |= VLQ_CONTINUATION_BIT;
        }
        encoded += base642.encode(digit);
      } while (vlq > 0);
      return encoded;
    };
    base64Vlq.decode = function base64VLQ_decode(aStr, aIndex, aOutParam) {
      var strLen = aStr.length;
      var result = 0;
      var shift = 0;
      var continuation, digit;
      do {
        if (aIndex >= strLen) {
          throw new Error("Expected more digits in base 64 VLQ value.");
        }
        digit = base642.decode(aStr.charCodeAt(aIndex++));
        if (digit === -1) {
          throw new Error("Invalid base64 digit: " + aStr.charAt(aIndex - 1));
        }
        continuation = !!(digit & VLQ_CONTINUATION_BIT);
        digit &= VLQ_BASE_MASK;
        result = result + (digit << shift);
        shift += VLQ_BASE_SHIFT;
      } while (continuation);
      aOutParam.value = fromVLQSigned(result);
      aOutParam.rest = aIndex;
    };
    return base64Vlq;
  }
  var util = {};
  var hasRequiredUtil;
  function requireUtil() {
    if (hasRequiredUtil)
      return util;
    hasRequiredUtil = 1;
    (function(exports) {
      function getArg(aArgs, aName, aDefaultValue) {
        if (aName in aArgs) {
          return aArgs[aName];
        } else if (arguments.length === 3) {
          return aDefaultValue;
        } else {
          throw new Error('"' + aName + '" is a required argument.');
        }
      }
      exports.getArg = getArg;
      var urlRegexp = /^(?:([\w+\-.]+):)?\/\/(?:(\w+:\w+)@)?([\w.-]*)(?::(\d+))?(.*)$/;
      var dataUrlRegexp = /^data:.+\,.+$/;
      function urlParse(aUrl) {
        var match = aUrl.match(urlRegexp);
        if (!match) {
          return null;
        }
        return {
          scheme: match[1],
          auth: match[2],
          host: match[3],
          port: match[4],
          path: match[5]
        };
      }
      exports.urlParse = urlParse;
      function urlGenerate(aParsedUrl) {
        var url = "";
        if (aParsedUrl.scheme) {
          url += aParsedUrl.scheme + ":";
        }
        url += "//";
        if (aParsedUrl.auth) {
          url += aParsedUrl.auth + "@";
        }
        if (aParsedUrl.host) {
          url += aParsedUrl.host;
        }
        if (aParsedUrl.port) {
          url += ":" + aParsedUrl.port;
        }
        if (aParsedUrl.path) {
          url += aParsedUrl.path;
        }
        return url;
      }
      exports.urlGenerate = urlGenerate;
      function normalize(aPath) {
        var path = aPath;
        var url = urlParse(aPath);
        if (url) {
          if (!url.path) {
            return aPath;
          }
          path = url.path;
        }
        var isAbsolute = exports.isAbsolute(path);
        var parts = path.split(/\/+/);
        for (var part, up = 0, i2 = parts.length - 1; i2 >= 0; i2--) {
          part = parts[i2];
          if (part === ".") {
            parts.splice(i2, 1);
          } else if (part === "..") {
            up++;
          } else if (up > 0) {
            if (part === "") {
              parts.splice(i2 + 1, up);
              up = 0;
            } else {
              parts.splice(i2, 2);
              up--;
            }
          }
        }
        path = parts.join("/");
        if (path === "") {
          path = isAbsolute ? "/" : ".";
        }
        if (url) {
          url.path = path;
          return urlGenerate(url);
        }
        return path;
      }
      exports.normalize = normalize;
      function join(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        if (aPath === "") {
          aPath = ".";
        }
        var aPathUrl = urlParse(aPath);
        var aRootUrl = urlParse(aRoot);
        if (aRootUrl) {
          aRoot = aRootUrl.path || "/";
        }
        if (aPathUrl && !aPathUrl.scheme) {
          if (aRootUrl) {
            aPathUrl.scheme = aRootUrl.scheme;
          }
          return urlGenerate(aPathUrl);
        }
        if (aPathUrl || aPath.match(dataUrlRegexp)) {
          return aPath;
        }
        if (aRootUrl && !aRootUrl.host && !aRootUrl.path) {
          aRootUrl.host = aPath;
          return urlGenerate(aRootUrl);
        }
        var joined = aPath.charAt(0) === "/" ? aPath : normalize(aRoot.replace(/\/+$/, "") + "/" + aPath);
        if (aRootUrl) {
          aRootUrl.path = joined;
          return urlGenerate(aRootUrl);
        }
        return joined;
      }
      exports.join = join;
      exports.isAbsolute = function(aPath) {
        return aPath.charAt(0) === "/" || urlRegexp.test(aPath);
      };
      function relative(aRoot, aPath) {
        if (aRoot === "") {
          aRoot = ".";
        }
        aRoot = aRoot.replace(/\/$/, "");
        var level = 0;
        while (aPath.indexOf(aRoot + "/") !== 0) {
          var index = aRoot.lastIndexOf("/");
          if (index < 0) {
            return aPath;
          }
          aRoot = aRoot.slice(0, index);
          if (aRoot.match(/^([^\/]+:\/)?\/*$/)) {
            return aPath;
          }
          ++level;
        }
        return Array(level + 1).join("../") + aPath.substr(aRoot.length + 1);
      }
      exports.relative = relative;
      var supportsNullProto = function() {
        var obj = /* @__PURE__ */ Object.create(null);
        return !("__proto__" in obj);
      }();
      function identity(s2) {
        return s2;
      }
      function toSetString(aStr) {
        if (isProtoString(aStr)) {
          return "$" + aStr;
        }
        return aStr;
      }
      exports.toSetString = supportsNullProto ? identity : toSetString;
      function fromSetString(aStr) {
        if (isProtoString(aStr)) {
          return aStr.slice(1);
        }
        return aStr;
      }
      exports.fromSetString = supportsNullProto ? identity : fromSetString;
      function isProtoString(s2) {
        if (!s2) {
          return false;
        }
        var length = s2.length;
        if (length < 9) {
          return false;
        }
        if (s2.charCodeAt(length - 1) !== 95 || s2.charCodeAt(length - 2) !== 95 || s2.charCodeAt(length - 3) !== 111 || s2.charCodeAt(length - 4) !== 116 || s2.charCodeAt(length - 5) !== 111 || s2.charCodeAt(length - 6) !== 114 || s2.charCodeAt(length - 7) !== 112 || s2.charCodeAt(length - 8) !== 95 || s2.charCodeAt(length - 9) !== 95) {
          return false;
        }
        for (var i2 = length - 10; i2 >= 0; i2--) {
          if (s2.charCodeAt(i2) !== 36) {
            return false;
          }
        }
        return true;
      }
      function compareByOriginalPositions(mappingA, mappingB, onlyCompareOriginal) {
        var cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0 || onlyCompareOriginal) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByOriginalPositions = compareByOriginalPositions;
      function compareByGeneratedPositionsDeflated(mappingA, mappingB, onlyCompareGenerated) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0 || onlyCompareGenerated) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsDeflated = compareByGeneratedPositionsDeflated;
      function strcmp(aStr1, aStr2) {
        if (aStr1 === aStr2) {
          return 0;
        }
        if (aStr1 === null) {
          return 1;
        }
        if (aStr2 === null) {
          return -1;
        }
        if (aStr1 > aStr2) {
          return 1;
        }
        return -1;
      }
      function compareByGeneratedPositionsInflated(mappingA, mappingB) {
        var cmp = mappingA.generatedLine - mappingB.generatedLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.generatedColumn - mappingB.generatedColumn;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = strcmp(mappingA.source, mappingB.source);
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalLine - mappingB.originalLine;
        if (cmp !== 0) {
          return cmp;
        }
        cmp = mappingA.originalColumn - mappingB.originalColumn;
        if (cmp !== 0) {
          return cmp;
        }
        return strcmp(mappingA.name, mappingB.name);
      }
      exports.compareByGeneratedPositionsInflated = compareByGeneratedPositionsInflated;
      function parseSourceMapInput(str) {
        return JSON.parse(str.replace(/^\)]}'[^\n]*\n/, ""));
      }
      exports.parseSourceMapInput = parseSourceMapInput;
      function computeSourceURL(sourceRoot, sourceURL, sourceMapURL) {
        sourceURL = sourceURL || "";
        if (sourceRoot) {
          if (sourceRoot[sourceRoot.length - 1] !== "/" && sourceURL[0] !== "/") {
            sourceRoot += "/";
          }
          sourceURL = sourceRoot + sourceURL;
        }
        if (sourceMapURL) {
          var parsed = urlParse(sourceMapURL);
          if (!parsed) {
            throw new Error("sourceMapURL could not be parsed");
          }
          if (parsed.path) {
            var index = parsed.path.lastIndexOf("/");
            if (index >= 0) {
              parsed.path = parsed.path.substring(0, index + 1);
            }
          }
          sourceURL = join(urlGenerate(parsed), sourceURL);
        }
        return normalize(sourceURL);
      }
      exports.computeSourceURL = computeSourceURL;
    })(util);
    return util;
  }
  var arraySet = {};
  var hasRequiredArraySet;
  function requireArraySet() {
    if (hasRequiredArraySet)
      return arraySet;
    hasRequiredArraySet = 1;
    var util2 = requireUtil();
    var has = Object.prototype.hasOwnProperty;
    var hasNativeMap = typeof Map !== "undefined";
    function ArraySet() {
      this._array = [];
      this._set = hasNativeMap ? /* @__PURE__ */ new Map() : /* @__PURE__ */ Object.create(null);
    }
    ArraySet.fromArray = function ArraySet_fromArray(aArray, aAllowDuplicates) {
      var set = new ArraySet();
      for (var i2 = 0, len = aArray.length; i2 < len; i2++) {
        set.add(aArray[i2], aAllowDuplicates);
      }
      return set;
    };
    ArraySet.prototype.size = function ArraySet_size() {
      return hasNativeMap ? this._set.size : Object.getOwnPropertyNames(this._set).length;
    };
    ArraySet.prototype.add = function ArraySet_add(aStr, aAllowDuplicates) {
      var sStr = hasNativeMap ? aStr : util2.toSetString(aStr);
      var isDuplicate = hasNativeMap ? this.has(aStr) : has.call(this._set, sStr);
      var idx = this._array.length;
      if (!isDuplicate || aAllowDuplicates) {
        this._array.push(aStr);
      }
      if (!isDuplicate) {
        if (hasNativeMap) {
          this._set.set(aStr, idx);
        } else {
          this._set[sStr] = idx;
        }
      }
    };
    ArraySet.prototype.has = function ArraySet_has(aStr) {
      if (hasNativeMap) {
        return this._set.has(aStr);
      } else {
        var sStr = util2.toSetString(aStr);
        return has.call(this._set, sStr);
      }
    };
    ArraySet.prototype.indexOf = function ArraySet_indexOf(aStr) {
      if (hasNativeMap) {
        var idx = this._set.get(aStr);
        if (idx >= 0) {
          return idx;
        }
      } else {
        var sStr = util2.toSetString(aStr);
        if (has.call(this._set, sStr)) {
          return this._set[sStr];
        }
      }
      throw new Error('"' + aStr + '" is not in the set.');
    };
    ArraySet.prototype.at = function ArraySet_at(aIdx) {
      if (aIdx >= 0 && aIdx < this._array.length) {
        return this._array[aIdx];
      }
      throw new Error("No element indexed by " + aIdx);
    };
    ArraySet.prototype.toArray = function ArraySet_toArray() {
      return this._array.slice();
    };
    arraySet.ArraySet = ArraySet;
    return arraySet;
  }
  var mappingList = {};
  var hasRequiredMappingList;
  function requireMappingList() {
    if (hasRequiredMappingList)
      return mappingList;
    hasRequiredMappingList = 1;
    var util2 = requireUtil();
    function generatedPositionAfter(mappingA, mappingB) {
      var lineA = mappingA.generatedLine;
      var lineB = mappingB.generatedLine;
      var columnA = mappingA.generatedColumn;
      var columnB = mappingB.generatedColumn;
      return lineB > lineA || lineB == lineA && columnB >= columnA || util2.compareByGeneratedPositionsInflated(mappingA, mappingB) <= 0;
    }
    function MappingList() {
      this._array = [];
      this._sorted = true;
      this._last = { generatedLine: -1, generatedColumn: 0 };
    }
    MappingList.prototype.unsortedForEach = function MappingList_forEach(aCallback, aThisArg) {
      this._array.forEach(aCallback, aThisArg);
    };
    MappingList.prototype.add = function MappingList_add(aMapping) {
      if (generatedPositionAfter(this._last, aMapping)) {
        this._last = aMapping;
        this._array.push(aMapping);
      } else {
        this._sorted = false;
        this._array.push(aMapping);
      }
    };
    MappingList.prototype.toArray = function MappingList_toArray() {
      if (!this._sorted) {
        this._array.sort(util2.compareByGeneratedPositionsInflated);
        this._sorted = true;
      }
      return this._array;
    };
    mappingList.MappingList = MappingList;
    return mappingList;
  }
  var hasRequiredSourceMapGenerator;
  function requireSourceMapGenerator() {
    if (hasRequiredSourceMapGenerator)
      return sourceMapGenerator;
    hasRequiredSourceMapGenerator = 1;
    var base64VLQ = requireBase64Vlq();
    var util2 = requireUtil();
    var ArraySet = requireArraySet().ArraySet;
    var MappingList = requireMappingList().MappingList;
    function SourceMapGenerator(aArgs) {
      if (!aArgs) {
        aArgs = {};
      }
      this._file = util2.getArg(aArgs, "file", null);
      this._sourceRoot = util2.getArg(aArgs, "sourceRoot", null);
      this._skipValidation = util2.getArg(aArgs, "skipValidation", false);
      this._sources = new ArraySet();
      this._names = new ArraySet();
      this._mappings = new MappingList();
      this._sourcesContents = null;
    }
    SourceMapGenerator.prototype._version = 3;
    SourceMapGenerator.fromSourceMap = function SourceMapGenerator_fromSourceMap(aSourceMapConsumer) {
      var sourceRoot = aSourceMapConsumer.sourceRoot;
      var generator = new SourceMapGenerator({
        file: aSourceMapConsumer.file,
        sourceRoot
      });
      aSourceMapConsumer.eachMapping(function(mapping) {
        var newMapping = {
          generated: {
            line: mapping.generatedLine,
            column: mapping.generatedColumn
          }
        };
        if (mapping.source != null) {
          newMapping.source = mapping.source;
          if (sourceRoot != null) {
            newMapping.source = util2.relative(sourceRoot, newMapping.source);
          }
          newMapping.original = {
            line: mapping.originalLine,
            column: mapping.originalColumn
          };
          if (mapping.name != null) {
            newMapping.name = mapping.name;
          }
        }
        generator.addMapping(newMapping);
      });
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var sourceRelative = sourceFile;
        if (sourceRoot !== null) {
          sourceRelative = util2.relative(sourceRoot, sourceFile);
        }
        if (!generator._sources.has(sourceRelative)) {
          generator._sources.add(sourceRelative);
        }
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          generator.setSourceContent(sourceFile, content);
        }
      });
      return generator;
    };
    SourceMapGenerator.prototype.addMapping = function SourceMapGenerator_addMapping(aArgs) {
      var generated = util2.getArg(aArgs, "generated");
      var original = util2.getArg(aArgs, "original", null);
      var source = util2.getArg(aArgs, "source", null);
      var name = util2.getArg(aArgs, "name", null);
      if (!this._skipValidation) {
        this._validateMapping(generated, original, source, name);
      }
      if (source != null) {
        source = String(source);
        if (!this._sources.has(source)) {
          this._sources.add(source);
        }
      }
      if (name != null) {
        name = String(name);
        if (!this._names.has(name)) {
          this._names.add(name);
        }
      }
      this._mappings.add({
        generatedLine: generated.line,
        generatedColumn: generated.column,
        originalLine: original != null && original.line,
        originalColumn: original != null && original.column,
        source,
        name
      });
    };
    SourceMapGenerator.prototype.setSourceContent = function SourceMapGenerator_setSourceContent(aSourceFile, aSourceContent) {
      var source = aSourceFile;
      if (this._sourceRoot != null) {
        source = util2.relative(this._sourceRoot, source);
      }
      if (aSourceContent != null) {
        if (!this._sourcesContents) {
          this._sourcesContents = /* @__PURE__ */ Object.create(null);
        }
        this._sourcesContents[util2.toSetString(source)] = aSourceContent;
      } else if (this._sourcesContents) {
        delete this._sourcesContents[util2.toSetString(source)];
        if (Object.keys(this._sourcesContents).length === 0) {
          this._sourcesContents = null;
        }
      }
    };
    SourceMapGenerator.prototype.applySourceMap = function SourceMapGenerator_applySourceMap(aSourceMapConsumer, aSourceFile, aSourceMapPath) {
      var sourceFile = aSourceFile;
      if (aSourceFile == null) {
        if (aSourceMapConsumer.file == null) {
          throw new Error(
            `SourceMapGenerator.prototype.applySourceMap requires either an explicit source file, or the source map's "file" property. Both were omitted.`
          );
        }
        sourceFile = aSourceMapConsumer.file;
      }
      var sourceRoot = this._sourceRoot;
      if (sourceRoot != null) {
        sourceFile = util2.relative(sourceRoot, sourceFile);
      }
      var newSources = new ArraySet();
      var newNames = new ArraySet();
      this._mappings.unsortedForEach(function(mapping) {
        if (mapping.source === sourceFile && mapping.originalLine != null) {
          var original = aSourceMapConsumer.originalPositionFor({
            line: mapping.originalLine,
            column: mapping.originalColumn
          });
          if (original.source != null) {
            mapping.source = original.source;
            if (aSourceMapPath != null) {
              mapping.source = util2.join(aSourceMapPath, mapping.source);
            }
            if (sourceRoot != null) {
              mapping.source = util2.relative(sourceRoot, mapping.source);
            }
            mapping.originalLine = original.line;
            mapping.originalColumn = original.column;
            if (original.name != null) {
              mapping.name = original.name;
            }
          }
        }
        var source = mapping.source;
        if (source != null && !newSources.has(source)) {
          newSources.add(source);
        }
        var name = mapping.name;
        if (name != null && !newNames.has(name)) {
          newNames.add(name);
        }
      }, this);
      this._sources = newSources;
      this._names = newNames;
      aSourceMapConsumer.sources.forEach(function(sourceFile2) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile2);
        if (content != null) {
          if (aSourceMapPath != null) {
            sourceFile2 = util2.join(aSourceMapPath, sourceFile2);
          }
          if (sourceRoot != null) {
            sourceFile2 = util2.relative(sourceRoot, sourceFile2);
          }
          this.setSourceContent(sourceFile2, content);
        }
      }, this);
    };
    SourceMapGenerator.prototype._validateMapping = function SourceMapGenerator_validateMapping(aGenerated, aOriginal, aSource, aName) {
      if (aOriginal && typeof aOriginal.line !== "number" && typeof aOriginal.column !== "number") {
        throw new Error(
          "original.line and original.column are not numbers -- you probably meant to omit the original mapping entirely and only map the generated position. If so, pass null for the original mapping instead of an object with empty or null values."
        );
      }
      if (aGenerated && "line" in aGenerated && "column" in aGenerated && aGenerated.line > 0 && aGenerated.column >= 0 && !aOriginal && !aSource && !aName) {
        return;
      } else if (aGenerated && "line" in aGenerated && "column" in aGenerated && aOriginal && "line" in aOriginal && "column" in aOriginal && aGenerated.line > 0 && aGenerated.column >= 0 && aOriginal.line > 0 && aOriginal.column >= 0 && aSource) {
        return;
      } else {
        throw new Error("Invalid mapping: " + JSON.stringify({
          generated: aGenerated,
          source: aSource,
          original: aOriginal,
          name: aName
        }));
      }
    };
    SourceMapGenerator.prototype._serializeMappings = function SourceMapGenerator_serializeMappings() {
      var previousGeneratedColumn = 0;
      var previousGeneratedLine = 1;
      var previousOriginalColumn = 0;
      var previousOriginalLine = 0;
      var previousName = 0;
      var previousSource = 0;
      var result = "";
      var next;
      var mapping;
      var nameIdx;
      var sourceIdx;
      var mappings = this._mappings.toArray();
      for (var i2 = 0, len = mappings.length; i2 < len; i2++) {
        mapping = mappings[i2];
        next = "";
        if (mapping.generatedLine !== previousGeneratedLine) {
          previousGeneratedColumn = 0;
          while (mapping.generatedLine !== previousGeneratedLine) {
            next += ";";
            previousGeneratedLine++;
          }
        } else {
          if (i2 > 0) {
            if (!util2.compareByGeneratedPositionsInflated(mapping, mappings[i2 - 1])) {
              continue;
            }
            next += ",";
          }
        }
        next += base64VLQ.encode(mapping.generatedColumn - previousGeneratedColumn);
        previousGeneratedColumn = mapping.generatedColumn;
        if (mapping.source != null) {
          sourceIdx = this._sources.indexOf(mapping.source);
          next += base64VLQ.encode(sourceIdx - previousSource);
          previousSource = sourceIdx;
          next += base64VLQ.encode(mapping.originalLine - 1 - previousOriginalLine);
          previousOriginalLine = mapping.originalLine - 1;
          next += base64VLQ.encode(mapping.originalColumn - previousOriginalColumn);
          previousOriginalColumn = mapping.originalColumn;
          if (mapping.name != null) {
            nameIdx = this._names.indexOf(mapping.name);
            next += base64VLQ.encode(nameIdx - previousName);
            previousName = nameIdx;
          }
        }
        result += next;
      }
      return result;
    };
    SourceMapGenerator.prototype._generateSourcesContent = function SourceMapGenerator_generateSourcesContent(aSources, aSourceRoot) {
      return aSources.map(function(source) {
        if (!this._sourcesContents) {
          return null;
        }
        if (aSourceRoot != null) {
          source = util2.relative(aSourceRoot, source);
        }
        var key = util2.toSetString(source);
        return Object.prototype.hasOwnProperty.call(this._sourcesContents, key) ? this._sourcesContents[key] : null;
      }, this);
    };
    SourceMapGenerator.prototype.toJSON = function SourceMapGenerator_toJSON() {
      var map = {
        version: this._version,
        sources: this._sources.toArray(),
        names: this._names.toArray(),
        mappings: this._serializeMappings()
      };
      if (this._file != null) {
        map.file = this._file;
      }
      if (this._sourceRoot != null) {
        map.sourceRoot = this._sourceRoot;
      }
      if (this._sourcesContents) {
        map.sourcesContent = this._generateSourcesContent(map.sources, map.sourceRoot);
      }
      return map;
    };
    SourceMapGenerator.prototype.toString = function SourceMapGenerator_toString() {
      return JSON.stringify(this.toJSON());
    };
    sourceMapGenerator.SourceMapGenerator = SourceMapGenerator;
    return sourceMapGenerator;
  }
  var sourceMapConsumer = {};
  var binarySearch = {};
  var hasRequiredBinarySearch;
  function requireBinarySearch() {
    if (hasRequiredBinarySearch)
      return binarySearch;
    hasRequiredBinarySearch = 1;
    (function(exports) {
      exports.GREATEST_LOWER_BOUND = 1;
      exports.LEAST_UPPER_BOUND = 2;
      function recursiveSearch(aLow, aHigh, aNeedle, aHaystack, aCompare, aBias) {
        var mid = Math.floor((aHigh - aLow) / 2) + aLow;
        var cmp = aCompare(aNeedle, aHaystack[mid], true);
        if (cmp === 0) {
          return mid;
        } else if (cmp > 0) {
          if (aHigh - mid > 1) {
            return recursiveSearch(mid, aHigh, aNeedle, aHaystack, aCompare, aBias);
          }
          if (aBias == exports.LEAST_UPPER_BOUND) {
            return aHigh < aHaystack.length ? aHigh : -1;
          } else {
            return mid;
          }
        } else {
          if (mid - aLow > 1) {
            return recursiveSearch(aLow, mid, aNeedle, aHaystack, aCompare, aBias);
          }
          if (aBias == exports.LEAST_UPPER_BOUND) {
            return mid;
          } else {
            return aLow < 0 ? -1 : aLow;
          }
        }
      }
      exports.search = function search(aNeedle, aHaystack, aCompare, aBias) {
        if (aHaystack.length === 0) {
          return -1;
        }
        var index = recursiveSearch(
          -1,
          aHaystack.length,
          aNeedle,
          aHaystack,
          aCompare,
          aBias || exports.GREATEST_LOWER_BOUND
        );
        if (index < 0) {
          return -1;
        }
        while (index - 1 >= 0) {
          if (aCompare(aHaystack[index], aHaystack[index - 1], true) !== 0) {
            break;
          }
          --index;
        }
        return index;
      };
    })(binarySearch);
    return binarySearch;
  }
  var quickSort = {};
  var hasRequiredQuickSort;
  function requireQuickSort() {
    if (hasRequiredQuickSort)
      return quickSort;
    hasRequiredQuickSort = 1;
    function swap(ary, x2, y2) {
      var temp = ary[x2];
      ary[x2] = ary[y2];
      ary[y2] = temp;
    }
    function randomIntInRange(low, high) {
      return Math.round(low + Math.random() * (high - low));
    }
    function doQuickSort(ary, comparator, p2, r2) {
      if (p2 < r2) {
        var pivotIndex = randomIntInRange(p2, r2);
        var i2 = p2 - 1;
        swap(ary, pivotIndex, r2);
        var pivot = ary[r2];
        for (var j2 = p2; j2 < r2; j2++) {
          if (comparator(ary[j2], pivot) <= 0) {
            i2 += 1;
            swap(ary, i2, j2);
          }
        }
        swap(ary, i2 + 1, j2);
        var q = i2 + 1;
        doQuickSort(ary, comparator, p2, q - 1);
        doQuickSort(ary, comparator, q + 1, r2);
      }
    }
    quickSort.quickSort = function(ary, comparator) {
      doQuickSort(ary, comparator, 0, ary.length - 1);
    };
    return quickSort;
  }
  var hasRequiredSourceMapConsumer;
  function requireSourceMapConsumer() {
    if (hasRequiredSourceMapConsumer)
      return sourceMapConsumer;
    hasRequiredSourceMapConsumer = 1;
    var util2 = requireUtil();
    var binarySearch2 = requireBinarySearch();
    var ArraySet = requireArraySet().ArraySet;
    var base64VLQ = requireBase64Vlq();
    var quickSort2 = requireQuickSort().quickSort;
    function SourceMapConsumer(aSourceMap, aSourceMapURL) {
      var sourceMap2 = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap2 = util2.parseSourceMapInput(aSourceMap);
      }
      return sourceMap2.sections != null ? new IndexedSourceMapConsumer(sourceMap2, aSourceMapURL) : new BasicSourceMapConsumer(sourceMap2, aSourceMapURL);
    }
    SourceMapConsumer.fromSourceMap = function(aSourceMap, aSourceMapURL) {
      return BasicSourceMapConsumer.fromSourceMap(aSourceMap, aSourceMapURL);
    };
    SourceMapConsumer.prototype._version = 3;
    SourceMapConsumer.prototype.__generatedMappings = null;
    Object.defineProperty(SourceMapConsumer.prototype, "_generatedMappings", {
      configurable: true,
      enumerable: true,
      get: function() {
        if (!this.__generatedMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }
        return this.__generatedMappings;
      }
    });
    SourceMapConsumer.prototype.__originalMappings = null;
    Object.defineProperty(SourceMapConsumer.prototype, "_originalMappings", {
      configurable: true,
      enumerable: true,
      get: function() {
        if (!this.__originalMappings) {
          this._parseMappings(this._mappings, this.sourceRoot);
        }
        return this.__originalMappings;
      }
    });
    SourceMapConsumer.prototype._charIsMappingSeparator = function SourceMapConsumer_charIsMappingSeparator(aStr, index) {
      var c2 = aStr.charAt(index);
      return c2 === ";" || c2 === ",";
    };
    SourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      throw new Error("Subclasses must implement _parseMappings");
    };
    SourceMapConsumer.GENERATED_ORDER = 1;
    SourceMapConsumer.ORIGINAL_ORDER = 2;
    SourceMapConsumer.GREATEST_LOWER_BOUND = 1;
    SourceMapConsumer.LEAST_UPPER_BOUND = 2;
    SourceMapConsumer.prototype.eachMapping = function SourceMapConsumer_eachMapping(aCallback, aContext, aOrder) {
      var context = aContext || null;
      var order = aOrder || SourceMapConsumer.GENERATED_ORDER;
      var mappings;
      switch (order) {
        case SourceMapConsumer.GENERATED_ORDER:
          mappings = this._generatedMappings;
          break;
        case SourceMapConsumer.ORIGINAL_ORDER:
          mappings = this._originalMappings;
          break;
        default:
          throw new Error("Unknown order of iteration.");
      }
      var sourceRoot = this.sourceRoot;
      mappings.map(function(mapping) {
        var source = mapping.source === null ? null : this._sources.at(mapping.source);
        source = util2.computeSourceURL(sourceRoot, source, this._sourceMapURL);
        return {
          source,
          generatedLine: mapping.generatedLine,
          generatedColumn: mapping.generatedColumn,
          originalLine: mapping.originalLine,
          originalColumn: mapping.originalColumn,
          name: mapping.name === null ? null : this._names.at(mapping.name)
        };
      }, this).forEach(aCallback, context);
    };
    SourceMapConsumer.prototype.allGeneratedPositionsFor = function SourceMapConsumer_allGeneratedPositionsFor(aArgs) {
      var line = util2.getArg(aArgs, "line");
      var needle = {
        source: util2.getArg(aArgs, "source"),
        originalLine: line,
        originalColumn: util2.getArg(aArgs, "column", 0)
      };
      needle.source = this._findSourceIndex(needle.source);
      if (needle.source < 0) {
        return [];
      }
      var mappings = [];
      var index = this._findMapping(
        needle,
        this._originalMappings,
        "originalLine",
        "originalColumn",
        util2.compareByOriginalPositions,
        binarySearch2.LEAST_UPPER_BOUND
      );
      if (index >= 0) {
        var mapping = this._originalMappings[index];
        if (aArgs.column === void 0) {
          var originalLine = mapping.originalLine;
          while (mapping && mapping.originalLine === originalLine) {
            mappings.push({
              line: util2.getArg(mapping, "generatedLine", null),
              column: util2.getArg(mapping, "generatedColumn", null),
              lastColumn: util2.getArg(mapping, "lastGeneratedColumn", null)
            });
            mapping = this._originalMappings[++index];
          }
        } else {
          var originalColumn = mapping.originalColumn;
          while (mapping && mapping.originalLine === line && mapping.originalColumn == originalColumn) {
            mappings.push({
              line: util2.getArg(mapping, "generatedLine", null),
              column: util2.getArg(mapping, "generatedColumn", null),
              lastColumn: util2.getArg(mapping, "lastGeneratedColumn", null)
            });
            mapping = this._originalMappings[++index];
          }
        }
      }
      return mappings;
    };
    sourceMapConsumer.SourceMapConsumer = SourceMapConsumer;
    function BasicSourceMapConsumer(aSourceMap, aSourceMapURL) {
      var sourceMap2 = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap2 = util2.parseSourceMapInput(aSourceMap);
      }
      var version = util2.getArg(sourceMap2, "version");
      var sources = util2.getArg(sourceMap2, "sources");
      var names = util2.getArg(sourceMap2, "names", []);
      var sourceRoot = util2.getArg(sourceMap2, "sourceRoot", null);
      var sourcesContent = util2.getArg(sourceMap2, "sourcesContent", null);
      var mappings = util2.getArg(sourceMap2, "mappings");
      var file = util2.getArg(sourceMap2, "file", null);
      if (version != this._version) {
        throw new Error("Unsupported version: " + version);
      }
      if (sourceRoot) {
        sourceRoot = util2.normalize(sourceRoot);
      }
      sources = sources.map(String).map(util2.normalize).map(function(source) {
        return sourceRoot && util2.isAbsolute(sourceRoot) && util2.isAbsolute(source) ? util2.relative(sourceRoot, source) : source;
      });
      this._names = ArraySet.fromArray(names.map(String), true);
      this._sources = ArraySet.fromArray(sources, true);
      this._absoluteSources = this._sources.toArray().map(function(s2) {
        return util2.computeSourceURL(sourceRoot, s2, aSourceMapURL);
      });
      this.sourceRoot = sourceRoot;
      this.sourcesContent = sourcesContent;
      this._mappings = mappings;
      this._sourceMapURL = aSourceMapURL;
      this.file = file;
    }
    BasicSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
    BasicSourceMapConsumer.prototype.consumer = SourceMapConsumer;
    BasicSourceMapConsumer.prototype._findSourceIndex = function(aSource) {
      var relativeSource = aSource;
      if (this.sourceRoot != null) {
        relativeSource = util2.relative(this.sourceRoot, relativeSource);
      }
      if (this._sources.has(relativeSource)) {
        return this._sources.indexOf(relativeSource);
      }
      var i2;
      for (i2 = 0; i2 < this._absoluteSources.length; ++i2) {
        if (this._absoluteSources[i2] == aSource) {
          return i2;
        }
      }
      return -1;
    };
    BasicSourceMapConsumer.fromSourceMap = function SourceMapConsumer_fromSourceMap(aSourceMap, aSourceMapURL) {
      var smc = Object.create(BasicSourceMapConsumer.prototype);
      var names = smc._names = ArraySet.fromArray(aSourceMap._names.toArray(), true);
      var sources = smc._sources = ArraySet.fromArray(aSourceMap._sources.toArray(), true);
      smc.sourceRoot = aSourceMap._sourceRoot;
      smc.sourcesContent = aSourceMap._generateSourcesContent(
        smc._sources.toArray(),
        smc.sourceRoot
      );
      smc.file = aSourceMap._file;
      smc._sourceMapURL = aSourceMapURL;
      smc._absoluteSources = smc._sources.toArray().map(function(s2) {
        return util2.computeSourceURL(smc.sourceRoot, s2, aSourceMapURL);
      });
      var generatedMappings = aSourceMap._mappings.toArray().slice();
      var destGeneratedMappings = smc.__generatedMappings = [];
      var destOriginalMappings = smc.__originalMappings = [];
      for (var i2 = 0, length = generatedMappings.length; i2 < length; i2++) {
        var srcMapping = generatedMappings[i2];
        var destMapping = new Mapping();
        destMapping.generatedLine = srcMapping.generatedLine;
        destMapping.generatedColumn = srcMapping.generatedColumn;
        if (srcMapping.source) {
          destMapping.source = sources.indexOf(srcMapping.source);
          destMapping.originalLine = srcMapping.originalLine;
          destMapping.originalColumn = srcMapping.originalColumn;
          if (srcMapping.name) {
            destMapping.name = names.indexOf(srcMapping.name);
          }
          destOriginalMappings.push(destMapping);
        }
        destGeneratedMappings.push(destMapping);
      }
      quickSort2(smc.__originalMappings, util2.compareByOriginalPositions);
      return smc;
    };
    BasicSourceMapConsumer.prototype._version = 3;
    Object.defineProperty(BasicSourceMapConsumer.prototype, "sources", {
      get: function() {
        return this._absoluteSources.slice();
      }
    });
    function Mapping() {
      this.generatedLine = 0;
      this.generatedColumn = 0;
      this.source = null;
      this.originalLine = null;
      this.originalColumn = null;
      this.name = null;
    }
    BasicSourceMapConsumer.prototype._parseMappings = function SourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      var generatedLine = 1;
      var previousGeneratedColumn = 0;
      var previousOriginalLine = 0;
      var previousOriginalColumn = 0;
      var previousSource = 0;
      var previousName = 0;
      var length = aStr.length;
      var index = 0;
      var cachedSegments = {};
      var temp = {};
      var originalMappings = [];
      var generatedMappings = [];
      var mapping, str, segment, end, value;
      while (index < length) {
        if (aStr.charAt(index) === ";") {
          generatedLine++;
          index++;
          previousGeneratedColumn = 0;
        } else if (aStr.charAt(index) === ",") {
          index++;
        } else {
          mapping = new Mapping();
          mapping.generatedLine = generatedLine;
          for (end = index; end < length; end++) {
            if (this._charIsMappingSeparator(aStr, end)) {
              break;
            }
          }
          str = aStr.slice(index, end);
          segment = cachedSegments[str];
          if (segment) {
            index += str.length;
          } else {
            segment = [];
            while (index < end) {
              base64VLQ.decode(aStr, index, temp);
              value = temp.value;
              index = temp.rest;
              segment.push(value);
            }
            if (segment.length === 2) {
              throw new Error("Found a source, but no line and column");
            }
            if (segment.length === 3) {
              throw new Error("Found a source and line, but no column");
            }
            cachedSegments[str] = segment;
          }
          mapping.generatedColumn = previousGeneratedColumn + segment[0];
          previousGeneratedColumn = mapping.generatedColumn;
          if (segment.length > 1) {
            mapping.source = previousSource + segment[1];
            previousSource += segment[1];
            mapping.originalLine = previousOriginalLine + segment[2];
            previousOriginalLine = mapping.originalLine;
            mapping.originalLine += 1;
            mapping.originalColumn = previousOriginalColumn + segment[3];
            previousOriginalColumn = mapping.originalColumn;
            if (segment.length > 4) {
              mapping.name = previousName + segment[4];
              previousName += segment[4];
            }
          }
          generatedMappings.push(mapping);
          if (typeof mapping.originalLine === "number") {
            originalMappings.push(mapping);
          }
        }
      }
      quickSort2(generatedMappings, util2.compareByGeneratedPositionsDeflated);
      this.__generatedMappings = generatedMappings;
      quickSort2(originalMappings, util2.compareByOriginalPositions);
      this.__originalMappings = originalMappings;
    };
    BasicSourceMapConsumer.prototype._findMapping = function SourceMapConsumer_findMapping(aNeedle, aMappings, aLineName, aColumnName, aComparator, aBias) {
      if (aNeedle[aLineName] <= 0) {
        throw new TypeError("Line must be greater than or equal to 1, got " + aNeedle[aLineName]);
      }
      if (aNeedle[aColumnName] < 0) {
        throw new TypeError("Column must be greater than or equal to 0, got " + aNeedle[aColumnName]);
      }
      return binarySearch2.search(aNeedle, aMappings, aComparator, aBias);
    };
    BasicSourceMapConsumer.prototype.computeColumnSpans = function SourceMapConsumer_computeColumnSpans() {
      for (var index = 0; index < this._generatedMappings.length; ++index) {
        var mapping = this._generatedMappings[index];
        if (index + 1 < this._generatedMappings.length) {
          var nextMapping = this._generatedMappings[index + 1];
          if (mapping.generatedLine === nextMapping.generatedLine) {
            mapping.lastGeneratedColumn = nextMapping.generatedColumn - 1;
            continue;
          }
        }
        mapping.lastGeneratedColumn = Infinity;
      }
    };
    BasicSourceMapConsumer.prototype.originalPositionFor = function SourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util2.getArg(aArgs, "line"),
        generatedColumn: util2.getArg(aArgs, "column")
      };
      var index = this._findMapping(
        needle,
        this._generatedMappings,
        "generatedLine",
        "generatedColumn",
        util2.compareByGeneratedPositionsDeflated,
        util2.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND)
      );
      if (index >= 0) {
        var mapping = this._generatedMappings[index];
        if (mapping.generatedLine === needle.generatedLine) {
          var source = util2.getArg(mapping, "source", null);
          if (source !== null) {
            source = this._sources.at(source);
            source = util2.computeSourceURL(this.sourceRoot, source, this._sourceMapURL);
          }
          var name = util2.getArg(mapping, "name", null);
          if (name !== null) {
            name = this._names.at(name);
          }
          return {
            source,
            line: util2.getArg(mapping, "originalLine", null),
            column: util2.getArg(mapping, "originalColumn", null),
            name
          };
        }
      }
      return {
        source: null,
        line: null,
        column: null,
        name: null
      };
    };
    BasicSourceMapConsumer.prototype.hasContentsOfAllSources = function BasicSourceMapConsumer_hasContentsOfAllSources() {
      if (!this.sourcesContent) {
        return false;
      }
      return this.sourcesContent.length >= this._sources.size() && !this.sourcesContent.some(function(sc) {
        return sc == null;
      });
    };
    BasicSourceMapConsumer.prototype.sourceContentFor = function SourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      if (!this.sourcesContent) {
        return null;
      }
      var index = this._findSourceIndex(aSource);
      if (index >= 0) {
        return this.sourcesContent[index];
      }
      var relativeSource = aSource;
      if (this.sourceRoot != null) {
        relativeSource = util2.relative(this.sourceRoot, relativeSource);
      }
      var url;
      if (this.sourceRoot != null && (url = util2.urlParse(this.sourceRoot))) {
        var fileUriAbsPath = relativeSource.replace(/^file:\/\//, "");
        if (url.scheme == "file" && this._sources.has(fileUriAbsPath)) {
          return this.sourcesContent[this._sources.indexOf(fileUriAbsPath)];
        }
        if ((!url.path || url.path == "/") && this._sources.has("/" + relativeSource)) {
          return this.sourcesContent[this._sources.indexOf("/" + relativeSource)];
        }
      }
      if (nullOnMissing) {
        return null;
      } else {
        throw new Error('"' + relativeSource + '" is not in the SourceMap.');
      }
    };
    BasicSourceMapConsumer.prototype.generatedPositionFor = function SourceMapConsumer_generatedPositionFor(aArgs) {
      var source = util2.getArg(aArgs, "source");
      source = this._findSourceIndex(source);
      if (source < 0) {
        return {
          line: null,
          column: null,
          lastColumn: null
        };
      }
      var needle = {
        source,
        originalLine: util2.getArg(aArgs, "line"),
        originalColumn: util2.getArg(aArgs, "column")
      };
      var index = this._findMapping(
        needle,
        this._originalMappings,
        "originalLine",
        "originalColumn",
        util2.compareByOriginalPositions,
        util2.getArg(aArgs, "bias", SourceMapConsumer.GREATEST_LOWER_BOUND)
      );
      if (index >= 0) {
        var mapping = this._originalMappings[index];
        if (mapping.source === needle.source) {
          return {
            line: util2.getArg(mapping, "generatedLine", null),
            column: util2.getArg(mapping, "generatedColumn", null),
            lastColumn: util2.getArg(mapping, "lastGeneratedColumn", null)
          };
        }
      }
      return {
        line: null,
        column: null,
        lastColumn: null
      };
    };
    sourceMapConsumer.BasicSourceMapConsumer = BasicSourceMapConsumer;
    function IndexedSourceMapConsumer(aSourceMap, aSourceMapURL) {
      var sourceMap2 = aSourceMap;
      if (typeof aSourceMap === "string") {
        sourceMap2 = util2.parseSourceMapInput(aSourceMap);
      }
      var version = util2.getArg(sourceMap2, "version");
      var sections = util2.getArg(sourceMap2, "sections");
      if (version != this._version) {
        throw new Error("Unsupported version: " + version);
      }
      this._sources = new ArraySet();
      this._names = new ArraySet();
      var lastOffset = {
        line: -1,
        column: 0
      };
      this._sections = sections.map(function(s2) {
        if (s2.url) {
          throw new Error("Support for url field in sections not implemented.");
        }
        var offset = util2.getArg(s2, "offset");
        var offsetLine = util2.getArg(offset, "line");
        var offsetColumn = util2.getArg(offset, "column");
        if (offsetLine < lastOffset.line || offsetLine === lastOffset.line && offsetColumn < lastOffset.column) {
          throw new Error("Section offsets must be ordered and non-overlapping.");
        }
        lastOffset = offset;
        return {
          generatedOffset: {
            // The offset fields are 0-based, but we use 1-based indices when
            // encoding/decoding from VLQ.
            generatedLine: offsetLine + 1,
            generatedColumn: offsetColumn + 1
          },
          consumer: new SourceMapConsumer(util2.getArg(s2, "map"), aSourceMapURL)
        };
      });
    }
    IndexedSourceMapConsumer.prototype = Object.create(SourceMapConsumer.prototype);
    IndexedSourceMapConsumer.prototype.constructor = SourceMapConsumer;
    IndexedSourceMapConsumer.prototype._version = 3;
    Object.defineProperty(IndexedSourceMapConsumer.prototype, "sources", {
      get: function() {
        var sources = [];
        for (var i2 = 0; i2 < this._sections.length; i2++) {
          for (var j2 = 0; j2 < this._sections[i2].consumer.sources.length; j2++) {
            sources.push(this._sections[i2].consumer.sources[j2]);
          }
        }
        return sources;
      }
    });
    IndexedSourceMapConsumer.prototype.originalPositionFor = function IndexedSourceMapConsumer_originalPositionFor(aArgs) {
      var needle = {
        generatedLine: util2.getArg(aArgs, "line"),
        generatedColumn: util2.getArg(aArgs, "column")
      };
      var sectionIndex = binarySearch2.search(
        needle,
        this._sections,
        function(needle2, section2) {
          var cmp = needle2.generatedLine - section2.generatedOffset.generatedLine;
          if (cmp) {
            return cmp;
          }
          return needle2.generatedColumn - section2.generatedOffset.generatedColumn;
        }
      );
      var section = this._sections[sectionIndex];
      if (!section) {
        return {
          source: null,
          line: null,
          column: null,
          name: null
        };
      }
      return section.consumer.originalPositionFor({
        line: needle.generatedLine - (section.generatedOffset.generatedLine - 1),
        column: needle.generatedColumn - (section.generatedOffset.generatedLine === needle.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
        bias: aArgs.bias
      });
    };
    IndexedSourceMapConsumer.prototype.hasContentsOfAllSources = function IndexedSourceMapConsumer_hasContentsOfAllSources() {
      return this._sections.every(function(s2) {
        return s2.consumer.hasContentsOfAllSources();
      });
    };
    IndexedSourceMapConsumer.prototype.sourceContentFor = function IndexedSourceMapConsumer_sourceContentFor(aSource, nullOnMissing) {
      for (var i2 = 0; i2 < this._sections.length; i2++) {
        var section = this._sections[i2];
        var content = section.consumer.sourceContentFor(aSource, true);
        if (content) {
          return content;
        }
      }
      if (nullOnMissing) {
        return null;
      } else {
        throw new Error('"' + aSource + '" is not in the SourceMap.');
      }
    };
    IndexedSourceMapConsumer.prototype.generatedPositionFor = function IndexedSourceMapConsumer_generatedPositionFor(aArgs) {
      for (var i2 = 0; i2 < this._sections.length; i2++) {
        var section = this._sections[i2];
        if (section.consumer._findSourceIndex(util2.getArg(aArgs, "source")) === -1) {
          continue;
        }
        var generatedPosition = section.consumer.generatedPositionFor(aArgs);
        if (generatedPosition) {
          var ret = {
            line: generatedPosition.line + (section.generatedOffset.generatedLine - 1),
            column: generatedPosition.column + (section.generatedOffset.generatedLine === generatedPosition.line ? section.generatedOffset.generatedColumn - 1 : 0)
          };
          return ret;
        }
      }
      return {
        line: null,
        column: null
      };
    };
    IndexedSourceMapConsumer.prototype._parseMappings = function IndexedSourceMapConsumer_parseMappings(aStr, aSourceRoot) {
      this.__generatedMappings = [];
      this.__originalMappings = [];
      for (var i2 = 0; i2 < this._sections.length; i2++) {
        var section = this._sections[i2];
        var sectionMappings = section.consumer._generatedMappings;
        for (var j2 = 0; j2 < sectionMappings.length; j2++) {
          var mapping = sectionMappings[j2];
          var source = section.consumer._sources.at(mapping.source);
          source = util2.computeSourceURL(section.consumer.sourceRoot, source, this._sourceMapURL);
          this._sources.add(source);
          source = this._sources.indexOf(source);
          var name = null;
          if (mapping.name) {
            name = section.consumer._names.at(mapping.name);
            this._names.add(name);
            name = this._names.indexOf(name);
          }
          var adjustedMapping = {
            source,
            generatedLine: mapping.generatedLine + (section.generatedOffset.generatedLine - 1),
            generatedColumn: mapping.generatedColumn + (section.generatedOffset.generatedLine === mapping.generatedLine ? section.generatedOffset.generatedColumn - 1 : 0),
            originalLine: mapping.originalLine,
            originalColumn: mapping.originalColumn,
            name
          };
          this.__generatedMappings.push(adjustedMapping);
          if (typeof adjustedMapping.originalLine === "number") {
            this.__originalMappings.push(adjustedMapping);
          }
        }
      }
      quickSort2(this.__generatedMappings, util2.compareByGeneratedPositionsDeflated);
      quickSort2(this.__originalMappings, util2.compareByOriginalPositions);
    };
    sourceMapConsumer.IndexedSourceMapConsumer = IndexedSourceMapConsumer;
    return sourceMapConsumer;
  }
  var sourceNode = {};
  var hasRequiredSourceNode;
  function requireSourceNode() {
    if (hasRequiredSourceNode)
      return sourceNode;
    hasRequiredSourceNode = 1;
    var SourceMapGenerator = requireSourceMapGenerator().SourceMapGenerator;
    var util2 = requireUtil();
    var REGEX_NEWLINE = /(\r?\n)/;
    var NEWLINE_CODE = 10;
    var isSourceNode = "$$$isSourceNode$$$";
    function SourceNode(aLine, aColumn, aSource, aChunks, aName) {
      this.children = [];
      this.sourceContents = {};
      this.line = aLine == null ? null : aLine;
      this.column = aColumn == null ? null : aColumn;
      this.source = aSource == null ? null : aSource;
      this.name = aName == null ? null : aName;
      this[isSourceNode] = true;
      if (aChunks != null)
        this.add(aChunks);
    }
    SourceNode.fromStringWithSourceMap = function SourceNode_fromStringWithSourceMap(aGeneratedCode, aSourceMapConsumer, aRelativePath) {
      var node = new SourceNode();
      var remainingLines = aGeneratedCode.split(REGEX_NEWLINE);
      var remainingLinesIndex = 0;
      var shiftNextLine = function() {
        var lineContents = getNextLine();
        var newLine = getNextLine() || "";
        return lineContents + newLine;
        function getNextLine() {
          return remainingLinesIndex < remainingLines.length ? remainingLines[remainingLinesIndex++] : void 0;
        }
      };
      var lastGeneratedLine = 1, lastGeneratedColumn = 0;
      var lastMapping = null;
      aSourceMapConsumer.eachMapping(function(mapping) {
        if (lastMapping !== null) {
          if (lastGeneratedLine < mapping.generatedLine) {
            addMappingWithCode(lastMapping, shiftNextLine());
            lastGeneratedLine++;
            lastGeneratedColumn = 0;
          } else {
            var nextLine = remainingLines[remainingLinesIndex] || "";
            var code = nextLine.substr(0, mapping.generatedColumn - lastGeneratedColumn);
            remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn - lastGeneratedColumn);
            lastGeneratedColumn = mapping.generatedColumn;
            addMappingWithCode(lastMapping, code);
            lastMapping = mapping;
            return;
          }
        }
        while (lastGeneratedLine < mapping.generatedLine) {
          node.add(shiftNextLine());
          lastGeneratedLine++;
        }
        if (lastGeneratedColumn < mapping.generatedColumn) {
          var nextLine = remainingLines[remainingLinesIndex] || "";
          node.add(nextLine.substr(0, mapping.generatedColumn));
          remainingLines[remainingLinesIndex] = nextLine.substr(mapping.generatedColumn);
          lastGeneratedColumn = mapping.generatedColumn;
        }
        lastMapping = mapping;
      }, this);
      if (remainingLinesIndex < remainingLines.length) {
        if (lastMapping) {
          addMappingWithCode(lastMapping, shiftNextLine());
        }
        node.add(remainingLines.splice(remainingLinesIndex).join(""));
      }
      aSourceMapConsumer.sources.forEach(function(sourceFile) {
        var content = aSourceMapConsumer.sourceContentFor(sourceFile);
        if (content != null) {
          if (aRelativePath != null) {
            sourceFile = util2.join(aRelativePath, sourceFile);
          }
          node.setSourceContent(sourceFile, content);
        }
      });
      return node;
      function addMappingWithCode(mapping, code) {
        if (mapping === null || mapping.source === void 0) {
          node.add(code);
        } else {
          var source = aRelativePath ? util2.join(aRelativePath, mapping.source) : mapping.source;
          node.add(new SourceNode(
            mapping.originalLine,
            mapping.originalColumn,
            source,
            code,
            mapping.name
          ));
        }
      }
    };
    SourceNode.prototype.add = function SourceNode_add(aChunk) {
      if (Array.isArray(aChunk)) {
        aChunk.forEach(function(chunk) {
          this.add(chunk);
        }, this);
      } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
        if (aChunk) {
          this.children.push(aChunk);
        }
      } else {
        throw new TypeError(
          "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
        );
      }
      return this;
    };
    SourceNode.prototype.prepend = function SourceNode_prepend(aChunk) {
      if (Array.isArray(aChunk)) {
        for (var i2 = aChunk.length - 1; i2 >= 0; i2--) {
          this.prepend(aChunk[i2]);
        }
      } else if (aChunk[isSourceNode] || typeof aChunk === "string") {
        this.children.unshift(aChunk);
      } else {
        throw new TypeError(
          "Expected a SourceNode, string, or an array of SourceNodes and strings. Got " + aChunk
        );
      }
      return this;
    };
    SourceNode.prototype.walk = function SourceNode_walk(aFn) {
      var chunk;
      for (var i2 = 0, len = this.children.length; i2 < len; i2++) {
        chunk = this.children[i2];
        if (chunk[isSourceNode]) {
          chunk.walk(aFn);
        } else {
          if (chunk !== "") {
            aFn(chunk, {
              source: this.source,
              line: this.line,
              column: this.column,
              name: this.name
            });
          }
        }
      }
    };
    SourceNode.prototype.join = function SourceNode_join(aSep) {
      var newChildren;
      var i2;
      var len = this.children.length;
      if (len > 0) {
        newChildren = [];
        for (i2 = 0; i2 < len - 1; i2++) {
          newChildren.push(this.children[i2]);
          newChildren.push(aSep);
        }
        newChildren.push(this.children[i2]);
        this.children = newChildren;
      }
      return this;
    };
    SourceNode.prototype.replaceRight = function SourceNode_replaceRight(aPattern, aReplacement) {
      var lastChild = this.children[this.children.length - 1];
      if (lastChild[isSourceNode]) {
        lastChild.replaceRight(aPattern, aReplacement);
      } else if (typeof lastChild === "string") {
        this.children[this.children.length - 1] = lastChild.replace(aPattern, aReplacement);
      } else {
        this.children.push("".replace(aPattern, aReplacement));
      }
      return this;
    };
    SourceNode.prototype.setSourceContent = function SourceNode_setSourceContent(aSourceFile, aSourceContent) {
      this.sourceContents[util2.toSetString(aSourceFile)] = aSourceContent;
    };
    SourceNode.prototype.walkSourceContents = function SourceNode_walkSourceContents(aFn) {
      for (var i2 = 0, len = this.children.length; i2 < len; i2++) {
        if (this.children[i2][isSourceNode]) {
          this.children[i2].walkSourceContents(aFn);
        }
      }
      var sources = Object.keys(this.sourceContents);
      for (var i2 = 0, len = sources.length; i2 < len; i2++) {
        aFn(util2.fromSetString(sources[i2]), this.sourceContents[sources[i2]]);
      }
    };
    SourceNode.prototype.toString = function SourceNode_toString() {
      var str = "";
      this.walk(function(chunk) {
        str += chunk;
      });
      return str;
    };
    SourceNode.prototype.toStringWithSourceMap = function SourceNode_toStringWithSourceMap(aArgs) {
      var generated = {
        code: "",
        line: 1,
        column: 0
      };
      var map = new SourceMapGenerator(aArgs);
      var sourceMappingActive = false;
      var lastOriginalSource = null;
      var lastOriginalLine = null;
      var lastOriginalColumn = null;
      var lastOriginalName = null;
      this.walk(function(chunk, original) {
        generated.code += chunk;
        if (original.source !== null && original.line !== null && original.column !== null) {
          if (lastOriginalSource !== original.source || lastOriginalLine !== original.line || lastOriginalColumn !== original.column || lastOriginalName !== original.name) {
            map.addMapping({
              source: original.source,
              original: {
                line: original.line,
                column: original.column
              },
              generated: {
                line: generated.line,
                column: generated.column
              },
              name: original.name
            });
          }
          lastOriginalSource = original.source;
          lastOriginalLine = original.line;
          lastOriginalColumn = original.column;
          lastOriginalName = original.name;
          sourceMappingActive = true;
        } else if (sourceMappingActive) {
          map.addMapping({
            generated: {
              line: generated.line,
              column: generated.column
            }
          });
          lastOriginalSource = null;
          sourceMappingActive = false;
        }
        for (var idx = 0, length = chunk.length; idx < length; idx++) {
          if (chunk.charCodeAt(idx) === NEWLINE_CODE) {
            generated.line++;
            generated.column = 0;
            if (idx + 1 === length) {
              lastOriginalSource = null;
              sourceMappingActive = false;
            } else if (sourceMappingActive) {
              map.addMapping({
                source: original.source,
                original: {
                  line: original.line,
                  column: original.column
                },
                generated: {
                  line: generated.line,
                  column: generated.column
                },
                name: original.name
              });
            }
          } else {
            generated.column++;
          }
        }
      });
      this.walkSourceContents(function(sourceFile, sourceContent) {
        map.setSourceContent(sourceFile, sourceContent);
      });
      return { code: generated.code, map };
    };
    sourceNode.SourceNode = SourceNode;
    return sourceNode;
  }
  var hasRequiredSourceMap;
  function requireSourceMap() {
    if (hasRequiredSourceMap)
      return sourceMap;
    hasRequiredSourceMap = 1;
    sourceMap.SourceMapGenerator = requireSourceMapGenerator().SourceMapGenerator;
    sourceMap.SourceMapConsumer = requireSourceMapConsumer().SourceMapConsumer;
    sourceMap.SourceNode = requireSourceNode().SourceNode;
    return sourceMap;
  }
  (function(module, exports) {
    exports.__esModule = true;
    var _utils2 = utils;
    var SourceNode = void 0;
    try {
      if (true) {
        var SourceMap = requireSourceMap();
        SourceNode = SourceMap.SourceNode;
      }
    } catch (err) {
    }
    if (!SourceNode) {
      SourceNode = function(line, column, srcFile, chunks) {
        this.src = "";
        if (chunks) {
          this.add(chunks);
        }
      };
      SourceNode.prototype = {
        add: function add(chunks) {
          if (_utils2.isArray(chunks)) {
            chunks = chunks.join("");
          }
          this.src += chunks;
        },
        prepend: function prepend(chunks) {
          if (_utils2.isArray(chunks)) {
            chunks = chunks.join("");
          }
          this.src = chunks + this.src;
        },
        toStringWithSourceMap: function toStringWithSourceMap() {
          return { code: this.toString() };
        },
        toString: function toString2() {
          return this.src;
        }
      };
    }
    function castChunk(chunk, codeGen2, loc) {
      if (_utils2.isArray(chunk)) {
        var ret = [];
        for (var i2 = 0, len = chunk.length; i2 < len; i2++) {
          ret.push(codeGen2.wrap(chunk[i2], loc));
        }
        return ret;
      } else if (typeof chunk === "boolean" || typeof chunk === "number") {
        return chunk + "";
      }
      return chunk;
    }
    function CodeGen(srcFile) {
      this.srcFile = srcFile;
      this.source = [];
    }
    CodeGen.prototype = {
      isEmpty: function isEmpty2() {
        return !this.source.length;
      },
      prepend: function prepend(source, loc) {
        this.source.unshift(this.wrap(source, loc));
      },
      push: function push(source, loc) {
        this.source.push(this.wrap(source, loc));
      },
      merge: function merge2() {
        var source = this.empty();
        this.each(function(line) {
          source.add(["  ", line, "\n"]);
        });
        return source;
      },
      each: function each2(iter) {
        for (var i2 = 0, len = this.source.length; i2 < len; i2++) {
          iter(this.source[i2]);
        }
      },
      empty: function empty() {
        var loc = this.currentLocation || { start: {} };
        return new SourceNode(loc.start.line, loc.start.column, this.srcFile);
      },
      wrap: function wrap(chunk) {
        var loc = arguments.length <= 1 || arguments[1] === void 0 ? this.currentLocation || { start: {} } : arguments[1];
        if (chunk instanceof SourceNode) {
          return chunk;
        }
        chunk = castChunk(chunk, this, loc);
        return new SourceNode(loc.start.line, loc.start.column, this.srcFile, chunk);
      },
      functionCall: function functionCall(fn, type, params) {
        params = this.generateList(params);
        return this.wrap([fn, type ? "." + type + "(" : "(", params, ")"]);
      },
      quotedString: function quotedString(str) {
        return '"' + (str + "").replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\u2028/g, "\\u2028").replace(/\u2029/g, "\\u2029") + '"';
      },
      objectLiteral: function objectLiteral(obj) {
        var _this = this;
        var pairs = [];
        Object.keys(obj).forEach(function(key) {
          var value = castChunk(obj[key], _this);
          if (value !== "undefined") {
            pairs.push([_this.quotedString(key), ":", value]);
          }
        });
        var ret = this.generateList(pairs);
        ret.prepend("{");
        ret.add("}");
        return ret;
      },
      generateList: function generateList(entries) {
        var ret = this.empty();
        for (var i2 = 0, len = entries.length; i2 < len; i2++) {
          if (i2) {
            ret.add(",");
          }
          ret.add(castChunk(entries[i2], this));
        }
        return ret;
      },
      generateArray: function generateArray(entries) {
        var ret = this.generateList(entries);
        ret.prepend("[");
        ret.add("]");
        return ret;
      }
    };
    exports["default"] = CodeGen;
    module.exports = exports["default"];
  })(codeGen, codeGen.exports);
  var codeGenExports = codeGen.exports;
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _base2 = base$1;
    var _exception3 = exceptionExports;
    var _exception22 = _interopRequireDefault2(_exception3);
    var _utils2 = utils;
    var _codeGen = codeGenExports;
    var _codeGen2 = _interopRequireDefault2(_codeGen);
    function Literal(value) {
      this.value = value;
    }
    function JavaScriptCompiler() {
    }
    JavaScriptCompiler.prototype = {
      // PUBLIC API: You can override these methods in a subclass to provide
      // alternative compiled forms for name lookup and buffering semantics
      nameLookup: function nameLookup(parent, name) {
        return this.internalNameLookup(parent, name);
      },
      depthedLookup: function depthedLookup(name) {
        return [this.aliasable("container.lookup"), "(depths, ", JSON.stringify(name), ")"];
      },
      compilerInfo: function compilerInfo() {
        var revision = _base2.COMPILER_REVISION, versions = _base2.REVISION_CHANGES[revision];
        return [revision, versions];
      },
      appendToBuffer: function appendToBuffer(source, location2, explicit) {
        if (!_utils2.isArray(source)) {
          source = [source];
        }
        source = this.source.wrap(source, location2);
        if (this.environment.isSimple) {
          return ["return ", source, ";"];
        } else if (explicit) {
          return ["buffer += ", source, ";"];
        } else {
          source.appendToBuffer = true;
          return source;
        }
      },
      initializeBuffer: function initializeBuffer() {
        return this.quotedString("");
      },
      // END PUBLIC API
      internalNameLookup: function internalNameLookup(parent, name) {
        this.lookupPropertyFunctionIsUsed = true;
        return ["lookupProperty(", parent, ",", JSON.stringify(name), ")"];
      },
      lookupPropertyFunctionIsUsed: false,
      compile: function compile2(environment, options, context, asObject) {
        this.environment = environment;
        this.options = options;
        this.stringParams = this.options.stringParams;
        this.trackIds = this.options.trackIds;
        this.precompile = !asObject;
        this.name = this.environment.name;
        this.isChild = !!context;
        this.context = context || {
          decorators: [],
          programs: [],
          environments: []
        };
        this.preamble();
        this.stackSlot = 0;
        this.stackVars = [];
        this.aliases = {};
        this.registers = { list: [] };
        this.hashes = [];
        this.compileStack = [];
        this.inlineStack = [];
        this.blockParams = [];
        this.compileChildren(environment, options);
        this.useDepths = this.useDepths || environment.useDepths || environment.useDecorators || this.options.compat;
        this.useBlockParams = this.useBlockParams || environment.useBlockParams;
        var opcodes = environment.opcodes, opcode = void 0, firstLoc = void 0, i2 = void 0, l2 = void 0;
        for (i2 = 0, l2 = opcodes.length; i2 < l2; i2++) {
          opcode = opcodes[i2];
          this.source.currentLocation = opcode.loc;
          firstLoc = firstLoc || opcode.loc;
          this[opcode.opcode].apply(this, opcode.args);
        }
        this.source.currentLocation = firstLoc;
        this.pushSource("");
        if (this.stackSlot || this.inlineStack.length || this.compileStack.length) {
          throw new _exception22["default"]("Compile completed with content left on stack");
        }
        if (!this.decorators.isEmpty()) {
          this.useDecorators = true;
          this.decorators.prepend(["var decorators = container.decorators, ", this.lookupPropertyFunctionVarDeclaration(), ";\n"]);
          this.decorators.push("return fn;");
          if (asObject) {
            this.decorators = Function.apply(this, ["fn", "props", "container", "depth0", "data", "blockParams", "depths", this.decorators.merge()]);
          } else {
            this.decorators.prepend("function(fn, props, container, depth0, data, blockParams, depths) {\n");
            this.decorators.push("}\n");
            this.decorators = this.decorators.merge();
          }
        } else {
          this.decorators = void 0;
        }
        var fn = this.createFunctionContext(asObject);
        if (!this.isChild) {
          var ret = {
            compiler: this.compilerInfo(),
            main: fn
          };
          if (this.decorators) {
            ret.main_d = this.decorators;
            ret.useDecorators = true;
          }
          var _context = this.context;
          var programs = _context.programs;
          var decorators2 = _context.decorators;
          for (i2 = 0, l2 = programs.length; i2 < l2; i2++) {
            if (programs[i2]) {
              ret[i2] = programs[i2];
              if (decorators2[i2]) {
                ret[i2 + "_d"] = decorators2[i2];
                ret.useDecorators = true;
              }
            }
          }
          if (this.environment.usePartial) {
            ret.usePartial = true;
          }
          if (this.options.data) {
            ret.useData = true;
          }
          if (this.useDepths) {
            ret.useDepths = true;
          }
          if (this.useBlockParams) {
            ret.useBlockParams = true;
          }
          if (this.options.compat) {
            ret.compat = true;
          }
          if (!asObject) {
            ret.compiler = JSON.stringify(ret.compiler);
            this.source.currentLocation = { start: { line: 1, column: 0 } };
            ret = this.objectLiteral(ret);
            if (options.srcName) {
              ret = ret.toStringWithSourceMap({ file: options.destName });
              ret.map = ret.map && ret.map.toString();
            } else {
              ret = ret.toString();
            }
          } else {
            ret.compilerOptions = this.options;
          }
          return ret;
        } else {
          return fn;
        }
      },
      preamble: function preamble() {
        this.lastContext = 0;
        this.source = new _codeGen2["default"](this.options.srcName);
        this.decorators = new _codeGen2["default"](this.options.srcName);
      },
      createFunctionContext: function createFunctionContext(asObject) {
        var _this = this;
        var varDeclarations = "";
        var locals = this.stackVars.concat(this.registers.list);
        if (locals.length > 0) {
          varDeclarations += ", " + locals.join(", ");
        }
        var aliasCount = 0;
        Object.keys(this.aliases).forEach(function(alias) {
          var node = _this.aliases[alias];
          if (node.children && node.referenceCount > 1) {
            varDeclarations += ", alias" + ++aliasCount + "=" + alias;
            node.children[0] = "alias" + aliasCount;
          }
        });
        if (this.lookupPropertyFunctionIsUsed) {
          varDeclarations += ", " + this.lookupPropertyFunctionVarDeclaration();
        }
        var params = ["container", "depth0", "helpers", "partials", "data"];
        if (this.useBlockParams || this.useDepths) {
          params.push("blockParams");
        }
        if (this.useDepths) {
          params.push("depths");
        }
        var source = this.mergeSource(varDeclarations);
        if (asObject) {
          params.push(source);
          return Function.apply(this, params);
        } else {
          return this.source.wrap(["function(", params.join(","), ") {\n  ", source, "}"]);
        }
      },
      mergeSource: function mergeSource(varDeclarations) {
        var isSimple = this.environment.isSimple, appendOnly = !this.forceBuffer, appendFirst = void 0, sourceSeen = void 0, bufferStart = void 0, bufferEnd = void 0;
        this.source.each(function(line) {
          if (line.appendToBuffer) {
            if (bufferStart) {
              line.prepend("  + ");
            } else {
              bufferStart = line;
            }
            bufferEnd = line;
          } else {
            if (bufferStart) {
              if (!sourceSeen) {
                appendFirst = true;
              } else {
                bufferStart.prepend("buffer += ");
              }
              bufferEnd.add(";");
              bufferStart = bufferEnd = void 0;
            }
            sourceSeen = true;
            if (!isSimple) {
              appendOnly = false;
            }
          }
        });
        if (appendOnly) {
          if (bufferStart) {
            bufferStart.prepend("return ");
            bufferEnd.add(";");
          } else if (!sourceSeen) {
            this.source.push('return "";');
          }
        } else {
          varDeclarations += ", buffer = " + (appendFirst ? "" : this.initializeBuffer());
          if (bufferStart) {
            bufferStart.prepend("return buffer + ");
            bufferEnd.add(";");
          } else {
            this.source.push("return buffer;");
          }
        }
        if (varDeclarations) {
          this.source.prepend("var " + varDeclarations.substring(2) + (appendFirst ? "" : ";\n"));
        }
        return this.source.merge();
      },
      lookupPropertyFunctionVarDeclaration: function lookupPropertyFunctionVarDeclaration() {
        return "\n      lookupProperty = container.lookupProperty || function(parent, propertyName) {\n        if (Object.prototype.hasOwnProperty.call(parent, propertyName)) {\n          return parent[propertyName];\n        }\n        return undefined\n    }\n    ".trim();
      },
      // [blockValue]
      //
      // On stack, before: hash, inverse, program, value
      // On stack, after: return value of blockHelperMissing
      //
      // The purpose of this opcode is to take a block of the form
      // `{{#this.foo}}...{{/this.foo}}`, resolve the value of `foo`, and
      // replace it on the stack with the result of properly
      // invoking blockHelperMissing.
      blockValue: function blockValue(name) {
        var blockHelperMissing2 = this.aliasable("container.hooks.blockHelperMissing"), params = [this.contextName(0)];
        this.setupHelperArgs(name, 0, params);
        var blockName = this.popStack();
        params.splice(1, 0, blockName);
        this.push(this.source.functionCall(blockHelperMissing2, "call", params));
      },
      // [ambiguousBlockValue]
      //
      // On stack, before: hash, inverse, program, value
      // Compiler value, before: lastHelper=value of last found helper, if any
      // On stack, after, if no lastHelper: same as [blockValue]
      // On stack, after, if lastHelper: value
      ambiguousBlockValue: function ambiguousBlockValue() {
        var blockHelperMissing2 = this.aliasable("container.hooks.blockHelperMissing"), params = [this.contextName(0)];
        this.setupHelperArgs("", 0, params, true);
        this.flushInline();
        var current = this.topStack();
        params.splice(1, 0, current);
        this.pushSource(["if (!", this.lastHelper, ") { ", current, " = ", this.source.functionCall(blockHelperMissing2, "call", params), "}"]);
      },
      // [appendContent]
      //
      // On stack, before: ...
      // On stack, after: ...
      //
      // Appends the string value of `content` to the current buffer
      appendContent: function appendContent(content) {
        if (this.pendingContent) {
          content = this.pendingContent + content;
        } else {
          this.pendingLocation = this.source.currentLocation;
        }
        this.pendingContent = content;
      },
      // [append]
      //
      // On stack, before: value, ...
      // On stack, after: ...
      //
      // Coerces `value` to a String and appends it to the current buffer.
      //
      // If `value` is truthy, or 0, it is coerced into a string and appended
      // Otherwise, the empty string is appended
      append: function append() {
        if (this.isInline()) {
          this.replaceStack(function(current) {
            return [" != null ? ", current, ' : ""'];
          });
          this.pushSource(this.appendToBuffer(this.popStack()));
        } else {
          var local = this.popStack();
          this.pushSource(["if (", local, " != null) { ", this.appendToBuffer(local, void 0, true), " }"]);
          if (this.environment.isSimple) {
            this.pushSource(["else { ", this.appendToBuffer("''", void 0, true), " }"]);
          }
        }
      },
      // [appendEscaped]
      //
      // On stack, before: value, ...
      // On stack, after: ...
      //
      // Escape `value` and append it to the buffer
      appendEscaped: function appendEscaped() {
        this.pushSource(this.appendToBuffer([this.aliasable("container.escapeExpression"), "(", this.popStack(), ")"]));
      },
      // [getContext]
      //
      // On stack, before: ...
      // On stack, after: ...
      // Compiler value, after: lastContext=depth
      //
      // Set the value of the `lastContext` compiler value to the depth
      getContext: function getContext(depth) {
        this.lastContext = depth;
      },
      // [pushContext]
      //
      // On stack, before: ...
      // On stack, after: currentContext, ...
      //
      // Pushes the value of the current context onto the stack.
      pushContext: function pushContext() {
        this.pushStackLiteral(this.contextName(this.lastContext));
      },
      // [lookupOnContext]
      //
      // On stack, before: ...
      // On stack, after: currentContext[name], ...
      //
      // Looks up the value of `name` on the current context and pushes
      // it onto the stack.
      lookupOnContext: function lookupOnContext(parts, falsy, strict, scoped) {
        var i2 = 0;
        if (!scoped && this.options.compat && !this.lastContext) {
          this.push(this.depthedLookup(parts[i2++]));
        } else {
          this.pushContext();
        }
        this.resolvePath("context", parts, i2, falsy, strict);
      },
      // [lookupBlockParam]
      //
      // On stack, before: ...
      // On stack, after: blockParam[name], ...
      //
      // Looks up the value of `parts` on the given block param and pushes
      // it onto the stack.
      lookupBlockParam: function lookupBlockParam(blockParamId, parts) {
        this.useBlockParams = true;
        this.push(["blockParams[", blockParamId[0], "][", blockParamId[1], "]"]);
        this.resolvePath("context", parts, 1);
      },
      // [lookupData]
      //
      // On stack, before: ...
      // On stack, after: data, ...
      //
      // Push the data lookup operator
      lookupData: function lookupData(depth, parts, strict) {
        if (!depth) {
          this.pushStackLiteral("data");
        } else {
          this.pushStackLiteral("container.data(data, " + depth + ")");
        }
        this.resolvePath("data", parts, 0, true, strict);
      },
      resolvePath: function resolvePath(type, parts, i2, falsy, strict) {
        var _this2 = this;
        if (this.options.strict || this.options.assumeObjects) {
          this.push(strictLookup(this.options.strict && strict, this, parts, i2, type));
          return;
        }
        var len = parts.length;
        for (; i2 < len; i2++) {
          this.replaceStack(function(current) {
            var lookup2 = _this2.nameLookup(current, parts[i2], type);
            if (!falsy) {
              return [" != null ? ", lookup2, " : ", current];
            } else {
              return [" && ", lookup2];
            }
          });
        }
      },
      // [resolvePossibleLambda]
      //
      // On stack, before: value, ...
      // On stack, after: resolved value, ...
      //
      // If the `value` is a lambda, replace it on the stack by
      // the return value of the lambda
      resolvePossibleLambda: function resolvePossibleLambda() {
        this.push([this.aliasable("container.lambda"), "(", this.popStack(), ", ", this.contextName(0), ")"]);
      },
      // [pushStringParam]
      //
      // On stack, before: ...
      // On stack, after: string, currentContext, ...
      //
      // This opcode is designed for use in string mode, which
      // provides the string value of a parameter along with its
      // depth rather than resolving it immediately.
      pushStringParam: function pushStringParam(string, type) {
        this.pushContext();
        this.pushString(type);
        if (type !== "SubExpression") {
          if (typeof string === "string") {
            this.pushString(string);
          } else {
            this.pushStackLiteral(string);
          }
        }
      },
      emptyHash: function emptyHash(omitEmpty) {
        if (this.trackIds) {
          this.push("{}");
        }
        if (this.stringParams) {
          this.push("{}");
          this.push("{}");
        }
        this.pushStackLiteral(omitEmpty ? "undefined" : "{}");
      },
      pushHash: function pushHash() {
        if (this.hash) {
          this.hashes.push(this.hash);
        }
        this.hash = { values: {}, types: [], contexts: [], ids: [] };
      },
      popHash: function popHash() {
        var hash = this.hash;
        this.hash = this.hashes.pop();
        if (this.trackIds) {
          this.push(this.objectLiteral(hash.ids));
        }
        if (this.stringParams) {
          this.push(this.objectLiteral(hash.contexts));
          this.push(this.objectLiteral(hash.types));
        }
        this.push(this.objectLiteral(hash.values));
      },
      // [pushString]
      //
      // On stack, before: ...
      // On stack, after: quotedString(string), ...
      //
      // Push a quoted version of `string` onto the stack
      pushString: function pushString(string) {
        this.pushStackLiteral(this.quotedString(string));
      },
      // [pushLiteral]
      //
      // On stack, before: ...
      // On stack, after: value, ...
      //
      // Pushes a value onto the stack. This operation prevents
      // the compiler from creating a temporary variable to hold
      // it.
      pushLiteral: function pushLiteral(value) {
        this.pushStackLiteral(value);
      },
      // [pushProgram]
      //
      // On stack, before: ...
      // On stack, after: program(guid), ...
      //
      // Push a program expression onto the stack. This takes
      // a compile-time guid and converts it into a runtime-accessible
      // expression.
      pushProgram: function pushProgram(guid) {
        if (guid != null) {
          this.pushStackLiteral(this.programExpression(guid));
        } else {
          this.pushStackLiteral(null);
        }
      },
      // [registerDecorator]
      //
      // On stack, before: hash, program, params..., ...
      // On stack, after: ...
      //
      // Pops off the decorator's parameters, invokes the decorator,
      // and inserts the decorator into the decorators list.
      registerDecorator: function registerDecorator(paramSize, name) {
        var foundDecorator = this.nameLookup("decorators", name, "decorator"), options = this.setupHelperArgs(name, paramSize);
        this.decorators.push(["fn = ", this.decorators.functionCall(foundDecorator, "", ["fn", "props", "container", options]), " || fn;"]);
      },
      // [invokeHelper]
      //
      // On stack, before: hash, inverse, program, params..., ...
      // On stack, after: result of helper invocation
      //
      // Pops off the helper's parameters, invokes the helper,
      // and pushes the helper's return value onto the stack.
      //
      // If the helper is not found, `helperMissing` is called.
      invokeHelper: function invokeHelper(paramSize, name, isSimple) {
        var nonHelper = this.popStack(), helper = this.setupHelper(paramSize, name);
        var possibleFunctionCalls = [];
        if (isSimple) {
          possibleFunctionCalls.push(helper.name);
        }
        possibleFunctionCalls.push(nonHelper);
        if (!this.options.strict) {
          possibleFunctionCalls.push(this.aliasable("container.hooks.helperMissing"));
        }
        var functionLookupCode = ["(", this.itemsSeparatedBy(possibleFunctionCalls, "||"), ")"];
        var functionCall = this.source.functionCall(functionLookupCode, "call", helper.callParams);
        this.push(functionCall);
      },
      itemsSeparatedBy: function itemsSeparatedBy(items, separator) {
        var result = [];
        result.push(items[0]);
        for (var i2 = 1; i2 < items.length; i2++) {
          result.push(separator, items[i2]);
        }
        return result;
      },
      // [invokeKnownHelper]
      //
      // On stack, before: hash, inverse, program, params..., ...
      // On stack, after: result of helper invocation
      //
      // This operation is used when the helper is known to exist,
      // so a `helperMissing` fallback is not required.
      invokeKnownHelper: function invokeKnownHelper(paramSize, name) {
        var helper = this.setupHelper(paramSize, name);
        this.push(this.source.functionCall(helper.name, "call", helper.callParams));
      },
      // [invokeAmbiguous]
      //
      // On stack, before: hash, inverse, program, params..., ...
      // On stack, after: result of disambiguation
      //
      // This operation is used when an expression like `{{foo}}`
      // is provided, but we don't know at compile-time whether it
      // is a helper or a path.
      //
      // This operation emits more code than the other options,
      // and can be avoided by passing the `knownHelpers` and
      // `knownHelpersOnly` flags at compile-time.
      invokeAmbiguous: function invokeAmbiguous(name, helperCall) {
        this.useRegister("helper");
        var nonHelper = this.popStack();
        this.emptyHash();
        var helper = this.setupHelper(0, name, helperCall);
        var helperName = this.lastHelper = this.nameLookup("helpers", name, "helper");
        var lookup2 = ["(", "(helper = ", helperName, " || ", nonHelper, ")"];
        if (!this.options.strict) {
          lookup2[0] = "(helper = ";
          lookup2.push(" != null ? helper : ", this.aliasable("container.hooks.helperMissing"));
        }
        this.push(["(", lookup2, helper.paramsInit ? ["),(", helper.paramsInit] : [], "),", "(typeof helper === ", this.aliasable('"function"'), " ? ", this.source.functionCall("helper", "call", helper.callParams), " : helper))"]);
      },
      // [invokePartial]
      //
      // On stack, before: context, ...
      // On stack after: result of partial invocation
      //
      // This operation pops off a context, invokes a partial with that context,
      // and pushes the result of the invocation back.
      invokePartial: function invokePartial2(isDynamic, name, indent) {
        var params = [], options = this.setupParams(name, 1, params);
        if (isDynamic) {
          name = this.popStack();
          delete options.name;
        }
        if (indent) {
          options.indent = JSON.stringify(indent);
        }
        options.helpers = "helpers";
        options.partials = "partials";
        options.decorators = "container.decorators";
        if (!isDynamic) {
          params.unshift(this.nameLookup("partials", name, "partial"));
        } else {
          params.unshift(name);
        }
        if (this.options.compat) {
          options.depths = "depths";
        }
        options = this.objectLiteral(options);
        params.push(options);
        this.push(this.source.functionCall("container.invokePartial", "", params));
      },
      // [assignToHash]
      //
      // On stack, before: value, ..., hash, ...
      // On stack, after: ..., hash, ...
      //
      // Pops a value off the stack and assigns it to the current hash
      assignToHash: function assignToHash(key) {
        var value = this.popStack(), context = void 0, type = void 0, id2 = void 0;
        if (this.trackIds) {
          id2 = this.popStack();
        }
        if (this.stringParams) {
          type = this.popStack();
          context = this.popStack();
        }
        var hash = this.hash;
        if (context) {
          hash.contexts[key] = context;
        }
        if (type) {
          hash.types[key] = type;
        }
        if (id2) {
          hash.ids[key] = id2;
        }
        hash.values[key] = value;
      },
      pushId: function pushId(type, name, child) {
        if (type === "BlockParam") {
          this.pushStackLiteral("blockParams[" + name[0] + "].path[" + name[1] + "]" + (child ? " + " + JSON.stringify("." + child) : ""));
        } else if (type === "PathExpression") {
          this.pushString(name);
        } else if (type === "SubExpression") {
          this.pushStackLiteral("true");
        } else {
          this.pushStackLiteral("null");
        }
      },
      // HELPERS
      compiler: JavaScriptCompiler,
      compileChildren: function compileChildren(environment, options) {
        var children2 = environment.children, child = void 0, compiler2 = void 0;
        for (var i2 = 0, l2 = children2.length; i2 < l2; i2++) {
          child = children2[i2];
          compiler2 = new this.compiler();
          var existing = this.matchExistingProgram(child);
          if (existing == null) {
            this.context.programs.push("");
            var index = this.context.programs.length;
            child.index = index;
            child.name = "program" + index;
            this.context.programs[index] = compiler2.compile(child, options, this.context, !this.precompile);
            this.context.decorators[index] = compiler2.decorators;
            this.context.environments[index] = child;
            this.useDepths = this.useDepths || compiler2.useDepths;
            this.useBlockParams = this.useBlockParams || compiler2.useBlockParams;
            child.useDepths = this.useDepths;
            child.useBlockParams = this.useBlockParams;
          } else {
            child.index = existing.index;
            child.name = "program" + existing.index;
            this.useDepths = this.useDepths || existing.useDepths;
            this.useBlockParams = this.useBlockParams || existing.useBlockParams;
          }
        }
      },
      matchExistingProgram: function matchExistingProgram(child) {
        for (var i2 = 0, len = this.context.environments.length; i2 < len; i2++) {
          var environment = this.context.environments[i2];
          if (environment && environment.equals(child)) {
            return environment;
          }
        }
      },
      programExpression: function programExpression(guid) {
        var child = this.environment.children[guid], programParams = [child.index, "data", child.blockParams];
        if (this.useBlockParams || this.useDepths) {
          programParams.push("blockParams");
        }
        if (this.useDepths) {
          programParams.push("depths");
        }
        return "container.program(" + programParams.join(", ") + ")";
      },
      useRegister: function useRegister(name) {
        if (!this.registers[name]) {
          this.registers[name] = true;
          this.registers.list.push(name);
        }
      },
      push: function push(expr) {
        if (!(expr instanceof Literal)) {
          expr = this.source.wrap(expr);
        }
        this.inlineStack.push(expr);
        return expr;
      },
      pushStackLiteral: function pushStackLiteral(item) {
        this.push(new Literal(item));
      },
      pushSource: function pushSource(source) {
        if (this.pendingContent) {
          this.source.push(this.appendToBuffer(this.source.quotedString(this.pendingContent), this.pendingLocation));
          this.pendingContent = void 0;
        }
        if (source) {
          this.source.push(source);
        }
      },
      replaceStack: function replaceStack(callback) {
        var prefix = ["("], stack = void 0, createdStack = void 0, usedLiteral = void 0;
        if (!this.isInline()) {
          throw new _exception22["default"]("replaceStack on non-inline");
        }
        var top = this.popStack(true);
        if (top instanceof Literal) {
          stack = [top.value];
          prefix = ["(", stack];
          usedLiteral = true;
        } else {
          createdStack = true;
          var _name = this.incrStack();
          prefix = ["((", this.push(_name), " = ", top, ")"];
          stack = this.topStack();
        }
        var item = callback.call(this, stack);
        if (!usedLiteral) {
          this.popStack();
        }
        if (createdStack) {
          this.stackSlot--;
        }
        this.push(prefix.concat(item, ")"));
      },
      incrStack: function incrStack() {
        this.stackSlot++;
        if (this.stackSlot > this.stackVars.length) {
          this.stackVars.push("stack" + this.stackSlot);
        }
        return this.topStackName();
      },
      topStackName: function topStackName() {
        return "stack" + this.stackSlot;
      },
      flushInline: function flushInline() {
        var inlineStack = this.inlineStack;
        this.inlineStack = [];
        for (var i2 = 0, len = inlineStack.length; i2 < len; i2++) {
          var entry = inlineStack[i2];
          if (entry instanceof Literal) {
            this.compileStack.push(entry);
          } else {
            var stack = this.incrStack();
            this.pushSource([stack, " = ", entry, ";"]);
            this.compileStack.push(stack);
          }
        }
      },
      isInline: function isInline() {
        return this.inlineStack.length;
      },
      popStack: function popStack(wrapped) {
        var inline2 = this.isInline(), item = (inline2 ? this.inlineStack : this.compileStack).pop();
        if (!wrapped && item instanceof Literal) {
          return item.value;
        } else {
          if (!inline2) {
            if (!this.stackSlot) {
              throw new _exception22["default"]("Invalid stack pop");
            }
            this.stackSlot--;
          }
          return item;
        }
      },
      topStack: function topStack() {
        var stack = this.isInline() ? this.inlineStack : this.compileStack, item = stack[stack.length - 1];
        if (item instanceof Literal) {
          return item.value;
        } else {
          return item;
        }
      },
      contextName: function contextName(context) {
        if (this.useDepths && context) {
          return "depths[" + context + "]";
        } else {
          return "depth" + context;
        }
      },
      quotedString: function quotedString(str) {
        return this.source.quotedString(str);
      },
      objectLiteral: function objectLiteral(obj) {
        return this.source.objectLiteral(obj);
      },
      aliasable: function aliasable(name) {
        var ret = this.aliases[name];
        if (ret) {
          ret.referenceCount++;
          return ret;
        }
        ret = this.aliases[name] = this.source.wrap(name);
        ret.aliasable = true;
        ret.referenceCount = 1;
        return ret;
      },
      setupHelper: function setupHelper(paramSize, name, blockHelper) {
        var params = [], paramsInit = this.setupHelperArgs(name, paramSize, params, blockHelper);
        var foundHelper = this.nameLookup("helpers", name, "helper"), callContext = this.aliasable(this.contextName(0) + " != null ? " + this.contextName(0) + " : (container.nullContext || {})");
        return {
          params,
          paramsInit,
          name: foundHelper,
          callParams: [callContext].concat(params)
        };
      },
      setupParams: function setupParams(helper, paramSize, params) {
        var options = {}, contexts = [], types = [], ids = [], objectArgs = !params, param = void 0;
        if (objectArgs) {
          params = [];
        }
        options.name = this.quotedString(helper);
        options.hash = this.popStack();
        if (this.trackIds) {
          options.hashIds = this.popStack();
        }
        if (this.stringParams) {
          options.hashTypes = this.popStack();
          options.hashContexts = this.popStack();
        }
        var inverse = this.popStack(), program = this.popStack();
        if (program || inverse) {
          options.fn = program || "container.noop";
          options.inverse = inverse || "container.noop";
        }
        var i2 = paramSize;
        while (i2--) {
          param = this.popStack();
          params[i2] = param;
          if (this.trackIds) {
            ids[i2] = this.popStack();
          }
          if (this.stringParams) {
            types[i2] = this.popStack();
            contexts[i2] = this.popStack();
          }
        }
        if (objectArgs) {
          options.args = this.source.generateArray(params);
        }
        if (this.trackIds) {
          options.ids = this.source.generateArray(ids);
        }
        if (this.stringParams) {
          options.types = this.source.generateArray(types);
          options.contexts = this.source.generateArray(contexts);
        }
        if (this.options.data) {
          options.data = "data";
        }
        if (this.useBlockParams) {
          options.blockParams = "blockParams";
        }
        return options;
      },
      setupHelperArgs: function setupHelperArgs(helper, paramSize, params, useRegister) {
        var options = this.setupParams(helper, paramSize, params);
        options.loc = JSON.stringify(this.source.currentLocation);
        options = this.objectLiteral(options);
        if (useRegister) {
          this.useRegister("options");
          params.push("options");
          return ["options=", options];
        } else if (params) {
          params.push(options);
          return "";
        } else {
          return options;
        }
      }
    };
    (function() {
      var reservedWords = "break else new var case finally return void catch for switch while continue function this with default if throw delete in try do instanceof typeof abstract enum int short boolean export interface static byte extends long super char final native synchronized class float package throws const goto private transient debugger implements protected volatile double import public let yield await null true false".split(" ");
      var compilerWords = JavaScriptCompiler.RESERVED_WORDS = {};
      for (var i2 = 0, l2 = reservedWords.length; i2 < l2; i2++) {
        compilerWords[reservedWords[i2]] = true;
      }
    })();
    JavaScriptCompiler.isValidJavaScriptVariableName = function(name) {
      return !JavaScriptCompiler.RESERVED_WORDS[name] && /^[a-zA-Z_$][0-9a-zA-Z_$]*$/.test(name);
    };
    function strictLookup(requireTerminal, compiler2, parts, i2, type) {
      var stack = compiler2.popStack(), len = parts.length;
      if (requireTerminal) {
        len--;
      }
      for (; i2 < len; i2++) {
        stack = compiler2.nameLookup(stack, parts[i2], type);
      }
      if (requireTerminal) {
        return [compiler2.aliasable("container.strict"), "(", stack, ", ", compiler2.quotedString(parts[i2]), ", ", JSON.stringify(compiler2.source.currentLocation), " )"];
      } else {
        return stack;
      }
    }
    exports["default"] = JavaScriptCompiler;
    module.exports = exports["default"];
  })(javascriptCompiler, javascriptCompiler.exports);
  var javascriptCompilerExports = javascriptCompiler.exports;
  (function(module, exports) {
    exports.__esModule = true;
    function _interopRequireDefault2(obj) {
      return obj && obj.__esModule ? obj : { "default": obj };
    }
    var _handlebarsRuntime = handlebars_runtimeExports;
    var _handlebarsRuntime2 = _interopRequireDefault2(_handlebarsRuntime);
    var _handlebarsCompilerAst = astExports;
    var _handlebarsCompilerAst2 = _interopRequireDefault2(_handlebarsCompilerAst);
    var _handlebarsCompilerBase = base;
    var _handlebarsCompilerCompiler = compiler;
    var _handlebarsCompilerJavascriptCompiler = javascriptCompilerExports;
    var _handlebarsCompilerJavascriptCompiler2 = _interopRequireDefault2(_handlebarsCompilerJavascriptCompiler);
    var _handlebarsCompilerVisitor = visitorExports;
    var _handlebarsCompilerVisitor2 = _interopRequireDefault2(_handlebarsCompilerVisitor);
    var _handlebarsNoConflict = noConflictExports;
    var _handlebarsNoConflict2 = _interopRequireDefault2(_handlebarsNoConflict);
    var _create = _handlebarsRuntime2["default"].create;
    function create() {
      var hb = _create();
      hb.compile = function(input, options) {
        return _handlebarsCompilerCompiler.compile(input, options, hb);
      };
      hb.precompile = function(input, options) {
        return _handlebarsCompilerCompiler.precompile(input, options, hb);
      };
      hb.AST = _handlebarsCompilerAst2["default"];
      hb.Compiler = _handlebarsCompilerCompiler.Compiler;
      hb.JavaScriptCompiler = _handlebarsCompilerJavascriptCompiler2["default"];
      hb.Parser = _handlebarsCompilerBase.parser;
      hb.parse = _handlebarsCompilerBase.parse;
      hb.parseWithoutProcessing = _handlebarsCompilerBase.parseWithoutProcessing;
      return hb;
    }
    var inst = create();
    inst.create = create;
    _handlebarsNoConflict2["default"](inst);
    inst.Visitor = _handlebarsCompilerVisitor2["default"];
    inst["default"] = inst;
    exports["default"] = inst;
    module.exports = exports["default"];
  })(handlebars, handlebars.exports);
  var handlebarsExports = handlebars.exports;
  const Handlebars = /* @__PURE__ */ getDefaultExportFromCjs(handlebarsExports);
  const qtmpl = `<div class="question">
  <h2>Question Id: {{qid}}</h2>
  <!--question content-->
  <div>{{{body}}}</div>
</div>
<div class="gpt-answer">
  <h2>GPT ANSWER</h2>
  <!--gpt answer-->
  {{{answer}}}
</div>
<div class="your-mark">
  <form data-qid="{{qid}}" data-cid="{{cid}}">
    <fieldset>
      <legend>What's your mark for this question: (out of 20)</legend>
      <div>
        <!-- <input type="radio" id="c0" name="contact" value="0" />
        <label for="c0">0</label>

        <input type="radio" id="c1" name="contact" value="1" />
        <label for="c1">1</label>

        <input type="radio" id="c2" name="contact" value="2" />
        <label for="c2">2</label>

        <input type="radio" id="c3" name="contact" value="3" />
        <label for="c3">3</label>

        <input type="radio" id="c4" name="contact" value="4" />
        <label for="c4">4</label>

        <input type="radio" id="c5" name="contact" value="5" checked />
        <label for="c5">5</label> -->
        <input
          type="range"
          id="mark"
          value="20"
          min="0"
          max="20"
          oninput="this.nextElementSibling.value = this.value"
        />
        <input type="number" value="20" disabled style="border:none; background: none;" />

        <div style="margin-top: 10px; vertical-align: top;">
          <p>Comments (if any)</p>
          <textarea id="comment" style="width: 100%; resize: vertical;"></textarea>
        </div>
      </div>
    </fieldset>
  </form>
</div>

<div class="divider"></div>
`;
  const tmpl = '<!DOCTYPE html>\n<html lang="en">\n  <head>\n    <meta charset="utf-8" />\n    <meta name="viewport" content="width=device-width, user-scalable=no" />\n    <meta name="theme-color" content="#000000" />\n    <link\n      rel="stylesheet"\n      href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css"\n      integrity="sha384-n8MVd4RsNIU0tAv4ct0nTaAbDJwPJzDEaqSD1odI+WdtXRGWt2kTvGFasHpSy3SV"\n      crossorigin="anonymous"\n    />\n\n    <!-- The loading of KaTeX is deferred to speed up page rendering -->\n    <script\n      defer\n      src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"\n      integrity="sha384-XjKyOOlGwcjNTAIQHIpgOno0Hl1YQqzUOEleOLALmuqehneUG+vnGctmUb0ZY0l8"\n      crossorigin="anonymous"\n    ><\/script>\n    <script\n      defer\n      src="https://cdnjs.cloudflare.com/ajax/libs/FileSaver.js/2.0.0/FileSaver.js"\n      crossorigin="anonymous"\n    ><\/script>\n\n    <!-- To automatically render math in text elements, include the auto-render extension: -->\n    <script\n      defer\n      src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"\n      integrity="sha384-+VBxd3r6XgURycqtZ117nYw44OOcIax56Z4dCRWbxyPt0Koah1uHoK0o4+/RRE05"\n      crossorigin="anonymous"\n      onload="renderMathInElement(document.body);"\n    ><\/script>\n    <title></title>\n    <style>\n      .question {\n        padding: 1em;\n      }\n      .divider {\n        margin: 10px 0;\n        border: solid 1px #888;\n      }\n      .gpt-answer {\n        padding: 1em;\n        border: dashed 1px #ccc;\n      }\n      .your-mark {\n        padding: 1em;\n        border: dashed 1px #ccc;\n      }\n    </style>\n  </head>\n\n  <body>\n    <h1>Preset Name: {{pid}}</h1>\n    {{{allQuestions}}}\n\n    <!--repeat until-->\n\n    <label for="marker">Marker</label>\n    <input id="marker" type="" text />\n    <button onclick="collectMark()">Collect your mark</button>\n    <script type="text/javascript">\n      const presetId = "{{pid}}";\n\n      function safeCsvString(input) {\n        // Check if the string contains special characters\n        if (\n          input.includes(",") ||\n          input.includes("\\n") ||\n          input.includes(\'"\')\n        ) {\n          // Escape double quotes and wrap the entire string in double quotes\n          return \'"\' + input.replace(/"/g, \'""\') + \'"\';\n        } else {\n          return input;\n        }\n      }\n\n      function collectMark() {\n        const marker = document.querySelector("input#marker").value;\n        const allForms = document.querySelectorAll("form[data-qid]");\n        const marks = [...allForms].map((x) => {\n          const mark = x.querySelector("#mark").value;\n          const comment = x.querySelector("#comment").value;\n          return [x.dataset.qid, x.dataset.cid, mark, comment];\n        });\n        console.log(marks);\n        const csvContent = [\n          "question_id,context_id,marker,mark,mark_max,mark_norm,comments",\n          ...marks.map(([id, cid, mark, comment]) => {\n            return `${id},${cid},${marker},${mark},20,${\n              mark / 20\n            },${safeCsvString(comment)}`;\n          }),\n        ].join("\\n");\n        const blob = new Blob([csvContent], {\n          type: "text/plain;charset=utf-8",\n        });\n        saveAs(\n          blob,\n          `${marker}_${presetId}_${new Date().toLocaleString()}.csv`\n        );\n      }\n    <\/script>\n  </body>\n</html>\n';
  const questionTemplate = Handlebars.compile(qtmpl);
  const reportTemplate = Handlebars.compile(tmpl);
  function generateAQuestion(qid, cid, body, answer) {
    return questionTemplate({
      qid,
      cid,
      body,
      answer
    });
  }
  function generateReport(data, presetId2, prologue2, epilogue2) {
    return reportTemplate({
      allQuestions: data.map(
        (x2) => generateAQuestion(
          x2.id,
          x2.contextId,
          prologue2 + x2.body + epilogue2,
          x2.answerHTML
        )
      ).join("\n"),
      pid: presetId2
    });
  }
  const _tmpl$ = /* @__PURE__ */ template$1(`<a class="flex px-3 min-h-[44px] py-1 items-center gap-3 transition-colors duration-200 dark:text-white cursor-pointer text-sm rounded-md border dark:border-white/20 gizmo:min-h-0 hover:bg-gray-500/10 h-11 gizmo:h-10 gizmo:rounded-lg gizmo:border-[rgba(0,0,0,0.1)] bg-white dark:bg-transparent flex-grow overflow-hidden"><span class=truncate>Open Script Panel`), _tmpl$2 = /* @__PURE__ */ template$1(`<div class="up-10px uborder-dashed uborder-1px uw-full">`), _tmpl$3 = /* @__PURE__ */ template$1(`<div class=umt-10px>`), _tmpl$4 = /* @__PURE__ */ template$1(`<div class="mb-1 flex flex-row gap-2">`);
  function safeFileName(input) {
    let sanitized = input.replace(/[\/\\?%*:|"<>]/g, "_");
    if (sanitized.length > 255) {
      sanitized = sanitized.substring(0, 255);
    }
    return sanitized;
  }
  let textarea;
  function openAFile() {
    return new Promise((res) => {
      var input = document.createElement("input");
      input.type = "file";
      input.accept = ".json";
      input.onchange = (e) => {
        const file = e.target.files[0];
        if (file == null) {
          res(null);
          return;
        }
        const reader = new FileReader();
        reader.readAsText(file, "utf-8");
        reader.onload = (ev) => {
          res(ev.target.result);
        };
      };
      input.click();
    });
  }
  function wait(ms) {
    return new Promise((res) => {
      setTimeout(() => res(), ms);
    });
  }
  function waitUntilResponse() {
    let responseStarted = false;
    return new Promise((res, rej) => {
      function check() {
        var _a, _b, _c;
        if (responseStarted) {
          if (((_a = document.querySelector(".final-completion")) == null ? void 0 : _a.querySelector(".result-streaming")) === null) {
            const final = (_b = document.querySelector(".final-completion")) == null ? void 0 : _b.querySelector(".markdown.prose");
            if (final) {
              res(final);
            } else {
              rej(new Error("Detect response failed"));
            }
            return;
          }
        } else {
          if ((_c = document.querySelector(".final-completion")) == null ? void 0 : _c.querySelector(".result-streaming")) {
            responseStarted = true;
          }
        }
        requestAnimationFrame(check);
      }
      check();
    });
  }
  async function postMessage(content) {
    textarea = document.querySelector('#prompt-textarea[tabindex="0"]');
    textarea.nextElementSibling;
    textarea.value = content;
    const inputEvent = new InputEvent("input", {
      bubbles: true,
      data: content,
      inputType: "insertFromPaste"
    });
    textarea.dispatchEvent(inputEvent);
    await wait(500);
    const keydownEvent = new KeyboardEvent("keydown", {
      bubbles: true,
      key: "Enter",
      altKey: false,
      ctrlKey: false,
      metaKey: false,
      shiftKey: false
    });
    textarea.dispatchEvent(keydownEvent);
  }
  async function startRoutine() {
    const data = [];
    let lastContext = null;
    for (const q of questions()) {
      if (lastContext != q.current.contextId) {
        console.log("context id differ");
        newTab.click();
        await wait(1e3);
      }
      await postMessage(prologue() + q.current.body + epilogue());
      const response = await waitUntilResponse();
      data.push({
        ...q.current,
        answerHTML: response.outerHTML
      });
      await wait(5e3);
      lastContext = q.current.contextId;
    }
    console.log("Done!");
    const blob = new Blob([generateReport(data, presetId(), prologue(), epilogue())], {
      type: "text/plain;charset=utf-8"
    });
    FileSaver_minExports.saveAs(blob, `report_${presetId()}_${(/* @__PURE__ */ new Date()).toLocaleString()}.html`);
  }
  let internalIdSel = 0;
  function createQuestionState(initial) {
    const internalId = internalIdSel++;
    const [id2, setId] = createSignal(initial.id);
    const [contextId, setContextId] = createSignal(initial.contextId);
    const [body, setBody] = createSignal(initial.body);
    return {
      UI: () => [createComponent(FormControl, {
        required: true,
        get children() {
          return [createComponent(FormLabel, {
            "for": "qid",
            children: "Question Id"
          }), createComponent(Input, {
            id: "qid",
            get value() {
              return id2();
            },
            onInput: (e) => setId(e.target.value)
          }), createComponent(FormHelperText, {})];
        }
      }), createComponent(FormControl, {
        required: true,
        get children() {
          return [createComponent(FormLabel, {
            "for": "qcid",
            children: "Question Context Id"
          }), createComponent(Input, {
            id: "cid",
            get value() {
              return contextId();
            },
            onInput: (e) => setContextId(e.target.value)
          }), createComponent(FormHelperText, {
            children: "Question with the same context id will be feed into the same chat session."
          })];
        }
      }), createComponent(FormControl, {
        required: true,
        get children() {
          return [createComponent(FormLabel, {
            "for": "body",
            children: "Question Body"
          }), createComponent(Textarea, {
            id: "body",
            get value() {
              return body();
            },
            onInput: (e) => setBody(e.target.value)
          }), createComponent(FormHelperText, {})];
        }
      })],
      get current() {
        return {
          internalId,
          id: id2(),
          contextId: contextId(),
          body: body()
        };
      }
    };
  }
  const [presetId, setPresetId] = createSignal("Unnamed Preset");
  const [prologue, setPrologue] = createSignal("");
  const [epilogue, setEpilogue] = createSignal("");
  const [questions, setQuestions] = createSignal([]);
  function App() {
    const {
      isOpen,
      onOpen,
      onClose
    } = createDisclosure();
    const addQuestionAtIndex = (idx) => {
      setQuestions((current) => {
        return [...current.slice(0, idx), createQuestionState({
          id: "",
          contextId: "",
          body: ""
        }), ...current.slice(idx)];
      });
    };
    return createComponent(HopeProvider, {
      get children() {
        return [(() => {
          const _el$ = _tmpl$();
          _el$.$$click = () => {
            onOpen();
          };
          return _el$;
        })(), createComponent(Modal, {
          centered: true,
          scrollBehavior: "inside",
          size: "full",
          get opened() {
            return isOpen();
          },
          onClose,
          get children() {
            return [createComponent(ModalOverlay, {}), createComponent(ModalContent, {
              get children() {
                return [createComponent(ModalCloseButton, {}), createComponent(ModalHeader, {
                  children: "Yeah it's a script."
                }), createComponent(ModalBody, {
                  get children() {
                    return createComponent(VStack, {
                      spacing: "10px",
                      get children() {
                        return [createComponent(FormControl, {
                          get children() {
                            return [createComponent(FormLabel, {
                              "for": "pid",
                              children: "Preset Name"
                            }), createComponent(Input, {
                              id: "pid",
                              get value() {
                                return presetId();
                              },
                              onInput: (e) => setPresetId(e.target.value)
                            }), createComponent(FormHelperText, {})];
                          }
                        }), createComponent(FormControl, {
                          get children() {
                            return [createComponent(FormLabel, {
                              "for": "pid",
                              children: "Prologue (for each question)"
                            }), createComponent(Textarea, {
                              id: "pid",
                              get value() {
                                return prologue();
                              },
                              onInput: (e) => setPrologue(e.target.value)
                            }), createComponent(FormHelperText, {})];
                          }
                        }), createComponent(FormControl, {
                          get children() {
                            return [createComponent(FormLabel, {
                              "for": "pid",
                              children: "Epilogue (for each question)"
                            }), createComponent(Textarea, {
                              id: "pid",
                              get value() {
                                return epilogue();
                              },
                              onInput: (e) => setEpilogue(e.target.value)
                            }), createComponent(FormHelperText, {})];
                          }
                        }), (() => {
                          const _el$2 = _tmpl$2();
                          insert(_el$2, createComponent(Button, {
                            onClick: () => addQuestionAtIndex(0),
                            children: "Add question"
                          }), null);
                          insert(_el$2, createComponent(For, {
                            get each() {
                              return questions();
                            },
                            children: (item, idx) => {
                              const UI = item.UI;
                              return (() => {
                                const _el$3 = _tmpl$3();
                                insert(_el$3, createComponent(Divider, {
                                  "class": "umy-10px"
                                }), null);
                                insert(_el$3, createComponent(UI, {}), null);
                                insert(_el$3, createComponent(Button, {
                                  colorScheme: "danger",
                                  onClick: () => setQuestions((current) => current.filter((x2) => x2.current.internalId !== item.current.internalId)),
                                  children: "Delete"
                                }), null);
                                insert(_el$3, createComponent(Divider, {
                                  "class": "umy-10px"
                                }), null);
                                insert(_el$3, createComponent(Button, {
                                  onClick: () => addQuestionAtIndex(idx() + 1),
                                  children: "Add question"
                                }), null);
                                return _el$3;
                              })();
                            }
                          }), null);
                          insert(_el$2, createComponent(Divider, {
                            "class": "umy-10px"
                          }), null);
                          insert(_el$2, createComponent(HStack, {
                            spacing: "10px",
                            get children() {
                              return [createComponent(Button, {
                                onClick: async () => {
                                  const file = await openAFile();
                                  if (file != null) {
                                    const content = JSON.parse(file);
                                    if ("questions" in content) {
                                      setQuestions(content["questions"].map(createQuestionState));
                                    }
                                    if ("presetId" in content) {
                                      setPresetId(String(content["presetId"]));
                                    }
                                    if ("prologue" in content) {
                                      setPrologue(String(content["prologue"]));
                                    }
                                    if ("epilogue" in content) {
                                      setEpilogue(String(content["epilogue"]));
                                    }
                                  }
                                },
                                children: "Load preset"
                              }), createComponent(Button, {
                                onClick: () => {
                                  const blob = new Blob([JSON.stringify({
                                    presetId: presetId(),
                                    questions: questions().map((x2) => x2.current),
                                    prologue: prologue(),
                                    epilogue: epilogue()
                                  })], {
                                    type: "text/plain;charset=utf-8"
                                  });
                                  FileSaver_minExports.saveAs(blob, `${safeFileName(presetId())}.json`);
                                },
                                children: "Save preset"
                              }), createComponent(Button, {
                                onClick: async () => {
                                  const file = await openAFile();
                                  if (file != null) {
                                    const content = JSON.parse(file);
                                    if ("questions" in content) {
                                      setQuestions((x2) => [...x2, ...content["questions"].map(createQuestionState)]);
                                    }
                                  }
                                },
                                children: "Merge preset"
                              })];
                            }
                          }), null);
                          return _el$2;
                        })(), createComponent(Button, {
                          onClick: () => {
                            console.log(questions().map((x2) => x2.current));
                            onClose();
                            startRoutine();
                          },
                          children: "Start!"
                        })];
                      }
                    });
                  }
                })];
              }
            })];
          }
        })];
      }
    });
  }
  const nav = document.querySelector("nav");
  const div = _tmpl$4();
  const newTab = nav.firstChild.firstChild;
  nav.insertBefore(div, nav.firstChild);
  render(() => createComponent(App, {}), div);
  delegateEvents(["click"]);
})();
