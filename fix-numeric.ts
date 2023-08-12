export const fixNumeric = (text: string) => {
  let newText = text.replace(/[^0-9.-]/g, "");
  let parts = newText.split(".");
  if (parts.length > 2) {
    newText = parts[0] + "." + parts.slice(1).join("");
  }
  if (newText.startsWith("-")) {
    newText = "-" + newText.slice(1).replace(/-/g, "");
  }
  return newText;
};
