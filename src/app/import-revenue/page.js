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
      .select(
        "platform, revenue_type, amount, entry_month"
      )
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

    const duplicateCount =
      entries.length - newEntries.length;

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

    alert(
      `Imported ${newEntries.length} new entries. ` +
        `Skipped ${duplicateCount} duplicate entries.`
    );

    router.push("/revenue");
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-10">
      <div className="max-w-5xl mx-auto">
        <Link
          href="/revenue"
          className="inline-block mb-8 border border-zinc-700 px-5 py-3 rounded-2xl hover:bg-zinc-800"
        >
          Back to Revenue
        </Link>

        <h1 className="text-5xl font-bold mb-4">Import Revenue CSV</h1>

        <p className="text-zinc-400 text-lg mb-8">
          Upload a CSV with these columns: platform, revenue_type, amount,
          entry_month, notes.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4">CSV Format</h2>

          <pre className="bg-zinc-950 border border-zinc-800 rounded-2xl p-4 overflow-x-auto text-zinc-300 text-sm">
        {`platform,revenue_type,amount,entry_month,notes
        Twitch,Subs,125.50,2026-05,May subs
        YouTube,Ads,87.20,2026-05,Ad revenue
        Kick,Donations,45.00,2026-05,Stream donations`}
          </pre>

          <Link
            href="/revenue-template.csv"
            className="inline-block mt-4 bg-white text-black px-5 py-3 rounded-2xl font-semibold"
          >
            Download CSV Template
          </Link>

          <p className="text-zinc-500 mt-4 text-sm">
            Flexible headers supported: platform/source/channel/site,
            revenue_type/type/category/income_type,
            amount/total/revenue/income/earnings,
            entry_month/month/date_month/period,
            notes/description/memo/details.
          </p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 mb-10">
          <input
            type="file"
            accept=".csv"
            onChange={handleFileUpload}
            className="w-full bg-zinc-800 border border-zinc-700 rounded-2xl p-4"
          />

          {fileName && (
            <p className="text-zinc-400 mt-4">Uploaded: {fileName}</p>
          )}

          {csvRows.length > 1 && (
            <div className="mt-4 text-sm text-zinc-400 space-y-1">
              <p>Valid rows: {validRows}</p>
              <p>Skipped rows: {skippedRows}</p>
            </div>
          )}

          {csvRows.length > 1 && (
            <button
              onClick={handleImport}
              disabled={isImporting}
              className="mt-6 bg-white text-black px-6 py-3 rounded-2xl font-semibold disabled:opacity-50"
            >
              {isImporting ? "Importing..." : "Import Revenue Entries"}
            </button>
          )}
        </div>

        {csvRows.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 overflow-x-auto">
            <h2 className="text-3xl font-bold mb-6">CSV Preview</h2>

            <table className="w-full text-left border-collapse">
              <tbody>
                {csvRows.slice(0, 10).map((row, rowIndex) => (
                  <tr key={rowIndex} className="border-b border-zinc-800">
                    {row.map((cell, cellIndex) => (
                      <td key={cellIndex} className="p-3 text-zinc-300">
                        {cell}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>

            <p className="text-zinc-500 mt-4 text-sm">
              Showing first 10 rows. Valid rows can now be imported.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}