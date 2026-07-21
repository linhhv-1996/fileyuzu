## How to Compare Two Lists Online

Comparing two lists by eye stops working somewhere around row twenty. This list comparison tool does it in one pass, for lists of any realistic size: paste your data, click compare, and every line is categorized for you — what is missing, what matches, and what is duplicated.

1. **Paste List A** into the left input, one item per line. This is typically your baseline or master list.
2. **Paste List B** into the right input. Alternatively, upload a file into either input — `.txt`, `.csv`, and Excel (`.xlsx`) are all supported, read directly in your browser.
3. **Set your options.** Enable **Trim Whitespace** if your data was exported from Excel, a CRM, or a database (invisible trailing spaces are the number one cause of false mismatches). Enable **Ignore Case** if capitalization differs between your sources.
4. **Click compare** and open the output tab that answers your question.

Empty lines are ignored automatically, so you can paste directly from a spreadsheet column without cleaning it up first.

---

## Reading the Results

The tool works as a list difference checker and a deduplicator at the same time. Every comparison produces six outputs:

- **Only in A** — items present in List A but missing from List B.
- **Only in B** — items present in List B but missing from List A.
- **In Both** — the intersection: items that appear in both lists.
- **All Unique** — both lists merged into one, with every duplicate removed.
- **Duplicates A** — items that appear more than once *within* List A itself.
- **Duplicates B** — the same internal-duplicate check for List B.

Each output is plain text you can copy straight back into a spreadsheet, a CRM import, or a script. If you are new to this kind of set logic, the guide on [finding missing items and unique values between two lists](/blog/find-missing-items-unique-values-between-lists) walks through each output with concrete reconciliation examples.

---

## What This Tool Is Built For

**Spreadsheet columns without formulas.** The most common reason people land here is a `VLOOKUP` returning `#N/A` on data that looks identical. Copy the two columns, paste them here, enable Trim Whitespace, and the mismatch is resolved in seconds — the full workflow is in [how to compare two Excel columns without formulas](/blog/compare-two-excel-columns-without-formulas).

**Email list hygiene.** Cross-reference an outreach list against your suppression list before every send, merge lead sources without duplicates, or find the overlap between two campaign segments. The complete marketing workflows are covered in [how to compare customer email lists online](/blog/compare-email-lists-online-deduplication).

**Reconciliation of IDs, SKUs, and URLs.** Stock counts against ERP records, migrated database IDs against the source export, crawled URLs against a sitemap — any job where "what is missing?" is the question.

---

## What It Does Not Do

A few honest limits, so you do not waste time on the wrong tool:

- **Two lists at a time.** There is no three-way comparison. To work across more than two sources, compare the first pair, copy the **All Unique** output, and compare that merged result against your third list.
- **Whole lines, not columns inside lines.** The comparison is line by line. A row like `John Smith, john@example.com` is treated as one string — isolate the single column you care about before pasting.
- **Exact matching only.** After optional trimming and case-folding, items must match exactly. There is no fuzzy matching, so `Jon Smith` will never match `John Smith`.
- **Capacity depends on your device.** Because processing is local, very large lists are limited by your machine's memory rather than a server quota. Tens of thousands of lines are no problem on an ordinary laptop.

---

## Frequently Asked Questions

### Is the comparison case-sensitive?

By default, yes — `Apple` and `apple` are treated as different items. Enable the **Ignore Case** option to treat them as the same, which is usually what you want for email addresses and names.

### Can I compare more than two lists at once?

Not directly. Compare two lists, copy the **All Unique** output as your merged baseline, then run a second comparison against the third list. Two chained comparisons cover three sources.

### What is the difference between "All Unique" and "Duplicates A"?

"All Unique" is a result you keep: both lists merged with every repeat removed — a clean master list. "Duplicates A" is a warning: it shows values repeated inside List A itself, which usually means a dirty export worth fixing before you trust the rest of the comparison.

### Does the order of my items matter?

No. The comparison checks whether each item exists in the other list, not where it sits. You do not need to sort either list before pasting.

### Why do identical-looking items show up as different?

Almost always an invisible character: a trailing space, a leading space, or inconsistent capitalization from two different export sources. Enable **Trim Whitespace** and **Ignore Case**, then run the comparison again — this resolves the vast majority of false mismatches.
