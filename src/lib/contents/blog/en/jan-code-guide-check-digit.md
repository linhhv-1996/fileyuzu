---
title: "JAN Codes Explained: Japan's Product Barcode and How the Check Digit Works"
date: "2026-07-12"
description: "What is a JAN code? Learn how Japan's product barcode relates to EAN-13, how to calculate the JAN check digit step by step, and how to generate JAN barcodes online."
ctaTool: "barcode-generator"
---

If you sell products into Japan — on Amazon Japan, Rakuten, or through a Japanese distributor — you will run into the term **JAN code**. Outside Japan, almost nobody explains it in English.

This guide covers what a JAN code actually is, how it relates to the EAN-13 barcodes you already know, how the check digit is calculated, and how to generate JAN barcode images.

If you already have a valid JAN number and just need the barcode image, use the free [Barcode Generator](/barcode-generator) — it supports JAN directly, alongside UPC-A and EAN-13.

---

## What Is a JAN Code?

JAN stands for **Japanese Article Number**. It is Japan's retail product barcode — the code scanned at checkout in every convenience store, supermarket, and drugstore in the country.

Here is the part that simplifies everything: **a JAN code is an EAN-13 barcode.** Same structure, same 13 digits, same scanning technology. "JAN" is simply what the EAN-13 system is called in Japan.

What makes a code a *JAN* code specifically is the country prefix. JAN codes begin with Japan's GS1 prefixes:

* **45** or **49**

Example:

```text
4901234567894
```

Any barcode scanner that reads EAN-13 reads JAN codes. Any point-of-sale system that handles EAN-13 handles JAN. There is no special "JAN scanner" or "JAN format" to worry about.

For the broader picture of how EAN-13 relates to UPC-A and GTINs, read [Product Barcodes 101: UPC-A vs. EAN-13](/blog/product-barcode-guide-upc-vs-ean).

---

## JAN-13 vs JAN-8

Like the EAN system, JAN comes in two lengths:

| Format | Digits | Use Case                                             |
| :----- | :----- | :--------------------------------------------------- |
| JAN-13 | 13     | Standard retail products (equivalent to EAN-13)      |
| JAN-8  | 8      | Very small products with limited label space (EAN-8) |

JAN-13 is the default. JAN-8 exists for items where a full-size barcode physically does not fit — small cosmetics, confectionery, stationery. Short codes are allocated separately and sparingly, so do not plan around JAN-8 unless your packaging genuinely cannot fit JAN-13. For minimum barcode dimensions, see the [barcode label size guide](/blog/barcode-label-sizes).

---

## How the JAN Check Digit Works

The last digit of a JAN code is not part of the product number — it is a **check digit**, calculated from the first 12 digits. Scanners use it to verify the code was read correctly.

The calculation is the standard EAN-13 modulo-10 method. Using `490123456789` as the first 12 digits:

**Step 1.** Number the digits from left to right, positions 1–12.

**Step 2.** Multiply digits in odd positions (1st, 3rd, 5th…) by 1, and digits in even positions (2nd, 4th, 6th…) by 3.

```text
Digit:    4   9   0   1   2   3   4   5   6   7   8   9
Weight:  ×1  ×3  ×1  ×3  ×1  ×3  ×1  ×3  ×1  ×3  ×1  ×3
Result:   4  27   0   3   2   9   4  15   6  21   8  27
```

**Step 3.** Add the results: 4 + 27 + 0 + 3 + 2 + 9 + 4 + 15 + 6 + 21 + 8 + 27 = **126**

**Step 4.** Take the last digit of the sum (126 → 6) and subtract it from 10: 10 − 6 = **4**. (If the sum ends in 0, the check digit is 0.)

The complete JAN code is:

```text
4901234567894
```

Two practical notes:

* You never invent the check digit — it is always computed. If a supplier gives you a 13-digit JAN, you can verify it with this method: recalculate the last digit and confirm it matches.
* Barcode generators do this automatically. When you create a JAN or EAN-13 barcode with the [Barcode Generator](/barcode-generator), the check digit is validated for you — a code with a wrong check digit is simply invalid.

---

## Do You Need an Official JAN Code?

The same rule that applies to UPC and EAN applies to JAN.

**For retail sale in Japan: yes.** Official JAN codes are issued through GS1 Japan. A business registers, receives a company prefix, and assigns product numbers under that prefix. Each product variant (size, color, flavor) gets its own JAN.

Marketplaces enforce this. **Amazon Japan uses JAN as its standard product identifier** — the field where a US seller would enter a UPC, a seller in Japan enters a JAN. Rakuten and Yahoo! Shopping Japan work the same way. Made-up numbers cause listing rejections and catalog conflicts.

**For internal use: no.** If you are labeling inventory, warehouse bins, or assets, you do not need JAN codes at all — Code 128 is more flexible because it supports letters and symbols. JAN is specifically a retail product identity format.

A barcode generator creates the scannable image from your number. It does not register or issue the number itself.

---

## Can You Sell a Product with a UPC or EAN in Japan?

Often, yes. Japanese POS systems scan any valid EAN-13, and an existing EAN from another country identifies your product globally — the same GTIN principle as everywhere else.

The practical friction is on the listing and distribution side: Japanese marketplaces and retailers expect a JAN field, some distributors require a 45/49-prefixed code for their systems, and a foreign-prefixed EAN can look unfamiliar in domestic retail. Whether you need a true JAN depends on your channel — a marketplace listing may accept your existing EAN, while a national retail chain may require a registered JAN.

The barcode image itself is the trivial part either way: JAN, EAN-13, and UPC-A can all be generated the same way once you have the number.

---

## How to Generate JAN Barcode Images

Once you have valid JAN numbers, creating the images takes a minute.

### One code at a time

Open the [Barcode Generator](/barcode-generator), choose JAN, enter the 13-digit number, and download the barcode as PNG or SVG. Use SVG for packaging artwork and PNG for stickers and documents — the [PNG vs. SVG guide](/blog/barcode-image-formats-png-vs-svg) explains when to use which.

### A whole product catalog at once

If your JAN numbers live in a spreadsheet, use Upload mode: put the JAN in Column A and the product name in Column B, upload the Excel or CSV file, and generate the full batch in one go. Everything is processed locally in your browser — your product catalog is never uploaded to a server. The full workflow is in the [Bulk Barcode Generator guide](/blog/bulk-barcode-generator-excel-csv).

### Printing

JAN barcodes follow the same print rules as any EAN-13: keep the size within the standard range, lock the aspect ratio, preserve the quiet zone, and test scan a sample. See [How to Print Barcode Labels](/blog/how-to-print-barcode-labels).

---

## Related Barcode Guides

* Create JAN, EAN-13, and UPC-A barcode images: [Free Barcode Generator](/barcode-generator)
* Understand retail barcode formats: [Product Barcodes 101: UPC-A vs. EAN-13](/blog/product-barcode-guide-upc-vs-ean)
* Generate barcodes from a spreadsheet: [Bulk Barcode Generator](/blog/bulk-barcode-generator-excel-csv)
* Choose the right dimensions: [Barcode Label Sizes](/blog/barcode-label-sizes)
* Print labels correctly: [How to Print Barcode Labels](/blog/how-to-print-barcode-labels)

---

## Final Thoughts

A JAN code is not a mysterious separate system — it is EAN-13 with a Japanese prefix (45 or 49), used as the product identifier across Japanese retail and marketplaces like Amazon Japan and Rakuten.

The last digit is always a calculated check digit, official numbers come from GS1 Japan, and once you have a valid number, generating the barcode image is the easy part.

Use the free [Barcode Generator](/barcode-generator) to create JAN barcodes one at a time, in bulk from a spreadsheet, or as a sequential series — exported as PNG or SVG, generated entirely in your browser.

---

## Frequently Asked Questions

### What is a JAN code?

A JAN (Japanese Article Number) is Japan's retail product barcode. It is structurally identical to EAN-13 and begins with Japan's country prefixes, 45 or 49.

### Is a JAN code the same as EAN-13?

Yes. JAN is the Japanese name for the EAN-13 system. Any EAN-13 scanner reads JAN codes.

### How many digits does a JAN code have?

13 digits for standard JAN-13. A short 8-digit version (JAN-8) exists for very small products.

### How is the JAN check digit calculated?

Multiply the first 12 digits alternately by 1 and 3 (starting with 1), add the results, then subtract the last digit of the sum from 10. If the sum ends in 0, the check digit is 0.

### Can I generate a JAN barcode online?

Yes. If you have a valid 13-digit JAN number, the [Barcode Generator](/barcode-generator) creates the barcode image in your browser and exports it as PNG or SVG.

### Does a barcode generator give me an official JAN number?

No. Official JAN numbers are issued through GS1 Japan. A generator creates the scannable image from a number you already have.

### Do I need a JAN code to sell on Amazon Japan?

Amazon Japan uses JAN as its standard product identifier field. Requirements vary by category and brand status, but sellers in Japan generally list products by JAN the way US sellers use UPC.

### Can I create JAN barcodes in bulk?

Yes. Put your JAN numbers in Column A of an Excel or CSV file, optional labels in Column B, and generate the whole batch at once with the [bulk workflow](/blog/bulk-barcode-generator-excel-csv).
