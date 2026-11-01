"use client";

import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { DropdownMenu, Popover, ToggleGroup } from "radix-ui";
import { AlignCenter, AlignLeft, AlignRight, AtSign, Bold, Check, ChevronDown, CodeXml, Highlighter, Italic, Link, Minus, Plus, RemoveFormatting, Strikethrough, Underline } from "lucide-react";
import styles from "./text-toolbar.module.css";

const fonts = { Hand: '"Toolbar Hand", cursive', Sans: 'Arial, sans-serif', Serif: 'Georgia, serif', Mono: 'monospace' };
const swatches = Array.from({ length: 13 }, (_, row) =>
  Array.from({ length: 13 }, (_, column) => {
    const x = (column - 6) * 14.2 + (row % 2 ? 7.1 : 0);
    const y = (row - 6) * 12.3;
    if (x * x + y * y > 82 * 82) return null;
    const angle = Math.atan2(y, x) * 180 / Math.PI;
    const hue = angle >= 0 ? 360 - angle * 4 / 3 : -angle * 2 / 3;
    return { x: x + 120, y: y + 120, color: `hsl(${hue.toFixed(0)} 85% ${Math.max(37, 79 - (y + 82) / 164 * 36).toFixed(0)}%)` };
  }).filter(item => item !== null)
).flat();

export default function TextToolbar() {
  const [format, setFormat] = useState<string[]>([]);
  const [size, setSize] = useState(22);
  const [align, setAlign] = useState("center");
  const [font, setFont] = useState<keyof typeof fonts>("Hand");
  const [color, setColor] = useState("");
  const [linkOpen, setLinkOpen] = useState(false);
  const [mentionOpen, setMentionOpen] = useState(false);
  const [mentionName, setMentionName] = useState("");
  const [url, setUrl] = useState("");
  const [linkError, setLinkError] = useState("");
  const [message, setMessage] = useState("");
  const editor = useRef<HTMLDivElement>(null);
  const textArea = useRef<HTMLDivElement>(null);
  const [selectionBox, setSelectionBox] = useState<{ startLeft: number; startTop: number; startHeight: number; endLeft: number; endTop: number; endHeight: number } | null>(null);
  const selection = useRef<Range | null>(null);
  const fontBeforeCode = useRef<string>(fonts.Hand);

  function measureSelection(range: Range) {
    const parent = textArea.current?.getBoundingClientRect();
    const rects = Array.from(range.getClientRects()).filter(rect => rect.width > 0 && rect.height > 0);
    const first = rects[0];
    const last = rects[rects.length - 1];
    if (parent && first && last && !range.collapsed) setSelectionBox({ startLeft: first.left - parent.left, startTop: first.top - parent.top, startHeight: first.height, endLeft: last.right - parent.left, endTop: last.top - parent.top, endHeight: last.height });
    else setSelectionBox(null);
  }

  function saveSelection() {
    const current = window.getSelection();
    if (current?.rangeCount && editor.current?.contains(current.anchorNode) && editor.current.contains(current.focusNode)) {
      selection.current = current.getRangeAt(0).cloneRange();
      measureSelection(selection.current);
      const range = selection.current;
      const walker = document.createTreeWalker(editor.current, NodeFilter.SHOW_TEXT);
      let node: Node | null = null;
      while ((node = walker.nextNode())) {
        if (!range.intersectsNode(node) || !node.textContent?.length) continue;
        if (node === range.startContainer && range.startOffset === node.textContent.length) continue;
        if (node === range.endContainer && range.endOffset === 0) continue;
        break;
      }
      const element = node?.parentElement;
      if (element) {
        const computed = getComputedStyle(element);
        const active = [];
        if (Number(computed.fontWeight) >= 600) active.push("bold");
        if (computed.fontStyle === "italic") active.push("italic");
        if (computed.fontFamily.includes("monospace")) active.push("code");
        // Decorations and backgrounds can be painted by a parent span.
        let ancestor: HTMLElement | null = element;
        while (ancestor && ancestor !== editor.current) {
          const style = getComputedStyle(ancestor);
          if (style.textDecorationLine.includes("underline") && !active.includes("underline")) active.push("underline");
          if (style.textDecorationLine.includes("line-through") && !active.includes("strike")) active.push("strike");
          if (!["rgba(0, 0, 0, 0)", "transparent"].includes(style.backgroundColor) && !active.includes("highlight")) active.push("highlight");
          ancestor = ancestor.parentElement;
        }
        setFormat(active);
        setSize(Math.round(parseFloat(computed.fontSize) / 1.5));
        setFont(computed.fontFamily.includes("Toolbar Hand") ? "Hand" : computed.fontFamily.includes("monospace") ? "Mono" : computed.fontFamily.includes("Georgia") ? "Serif" : "Sans");
        setColor(computed.color);
        setAlign(["center", "right"].includes(computed.textAlign) ? computed.textAlign : "left");
      }
    }
  }

  useEffect(() => {
    const target = editor.current;
    if (!target) return;
    const range = document.createRange();
    range.selectNodeContents(target.querySelector("[data-quote]") ?? target);
    selection.current = range;
    const refresh = () => { if (selection.current) measureSelection(selection.current); };
    void document.fonts.ready.then(refresh);
    document.addEventListener("selectionchange", saveSelection);
    window.addEventListener("resize", refresh);
    return () => {
      document.removeEventListener("selectionchange", saveSelection);
      window.removeEventListener("resize", refresh);
    };
  }, []);

  useEffect(() => {
    const frame = requestAnimationFrame(() => { if (selection.current) measureSelection(selection.current); });
    return () => cancelAnimationFrame(frame);
  }, [align]);

  function applyStyle(patch: Partial<CSSStyleDeclaration>) {
    const target = editor.current;
    if (!target) return;
    let range = selection.current;
    if (!range || range.collapsed || !target.contains(range.commonAncestorContainer)) {
      const node = range?.startContainer;
      const element = node?.nodeType === Node.TEXT_NODE ? node.parentElement : node as HTMLElement | undefined;
      range = document.createRange();
      range.selectNodeContents(element?.closest("p") ?? target.querySelector("[data-quote]") ?? target);
    }
    const styleRange = (part: Range) => {
      // Lift complete wrappers so switching a style off also removes its old value.
      let wrapper = part.commonAncestorContainer.nodeType === Node.TEXT_NODE ? part.commonAncestorContainer.parentElement : part.commonAncestorContainer as HTMLElement;
      while (wrapper && wrapper !== target && wrapper.tagName === "SPAN" && part.toString() === wrapper.textContent) {
        part.selectNode(wrapper);
        wrapper = wrapper.parentElement;
      }
      const fragment = part.extractContents();
      fragment.querySelectorAll<HTMLElement>("span").forEach(node => {
        Object.assign(node.style, Object.fromEntries(Object.keys(patch).map(property => [property, ""])));
      });
      const span = document.createElement("span");
      Object.assign(span.style, patch);
      span.appendChild(fragment);
      part.insertNode(span);
      return span;
    };
    // Format each selected text run, preserving paragraph structure across selections.
    const walker = document.createTreeWalker(target, NodeFilter.SHOW_TEXT);
    const parts: Range[] = [];
    let node: Node | null;
    while ((node = walker.nextNode())) {
      if (!range.intersectsNode(node) || !node.textContent?.length) continue;
      const part = document.createRange();
      part.setStart(node, node === range.startContainer ? range.startOffset : 0);
      part.setEnd(node, node === range.endContainer ? range.endOffset : node.textContent.length);
      if (!part.collapsed) parts.push(part);
    }
    const spans = parts.reverse().map(styleRange).reverse();
    if (!spans.length) return;
    range = document.createRange();
    range.setStartBefore(spans[0]);
    range.setEndAfter(spans[spans.length - 1]);
    selection.current = range.cloneRange();
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    const updatedRange = range;
    requestAnimationFrame(() => measureSelection(updatedRange));
  }

  function updateFormat(next: string[]) {
    const changed = [...format, ...next].find(value => format.includes(value) !== next.includes(value));
    const active = changed ? next.includes(changed) : false;
    if (changed === "bold") applyStyle({ fontWeight: active ? "700" : "400" });
    if (changed === "italic") applyStyle({ fontStyle: active ? "italic" : "normal" });
    if (changed === "underline" || changed === "strike") applyStyle({ textDecoration: [next.includes("underline") ? "underline" : "", next.includes("strike") ? "line-through" : ""].filter(Boolean).join(" ") || "none" });
    if (changed === "code") {
      if (active) fontBeforeCode.current = fonts[font === "Mono" ? "Sans" : font];
      applyStyle({ fontFamily: active ? fonts.Mono : fontBeforeCode.current });
    }
    if (changed === "highlight") applyStyle({ backgroundColor: active ? "#fff0a6" : "transparent" });
    setFormat(next);
  }

  function updateSize(value: number) {
    const next = Math.min(72, Math.max(12, value));
    setSize(next);
    applyStyle({ fontSize: `${next * 1.5}px` });
  }

  function updateColor(value: string) {
    setColor(value);
    applyStyle({ color: value });
  }

  function dragHandle(event: ReactPointerEvent<HTMLButtonElement>, edge: "start" | "end") {
    event.preventDefault();
    const range = selection.current?.cloneRange();
    if (!range) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    const handle = event.currentTarget;
    const move = (pointer: PointerEvent) => {
      const caret = document.caretPositionFromPoint(pointer.clientX, pointer.clientY);
      if (!caret || !editor.current?.contains(caret.offsetNode)) return;
      const point = document.createRange();
      point.setStart(caret.offsetNode, caret.offset);
      point.collapse(true);
      const boundary = range.cloneRange();
      boundary.collapse(edge !== "start");
      const comparison = point.compareBoundaryPoints(Range.START_TO_START, boundary);
      if (edge === "start" && comparison < 0) range.setStart(caret.offsetNode, caret.offset);
      if (edge === "end" && comparison > 0) range.setEnd(caret.offsetNode, caret.offset);
      selection.current = range.cloneRange();
      window.getSelection()?.removeAllRanges();
      window.getSelection()?.addRange(range);
      measureSelection(range);
    };
    const finish = () => { handle.removeEventListener("pointermove", move); handle.removeEventListener("pointerup", finish); handle.removeEventListener("pointercancel", finish); };
    handle.addEventListener("pointermove", move);
    handle.addEventListener("pointerup", finish);
    handle.addEventListener("pointercancel", finish);
  }

  function insertMention() {
    if (!mentionName.trim()) return;
    if (!editor.current) return;
    editor.current.focus();
    const range = selection.current && editor.current.contains(selection.current.commonAncestorContainer) ? selection.current : document.createRange();
    if (!selection.current) { range.selectNodeContents(editor.current); range.collapse(false); }
    range.deleteContents();
    const text = document.createTextNode(`@${mentionName.trim().replace(/^@/, "")} `);
    range.insertNode(text);
    range.setStartAfter(text);
    range.collapse(true);
    window.getSelection()?.removeAllRanges();
    window.getSelection()?.addRange(range);
    selection.current = range.cloneRange();
    setMentionOpen(false);
    setMentionName("");
    setSelectionBox(null);
  }

  function applyLink() {
    let parsed: URL;
    try { parsed = new URL(url); } catch { setLinkError("Enter a full URL, such as https://example.com"); return; }
    if (!["https:", "http:"].includes(parsed.protocol)) { setLinkError("Use an https:// or http:// link."); return; }
    const target = editor.current;
    if (!target) return;
    const range = selection.current && target.contains(selection.current.commonAncestorContainer) ? selection.current : document.createRange();
    if (!selection.current || range.collapsed) range.selectNodeContents(target);
    const anchor = document.createElement("a");
    anchor.href = parsed.href;
    anchor.target = "_blank";
    anchor.rel = "noopener noreferrer";
    anchor.appendChild(range.extractContents());
    range.insertNode(anchor);
    selection.current = null;
    setLinkOpen(false);
    setMessage("Link applied. Select the linked text to edit it.");
  }

  function updateAlignment(value: string) {
    if (!value) return;
    setAlign(value);
    editor.current?.querySelectorAll<HTMLElement>("p").forEach(paragraph => {
      if (selection.current?.intersectsNode(paragraph)) paragraph.style.textAlign = value;
    });
  }

  return (
    <div className={styles.scene} ref={textArea}>
      <div className={styles.foreground}>
        <div className={styles.toolbar} onPointerDownCapture={saveSelection} role="toolbar" aria-label="Text formatting" aria-orientation="horizontal">
          <div className={styles.topRow}>
            <div className={styles.palette}>
              <svg viewBox="0 0 240 240" role="group" aria-label="Text color palette">
                <defs><filter id="toolbar-palette-shadow" x="-30%" y="-30%" width="160%" height="170%"><feDropShadow dx="0" dy="7" stdDeviation="5" floodOpacity=".16" /></filter></defs>
                <g filter="url(#toolbar-palette-shadow)">{swatches.map((swatch, i) => <circle key={i} cx={swatch.x} cy={swatch.y} r="10.8" fill={swatch.color} role="button" tabIndex={0} aria-label={`Set text color ${swatch.color}`} aria-pressed={color === swatch.color} onClick={() => updateColor(swatch.color)} onKeyDown={event => { if (event.key === "Enter" || event.key === " ") { event.preventDefault(); updateColor(swatch.color); } }} stroke={color === swatch.color ? "#fff" : "none"} strokeWidth="2.5" />)}</g>
              </svg>
              <input type="color" value={color.startsWith("#") ? color : "#222222"} onChange={event => updateColor(event.target.value)} aria-label="Choose a custom text color" title="Custom color" />
            </div>
            <div className={styles.tools}>
              <ToggleGroup.Root type="multiple" value={format} onValueChange={updateFormat} className={styles.formatGrid} aria-label="Text styles">
                <ToggleGroup.Item value="bold" aria-label="Bold" title="Bold"><Bold /></ToggleGroup.Item>
                <ToggleGroup.Item value="italic" aria-label="Italic" title="Italic"><Italic /></ToggleGroup.Item>
                <ToggleGroup.Item value="underline" aria-label="Underline" title="Underline"><Underline /></ToggleGroup.Item>
                <ToggleGroup.Item value="strike" aria-label="Strikethrough" title="Strikethrough"><Strikethrough /></ToggleGroup.Item>
                <ToggleGroup.Item value="code" aria-label="Code" title="Code"><CodeXml /></ToggleGroup.Item>
                <ToggleGroup.Item value="highlight" aria-label="Highlight" title="Highlight"><Highlighter /></ToggleGroup.Item>
              </ToggleGroup.Root>
              <div className={styles.actionRow}>
                <Popover.Root open={linkOpen} onOpenChange={open => { setLinkOpen(open); setLinkError(""); }}>
                  <Popover.Trigger aria-label="Add link" title="Add link" onPointerDown={saveSelection}><Link /></Popover.Trigger>
                  <Popover.Portal><Popover.Content className={styles.popover} sideOffset={12} collisionPadding={16} aria-label="Insert link">
                    <form onSubmit={event => { event.preventDefault(); applyLink(); }}><label htmlFor="toolbar-url">Link address</label><div><input id="toolbar-url" type="url" placeholder="https://example.com" value={url} onChange={event => setUrl(event.target.value)} required /><button type="submit" aria-label="Apply link"><Check size={18} /></button></div>{linkError && <p role="alert">{linkError}</p>}</form>
                  </Popover.Content></Popover.Portal>
                </Popover.Root>
                <Popover.Root open={mentionOpen} onOpenChange={setMentionOpen}>
                  <Popover.Trigger aria-label="Insert mention" title="Insert mention"><AtSign /></Popover.Trigger>
                  <Popover.Portal><Popover.Content className={styles.popover} sideOffset={12} collisionPadding={16} aria-label="Mention someone">
                    <form onSubmit={event => { event.preventDefault(); insertMention(); }}><label htmlFor="toolbar-mention">Mention someone</label><div><input id="toolbar-mention" placeholder="e.g. Eduardo" value={mentionName} onChange={event => setMentionName(event.target.value)} maxLength={60} required /><button type="submit" aria-label="Add mention"><Check size={18} /></button></div></form>
                  </Popover.Content></Popover.Portal>
                </Popover.Root>
                <button type="button" aria-label="Reset formatting" title="Reset formatting" onClick={() => { setFormat([]); setColor(""); setSize(16); setFont("Sans"); applyStyle({ fontWeight: "400", fontStyle: "normal", textDecoration: "none", fontFamily: fonts.Sans, fontSize: "24px", color: "inherit", backgroundColor: "transparent" }); setMessage("Formatting reset."); }}><RemoveFormatting /></button>
              </div>
            </div>
          </div>
          <div className={styles.bottomRow}>
            <div className={styles.sizeControl}>
              <button type="button" aria-label="Decrease text size" disabled={size <= 12} onClick={() => updateSize(size - 1)}><Minus /></button>
              <input type="number" aria-label="Text size" min={12} max={72} value={size} onChange={event => { const value = Number(event.target.value); if (Number.isFinite(value)) updateSize(value); }} />
              <button type="button" aria-label="Increase text size" disabled={size >= 72} onClick={() => updateSize(size + 1)}><Plus /></button>
            </div>
            <ToggleGroup.Root className={styles.alignment} type="single" value={align} onValueChange={updateAlignment} aria-label="Text alignment">
              <ToggleGroup.Item value="left" aria-label="Align left"><AlignLeft /></ToggleGroup.Item><ToggleGroup.Item value="center" aria-label="Align center"><AlignCenter /></ToggleGroup.Item><ToggleGroup.Item value="right" aria-label="Align right"><AlignRight /></ToggleGroup.Item>
            </ToggleGroup.Root>
            <DropdownMenu.Root><DropdownMenu.Trigger className={styles.fontTrigger} aria-label={`Font: ${font}`}><span style={{ fontFamily: fonts[font] }}>{font}</span><ChevronDown /></DropdownMenu.Trigger>
              <DropdownMenu.Portal><DropdownMenu.Content className={styles.fontMenu} sideOffset={10} collisionPadding={16} align="end"><DropdownMenu.RadioGroup value={font} onValueChange={value => { setFont(value as keyof typeof fonts); applyStyle({ fontFamily: fonts[value as keyof typeof fonts] }); }}>{Object.entries(fonts).map(([name, family]) => <DropdownMenu.RadioItem key={name} value={name} style={{ fontFamily: family }} className={styles.fontItem}>{name}<DropdownMenu.ItemIndicator><Check size={15} /></DropdownMenu.ItemIndicator></DropdownMenu.RadioItem>)}</DropdownMenu.RadioGroup></DropdownMenu.Content></DropdownMenu.Portal>
            </DropdownMenu.Root>
          </div>
        </div>
      </div>
      <article className={styles.document} aria-label="Document preview">
        <div ref={editor} role="textbox" aria-label="Editable document" aria-multiline="true" contentEditable suppressContentEditableWarning spellCheck={false} className={styles.editor} onPointerUp={saveSelection} onKeyUp={saveSelection} onBlur={saveSelection} onInput={() => { selection.current = null; setSelectionBox(null); }}>
          <p>The best ideas usually start as a few words in the margin. Give them a little room, and they become something worth sharing.</p>
          <p data-quote className={styles.quote}>Make room for a little wonder.</p>
          <p>A notebook, an open window, a quiet afternoon. Sometimes that’s all it takes to see a familiar thing in a completely new way.</p>
          <p>Write it down while it’s still a little messy. Move the words around, find the right rhythm, and let the story take its own shape.</p>
        </div>
      </article>
          {selectionBox && <div className={styles.selection}>
            <button className={styles.startHandle} style={{ left: selectionBox.startLeft - 14, top: selectionBox.startTop - 14, height: selectionBox.startHeight + 28 }} type="button" aria-label="Drag selection start" onPointerDown={event => dragHandle(event, "start")} />
            <button className={styles.endHandle} style={{ left: selectionBox.endLeft - 14, top: selectionBox.endTop - 14, height: selectionBox.endHeight + 28 }} type="button" aria-label="Drag selection end" onPointerDown={event => dragHandle(event, "end")} />
          </div>}
      <p className={styles.status} role="status">{message}</p>
    </div>
  );
}
