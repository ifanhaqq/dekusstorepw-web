import { Buffer } from "buffer";

export const generateKeyPair = async (password: string) => {
  const generatedKeyPair = await crypto.subtle.generateKey(
    {
      name: "RSA-OAEP",
      modulusLength: 4096,
      publicExponent: new Uint8Array([1, 0, 1]),
      hash: "SHA-256",
    },
    true,
    ["encrypt", "decrypt"],
  );

  const importedPasswordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const salt = crypto.getRandomValues(new Uint8Array(16));

  const saltBase64 = Buffer.from(salt).toString("base64");

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    importedPasswordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const exportedPrivateKeyRaw = await crypto.subtle.exportKey(
    "pkcs8",
    generatedKeyPair.privateKey,
  );

  const iv = crypto.getRandomValues(new Uint8Array(12));

  const ivBase64 = Buffer.from(iv).toString("base64"); // store

  const encryptedPrivateKey = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: iv },
    derivedKey,
    exportedPrivateKeyRaw,
  );

  const publicKeyRaw = await crypto.subtle.exportKey(
    "spki",
    generatedKeyPair.publicKey,
  );

  const publicKeyBase64 = Buffer.from(publicKeyRaw).toString("base64"); // store

  const encryptedPrivateKeyBase64 =
    Buffer.from(encryptedPrivateKey).toString("base64"); // store

  return {
    publicKey: publicKeyBase64,
    encryptedPrivateKey: encryptedPrivateKeyBase64,
    iv: ivBase64,
    salt: saltBase64,
  };
};

export const getPrivateKey = async (
  encryptedPrivateKeyBase64: string,
  ivBase64: string,
  password: string,
  saltBase64: string,
) => {
  const encryptedPrivateKey = Buffer.from(encryptedPrivateKeyBase64, "base64");
  const iv = Buffer.from(ivBase64, "base64");

  const salt = Buffer.from(saltBase64, "base64");

  const passwordKey = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(password),
    { name: "PBKDF2" },
    false,
    ["deriveKey"],
  );

  const derivedKey = await crypto.subtle.deriveKey(
    {
      name: "PBKDF2",
      salt: salt,
      iterations: 100000,
      hash: "SHA-256",
    },
    passwordKey,
    { name: "AES-GCM", length: 256 },
    true,
    ["decrypt"],
  );

  const decryptedPrivateKeyRaw = await crypto.subtle.decrypt(
    {
      name: "AES-GCM",
      iv: iv,
    },
    derivedKey,
    encryptedPrivateKey,
  );

  const privateKey = await crypto.subtle.importKey(
    "pkcs8",
    decryptedPrivateKeyRaw,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["decrypt"],
  );
  return privateKey;
};

export const getPublicKey = async (publicKeyBase64: string) => {
  const publicKeyRaw = Buffer.from(publicKeyBase64, "base64");

  const publicKey = await crypto.subtle.importKey(
    "spki",
    publicKeyRaw,
    { name: "RSA-OAEP", hash: "SHA-256" },
    true,
    ["encrypt"],
  );
  return publicKey;
};

export const encryptPassword = async (
  password: string,
  publicKey: CryptoKey,
) => {
  const aesKey = await crypto.subtle.generateKey(
    { name: "AES-GCM", length: 256 },
    true,
    ["encrypt", "decrypt"],
  );

  const ivPassword = crypto.getRandomValues(new Uint8Array(12));

  const encryptedPassword = await crypto.subtle.encrypt(
    { name: "AES-GCM", iv: ivPassword },
    aesKey,
    new TextEncoder().encode(password),
  );

  const aesKeyRaw = await crypto.subtle.exportKey("raw", aesKey);

  const encryptedKey = await crypto.subtle.encrypt(
    { name: "RSA-OAEP" },
    publicKey,
    aesKeyRaw,
  );

  return {
    ivPassword: Buffer.from(ivPassword).toString("base64"),
    encryptedPassword: Buffer.from(encryptedPassword).toString("base64"),
    encryptedKey: Buffer.from(encryptedKey).toString("base64"),
  };
};

export const decryptPassword = async (
  privateKey: CryptoKey,
  encryptedKey: string,
  ivPasswordBase64: string,
  encryptedPasswordBase64: string,
) => {
  const encryptedKeyRaw = Buffer.from(encryptedKey, "base64");
  const ivPassword = Buffer.from(ivPasswordBase64, "base64");
  const encryptedPassword = Buffer.from(encryptedPasswordBase64, "base64");

  const decryptedAesKeyRaw = await crypto.subtle.decrypt(
    { name: "RSA-OAEP" },
    privateKey,
    encryptedKeyRaw,
  );

  const aesKey = await crypto.subtle.importKey(
    "raw",
    decryptedAesKeyRaw,
    { name: "AES-GCM" },
    false,
    ["decrypt"],
  );

  const decrypted = await crypto.subtle.decrypt(
    { name: "AES-GCM", iv: ivPassword },
    aesKey,
    encryptedPassword,
  );

  return new TextDecoder().decode(decrypted);
};

// const main = async () => {
//   const generatedKeyPair = await generateKeyPair("ZVLJy@4r?##n5wC");

//   console.log("Generated Key Pair:", generatedKeyPair);
//   // const userPassword = "superSecretPassword";

//   // const accountPassword = "myAccountPassword";
//   // const generatedKeyPair = await generateKeyPair(userPassword);

//   // //   const publicKey = await getPublicKey(generatedKeyPair.publicKey);

//   // const privateKey = await getPrivateKey(
//   //   generatedKeyPair.encryptedPrivateKey,
//   //   generatedKeyPair.iv,
//   //   userPassword,
//   //   generatedKeyPair.salt,
//   // );

//   // const encryptedPassword = await encryptPassword(
//   //   accountPassword,
//   //   generatedKeyPair.publicKey,
//   // );

//   // const decryptedPassword = await decryptPassword(
//   //   privateKey,
//   //   encryptedPassword.encryptedKey,
//   //   encryptedPassword.ivPassword,
//   //   encryptedPassword.encryptedPassword,
//   // );

//   // console.log(
//   //   "EncryptedPassword:",
//   //   encryptedPassword.encryptedPassword.substring(0, 35),
//   // ); // print first 100 chars for brevity
//   // console.log("Decrypted Password:", decryptedPassword);
// };

// main();
