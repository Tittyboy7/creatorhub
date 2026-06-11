"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function ImportRevenuePage() {
  const router = useRouter();

  const [fileName, setFileName] = useState("");
  const [csvRows, setCsvRows] = useState([]);
  const [isImporting, setIsImporting] = useState(false);
  const [headers = [], ...dataRows] = csvRows;

  const normalizedPreviewHeaders = headers.map((header) =>
    normalizeHeader(header)
  );

  const skippedRows =
    dataRows.length > 0
      ? dataRows.filter((row) => {
          const rowData = {};

          normalizedPreviewHeaders.forEach((header, index) => {
            rowData[header] = row[index] || "";
          });

          const platform = getValue(rowData, [
            "platform",
            "source",
            "channel",
            "site",
          ]);

          const revenueType = getValue(rowData, [
            "revenue_type",
            "type",
            "category",
            "income_type",
          ]);

          const amount = Number(
            getValue(rowData, [
              "amount",
              "total",
              "revenue",
              "income",
              "earnings",
            ])
          );

          const entryMonth = getValue(rowData, [
            "entry_month",
            "month",
            "date_month",
            "period",
          ]);

          return !(
            platform &&
            revenueType &&
            amount > 0 &&
            entryMonth
          );
        }).length
      : 0;

  const validRows = Math.max(dataRows.length - skippedRows, 0);

  function handleFileUpload(e) {
    const file = e.target.files[0];

    if (!file) return;

    setFileName(file.name);

    const reader = new FileReader();

    reader.onload = (event) => {
      const text = event.target.result;

      const rows = text
        .split("\n")
        .map((row) => row.trim())
        .filter(Boolean)
        .map((row) => row.split(",").map((cell) => cell.trim()));

      setCsvRows(rows);
    };

    reader.readAsText(file);
  }

  function getValue(rowData, possibleKeys) {
    for (const key of possibleKeys) {
      if (rowData[key]) {
        return rowData[key];
      }
    }

    return "";
  }

  function normalizeHeader(header) {
    return header
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "_")
      .replace(/-/g, "_");
  }

  async function handleImport() {
    if (csvRows.length < 2) {
      alert("Your CSV needs a header row and at least one data row.");
      return;
    }

    setIsImporting(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert("You must be logged in.");
      setIsImporting(false);
      return;
    }

    const { data: creator } = await supabase
      .from("creators")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (!creator) {
      alert("You must create a creator profile first.");
      setIsImporting(false);
      return;
    }

    const [headers, ...dataRows] = csvRows;

    const normalizedHeaders = headers.map((header) =>
      normalizeHeader(header)
    );

    const entries = dataRows
      .map((row) => {
        const rowData = {};

        normalizedHeaders.forEach((header, index) => {
          rowData[header] = row[index] || "";
        });

        return {
          user_id: user.id,
          creator_id: creator.id,
          platform: getValue(rowData, [
            "platform",
            "source",
            "channel",
            "site",
          ]),
          revenue_type: getValue(rowData, [
            "revenue_type",
            "type",
            "category",
            "income_type",
          ]),
          amount: Number(
            getValue(rowData, [
              "amount",
              "total",
              "revenue",
              "income",
              "earnings",
            ])
          ),
          entry_month: getValue(rowData, [
            "entry_month",
            "month",
            "date_month",
            "period",
          ]),
          notes: getValue(rowData, [
            "notes",
            "description",
            "memo",
            "details",
          ]),
        };
      })
      .filter(
        (entry) =>
          entry.platform &&
          entry.revenue_type &&
          entry.amount > 0 &&
          entry.entry_month
      );

    if (entries.length === 0) {
      alert(
        "No valid rows found. Make sure your CSV has platform, revenue_type, amount, entry_month, and notes columns."
      );
      setIsImporting(false);
      return;
    }

    const { data: existingEntries } = await supabase
      .from("revenue_entries")
      .select("platform, revenue_type, amount, entry_month")
      .eq("creator_id", creator.id);

    const newEntries = entries.filter((entry) => {
      return !(existingEntries || []).some(
        (existing) =>
          existing.platform === entry.platform &&
          existing.revenue_type === entry.revenue_type &&
          Number(existing.amount) === Number(entry.amount) &&
          existing.entry_month === entry.entry_month
      );
    });

    const duplicateCount = entries.length - newEntries.length;

    if (newEntries.length === 0) {
      alert(
        `All ${entries.length} rows already exist. No new entries were imported.`
      );
      setIsImporting(false);
      return;
    }

    const { error } = await supabase
      .from("revenue_entries")
      .insert(newEntries);

    if (error) {
      alert(error.message);
      setIsImporting(false);
      return;
    }

    const { data: preferences } = await supabase
      .from("notification_preferences")
      .select("revenue_imports")
      .eq("user_id", user.id)
      .maybeSingle();

    if (preferences?.revenue_imports !== false) {
      await supabase.from("notifications").insert({
        user_id: user.id,
        creator_id: creator.id,
        type: "revenue",
        title: "Revenue Import Completed",
        message:
          `Imported ${newEntries.length} new entries. ` +
          `Skipped ${duplicateCount} duplicate entries.`,
      });
    }

    alert(
      `Imported ${newEntries.length} new entries. ` +
        `Skipped ${duplicateCount} duplicate entries.`
    );

    router.push("/revenue");
  }

  return (
    <div className="min-h-screen bg-zinc-950 px-5 py-8 text-white md:p-10">
      <div className="mx-auto max-w-6xl space-y-8">
        <Link
          href="/revenue"
          className="inline-block rounded-2xl border border-zinc-700 px-5 py-3 hover:bg-zinc-800"
        >
          Back to Revenue
        </Link>

        <section className="rounded-[2rem] border border-zinc-800 bg-gradient-to-br from-zinc-900 via-zinc-950 to-black p-6 shadow-2xl md:p-10">
          <p className="mb-3 text-sm font-semibold uppercase tracking-wide text-zinc-500">
            Bulk Revenue Import
          </p>

          <h1 className="text-4xl font-bold md:text-5xl">
            Import Revenue CSV
          </h1>

          <p className="mt-4 max-w-3xl text-zinc-400">
            Upload revenue entries from spreadsheets, payout reports, or platform exports.
            CSV imports help you move faster while real-time platform syncing is built later.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Upload CSV
              </h2>

              <p className="mt-2 text-sm text-zinc-500">
                Choose a CSV file with revenue rows. Valid rows can be imported directly
                into your revenue dashboard.
              </p>

              <input
                type="file"
                accept=".csv"
                onChange={handleFileUpload}
                className="mt-6 w-full rounded-2xl border border-zinc-700 bg-zinc-800 p-4"
              />

              {fileName && (
                <p className="mt-4 text-sm text-zinc-400">
                  Uploaded: {fileName}
                </p>
              )}

              {csvRows.length > 1 && (
                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Valid Rows</p>
                    <p className="mt-1 text-2xl font-bold">{validRows}</p>
                  </div>

                  <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                    <p className="text-xs text-zinc-500">Skipped Rows</p>
                    <p className="mt-1 text-2xl font-bold">{skippedRows}</p>
                  </div>
                </div>
              )}

              {csvRows.length > 1 && (
                <button
                  onClick={handleImport}
                  disabled={isImporting}
                  className="mt-6 w-full rounded-2xl bg-white px-6 py-4 font-semibold text-black hover:bg-zinc-200 disabled:opacity-50"
                >
                  {isImporting ? "Importing..." : "Import Revenue Entries"}
                </button>
              )}
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Supported Columns
              </h2>

              <p className="mt-3 text-sm leading-relaxed text-zinc-400">
                Required data includes platform, revenue type, amount, and entry month.
                Notes are optional.
              </p>

              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                {[
                  "platform / source / channel / site",
                  "revenue_type / type / category / income_type",
                  "amount / total / revenue / income / earnings",
                  "entry_month / month / date_month / period",
                  "notes / description / memo / details",
                ].map((item) => (
                  <div
                    key={item}
                    className="rounded-2xl border border-zinc-800 bg-zinc-950 p-3 text-sm text-zinc-400"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <h2 className="text-2xl font-bold">
                    CSV Format
                  </h2>

                  <p className="mt-2 text-sm text-zinc-500">
                    Use this format for the cleanest import experience.
                  </p>
                </div>

                <Link
                  href="/revenue-template.csv"
                  className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-zinc-200"
                >
                  Download Template
                </Link>
              </div>

              <pre className="mt-6 overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950 p-4 text-sm text-zinc-300">
{`platform,revenue_type,amount,entry_month,notes
Twitch,Subs,125.50,2026-05,May subs
YouTube,Ads,87.20,2026-05,Ad revenue
Kick,Donations,45.00,2026-05,Stream donations`}
              </pre>
            </div>

            <div className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
              <h2 className="text-2xl font-bold">
                Import behavior
              </h2>

              <div className="mt-5 space-y-3">
                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-semibold">Duplicates are skipped</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Matching platform, type, amount, and month entries are not imported twice.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-semibold">Invalid rows are ignored</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Rows missing required values will be counted as skipped rows.
                  </p>
                </div>

                <div className="rounded-2xl border border-zinc-800 bg-zinc-950 p-4">
                  <p className="font-semibold">Revenue dashboard updates</p>
                  <p className="mt-1 text-sm text-zinc-500">
                    Imported entries immediately appear in your revenue charts and breakdowns.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {csvRows.length > 0 && (
          <section className="rounded-3xl border border-zinc-800 bg-zinc-900 p-6">
            <div className="mb-6 flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <h2 className="text-2xl font-bold md:text-3xl">
                  CSV Preview
                </h2>

                <p className="mt-1 text-sm text-zinc-500">
                  Showing the first 10 rows before import.
                </p>
              </div>

              <p className="text-sm text-zinc-500">
                Duplicate entries will be skipped automatically.
              </p>
            </div>

            <div className="overflow-x-auto rounded-2xl border border-zinc-800">
              <table className="w-full border-collapse text-left">
                <tbody>
                  {csvRows.slice(0, 10).map((row, rowIndex) => (
                    <tr key={rowIndex} className="border-b border-zinc-800 last:border-b-0">
                      {row.map((cell, cellIndex) => (
                        <td
                          key={cellIndex}
                          className="p-3 text-sm text-zinc-300"
                        >
                          {cell}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}