export function UpsertKeyValue(obj: any, keyToChange: string, value: any) {
  const keyToChangeLower = keyToChange.toLowerCase();
  for (const key of Object.keys(obj)) {
    if (key.toLowerCase() === keyToChangeLower) {
      // Reassign old key
      obj[key] = value;
      // Done
      return;
    }
  }
  // Insert at end instead
  obj[keyToChange] = value;
}

export function assignFromPartial<T extends {}>(
  target: T,
  ...sources: Partial<T>[]
) {
  return Object.assign(target, ...sources) as T;
}

export function addDays(date: Date, days: number) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function toDateString(date: Date) {
  const offset = date.getTimezoneOffset();
  date = new Date(date.getTime() - offset * 60 * 1000);
  return date.toISOString().split("T")[0];
}

export function toICalDateTime(date: Date) {
  const year = date.getUTCFullYear();
  const month = padN(date.getUTCMonth() + 1);
  const day = padN(date.getUTCDate());
  const hour = padN(date.getUTCHours());
  const minute = padN(date.getUTCMinutes());
  const second = padN(date.getUTCSeconds());
  return `${year}${month}${day}T${hour}${minute}${second}Z`;
};

export function padN(str: number, pad = "00", padLeft = true) {
  if (typeof str === "undefined") return pad;
  if (padLeft) {
    return (pad + str.toString()).slice(-pad.length);
  } else {
    return (str.toString() + pad).substring(0, pad.length);
  }
}
