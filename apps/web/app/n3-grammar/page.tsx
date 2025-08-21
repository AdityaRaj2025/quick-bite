import path from "node:path";
import fs from "node:fs";
import styles from "./docx.module.css";

export const runtime = "nodejs";

async function convertDocxToHtml(
  absDocxPath: string
): Promise<{ html: string; note?: string }> {
  try {
    if (!fs.existsSync(absDocxPath)) {
      return {
        html: "",
        note: `File not found at ${absDocxPath}`,
      };
    }

    // Lazy load to avoid build-time error if dependency isn't installed yet
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const mammoth = require("mammoth") as any;
    const result = await mammoth.convertToHtml({ path: absDocxPath });
    return { html: result.value as string };
  } catch (error: any) {
    return {
      html: "",
      note:
        error?.message ||
        "Failed to convert DOCX. Make sure 'mammoth' is installed.",
    };
  }
}

export default async function Page() {
  const docxPath = path.resolve(process.cwd(), "..", "..", "blog", "N3.docx");
  const { html, note } = await convertDocxToHtml(docxPath);

  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight">
          N3 Grammar Explained
        </h1>
        <p className="text-muted-foreground mt-2">
          Clean, readable version of your DOCX, optimized for screen reading.
        </p>
      </div>

      {note ? (
        <div className="mb-6 rounded-lg border border-dashed p-4 text-sm">
          <p className="font-medium">Heads up</p>
          <p className="text-muted-foreground mt-1">
            {note}. If you are developing locally, install the converter with:
          </p>
          <pre className="mt-3 overflow-auto rounded-md bg-muted p-3 text-xs">
            <code>npm install -w @quick-bite/web mammoth</code>
          </pre>
        </div>
      ) : null}

      <article
        className={`${styles.content} bg-card text-card-foreground rounded-xl border p-6 shadow-sm`}
      >
        {html ? (
          <div dangerouslySetInnerHTML={{ __html: html }} />
        ) : (
          <p className="text-muted-foreground">No content to display.</p>
        )}
      </article>
    </main>
  );
}
