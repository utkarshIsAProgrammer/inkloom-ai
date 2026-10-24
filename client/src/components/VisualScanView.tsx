import { useRef, useState } from "react";
import type { ImageScanResult } from "../types";
import { scanImage } from "../lib/api";
import { SAMPLE_ALT_ASSET, SAMPLE_ALT_TEXT, VISUAL_CHANNELS } from "../lib/constants";
import { messageOf } from "../lib/errors";
import PageHead from "./PageHead";
import ViolationRow from "./ViolationRow";
import { Button } from "./ui/Button";
import { SelectField, TextField } from "./ui/Field";
import { Notice, Panel, PanelHead } from "./ui/Panel";
import { ScoreReadout, Stat } from "./ui/Readout";

const MAX_INPUT_BYTES = 15 * 1024 * 1024;
const MAX_EDGE = 1100;

/** Resize and compress in the browser so uploads stay under a few hundred KB. */
async function compressImage(file: File): Promise<{ dataUrl: string; bytes: number }> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(bitmap.width * scale));
  canvas.height = Math.max(1, Math.round(bitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("This browser cannot prepare images.");
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();
  const dataUrl = canvas.toDataURL("image/jpeg", 0.82);
  const bytes = Math.round((dataUrl.length - dataUrl.indexOf(",") - 1) * 0.75);
  return { dataUrl, bytes };
}

export default function VisualScanView({
  notify,
}: {
  notify: (text: string, tone?: "info" | "error") => void;
}) {
  const [assetName, setAssetName] = useState("Brand hero graphic");
  const [channel, setChannel] = useState(VISUAL_CHANNELS[0]);
  const [altText, setAltText] = useState("");
  const [image, setImage] = useState<{ dataUrl: string; bytes: number } | null>(null);
  const [fileName, setFileName] = useState("");
  const [result, setResult] = useState<ImageScanResult | null>(null);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function handleFile(file: File | null) {
    if (!file) return;
    if (!/^image\/(png|jpeg|webp)$/.test(file.type)) {
      setError("Use a PNG, JPEG or WebP image.");
      return;
    }
    if (file.size > MAX_INPUT_BYTES) {
      setError("Choose an image under 15 MB.");
      return;
    }
    try {
      const compressed = await compressImage(file);
      setImage(compressed);
      setFileName(file.name);
      setError(null);
    } catch (cause) {
      setError(messageOf(cause));
    }
  }

  async function runScan() {
    setError(null);
    setScanning(true);
    try {
      const response = await scanImage({
        image_base64: image?.dataUrl ?? null,
        alt_text: altText,
        asset_name: assetName.trim() || "Brand asset",
        channel,
      });
      setResult(response);
      notify("Asset checked against the palette and WCAG 2.1 AA.");
    } catch (cause) {
      setError(messageOf(cause));
    } finally {
      setScanning(false);
    }
  }

  return (
    <div className="pb-10">
      <PageHead
        title="Check the image."
        description="Palette match, contrast and alt text are scored in one pass. Nothing is stored."
      />

      <div className="mt-6 grid grid-cols-1 gap-6 xl:grid-cols-12">
        <div className="xl:col-span-5">
          <Panel>
            <PanelHead label="Asset" />
            <div className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <TextField
                  id="visual-name"
                  label="Asset name"
                  value={assetName}
                  onChange={(event) => setAssetName(event.target.value)}
                />
                <SelectField
                  id="visual-channel"
                  label="Placement"
                  value={channel}
                  onChange={(event) => setChannel(event.target.value)}
                >
                  {VISUAL_CHANNELS.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                </SelectField>
              </div>

              <div className="mt-3">
                <input
                  ref={input}
                  id="visual-file"
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="sr-only"
                  onChange={(event) => void handleFile(event.target.files?.[0] ?? null)}
                />
                <div className="flex flex-wrap items-center gap-3 rounded-[8px] border border-dashed border-line p-3">
                  <label
                    htmlFor="visual-file"
                    className="inline-flex h-8 cursor-pointer items-center rounded-[8px] border border-line px-2.5 text-[12px] transition-colors hover:border-ink"
                  >
                    Choose image
                  </label>
                  <span className="min-w-0 flex-1 truncate font-mono text-[10px] uppercase tracking-[0.04em] text-muted">
                    {fileName
                      ? `${fileName} · ${Math.max(1, Math.round((image?.bytes ?? 0) / 1024))} KB`
                      : "PNG, JPEG or WebP"}
                  </span>
                  {image ? (
                    <Button
                      variant="quiet"
                      onClick={() => {
                        setImage(null);
                        setFileName("");
                        if (input.current) input.current.value = "";
                      }}
                    >
                      Remove
                    </Button>
                  ) : null}
                </div>
                <p className="mt-1.5 text-[11px] font-light text-muted">
                  Resized in your browser before upload.
                </p>
              </div>

              {image ? (
                <div className="mt-3 overflow-hidden rounded-[8px] border border-line">
                  <img
                    src={image.dataUrl}
                    alt={altText || "Selected brand asset preview"}
                    className="max-h-[200px] w-full object-contain"
                  />
                </div>
              ) : null}

              <div className="mt-3">
                <label htmlFor="visual-alt" className="meta mb-1.5 block text-muted">
                  Alt text
                </label>
                <textarea
                  id="visual-alt"
                  className="field font-light"
                  rows={3}
                  value={altText}
                  onChange={(event) => setAltText(event.target.value)}
                  placeholder="Describe what the asset communicates."
                />
              </div>

              {error ? (
                <div className="mt-3">
                  <Notice tone="error">{error}</Notice>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <Button onClick={runScan} busy={scanning}>
                  {scanning ? "Checking" : "Check asset"}
                </Button>
                <Button
                  variant="accent"
                  onClick={() => {
                    setAssetName(SAMPLE_ALT_ASSET);
                    setAltText(SAMPLE_ALT_TEXT);
                    setError(null);
                  }}
                >
                  Sample: weak alt text
                </Button>
              </div>
            </div>
          </Panel>
        </div>

        <div className="space-y-4 xl:col-span-7">
          {result === null ? (
            <Panel>
              <PanelHead label="Result" />
              <div className="p-4">
                <p className="text-[13px] font-light text-muted">
                  Upload an image or check alt text alone. Results appear here.
                </p>
              </div>
            </Panel>
          ) : (
            <>
              <Panel>
                <PanelHead
                  label="Result"
                  right={
                    <span className="meta text-muted">{result.status.replace(/_/g, " ")}</span>
                  }
                />
                <div className="p-4">
                  <ScoreReadout
                    score={result.compliance_score}
                    grade={
                      result.compliance_score >= 80
                        ? "PASS"
                        : result.compliance_score >= 50
                          ? "FIX"
                          : "FAIL"
                    }
                    note="Palette, alt text and contrast."
                  />

                  <div className="mt-4 flex flex-wrap gap-2">
                    {result.dominant_colors.map((hex) => (
                      <div key={hex} className="w-[64px]">
                        <span
                          aria-hidden="true"
                          className="block h-10 w-full border border-line"
                          style={{ backgroundColor: hex }}
                        />
                        <span className="mt-1 block font-mono text-[9px] text-muted">
                          {hex.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>

                  <dl className="mt-4 grid grid-cols-3 gap-4 border-t border-line pt-4">
                    <Stat label="Palette" value={`${result.brand_palette_match}%`} />
                    <Stat
                      label="Contrast"
                      value={`${result.contrast_ratio}:1 ${result.wcag_pass ? "AA" : "fail"}`}
                    />
                    <Stat label="Alt text" value={`${result.alt_text_score}/100`} />
                  </dl>

                  <p className="mt-3 text-[12px] font-light text-muted">
                    {result.alt_text_feedback}
                  </p>
                  <p className="mt-2 border-l-2 border-accent pl-2 font-mono text-[11px] leading-relaxed">
                    {result.suggested_alt_text}
                  </p>

                  {result.recommendations.length > 0 ? (
                    <ul className="mt-3 space-y-1 border-t border-line pt-3">
                      {result.recommendations.slice(0, 3).map((recommendation) => (
                        <li
                          key={recommendation}
                          className="text-[12px] font-light leading-relaxed text-muted"
                        >
                          {recommendation}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              </Panel>

              <Panel>
                <PanelHead label={`Findings · ${result.violations.length}`} />
                <div className="px-4">
                  {result.violations.length === 0 ? (
                    <p className="py-5 text-[13px] font-light text-muted">
                      No visual guideline was triggered.
                    </p>
                  ) : (
                    result.violations.map((violation, index) => (
                      <ViolationRow
                        key={`${violation.rule_id}-${index}`}
                        violation={violation}
                      />
                    ))
                  )}
                </div>
              </Panel>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
