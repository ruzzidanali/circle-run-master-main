function normalizeAccountNumber(region, accRaw) {
  if (!accRaw) return "";
  let acc = accRaw.replace(/\s+/g, "").trim();

  switch (region.toLowerCase()) {
    case "negeri-sembilan":
    case "negeri sembilan":
      acc = acc.replace(/-/g, "");
      acc = acc.replace(/^0+/, "");
      return acc;

    case "selangor":
      acc = acc.replace(/^0+/, "");
      return acc;

    case "johor":
      acc = acc.replace(/[.\-]/g, "");
      acc = acc.replace(/[^A-Za-z0-9]/g, "");
      return acc;

    default:
      return acc;
  }
}

function formatMelakaInvoice(raw) {
  if (!raw) return "";

  let v = raw.trim();

  v = v.replace(/[^\w()]/g, "");

  return v;
}

// regionParsers.js
export function parseJohorFields(results) {
  const out = {};

  // 🧾 Deposit
  const depositRaw = results["Deposit"];
  if (depositRaw) {
    const match = depositRaw.match(/(\d+(?:[.,]\d{1,2})?)/);
    out["Deposit"] = match ? match[1].replace(",", ".") : "0.00";
  } else {
    out["Deposit"] = "0.00";
  }

  // 🧾 Tunggakan + Tarikh Section
  const tunggakanRaw = results["Tunggakan dan Tarikh Section"] || "";
  if (tunggakanRaw) {
    // Try to find any numeric amount after TUNGGAKAN
    const tunggakanMatch = tunggakanRaw.match(
      /TUNGGAKAN(?:\s+\d{2}\/\d{2}\/\d{2,4})?(?:\s+[A-Z0-9\/]+)?\s+([0-9]+(?:[.,][0-9]{1,2})?)/i
    );
    out["Tunggakan"] = tunggakanMatch
      ? tunggakanMatch[1].replace(",", ".")
      : "0.00";

    // Find any date near JUMLAH BIL SEMASA or JUMLAH PERLU DIBAYAR
    const dateMatch = tunggakanRaw.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g);
    if (dateMatch && dateMatch.length >= 1) {
      out["Tarikh"] = dateMatch[0];
      if (dateMatch.length >= 2) {
        out["Tarikh Tamat"] = dateMatch[1]; // next date if exists
      }
    }
  } else {
    out["Tunggakan"] = "0.00";
  }

  // 🧾 Jumlah Bil Semasa
  const jumlahBilRaw = results["Jumlah Bil Semasa Section"];
  if (jumlahBilRaw) {
    const match = jumlahBilRaw.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/);
    if (match) {
      const num = match[1].replace(/,/g, "");
      out["Jumlah Bil Semasa"] = num;
    }
  }

  // 🧾 Normalize No. Bil & No. Akaun
  // out["No. Bil"] = (results["No. Bil"] || "")
  //   .replace(/\s+/g, "")
  //   .replace(/[^A-Za-z0-9\-]/g, "");

  //New
  // 🧾 Normalize No. Bil (Johor forces: PREFIX(NO XX))
  let bilRaw = results["No. Bil"] || "";

  // Clean noise but keep (), spaces, letters, digits, dash
  bilRaw = bilRaw
    .replace(/[^\w\s()\-]/g, "") // remove weird chars
    .replace(/\s+/g, " ") // collapse spaces
    .trim();

  // Extract main prefix: L25111
  const prefixMatch = bilRaw.match(/^[A-Za-z]\d{5,}/);
  const prefix = prefixMatch ? prefixMatch[0] : "";

  // Extract NO number
  const noMatch = bilRaw.match(/NO\s*(\d+)/i);
  const noNumber = noMatch ? noMatch[1] : "";

  // Build final format EXACTLY like required: L25111(NO 46)
  if (prefix && noNumber) {
    out["No. Bil"] = `${prefix}(NO ${noNumber})`; // 👈 NO SPACE before "("
  } else {
    out["No. Bil"] = bilRaw;
  }

  // 🧾 Normalize No. Akaun (with smart Johor fixes)
  let accRaw = (results["No. Akaun"] || "").trim();
  let acc = accRaw.replace(/[^\w\-]/g, ""); // keep letters, digits, dash

  // Handle common OCR issues:
  // 1️⃣ "86392904-1L6451225" → "86392904-L6451225"
  // 2️⃣ "863929041L6451225" → "86392904-L6451225"
  // 3️⃣ "863929041.6451225" → "86392904-L6451225"
  acc = acc
    .replace(/^(\d{8})[-1Iil\.]+L?(\d{5,})$/i, "$1-L$2")
    .replace(/^(\d{8})([A-Z])(\d{5,})$/i, "$1-$2$3");

  // Final cleanup and remove dash for SQL consistency
  out["No. Akaun"] = acc.replace(/-/g, "");

  // 🧾 Meter / Tarikh Bacaan / Penggunaan
  const meterRaw = results["No Meter, Tarikh, Penggunaan(m3) Section"] || "";
  if (meterRaw) {
    // ✅ Handle both SAJ and SAI prefixes (OCR inconsistency)
    const meterMatch = meterRaw.match(/(SA[J|I][0-9A-Z]+)/i);
    out["No. Meter"] = meterMatch ? meterMatch[1].trim() : "";

    if (out["No. Meter"]) {
      out["No. Meter"] = out["No. Meter"]
        .toUpperCase()
        .replace(/^SAI/, "SAJ")
        .replace(/[^A-Z0-9]/g, "");
    }

    // ✅ Find the first line with meter prefix, fallback if not found
    const meterLine =
      meterRaw.split("\n").find((l) => /SA[J|I]/i.test(l)) ||
      meterRaw.split("\n")[0];

    // ✅ Only run .match() if meterLine is defined
    const usageMatch =
      typeof meterLine === "string"
        ? meterLine.match(/(\d{1,5}(?:[.,\s]\d{1,2})?)\s*(?:m3|$)/i)
        : null;

    if (usageMatch) {
      let val = usageMatch[1].replace(/\s+/g, "").replace(",", ".");
      if (!val.includes(".")) val += ".00";
      out["Penggunaan (m3)"] = val;
    } else {
      const fallbackUsage = meterRaw.match(
        /(\d{2,4}(?:[.,]\d{1,2})?)\s*(?:m3|$)/i
      );
      out["Penggunaan (m3)"] = fallbackUsage
        ? fallbackUsage[1].replace(",", ".")
        : "0.00";
    }

    // Tarikh (2 dates)
    const dateMatches = meterRaw.match(/(\d{2}[\/\-]\d{2}[\/\-]\d{4})/g);
    if (dateMatches && dateMatches.length >= 2) {
      const start = dateMatches[1];
      const end = dateMatches[0];
      out["Tempoh Bil"] = `${start} - ${end}`;

      const d1 = new Date(start.split("/").reverse().join("-"));
      const d2 = new Date(end.split("/").reverse().join("-"));
      out["Bilangan Hari"] = Math.abs(
        Math.round((d2 - d1) / 86400000)
      ).toString();
    }
  }

  // 🧾 Jumlah Caj Air Semasa
  const cajRaw = results["Jumlah Caj Air Semasa Section"];
  if (cajRaw) {
    const match = cajRaw.match(/(\d{1,3}(?:,\d{3})*(?:\.\d{1,2})?)/);
    if (match) {
      const num = match[1].replace(/,/g, "");
      out["Jumlah Caj Air Semasa"] = num;
    }

    // out["Jumlah Caj Air Semasa"] = match ? match[1].replace(",", ".") : "";
  }

  // Default fallback
  if (!out["Jumlah Caj Air Semasa"])
    out["Jumlah Caj Air Semasa"] = out["Jumlah Bil Semasa"] || "0.00";

  return out;
}

export function parseKedahFields(results, fileName) {
  const section =
    results[
      "Jumlah Caj Semasa, Jumlah Tunggakan dan Jumlah Perlu Dibayar Section"
    ] || "";

  // 🧾 Helper: extract numeric values (robust against missing RM / newlines)
  const getValue = (label) => {
    const regex = new RegExp(label + "[^0-9]*([0-9]+(?:[.,][0-9]{1,2})?)", "i");
    const match = section.match(regex);
    return match ? match[1].replace(",", ".") : "0.00";
  };

  // 🧾 Build clean structured output
  return {
    "File Name": fileName,
    Region: "Kedah",
    "Nombor Akaun": results["No. Akaun"] || "",
    "No. Invois": results["No. Bil"] || "",
    Tarikh: results["Tarikh"] || "",
    "Tempoh Bil": results["Tempoh Bil"] || "",
    "Nombor Meter": results["No. Meter"] || "",
    "Penggunaan Semasa": results["Penggunaan Semasa"] || "",
    "Jumlah Caj Semasa": getValue("JUMLAH CAJ SEMASA"),
    "Jumlah Tunggakan": getValue("JUMLAH TUNGGAKAN"),
    "Jumlah Perlu Dibayar": getValue("JUMLAH PERLU DIBAYAR"),
    Cagaran: results["Cagaran"] || "0.00",
  };
}

export function parseNegeriSembilanFields(results) {
  const out = {};

  // 🧾 Basic fields
  // out["No. Akaun"] = results["No. Akaun"] || "";
  // out["No. Invois"] = results["No. Bil"] || "";
  out["No. Akaun"] = normalizeAccountNumber(
    "Negeri Sembilan",
    results["No. Akaun"] || ""
  );
  out["No. Invois"] = results["No. Bil"] || "";

  // 🗓️ Normalize Tarikh (e.g. 09-08-2025 → 09/08/2025)
  if (results["Tarikh"]) {
    const norm = results["Tarikh"]
      .replace(/[.\-]/g, "/")
      .replace(/\s+/g, "")
      .trim();
    out["Tarikh"] = norm;
  } else {
    out["Tarikh"] = "";
  }

  // 🧮 Extract tempoh bil + bilangan hari
  const section = results["Bilangan Hari Section"] || "";
  const match = section.match(
    /TEMPOH\s+BIL\s+SEMASA\s*[:\-]?\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4}).*?(?:HINGGA|TO)\s*(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})/i
  );

  if (match) {
    const start = `${match[1].padStart(2, "0")}/${match[2].padStart(2, "0")}/${match[3]}`;
    const end = `${match[4].padStart(2, "0")}/${match[5].padStart(2, "0")}/${match[6]}`;
    out["Tempoh Bil"] = `${start} - ${end}`;

    const d1 = new Date(`${match[3]}-${match[2]}-${match[1]}`);
    const d2 = new Date(`${match[6]}-${match[5]}-${match[4]}`);
    const days = Math.abs(Math.round((d2 - d1) / 86400000));
    out["Bilangan Hari"] = days.toString();
  } else {
    out["Tempoh Bil"] = "";
    out["Bilangan Hari"] = "";
  }

  // 🔢 Clean Penggunaan
  if (results["Penggunaan"]) {
    const match = results["Penggunaan"].match(/(\d+(?:[.,]\d+)?)/);
    out["Penggunaan"] = match ? match[1].replace(",", ".") : "0";
  } else {
    out["Penggunaan"] = "0";
  }

  // 💰 Clean Deposit (remove RM)
  if (results["Deposit"]) {
    const match = results["Deposit"].match(/([0-9]+(?:[.,][0-9]{1,2})?)/);
    out["Deposit"] = match ? match[1].replace(",", ".") : "0.00";
  } else {
    out["Deposit"] = "0.00";
  }

  // 💧 Remaining fields
  out["No. Meter"] = results["No. Meter"] || "";
  out["Caj Semasa"] = results["Caj Semasa"] || "0.00";
  out["Tunggakan"] = results["Tunggakan"] || "0.00";
  out["Jumlah Perlu Dibayar"] = results["Jumlah Perlu Dibayar"] || "0.00";

  return out;
}

export function standardizeOutput(data) {
  // 🧹 Helper: Clean numeric string, default 0.00
  // const cleanNum = (v) => {
  //   if (!v || v === "" || v === null) return "0.00";
  //   const cleaned = v.toString().replace(/[^\d.,-]/g, "").replace(",", ".");
  //   return cleaned === "" ? "0.00" : cleaned;
  // };

  const cleanNum = (v) => {
    if (!v || v === "" || v === null) return "0.00";
    let cleaned = v.toString().trim();

    cleaned = cleaned
      .replace(/[^\d.,]/g, "")
      .replace(/(\d)[,.](?=\d{3}\b)/g, "$1")
      .replace(",", ".");

    const parts = cleaned.split(".");
    if (parts.length > 2) {
      const last = parts.pop();
      cleaned = parts.join("") + "." + last;
    }

    return cleaned === "" ? "0.00" : cleaned;
  };

  // 🧹 Helper: Clean text string, default null
  const cleanText = (v) => {
    if (!v || v === "" || v === null) return null;
    return v
      .toString()
      .trim()
      .replace(/[^\w\s\/\-\.,]/g, "");
  };

  return {
    File_Name: cleanText(data["File Name"] || data["File_Name"]),
    Region: cleanText(data["Region"]),
    No_Invois:
      data["Region"] && data["Region"].toLowerCase() === "johor"
        ? (data["No. Bil"] || data["No. Invois"] || "").trim()
      : data["Region"] && data["Region"].toLowerCase() === "melaka"
        ? formatMelakaInvoice(data["No. Invois"] || data["No. Bil"] || "")
        : cleanText(
            data["No. Invois"] ||
              data["No. Bil"] ||
              data["No_Invois"] ||
              data["No_Bil"]
          ),
    No_Akaun: cleanText(
      normalizeAccountNumber(
        data["Region"] || "",
        data["No. Akaun"] || data["Nombor Akaun"] || data["Nombor_Akaun"]
      )
    ),
    // No_Akaun: cleanText(
    //   data["No. Akaun"] ||
    //     data["Nombor Akaun"] ||
    //     data["Nombor_Akaun"]
    // ),
    Tarikh: cleanText(
      (data["Tarikh"] || "").toString().replace(/-/g, "/").trim()
    ),
    Tempoh_Bil: cleanText(data["Tempoh Bil"] || data["Tempoh_Bil"]),
    Bilangan_Hari: cleanText(data["Bilangan Hari"] || data["Bilangan_Hari"]),
    No_Meter: cleanText(
      data["No. Meter"] || data["Nombor Meter"] || data["Nombor_Meter"]
    ),
    Penggunaan: cleanNum(
      data["Penggunaan"] || data["Penggunaan (m3)"] || data["Penggunaan Semasa"]
    ),
    Caj_Semasa: cleanNum(
      data["Caj Semasa"] ||
        data["Jumlah Bil Semasa"] ||
        data["Jumlah Caj Semasa"] ||
        data["Jumlah Caj Air Semasa"] ||
        data["Bil Semasa"] ||
        data["Jumlah Perlu Dibayar"] ||
        data["Jumlah_Perlu_Dibayar"]
    ),
    Tunggakan: cleanNum(data["Tunggakan"] || data["Jumlah Tunggakan"]),
    Jumlah_Perlu_Dibayar: cleanNum(
      data["Caj Semasa"] ||
        data["Jumlah Bil Semasa"] ||
        data["Jumlah Caj Semasa"] ||
        data["Jumlah Caj Air Semasa"] ||
        data["Bil Semasa"] ||
        data["Jumlah Perlu Dibayar"] ||
        data["Jumlah_Perlu_Dibayar"]
    ),
    Deposit: cleanNum(data["Deposit"] || data["Cagaran"]),
  };
}
