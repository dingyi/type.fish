// Country name -> ISO 3166-1 alpha-2 code, for flag rendering.
// Used to map the English country labels in the data to flag icons.
// Unknown / unmappable values resolve to null (no flag shown).

const COUNTRY_TO_CODE: Record<string, string> = {
  Argentina: "AR",
  Australia: "AU",
  Austria: "AT",
  Bangladesh: "BD",
  Belarus: "BY",
  Belgium: "BE",
  Brazil: "BR",
  Bulgaria: "BG",
  Cambodia: "KH",
  Canada: "CA",
  Chile: "CL",
  China: "CN",
  Colombia: "CO",
  Croatia: "HR",
  Czechia: "CZ",
  Denmark: "DK",
  Egypt: "EG",
  Estonia: "EE",
  Ethiopia: "ET",
  Finland: "FI",
  France: "FR",
  Georgia: "GE",
  Germany: "DE",
  Ghana: "GH",
  Greece: "GR",
  Hungary: "HU",
  Iceland: "IS",
  India: "IN",
  Indonesia: "ID",
  Iran: "IR",
  Iraq: "IQ",
  Ireland: "IE",
  Israel: "IL",
  Italy: "IT",
  Japan: "JP",
  Jordan: "JO",
  Kazakhstan: "KZ",
  Kuwait: "KW",
  Laos: "LA",
  Latvia: "LV",
  Lebanon: "LB",
  Lithuania: "LT",
  Malaysia: "MY",
  Mexico: "MX",
  Netherlands: "NL",
  "New Zealand": "NZ",
  Nigeria: "NG",
  Norway: "NO",
  Palestine: "PS",
  Peru: "PE",
  Philippines: "PH",
  Poland: "PL",
  Portugal: "PT",
  Romania: "RO",
  Russia: "RU",
  "Saudi Arabia": "SA",
  Serbia: "RS",
  Singapore: "SG",
  Slovakia: "SK",
  Slovenia: "SI",
  "South Africa": "ZA",
  "South Korea": "KR",
  Spain: "ES",
  "Sri Lanka": "LK",
  Sweden: "SE",
  Switzerland: "CH",
  Taiwan: "TW",
  Thailand: "TH",
  Turkey: "TR",
  Ukraine: "UA",
  "United Arab Emirates": "AE",
  "United Kingdom": "GB",
  "United States": "US",
  Uruguay: "UY",
  Vietnam: "VN",
};

/**
 * Get the ISO code for a country label. Returns null for Unknown or
 * anything unmappable. For compound labels like "Germany / Brazil",
 * only the first country's code is returned (used as the flag).
 */
export function getCountryCode(label: string): string | null {
  if (!label || label === "Unknown") {
    return null;
  }
  const first = label.split("/")[0].trim();
  return COUNTRY_TO_CODE[first] ?? null;
}
