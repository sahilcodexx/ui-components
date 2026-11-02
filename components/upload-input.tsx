"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check, Play, RotateCcw, Square, TriangleAlert, Upload, X } from "lucide-react";
import styles from "./upload-input.module.css";

const MAX_SIZE = 25 * 1024 * 1024;
const spring = { type: "spring" as const, stiffness: 280, damping: 30, mass: 0.8 };

type TransferOptions = { signal: AbortSignal; onProgress: (progress: number) => void };
export type UploadInputProps = { onUpload?: (file: File, options: TransferOptions) => Promise<void> };
type UploadFile = { id: string; file: File; progress: number; status: "uploading" | "complete" | "error" | "rejected"; error?: string };

function formatSize(bytes: number) {
  if (bytes < 1024 * 1024) return `${Math.max(0.1, bytes / 1024).toFixed(bytes < 1024 ? 1 : 0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fileKind(name: string) {
  const extension = name.split(".").pop()?.toUpperCase() ?? "FILE";
  return { label: extension.length <= 5 ? extension : "FILE", tone: extension === "PDF" ? "red" : ["PNG", "JPG", "JPEG", "WEBP", "SVG"].includes(extension) ? "purple" : ["XLSX", "CSV", "XLS"].includes(extension) ? "green" : ["MP4", "MOV", "WEBM"].includes(extension) ? "orange" : "blue" };
}

function FileIcon({ name, className = "" }: { name: string; className?: string }) {
  const kind = fileKind(name);
  return <span className={`${styles.fileIcon} ${className}`} data-tone={kind.tone} aria-hidden="true"><svg viewBox="0 0 38 48" fill="none"><path d="M6 1h18l13 13v28a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5Z" /><path d="M24 1v9a4 4 0 0 0 4 4h9" /></svg><span>{kind.label}</span></span>;
}

// Local preview transport; pass onUpload to report real server progress instead.
function previewTransfer(file: File, { signal, onProgress }: TransferOptions, failAt?: number): Promise<void> {
  return new Promise((resolve, reject) => {
    const duration = 2800 + Math.min(file.size / (1024 * 1024) * 320, 2200);
    const started = performance.now();
    function clean() { clearInterval(timer); signal.removeEventListener("abort", abort); window.removeEventListener("offline", offline); }
    function abort() { clean(); reject(new DOMException("Transfer cancelled", "AbortError")); }
    function offline() { clean(); reject(new Error("Connection lost")); }
    const timer = setInterval(() => {
      if (!navigator.onLine) { offline(); return; }
      const progress = Math.min((performance.now() - started) / duration, 1);
      onProgress(progress);
      if (failAt !== undefined && progress >= failAt) { offline(); return; }
      if (progress === 1) { clean(); resolve(); }
    }, 80);
    signal.addEventListener("abort", abort, { once: true });
    window.addEventListener("offline", offline, { once: true });
    if (signal.aborted) abort();
  });
}

export default function UploadInput({ onUpload }: UploadInputProps) {
  const [files, setFiles] = useState<UploadFile[]>([]);
  const [showcasing, setShowcasing] = useState(false);
  const [hasPlayed, setHasPlayed] = useState(false);
  const showcaseController = useRef<AbortController | null>(null);
  const [dragging, setDragging] = useState(false);
  const [dragCount, setDragCount] = useState(1);
  const input = useRef<HTMLInputElement>(null);
  const dragDepth = useRef(0);
  const controllers = useRef(new Map<string, AbortController>());
  const knownFiles = useRef(new Set<string>());
  const reduceMotion = useReducedMotion();
  const transition = reduceMotion ? { duration: 0 } : spring;
  const active = files.filter(file => file.status === "uploading");
  const complete = files.filter(file => file.status === "complete");
  const hasErrors = files.some(file => file.status === "error" || file.status === "rejected");
  const valid = files.filter(file => file.status !== "rejected");
  const totalSize = valid.reduce((total, item) => total + item.file.size, 0);
  const transferred = valid.reduce((total, item) => total + item.file.size * item.progress, 0);

  useEffect(() => {
    const pending = controllers.current;
    const showcase = showcaseController;
    return () => { showcase.current?.abort(); pending.forEach(controller => controller.abort()); pending.clear(); };
  }, []);

  async function transfer(item: UploadFile, failPreview = false) {
    const controller = new AbortController();
    controllers.current.set(item.id, controller);
    setFiles(current => current.map(file => file.id === item.id ? { ...file, status: "uploading", progress: 0, error: undefined } : file));
    try {
      await (onUpload ?? ((file, options) => previewTransfer(file, options, failPreview ? 0.58 : undefined)))(item.file, { signal: controller.signal, onProgress: value => {
        if (controller.signal.aborted || !Number.isFinite(value)) return;
        setFiles(current => current.map(file => file.id === item.id ? { ...file, progress: Math.max(file.progress, Math.min(1, Math.max(0, value))) } : file));
      } });
      if (!controller.signal.aborted) setFiles(current => current.map(file => file.id === item.id ? { ...file, progress: 1, status: "complete" } : file));
    } catch (error) {
      if (!controller.signal.aborted) setFiles(current => current.map(file => file.id === item.id ? { ...file, status: "error", error: error instanceof Error ? error.message : "Upload failed. Please retry." } : file));
    } finally {
      if (controllers.current.get(item.id) === controller) controllers.current.delete(item.id);
    }
  }

  function addFiles(incoming: File[], failPreviewName?: string) {
    const added: UploadFile[] = [];
    for (const file of incoming) {
      const id = `${file.name}-${file.size}-${file.lastModified}`;
      if (knownFiles.current.has(id)) continue;
      knownFiles.current.add(id);
      added.push({ id, file, progress: 0, status: file.size > MAX_SIZE ? "rejected" : "uploading", error: file.size > MAX_SIZE ? "Too large – max 25 MB" : undefined });
    }
    setFiles(current => [...current, ...added]);
    added.filter(file => file.status === "uploading").forEach(item => { void transfer(item, item.file.name === failPreviewName); });
    return added;
  }

  function removeFile(id: string, stopShowcase = true) {
    if (stopShowcase) stopShowcasePlayback();
    controllers.current.get(id)?.abort();
    controllers.current.delete(id);
    knownFiles.current.delete(id);
    setFiles(current => current.filter(file => file.id !== id));
  }

  function clearFiles(stopShowcase = true) {
    if (stopShowcase) stopShowcasePlayback();
    controllers.current.forEach(controller => controller.abort());
    controllers.current.clear();
    knownFiles.current.clear();
    setFiles([]);
  }

  function stopShowcasePlayback() {
    showcaseController.current?.abort();
    showcaseController.current = null;
    setShowcasing(false);
    setDragging(false);
    dragDepth.current = 0;
  }

  function openPicker() {
    if (showcaseController.current) clearFiles();
    input.current?.click();
  }

  async function playShowcase() {
    if (onUpload) return;
    clearFiles();
    const controller = new AbortController();
    showcaseController.current = controller;
    setShowcasing(true);
    setHasPlayed(true);
    function wait(milliseconds: number) {
      return new Promise<void>((resolve, reject) => {
        function abort() { clearTimeout(timer); reject(new DOMException("Showcase stopped", "AbortError")); }
        const timer = setTimeout(() => { controller.signal.removeEventListener("abort", abort); resolve(); }, milliseconds);
        controller.signal.addEventListener("abort", abort, { once: true });
        if (controller.signal.aborted) abort();
      });
    }
    try {
      await wait(700);
      setDragCount(4);
      setDragging(true);
      await wait(1600);
      setDragging(false);
      const samples = [
        ["Q3-Board-Report.pdf", 4.2, "application/pdf"],
        ["Hero-Shot.png", 2.6, "image/png"],
        ["Budget-2027.xlsx", 1.3, "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"],
        ["Product-Demo.mp4", 28, "video/mp4"],
      ] as const;
      const added = addFiles(samples.map(([name, mb, type]) => new File([new Uint8Array(Math.round(mb * 1024 * 1024))], name, { type })), "Budget-2027.xlsx");
      await wait(6500);
      const retry = added.find(item => item.file.name === "Budget-2027.xlsx");
      if (retry) void transfer(retry);
      await wait(4300);
      const oversized = added.find(item => item.status === "rejected");
      if (oversized) removeFile(oversized.id, false);
      await wait(1800);
      clearFiles(false);
      await wait(800);
    } catch (error) {
      if (!controller.signal.aborted) console.error("Showcase could not finish", error);
    } finally {
      if (showcaseController.current === controller) {
        showcaseController.current = null;
        setShowcasing(false);
        setDragging(false);
      }
    }
  }

  function dragEnter(event: DragEvent) {
    event.preventDefault();
    if (!Array.from(event.dataTransfer.types).includes("Files")) return;
    dragDepth.current++;
    setDragCount(Math.max(1, event.dataTransfer.items.length));
    setDragging(true);
  }

  const footer = !files.length ? "No files yet" : active.length ? `${onUpload ? "Uploading" : "Transferring"} ${active.length} of ${files.length} · ${formatSize(transferred)} of ${formatSize(totalSize)}` : `${complete.length} of ${files.length} ${onUpload ? "uploaded" : "ready"}`;

  return (
    <div className={styles.stage}>
      <LayoutGroup>
        <motion.section layout transition={transition} className={styles.shell} aria-label="File uploader" style={{ width: dragging ? "100%" : files.length ? "100%" : "94%", borderRadius: 27 }}>
          <motion.div layout transition={transition} className={styles.surface} style={{ borderRadius: 23 }}>
            <motion.div layout transition={transition} className={styles.dropzone} role="button" tabIndex={0} aria-label="Upload files" onClick={openPicker} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openPicker(); } }} data-dragging={dragging} onDragEnter={dragEnter} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (showcaseController.current) clearFiles(); addFiles(Array.from(event.dataTransfer.files)); }}>
              <input ref={input} onClick={event => event.stopPropagation()} className={styles.hiddenInput} type="file" multiple aria-label="Choose files to upload" onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
              <div className={styles.cards} aria-hidden="true">
                <motion.div className={styles.backCard} data-side="left" animate={{ x: dragging ? -43 : -28, y: dragging ? 9 : 8, rotate: dragging ? -19 : -13, scale: dragging ? 1 : 0.96 }} transition={transition}><FileIcon name="file.pdf" /></motion.div>
                <motion.div className={styles.backCard} data-side="right" animate={{ x: dragging ? 43 : 28, y: dragging ? 9 : 8, rotate: dragging ? 19 : 13, scale: dragging ? 1 : 0.96 }} transition={transition}><FileIcon name="file.png" /></motion.div>
                <motion.div className={styles.uploadCard} animate={{ y: dragging ? -4 : 0, scale: dragging ? 1.05 : 1 }} transition={transition}><Upload size={23} strokeWidth={2} /></motion.div>
              </div>
              <div className={styles.prompt}>
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={dragging ? "dragging" : "idle"} initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -5 }} transition={{ duration: reduceMotion ? 0 : 0.12 }}>{dragging ? `Release to upload ${dragCount} ${dragCount === 1 ? "file" : "files"}` : <>Drop files here or <span className={styles.browse}>browse</span></>}</motion.p>
                </AnimatePresence>
                <span>PDF, PNG, JPG and more · up to 25 MB each</span>
              </div>
            </motion.div>
            <motion.ul layout transition={transition} className={styles.fileList} aria-label="Selected files">
              <AnimatePresence initial={false} mode="popLayout">
                {files.map(item => <motion.li layout key={item.id} transition={transition} initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }} className={styles.fileRow} data-status={item.status}>
                  <FileIcon name={item.file.name} />
                  <div className={styles.fileDetails}>
                    <div className={styles.fileName}><span title={item.file.name}>{item.file.name}</span><AnimatePresence>{item.status === "complete" && <motion.span initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={transition}><Check size={15} strokeWidth={2} aria-label="Complete" /></motion.span>}</AnimatePresence></div>
                    <p>{item.error ? item.error : item.status === "complete" ? formatSize(item.file.size) : `${formatSize(item.file.size * item.progress)} of ${formatSize(item.file.size)} · ${Math.max(1, Math.ceil((1 - item.progress) * 5))}s left`}</p>
                    <AnimatePresence initial={false}>{(item.status === "uploading" || item.status === "error") && <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className={styles.progress} role="progressbar" aria-label={`${item.file.name} progress`} aria-valuenow={Math.round(item.progress * 100)} aria-valuemin={0} aria-valuemax={100}><motion.span initial={false} animate={{ scaleX: item.progress }} transition={{ duration: reduceMotion ? 0 : 0.15, ease: "linear" }} /></motion.div>}</AnimatePresence>
                  </div>
                  <div className={styles.rowActions}>{item.status === "error" && <button type="button" aria-label={`Retry ${item.file.name}`} onClick={() => { if (!controllers.current.has(item.id)) void transfer(item); }}><RotateCcw size={18} /></button>}<button type="button" aria-label={`${item.status === "uploading" ? "Cancel" : "Remove"} ${item.file.name}`} onClick={() => removeFile(item.id)}><X size={18} /></button></div>
                </motion.li>)}
              </AnimatePresence>
            </motion.ul>
          </motion.div>
          <motion.footer layout transition={transition} className={styles.footer}><span>{hasErrors && !active.length && <TriangleAlert size={16} />}<span role="status" aria-live="polite">{footer}</span></span><AnimatePresence>{files.length > 0 && <motion.button key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" onClick={() => clearFiles()}>Clear</motion.button>}</AnimatePresence></motion.footer>
        </motion.section>
      </LayoutGroup>
      {!onUpload && <>
        <p className={styles.previewNote}>Local preview · files stay on your device</p>
        <button className={styles.showcaseButton} type="button" onClick={() => { if (showcasing) clearFiles(); else void playShowcase(); }} aria-label={showcasing ? "Stop showcase" : hasPlayed ? "Replay showcase" : "Play showcase"}>
          {showcasing ? <Square size={13} fill="currentColor" /> : hasPlayed ? <RotateCcw size={15} /> : <Play size={14} fill="currentColor" />}<span>{showcasing ? "Stop showcase" : hasPlayed ? "Replay showcase" : "Play showcase"}</span>
        </button>
      </>}
    </div>
  );
}
