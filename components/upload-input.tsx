"use client";

import { useEffect, useRef, useState, type DragEvent } from "react";
import { AnimatePresence, LayoutGroup, motion, useReducedMotion } from "motion/react";
import { Check, Play, RotateCcw, Square, TriangleAlert, Upload, X } from "lucide-react";

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
  return <span className={`relative inline-block h-[42px] w-[33px] shrink-0 [&>svg]:block [&>svg]:size-full [&>svg]:fill-white [&>svg]:stroke-[#d5d5da] [&>svg]:stroke-[1.4] [&>svg]:[stroke-linejoin:round] [&>span]:absolute [&>span]:bottom-[7px] [&>span]:left-0 [&>span]:rounded-[2px] [&>span]:bg-[#eaf0ff] [&>span]:px-1 [&>span]:py-[2px] [&>span]:text-[7px] [&>span]:font-[750] [&>span]:tracking-[.1px] [&>span]:text-[#5379c4] data-[tone=red]:[&>span]:bg-[#fce7ec] data-[tone=red]:[&>span]:text-[#d6576c] data-[tone=purple]:[&>span]:bg-[#eee4fc] data-[tone=purple]:[&>span]:text-[#9462d7] data-[tone=green]:[&>span]:bg-[#e1f2e8] data-[tone=green]:[&>span]:text-[#4c9e71] data-[tone=orange]:[&>span]:bg-[#fff0da] data-[tone=orange]:[&>span]:text-[#d29134] dark:[&>svg]:fill-[#252529] dark:[&>svg]:stroke-[#414145] dark:[&>span]:bg-[#242d42] dark:[&>span]:text-[#8aa9ed] dark:data-[tone=red]:[&>span]:bg-[#42232d] dark:data-[tone=red]:[&>span]:text-[#e56a86] dark:data-[tone=purple]:[&>span]:bg-[#332344] dark:data-[tone=purple]:[&>span]:text-[#b389ed] dark:data-[tone=green]:[&>span]:bg-[#20392d] dark:data-[tone=green]:[&>span]:text-[#72c493] dark:data-[tone=orange]:[&>span]:bg-[#3f3021] dark:data-[tone=orange]:[&>span]:text-[#e4b36b] max-[480px]:h-9 max-[480px]:w-7 ${className}`} data-tone={kind.tone} aria-hidden="true"><svg viewBox="0 0 38 48" fill="none"><path d="M6 1h18l13 13v28a5 5 0 0 1-5 5H6a5 5 0 0 1-5-5V6a5 5 0 0 1 5-5Z" /><path d="M24 1v9a4 4 0 0 0 4 4h9" /></svg><span>{kind.label}</span></span>;
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
    <div className="w-full max-w-[740px] font-sans text-[#202022] dark:text-[#ededf0] [&_button:focus-visible]:rounded [&_button:focus-visible]:outline-2 [&_button:focus-visible]:outline-offset-4 [&_button:focus-visible]:outline-[#4264f5]">
      <LayoutGroup>
        <motion.section layout transition={transition} className="mx-auto border border-[#ededee] bg-[#eeeeef] px-[5px] pt-[5px] dark:border-[#171719] dark:bg-[#101012]" aria-label="File uploader" style={{ width: dragging ? "100%" : files.length ? "100%" : "94%", borderRadius: 27 }}>
          <motion.div layout transition={transition} className="overflow-hidden bg-white px-2 pt-2 shadow-[0_1px_3px_#00000005] dark:bg-[#18181b] dark:shadow-[0_0_0_1px_#303033]" style={{ borderRadius: 23 }}>
            <motion.div layout transition={transition} className="group flex min-h-56 cursor-pointer flex-col items-center justify-center rounded-[17px] border-[1.5px] border-dashed border-[#d5d5d8] bg-[#fafafa] px-[15px] pb-6 pt-[29px] outline-none transition-colors duration-200 hover:border-[#b3b6c2] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#4264f5] data-[dragging=true]:border-solid data-[dragging=true]:border-[#3d62f5] data-[dragging=true]:bg-[#f1f3ff] dark:border-[#343437] dark:bg-[#1d1d20] dark:hover:border-[#52525a] dark:data-[dragging=true]:border-[#7790ff] dark:data-[dragging=true]:bg-[#20243b] max-[480px]:min-h-[205px] max-[480px]:px-[10px] max-[480px]:py-[23px] motion-reduce:transition-none" role="button" tabIndex={0} aria-label="Upload files" onClick={openPicker} onKeyDown={event => { if (event.target === event.currentTarget && (event.key === "Enter" || event.key === " ")) { event.preventDefault(); openPicker(); } }} data-dragging={dragging} onDragEnter={dragEnter} onDragOver={event => { event.preventDefault(); event.dataTransfer.dropEffect = "copy"; }} onDragLeave={event => { event.preventDefault(); dragDepth.current = Math.max(0, dragDepth.current - 1); if (!dragDepth.current) setDragging(false); }} onDrop={event => { event.preventDefault(); dragDepth.current = 0; setDragging(false); if (showcaseController.current) clearFiles(); addFiles(Array.from(event.dataTransfer.files)); }}>
              <input ref={input} onClick={event => event.stopPropagation()} className="hidden" type="file" multiple aria-label="Choose files to upload" onChange={event => { addFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
              <div className="relative mb-[18px] grid h-[85px] w-[150px] place-items-center dark:[&_svg]:fill-[#28282d] dark:[&_svg]:stroke-[#51515b]" aria-hidden="true">
                <motion.div className="absolute flex items-center justify-center [&>span]:h-[60px] [&>span]:w-[47px] [&>span]:drop-shadow-[0_2px_2px_#00000008] [&>span>span]:bottom-[10px] [&>span>span]:px-1 [&>span>span]:py-[2px] [&>span>span]:text-[9px] data-[side=right]:[&>span>span]:left-auto data-[side=right]:[&>span>span]:right-0" data-side="left" animate={{ x: dragging ? -43 : -28, y: dragging ? 9 : 8, rotate: dragging ? -19 : -13, scale: dragging ? 1 : 0.96 }} transition={transition}><FileIcon name="file.pdf" /></motion.div>
                <motion.div className="absolute flex items-center justify-center [&>span]:h-[60px] [&>span]:w-[47px] [&>span]:drop-shadow-[0_2px_2px_#00000008] [&>span>span]:bottom-[10px] [&>span>span]:px-1 [&>span>span]:py-[2px] [&>span>span]:text-[9px] data-[side=right]:[&>span>span]:left-auto data-[side=right]:[&>span>span]:right-0" data-side="right" animate={{ x: dragging ? 43 : 28, y: dragging ? 9 : 8, rotate: dragging ? 19 : 13, scale: dragging ? 1 : 0.96 }} transition={transition}><FileIcon name="file.png" /></motion.div>
                <motion.div className="relative z-[1] grid h-[67px] w-[53px] place-items-center rounded-[13px] border border-[#e3e3e6] bg-white shadow-[0_2px_4px_#00000006,0_5px_12px_#00000006] group-data-[dragging=true]:text-[#4264f5] dark:border-[#50505a] dark:bg-[#2c2c31] dark:shadow-[0_2px_4px_#0002,0_5px_12px_#0002]" animate={{ y: dragging ? -4 : 0, scale: dragging ? 1.05 : 1 }} transition={transition}><Upload size={23} strokeWidth={2} /></motion.div>
              </div>
              <div className="text-center [&_p]:mb-2 [&_p]:mt-0 [&_p]:text-lg [&_p]:leading-[1.4] [&_p]:font-[550] [&_p]:tracking-[-.45px] [&>span]:text-sm [&>span]:leading-[1.5] [&>span]:tracking-[.05px] [&>span]:text-[#909093] dark:[&>span]:text-[#87878e] max-[480px]:[&_p]:text-base max-[480px]:[&>span]:text-[11px]">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.p key={dragging ? "dragging" : "idle"} initial={{ opacity: 0, y: reduceMotion ? 0 : 5 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: reduceMotion ? 0 : -5 }} transition={{ duration: reduceMotion ? 0 : 0.12 }}>{dragging ? `Release to upload ${dragCount} ${dragCount === 1 ? "file" : "files"}` : <>Drop files here or <span className="cursor-pointer border-0 bg-transparent p-0 text-[#3e60ed] hover:underline hover:underline-offset-[3px] dark:text-[#8c9dff]">browse</span></>}</motion.p>
                </AnimatePresence>
                <span>PDF, PNG, JPG and more · up to 25 MB each</span>
              </div>
            </motion.div>
            <motion.ul layout transition={transition} className="m-0 list-none p-0" aria-label="Selected files">
              <AnimatePresence initial={false} mode="popLayout">
                {files.map(item => <motion.li layout key={item.id} transition={transition} initial={{ opacity: 0, y: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, x: reduceMotion ? 0 : 12, scale: reduceMotion ? 1 : 0.97 }} className="relative flex items-center gap-[15px] border-b border-[#ebebed] px-[10px] py-5 last:border-b-0 dark:border-[#2b2b2f] max-[480px]:gap-[11px] max-[480px]:px-[5px] max-[480px]:py-[17px] data-[status=error]:[&_p]:text-[#d84d68] data-[status=rejected]:[&_p]:text-[#d84d68] dark:data-[status=error]:[&_p]:text-[#ee6c89] dark:data-[status=rejected]:[&_p]:text-[#ee6c89] data-[status=error]:[&_[role=progressbar]>span]:bg-[#e65672]" data-status={item.status}>
                  <FileIcon name={item.file.name} />
                  <div className="min-w-0 flex-1 [&>p]:mb-0 [&>p]:mt-1 [&>p]:text-[13px] [&>p]:leading-[1.4] [&>p]:text-[#99999d] dark:[&>p]:text-[#8c8c95] max-[480px]:[&>p]:text-[11px]">
                    <div className="flex items-center gap-2 text-base leading-[1.4] font-medium tracking-[-.3px] [&>span:first-child]:truncate [&>span:last-child:not(:first-child)]:flex [&>span:last-child:not(:first-child)]:shrink-0 [&>span:last-child:not(:first-child)]:text-[#939397] max-[480px]:text-sm"><span title={item.file.name}>{item.file.name}</span><AnimatePresence>{item.status === "complete" && <motion.span initial={{ opacity: 0, scale: reduceMotion ? 1 : 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={transition}><Check size={15} strokeWidth={2} aria-label="Complete" /></motion.span>}</AnimatePresence></div>
                    <p>{item.error ? item.error : item.status === "complete" ? formatSize(item.file.size) : `${formatSize(item.file.size * item.progress)} of ${formatSize(item.file.size)} · ${Math.max(1, Math.ceil((1 - item.progress) * 5))}s left`}</p>
                    <AnimatePresence initial={false}>{(item.status === "uploading" || item.status === "error") && <motion.div key="progress" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} transition={{ duration: reduceMotion ? 0 : 0.18 }} className="mt-[11px] h-1 overflow-hidden rounded-[6px] bg-[#ededf0] [&>span]:block [&>span]:size-full [&>span]:origin-left [&>span]:rounded-[inherit] [&>span]:bg-[#252527] dark:bg-[#29292f] dark:[&>span]:bg-[#e5e5ed]" role="progressbar" aria-label={`${item.file.name} progress`} aria-valuenow={Math.round(item.progress * 100)} aria-valuemin={0} aria-valuemax={100}><motion.span initial={false} animate={{ scaleX: item.progress }} transition={{ duration: reduceMotion ? 0 : 0.15, ease: "linear" }} /></motion.div>}</AnimatePresence>
                  </div>
                  <div className="flex shrink-0 items-center gap-[3px] [&>button]:grid [&>button]:h-[30px] [&>button]:w-7 [&>button]:cursor-pointer [&>button]:place-items-center [&>button]:rounded-[7px] [&>button]:border-0 [&>button]:bg-transparent [&>button]:text-[#98989b] [&>button:hover]:bg-[#f3f3f5] [&>button:hover]:text-[#47474b] dark:[&>button:hover]:bg-[#29292e] dark:[&>button:hover]:text-[#dddde5] max-[480px]:[&>button]:w-[25px]">{item.status === "error" && <button type="button" aria-label={`Retry ${item.file.name}`} onClick={() => { if (!controllers.current.has(item.id)) void transfer(item); }}><RotateCcw size={18} /></button>}<button type="button" aria-label={`${item.status === "uploading" ? "Cancel" : "Remove"} ${item.file.name}`} onClick={() => removeFile(item.id)}><X size={18} /></button></div>
                </motion.li>)}
              </AnimatePresence>
            </motion.ul>
          </motion.div>
          <motion.footer layout transition={transition} className="flex min-h-[49px] items-center justify-between gap-3 px-3 py-[10px] text-[13px] leading-[1.5] text-[#949498] [&>span]:flex [&>span]:min-w-0 [&>span]:items-center [&>span]:gap-2 [&_button]:shrink-0 [&_button]:cursor-pointer [&_button]:border-0 [&_button]:bg-transparent [&_button]:py-[2px] [&_button]:pl-2 [&_button]:pr-0 [&_button]:text-[#75757b] [&_button:hover]:text-[#242426] dark:text-[#aaaab3] dark:[&_button]:text-[#a4a4ad] dark:[&_button:hover]:text-[#eeeef4] max-[480px]:text-[11px]"><span>{hasErrors && !active.length && <TriangleAlert size={16} />}<span role="status" aria-live="polite">{footer}</span></span><AnimatePresence>{files.length > 0 && <motion.button key="clear" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} type="button" onClick={() => clearFiles()}>Clear</motion.button>}</AnimatePresence></motion.footer>
        </motion.section>
      </LayoutGroup>
      {!onUpload && <>
        <p className="mb-0 mt-[17px] text-center text-[11px] tracking-[.1px] text-[#a5a5ab] dark:text-[#66666e]">Local preview · files stay on your device</p>
        <button className="fixed bottom-6 right-6 z-30 flex min-h-[39px] cursor-pointer items-center justify-center gap-[9px] rounded-xl border border-[#dedee3] bg-white px-[14px] text-xs font-medium text-[#53535c] shadow-[0_2px_4px_#00000003,0_5px_16px_#00000006] hover:bg-[#f5f5f7] hover:text-[#222228] dark:border-[#3a3a42] dark:bg-[#222226] dark:text-[#c5c5cf] dark:shadow-[0_5px_16px_#0002] dark:hover:bg-[#2d2d33] dark:hover:text-[#eeeef5] max-[480px]:bottom-4 max-[480px]:right-4" type="button" onClick={() => { if (showcasing) clearFiles(); else void playShowcase(); }} aria-label={showcasing ? "Stop showcase" : hasPlayed ? "Replay showcase" : "Play showcase"}>
          {showcasing ? <Square size={13} fill="currentColor" /> : hasPlayed ? <RotateCcw size={15} /> : <Play size={14} fill="currentColor" />}<span>{showcasing ? "Stop showcase" : hasPlayed ? "Replay showcase" : "Play showcase"}</span>
        </button>
      </>}
    </div>
  );
}
