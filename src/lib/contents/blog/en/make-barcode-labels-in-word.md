---
title: "How to Make Barcode Labels in Word (Free, No Label Software Needed)"
date: "2026-07-13"
description: "Print barcode labels using Microsoft Word or Google Docs and standard Avery sheets — no paid label software. Step-by-step layout, sizing, and printing guide."
ctaTool: "barcode-generator"
---

You do not need paid label software or a special printer to make barcode labels. Microsoft Word (or Google Docs), a sheet of Avery-style labels, and a regular office printer are enough.

The workflow has two halves: generate the barcode images with the free [Barcode Generator](/barcode-generator), then lay them out in a Word label template and print.

This guide walks through the whole thing, including the mistakes that make Word-printed barcodes fail to scan.

---

## What You Need

* **Barcode images.** Created with the [Barcode Generator](/barcode-generator) and exported as PNG — the format Word handles best. One code or hundreds; for a batch, use the [bulk workflow](/blog/bulk-barcode-generator-excel-csv).
* **A label sheet.** Avery-style adhesive sheets from any office supply store. Avery 5160 (2.625 × 1 in, 30 labels per sheet) is the common default; Avery 5163 (4 × 2 in, 10 per sheet) gives more room for retail UPC/EAN barcodes or long codes.
* **Microsoft Word or Google Docs.** Any recent version.
* **A laser or inkjet printer.** Laser is preferable for barcodes — crisper lines, no wet ink. Inkjet works with good label stock and a test scan.

Not sure which label size fits your barcode type? The [barcode label size guide](/blog/barcode-label-sizes) has the numbers.

---

## Step 1: Generate the Barcode Images

Open the [Barcode Generator](/barcode-generator) and create your barcodes:

* **A few labels:** use Manual mode — type each code, download each PNG.
* **A list from a spreadsheet:** use Upload mode — Excel/CSV with the code in Column A and a label in Column B, and the whole batch generates at once.
* **A numbered series** (`BOX-001` to `BOX-120`): use Sequential mode — set the prefix, start number, and quantity, and skip the spreadsheet entirely.

Export as **PNG**. Word places PNG images cleanly; SVG support in office software is inconsistent.

Pick the right barcode type before generating: **Code 128** for inventory, SKUs, and asset tags; **UPC-A or EAN-13** only if you have official retail numbers ([details here](/blog/product-barcode-guide-upc-vs-ean)).

Everything runs in your browser — your SKU list is never uploaded to a server.

---

## Step 2: Open the Label Template in Word

Word has every common Avery layout built in:

1. Go to **Mailings → Labels → Options**.
2. Under Label vendors, choose **Avery US Letter**.
3. Select your product number (e.g., **5160**).
4. Click **New Document**.

Word opens a page with a table matching the label sheet exactly — each cell is one physical label.

**Tip:** if you can't see the cell boundaries, go to **Table Layout → View Gridlines**. The gridlines show on screen but do not print.

In **Google Docs**, install the free Avery Label Merge add-on, or insert a table manually with cell dimensions matching your sheet (2.625 × 1 in for 5160-style sheets, with margins per the packaging).

---

## Step 3: Insert the Barcode Images

Click into the first cell and insert the barcode: **Insert → Pictures → This Device**, then select the PNG.

Then, for every image:

1. **Set layout to "In Line with Text."** Right-click the image → Wrap Text → In Line with Text. Floating images drift across cell boundaries when you edit; inline images stay put.
2. **Resize from a corner handle only.** Dragging a side handle stretches the barcode and changes the bar proportions — the number one reason Word-printed barcodes fail to scan. Corner handles keep the aspect ratio locked.
3. **Leave white space around the bars.** Don't enlarge the image until it touches the cell edges — the barcode needs its quiet zone. If your exported PNG includes a white margin, never crop it off.
4. **Center it.** Select the cell and use paragraph centering so the barcode sits away from the label edges.

If the code text under the barcode is too small to read at label size, that's a sign the code is too long for the label — use a shorter code or a bigger label, don't stretch.

### Filling the whole sheet

* **Same barcode on every label** (one product, 30 stickers): copy the formatted cell and paste it into the remaining cells.
* **Different barcode per label:** insert them one by one, or work sheet by sheet from your bulk-generated folder. Keep filenames matching the codes (the generator names files by code value) so you can go down the list in order.

Word's mail merge can technically place images with `IncludePicture` fields, but it is fragile and easy to get wrong. For most jobs under a few hundred labels, direct insertion is faster than debugging merge fields.

---

## Step 4: Print a Test Page on Plain Paper

Before touching your label sheets:

1. Print the document on **plain paper**.
2. Hold it in front of a label sheet against a light source and check the alignment — every barcode should sit inside a label boundary.
3. **Test scan** two or three barcodes on the plain-paper print with your scanner or a phone app.
4. Confirm each scanned value matches the intended code exactly.

If alignment is off, check that print scaling is set to **100% / Actual size** — "Fit to page" shrinks the layout and misaligns every label on the sheet.

If barcodes don't scan, they are usually too small, stretched, or printing blurry. The [printing guide](/blog/how-to-print-barcode-labels) covers each failure mode.

---

## Step 5: Print on the Label Sheet

Once the test page passes:

1. Load the label sheet according to your printer's feed orientation (usually face-down for bottom trays — check the printer's tray icon).
2. Print at 100% scale, best quality setting.
3. Feed label sheets one at a time if your printer grabs multiple sheets.
4. Test scan one label from the printed sheet before running the rest of the batch.

Store unused label sheets flat; curled sheets jam and misalign.

---

## Common Mistakes with Word Barcode Labels

### Stretching the image

Side-handle resizing distorts bar widths. Corner handles only.

### Printing with "Fit to page"

Any scaling other than 100% shifts the entire grid off the physical labels.

### Cropping the quiet zone

Trimming the white margin to make the bars bigger breaks scanning. The blank space is functional.

### Using barcode fonts instead of images

Word barcode fonts (like free Code 39 fonts) look convenient but silently produce invalid barcodes when start/stop characters or check digits are missing. A generated image is already a complete, valid barcode.

### Codes too long for the label

A 30-character Code 128 will not scan from a 2.625 × 1 in label. Shorten the code or move up a label size — see the [size guide](/blog/barcode-label-sizes).

### Skipping the test scan

One plain-paper test page costs a minute. A misaligned batch costs the whole pack of label sheets.

---

## Related Barcode Guides

* Create the barcode images: [Free Barcode Generator](/barcode-generator)
* Generate a whole batch from Excel or CSV: [Bulk Barcode Generator](/blog/bulk-barcode-generator-excel-csv)
* Pick the right label dimensions: [Barcode Label Sizes](/blog/barcode-label-sizes)
* Full printing guide: [How to Print Barcode Labels](/blog/how-to-print-barcode-labels)
* PNG vs SVG export: [PNG vs. SVG Barcodes](/blog/barcode-image-formats-png-vs-svg)

---

## Final Thoughts

Word plus an Avery sheet is a perfectly good barcode label maker for small and medium batches: generate PNG barcodes with the free [Barcode Generator](/barcode-generator), open the matching Avery template in Word, insert the images inline, keep the aspect ratio locked, and always test on plain paper before printing on labels.

For hundreds of labels a day you'll eventually want a thermal printer — but for inventory tags, product stickers, and asset labels, the office printer you already own does the job.

---

## Frequently Asked Questions

### Can I make barcode labels in Word for free?

Yes. Generate the barcode images with a free [Barcode Generator](/barcode-generator), open the matching Avery template via Mailings → Labels, insert the PNGs, and print.

### What Avery labels work best for barcodes?

Avery 5160 (2.625 × 1 in, 30 per sheet) suits most inventory barcodes. Avery 5163 (4 × 2 in) gives more room for retail UPC/EAN or long Code 128 values.

### Should I insert barcodes as PNG or SVG in Word?

PNG. Word handles PNG images reliably; SVG support in office software is inconsistent.

### Why won't my Word-printed barcode scan?

The usual causes are stretching (side-handle resizing), printing at less than 100% scale, cropping the white quiet zone, or a code too long for the label size.

### Can I use a barcode font in Word instead of images?

It's risky. Barcode fonts require correct start/stop characters and check digits that the font does not add for you. Generated images are complete, valid barcodes.

### How do I print many different barcode labels at once?

Generate the batch from an Excel or CSV file with the [bulk workflow](/blog/bulk-barcode-generator-excel-csv), then place the images into the template cells in order.

### Can I do this in Google Docs?

Yes. Use the Avery Label Merge add-on or build a table with cell sizes matching your label sheet, then insert the PNGs the same way.
