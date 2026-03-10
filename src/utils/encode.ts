export async function AESEncode(data: string) {
  const secretKey: string = import.meta.env["VITE_CLOUD_AES_KEY"];
  const binaryData = new TextEncoder().encode(data);

  const iv = window.crypto.getRandomValues(new Uint8Array(16));
  const cryptoKey = await window.crypto.subtle.importKey(
    "raw",
    str2ab(secretKey),
    { name: "AES-CBC" },
    false,
    ["encrypt"],
  );

  const ctEncrypted = await window.crypto.subtle.encrypt(
    { name: "AES-CBC", iv: iv },
    cryptoKey,
    binaryData,
  );
  const binaryCipherText = new Uint8Array(ctEncrypted);
  const ciphertext = btoa(String.fromCharCode(...binaryCipherText));
  const ivString = btoa(String.fromCharCode(...iv));

  return btoa(JSON.stringify({ iv: ivString, ciphertext }));
}

// string to ArrayBuffer
function str2ab(str: string) {
  const buf = new ArrayBuffer(str.length);
  const bufView = new Uint8Array(buf);
  for (let i = 0; i < str.length; i++) {
    bufView[i] = str.charCodeAt(i);
  }
  return bufView;
}
