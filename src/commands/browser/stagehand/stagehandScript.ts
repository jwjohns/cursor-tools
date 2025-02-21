(() => {
  // lib/dom/xpathUtils.ts
  function getParentElement(node) {
    return isElementNode(node) ? node.parentElement : node.parentNode;
  }
  function getCombinations(attributes, size) {
    const results = [];
    function helper(start, combo) {
      if (combo.length === size) {
        results.push([...combo]);
        return;
      }
      for (let i = start; i < attributes.length; i++) {
        combo.push(attributes[i]);
        helper(i + 1, combo);
        combo.pop();
      }
    }
    helper(0, []);
    return results;
  }
  function isXPathFirstResultElement(xpath, target) {
    try {
      const result = document.evaluate(
        xpath,
        document.documentElement,
        null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE,
        null
      );
      return result.snapshotItem(0) === target;
    } catch (error) {
      console.warn(`Invalid XPath expression: ${xpath}`, error);
      return false;
    }
  }
  function escapeXPathString(value) {
    if (value.includes("'")) {
      if (value.includes('"')) {
        return "concat(" + value.split(/('+)/).map((part) => {
          if (part === "'") {
            return `"'"`;
          } else if (part.startsWith("'") && part.endsWith("'")) {
            return `"${part}"`;
          } else {
            return `'${part}'`;
          }
        }).join(",") + ")";
      } else {
        return `"${value}"`;
      }
    } else {
      return `'${value}'`;
    }
  }
  async function generateXPathsForElement(element) {
    if (!element) return [];
    const [complexXPath, standardXPath, idBasedXPath] = await Promise.all([
      generateComplexXPath(element),
      generateStandardXPath(element),
      generatedIdBasedXPath(element)
    ]);
    return [standardXPath, ...idBasedXPath ? [idBasedXPath] : [], complexXPath];
  }
  async function generateComplexXPath(element) {
    const parts = [];
    let currentElement = element;
    while (currentElement && (isTextNode(currentElement) || isElementNode(currentElement))) {
      if (isElementNode(currentElement)) {
        const el = currentElement;
        let selector = el.tagName.toLowerCase();
        const attributePriority = [
          "data-qa",
          "data-component",
          "data-role",
          "role",
          "aria-role",
          "type",
          "name",
          "aria-label",
          "placeholder",
          "title",
          "alt"
        ];
        const attributes = attributePriority.map((attr) => {
          let value = el.getAttribute(attr);
          if (attr === "href-full" && value) {
            value = el.getAttribute("href");
          }
          return value ? { attr: attr === "href-full" ? "href" : attr, value } : null;
        }).filter((attr) => attr !== null);
        let uniqueSelector = "";
        for (let i = 1; i <= attributes.length; i++) {
          const combinations = getCombinations(attributes, i);
          for (const combo of combinations) {
            const conditions = combo.map((a) => `@${a.attr}=${escapeXPathString(a.value)}`).join(" and ");
            const xpath2 = `//${selector}[${conditions}]`;
            if (isXPathFirstResultElement(xpath2, el)) {
              uniqueSelector = xpath2;
              break;
            }
          }
          if (uniqueSelector) break;
        }
        if (uniqueSelector) {
          parts.unshift(uniqueSelector.replace("//", ""));
          break;
        } else {
          const parent = getParentElement(el);
          if (parent) {
            const siblings = Array.from(parent.children).filter(
              (sibling) => sibling.tagName === el.tagName
            );
            const index = siblings.indexOf(el) + 1;
            selector += siblings.length > 1 ? `[${index}]` : "";
          }
          parts.unshift(selector);
        }
      }
      currentElement = getParentElement(currentElement);
    }
    const xpath = "//" + parts.join("/");
    return xpath;
  }
  async function generateStandardXPath(element) {
    const parts = [];
    while (element && (isTextNode(element) || isElementNode(element))) {
      let index = 0;
      let hasSameTypeSiblings = false;
      const siblings = element.parentElement ? Array.from(element.parentElement.childNodes) : [];
      for (let i = 0; i < siblings.length; i++) {
        const sibling = siblings[i];
        if (sibling.nodeType === element.nodeType && sibling.nodeName === element.nodeName) {
          index = index + 1;
          hasSameTypeSiblings = true;
          if (sibling.isSameNode(element)) {
            break;
          }
        }
      }
      if (element.nodeName !== "#text") {
        const tagName = element.nodeName.toLowerCase();
        const pathIndex = hasSameTypeSiblings ? `[${index}]` : "";
        parts.unshift(`${tagName}${pathIndex}`);
      }
      element = element.parentElement;
    }
    return parts.length ? `/${parts.join("/")}` : "";
  }
  async function generatedIdBasedXPath(element) {
    if (isElementNode(element) && element.id) {
      return `//*[@id='${element.id}']`;
    }
    return null;
  }

  // lib/dom/utils.ts
  async function waitForDomSettle() {
    return new Promise((resolve) => {
      const createTimeout = () => {
        return setTimeout(() => {
          resolve();
        }, 2e3);
      };
      let timeout = createTimeout();
      const observer = new MutationObserver(() => {
        clearTimeout(timeout);
        timeout = createTimeout();
      });
      observer.observe(window.document.body, { childList: true, subtree: true });
    });
  }
  window.waitForDomSettle = waitForDomSettle;
  function calculateViewportHeight() {
    return Math.ceil(window.innerHeight * 0.75);
  }
  function canElementScroll(elem) {
    if (typeof elem.scrollTo !== "function") {
      console.warn("canElementScroll: .scrollTo is not a function.");
      return false;
    }
    try {
      const originalTop = elem.scrollTop;
      elem.scrollTo({
        top: originalTop + 100,
        left: 0,
        behavior: "instant"
      });
      if (elem.scrollTop === originalTop) {
        throw new Error("scrollTop did not change");
      }
      elem.scrollTo({
        top: originalTop,
        left: 0,
        behavior: "instant"
      });
      return true;
    } catch (error) {
      console.warn("canElementScroll error:", error.message || error);
      return false;
    }
  }

  // lib/dom/GlobalPageContainer.ts
  var GlobalPageContainer = class {
    getViewportHeight() {
      return calculateViewportHeight();
    }
    getScrollHeight() {
      return document.documentElement.scrollHeight;
    }
    async scrollTo(offset) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.scrollTo({ top: offset, left: 0, behavior: "smooth" });
      await this.waitForScrollEnd();
    }
    async waitForScrollEnd() {
      return new Promise((resolve) => {
        let scrollEndTimer;
        const handleScroll = () => {
          clearTimeout(scrollEndTimer);
          scrollEndTimer = window.setTimeout(() => {
            window.removeEventListener("scroll", handleScroll);
            resolve();
          }, 100);
        };
        window.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      });
    }
  };

  // lib/dom/ElementContainer.ts
  var ElementContainer = class {
    constructor(el) {
      this.el = el;
    }
    getViewportHeight() {
      return this.el.clientHeight;
    }
    getScrollHeight() {
      return this.el.scrollHeight;
    }
    async scrollTo(offset) {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      this.el.scrollTo({ top: offset, left: 0, behavior: "smooth" });
      await this.waitForScrollEnd();
    }
    async waitForScrollEnd() {
      return new Promise((resolve) => {
        let scrollEndTimer;
        const handleScroll = () => {
          clearTimeout(scrollEndTimer);
          scrollEndTimer = window.setTimeout(() => {
            this.el.removeEventListener("scroll", handleScroll);
            resolve();
          }, 100);
        };
        this.el.addEventListener("scroll", handleScroll, { passive: true });
        handleScroll();
      });
    }
  };

  // lib/dom/containerFactory.ts
  function createStagehandContainer(obj) {
    if (obj instanceof Window) {
      return new GlobalPageContainer();
    } else {
      return new ElementContainer(obj);
    }
  }

  // lib/dom/process.ts
  function isElementNode(node) {
    return node.nodeType === Node.ELEMENT_NODE;
  }
  function isTextNode(node) {
    return node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim());
  }
  function getScrollableElements(topN) {
    const docEl = document.documentElement;
    const scrollableElements = [docEl];
    const allElements = document.querySelectorAll("*");
    for (const elem of allElements) {
      const style = window.getComputedStyle(elem);
      const overflowY = style.overflowY;
      const isPotentiallyScrollable = overflowY === "auto" || overflowY === "scroll" || overflowY === "overlay";
      if (isPotentiallyScrollable) {
        const candidateScrollDiff = elem.scrollHeight - elem.clientHeight;
        if (candidateScrollDiff > 0 && canElementScroll(elem)) {
          scrollableElements.push(elem);
        }
      }
    }
    scrollableElements.sort((a, b) => b.scrollHeight - a.scrollHeight);
    if (topN !== void 0) {
      return scrollableElements.slice(0, topN);
    }
    return scrollableElements;
  }
  async function getScrollableElementXpaths(topN) {
    const scrollableElems = getScrollableElements(topN);
    const xpaths = [];
    for (const elem of scrollableElems) {
      const allXPaths = await generateXPathsForElement(elem);
      const firstXPath = allXPaths?.[0] || "";
      xpaths.push(firstXPath);
    }
    return xpaths;
  }
  async function processDom(chunksSeen) {
    const { chunk, chunksArray } = await pickChunk(chunksSeen);
    const container = createStagehandContainer(window);
    const { outputString, selectorMap } = await processElements(
      chunk,
      true,
      0,
      container
    );
    console.log(
      `Stagehand (Browser Process): Extracted dom elements:
${outputString}`
    );
    return {
      outputString,
      selectorMap,
      chunk,
      chunks: chunksArray
    };
  }
  async function processAllOfDom() {
    console.log("Stagehand (Browser Process): Processing all of DOM");
    const mainScrollableElements = getScrollableElements(1);
    const mainScrollable = mainScrollableElements[0];
    const container = mainScrollable === document.documentElement ? createStagehandContainer(window) : createStagehandContainer(mainScrollable);
    const viewportHeight = container.getViewportHeight();
    const documentHeight = container.getScrollHeight();
    const totalChunks = Math.ceil(documentHeight / viewportHeight);
    let index = 0;
    const results = [];
    for (let chunk = 0; chunk < totalChunks; chunk++) {
      const result = await processElements(chunk, true, index, container);
      results.push(result);
      index += Object.keys(result.selectorMap).length;
    }
    await container.scrollTo(0);
    const allOutputString = results.map((result) => result.outputString).join("");
    const allSelectorMap = results.reduce(
      (acc, result) => ({ ...acc, ...result.selectorMap }),
      {}
    );
    console.log(
      `Stagehand (Browser Process): All dom elements: ${allOutputString}`
    );
    return {
      outputString: allOutputString,
      selectorMap: allSelectorMap
    };
  }
  var xpathCache = /* @__PURE__ */ new Map();
  async function processElements(chunk, scrollToChunk = true, indexOffset = 0, container) {
    console.time("processElements:total");
    const stagehandContainer = container ?? createStagehandContainer(window);
    const viewportHeight = stagehandContainer.getViewportHeight();
    const totalScrollHeight = stagehandContainer.getScrollHeight();
    const chunkHeight = viewportHeight * chunk;
    const maxScrollTop = totalScrollHeight - viewportHeight;
    const offsetTop = Math.min(chunkHeight, maxScrollTop);
    if (scrollToChunk) {
      console.time("processElements:scroll");
      await stagehandContainer.scrollTo(offsetTop);
      console.timeEnd("processElements:scroll");
    }
    console.log("Stagehand (Browser Process): Generating candidate elements");
    console.time("processElements:findCandidates");
    const DOMQueue = [...document.body.childNodes];
    const candidateElements = [];
    while (DOMQueue.length > 0) {
      const element = DOMQueue.pop();
      let shouldAddElement = false;
      if (element && isElementNode(element)) {
        const childrenCount = element.childNodes.length;
        for (let i = childrenCount - 1; i >= 0; i--) {
          const child = element.childNodes[i];
          DOMQueue.push(child);
        }
        if (isInteractiveElement(element)) {
          if (isActive(element) && isVisible(element)) {
            shouldAddElement = true;
          }
        }
        if (isLeafElement(element)) {
          if (isActive(element) && isVisible(element)) {
            shouldAddElement = true;
          }
        }
      }
      if (element && isTextNode(element) && isTextVisible(element)) {
        shouldAddElement = true;
      }
      if (shouldAddElement) {
        candidateElements.push(element);
      }
    }
    console.timeEnd("processElements:findCandidates");
    const selectorMap = {};
    let outputString = "";
    console.log(
      `Stagehand (Browser Process): Processing candidate elements: ${candidateElements.length}`
    );
    console.time("processElements:processCandidates");
    console.time("processElements:generateXPaths");
    const xpathLists = await Promise.all(
      candidateElements.map(async (element) => {
        if (xpathCache.has(element)) {
          return xpathCache.get(element);
        }
        const xpaths = await generateXPathsForElement(element);
        xpathCache.set(element, xpaths);
        return xpaths;
      })
    );
    console.timeEnd("processElements:generateXPaths");
    candidateElements.forEach((element, index) => {
      const xpaths = xpathLists[index];
      let elementOutput = "";
      if (isTextNode(element)) {
        const textContent = element.textContent?.trim();
        if (textContent) {
          elementOutput += `${index + indexOffset}:${textContent}
`;
        }
      } else if (isElementNode(element)) {
        const tagName = element.tagName.toLowerCase();
        const attributes = collectEssentialAttributes(element);
        const openingTag = `<${tagName}${attributes ? " " + attributes : ""}>`;
        const closingTag = `</${tagName}>`;
        const textContent = element.textContent?.trim() || "";
        elementOutput += `${index + indexOffset}:${openingTag}${textContent}${closingTag}
`;
      }
      outputString += elementOutput;
      selectorMap[index + indexOffset] = xpaths;
    });
    console.timeEnd("processElements:processCandidates");
    console.timeEnd("processElements:total");
    return {
      outputString,
      selectorMap
    };
  }
  function collectEssentialAttributes(element) {
    const essentialAttributes = [
      "id",
      "class",
      "href",
      "src",
      "aria-label",
      "aria-name",
      "aria-role",
      "aria-description",
      "aria-expanded",
      "aria-haspopup",
      "type",
      "value"
    ];
    const attrs = essentialAttributes.map((attr) => {
      const value = element.getAttribute(attr);
      return value ? `${attr}="${value}"` : "";
    }).filter((attr) => attr !== "");
    Array.from(element.attributes).forEach((attr) => {
      if (attr.name.startsWith("data-")) {
        attrs.push(`${attr.name}="${attr.value}"`);
      }
    });
    return attrs.join(" ");
  }
  function storeDOM() {
    const originalDOM = document.body.cloneNode(true);
    console.log("DOM state stored.");
    return originalDOM.outerHTML;
  }
  function restoreDOM(storedDOM) {
    console.log("Restoring DOM");
    if (storedDOM) {
      document.body.innerHTML = storedDOM;
    } else {
      console.error("No DOM state was provided.");
    }
  }
  function createTextBoundingBoxes() {
    const style = document.createElement("style");
    document.head.appendChild(style);
    if (style.sheet) {
      style.sheet.insertRule(
        `
      .stagehand-highlighted-word, .stagehand-space {
        border: 0px solid orange;
        display: inline-block !important;
        visibility: visible;
      }
    `,
        0
      );
      style.sheet.insertRule(
        `
        code .stagehand-highlighted-word, code .stagehand-space,
        pre .stagehand-highlighted-word, pre .stagehand-space {
          white-space: pre-wrap;
          display: inline !important;
      }
     `,
        1
      );
    }
    function applyHighlighting(root) {
      root.querySelectorAll("body *").forEach((element) => {
        if (element.closest(".stagehand-nav, .stagehand-marker")) {
          return;
        }
        if (["SCRIPT", "STYLE", "IFRAME", "INPUT"].includes(element.tagName)) {
          return;
        }
        const childNodes = Array.from(element.childNodes);
        childNodes.forEach((node) => {
          if (node.nodeType === 3 && node.textContent?.trim().length > 0) {
            const textContent = node.textContent.replace(/\u00A0/g, " ");
            const tokens = textContent.split(/(\s+)/g);
            const fragment = document.createDocumentFragment();
            const parentIsCode = element.tagName === "CODE";
            tokens.forEach((token) => {
              const span = document.createElement("span");
              span.textContent = token;
              if (parentIsCode) {
                span.style.whiteSpace = "pre-wrap";
                span.style.display = "inline";
              }
              span.className = token.trim().length === 0 ? "stagehand-space" : "stagehand-highlighted-word";
              fragment.appendChild(span);
            });
            if (fragment.childNodes.length > 0 && node.parentNode) {
              element.insertBefore(fragment, node);
              node.remove();
            }
          }
        });
      });
    }
    applyHighlighting(document);
    document.querySelectorAll("iframe").forEach((iframe) => {
      try {
        iframe.contentWindow?.postMessage({ action: "highlight" }, "*");
      } catch (error) {
        console.error("Error accessing iframe content: ", error);
      }
    });
  }
  function getElementBoundingBoxes(xpath) {
    const element = document.evaluate(
      xpath,
      document,
      null,
      XPathResult.FIRST_ORDERED_NODE_TYPE,
      null
    ).singleNodeValue;
    if (!element) return [];
    const isValidText = (text) => text && text.trim().length > 0;
    let dropDownElem = element.querySelector("option[selected]");
    if (!dropDownElem) {
      dropDownElem = element.querySelector("option");
    }
    if (dropDownElem) {
      const elemText = dropDownElem.textContent || "";
      if (isValidText(elemText)) {
        const parentRect = element.getBoundingClientRect();
        return [
          {
            text: elemText.trim(),
            top: parentRect.top + window.scrollY,
            left: parentRect.left + window.scrollX,
            width: parentRect.width,
            height: parentRect.height
          }
        ];
      } else {
        return [];
      }
    }
    let placeholderText = "";
    if ((element.tagName.toLowerCase() === "input" || element.tagName.toLowerCase() === "textarea") && element.placeholder) {
      placeholderText = element.placeholder;
    } else if (element.tagName.toLowerCase() === "a") {
      placeholderText = "";
    } else if (element.tagName.toLowerCase() === "img") {
      placeholderText = element.alt || "";
    }
    const words = element.querySelectorAll(
      ".stagehand-highlighted-word"
    );
    const boundingBoxes = Array.from(words).map((word) => {
      const rect = word.getBoundingClientRect();
      return {
        text: word.innerText || "",
        top: rect.top + window.scrollY,
        left: rect.left + window.scrollX,
        width: rect.width,
        height: rect.height * 0.75
      };
    }).filter(
      (box) => box.width > 0 && box.height > 0 && box.top >= 0 && box.left >= 0 && isValidText(box.text)
    );
    if (boundingBoxes.length === 0) {
      const elementRect = element.getBoundingClientRect();
      return [
        {
          text: placeholderText,
          top: elementRect.top + window.scrollY,
          left: elementRect.left + window.scrollX,
          width: elementRect.width,
          height: elementRect.height * 0.75
        }
      ];
    }
    return boundingBoxes;
  }
  window.processDom = processDom;
  window.processAllOfDom = processAllOfDom;
  window.processElements = processElements;
  window.storeDOM = storeDOM;
  window.restoreDOM = restoreDOM;
  window.createTextBoundingBoxes = createTextBoundingBoxes;
  window.getElementBoundingBoxes = getElementBoundingBoxes;
  window.createStagehandContainer = createStagehandContainer;
  window.getScrollableElementXpaths = getScrollableElementXpaths;
  var leafElementDenyList = ["SVG", "IFRAME", "SCRIPT", "STYLE", "LINK"];
  var interactiveElementTypes = [
    "A",
    "BUTTON",
    "DETAILS",
    "EMBED",
    "INPUT",
    "LABEL",
    "MENU",
    "MENUITEM",
    "OBJECT",
    "SELECT",
    "TEXTAREA",
    "SUMMARY"
  ];
  var interactiveRoles = [
    "button",
    "menu",
    "menuitem",
    "link",
    "checkbox",
    "radio",
    "slider",
    "tab",
    "tabpanel",
    "textbox",
    "combobox",
    "grid",
    "listbox",
    "option",
    "progressbar",
    "scrollbar",
    "searchbox",
    "switch",
    "tree",
    "treeitem",
    "spinbutton",
    "tooltip"
  ];
  var interactiveAriaRoles = ["menu", "menuitem", "button"];
  var isVisible = (element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) {
      return false;
    }
    if (!isTopElement(element, rect)) {
      return false;
    }
    const visible = element.checkVisibility({
      checkOpacity: true,
      checkVisibilityCSS: true
    });
    return visible;
  };
  var isTextVisible = (element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    const rect = range.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0 || rect.top < 0 || rect.top > window.innerHeight) {
      return false;
    }
    const parent = element.parentElement;
    if (!parent) {
      return false;
    }
    const visible = parent.checkVisibility({
      checkOpacity: true,
      checkVisibilityCSS: true
    });
    return visible;
  };
  function isTopElement(elem, rect) {
    const points = [
      { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.25 },
      { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.25 },
      { x: rect.left + rect.width * 0.25, y: rect.top + rect.height * 0.75 },
      { x: rect.left + rect.width * 0.75, y: rect.top + rect.height * 0.75 },
      { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 }
    ];
    return points.some((point) => {
      const topEl = document.elementFromPoint(point.x, point.y);
      let current = topEl;
      while (current && current !== document.body) {
        if (current.isSameNode(elem)) {
          return true;
        }
        current = current.parentElement;
      }
      return false;
    });
  }
  var isActive = (element) => {
    if (element.hasAttribute("disabled") || element.hasAttribute("hidden") || element.getAttribute("aria-disabled") === "true") {
      return false;
    }
    return true;
  };
  var isInteractiveElement = (element) => {
    const elementType = element.tagName;
    const elementRole = element.getAttribute("role");
    const elementAriaRole = element.getAttribute("aria-role");
    return elementType && interactiveElementTypes.includes(elementType) || elementRole && interactiveRoles.includes(elementRole) || elementAriaRole && interactiveAriaRoles.includes(elementAriaRole);
  };
  var isLeafElement = (element) => {
    if (element.textContent === "") {
      return false;
    }
    if (element.childNodes.length === 0) {
      return !leafElementDenyList.includes(element.tagName);
    }
    if (element.childNodes.length === 1 && isTextNode(element.childNodes[0])) {
      return true;
    }
    return false;
  };
  async function pickChunk(chunksSeen) {
    const viewportHeight = calculateViewportHeight();
    const documentHeight = document.documentElement.scrollHeight;
    const chunks = Math.ceil(documentHeight / viewportHeight);
    const chunksArray = Array.from({ length: chunks }, (_, i) => i);
    const chunksRemaining = chunksArray.filter((chunk2) => {
      return !chunksSeen.includes(chunk2);
    });
    const currentScrollPosition = window.scrollY;
    const closestChunk = chunksRemaining.reduce((closest, current) => {
      const currentChunkTop = viewportHeight * current;
      const closestChunkTop = viewportHeight * closest;
      return Math.abs(currentScrollPosition - currentChunkTop) < Math.abs(currentScrollPosition - closestChunkTop) ? current : closest;
    }, chunksRemaining[0]);
    const chunk = closestChunk;
    if (chunk === void 0) {
      throw new Error(`No chunks remaining to check: ${chunksRemaining}`);
    }
    return {
      chunk,
      chunksArray
    };
  }

  // lib/dom/debug.ts
  async function debugDom() {
    window.chunkNumber = 0;
    const { selectorMap: multiSelectorMap } = await window.processElements(
      window.chunkNumber
    );
    const selectorMap = multiSelectorMapToSelectorMap(multiSelectorMap);
    drawChunk(selectorMap);
  }
  function multiSelectorMapToSelectorMap(multiSelectorMap) {
    return Object.fromEntries(
      Object.entries(multiSelectorMap).map(([key, selectors]) => [
        Number(key),
        selectors[0]
      ])
    );
  }
  function drawChunk(selectorMap) {
    if (!window.showChunks) return;
    cleanupMarkers();
    Object.values(selectorMap).forEach((selector) => {
      const element = document.evaluate(
        selector,
        document,
        null,
        XPathResult.FIRST_ORDERED_NODE_TYPE,
        null
      ).singleNodeValue;
      if (element) {
        let rect;
        if (element.nodeType === Node.ELEMENT_NODE) {
          rect = element.getBoundingClientRect();
        } else {
          const range = document.createRange();
          range.selectNodeContents(element);
          rect = range.getBoundingClientRect();
        }
        const color = "grey";
        const overlay = document.createElement("div");
        overlay.style.position = "absolute";
        overlay.style.left = `${rect.left + window.scrollX}px`;
        overlay.style.top = `${rect.top + window.scrollY}px`;
        overlay.style.padding = "2px";
        overlay.style.width = `${rect.width}px`;
        overlay.style.height = `${rect.height}px`;
        overlay.style.backgroundColor = color;
        overlay.className = "stagehand-marker";
        overlay.style.opacity = "0.3";
        overlay.style.zIndex = "1000000000";
        overlay.style.border = "1px solid";
        overlay.style.pointerEvents = "none";
        document.body.appendChild(overlay);
      }
    });
  }
  async function cleanupDebug() {
    cleanupMarkers();
  }
  function cleanupMarkers() {
    const markers = document.querySelectorAll(".stagehand-marker");
    markers.forEach((marker) => {
      marker.remove();
    });
  }
  window.debugDom = debugDom;
  window.cleanupDebug = cleanupDebug;
})();
