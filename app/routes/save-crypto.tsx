import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { saveCrypto, unSaveCrypto } from "~/models/save_crypto.server";
import { requireUserId } from "~/session.server";

export type CryptoData = {
  id: string;
  rank?: number;
  symbol?: string;
  name: string;
  supply?: number;
  maxSupply?: number;
  marketCapUsd?: number;
  volumeUsd24Hr: number;
  priceUsd: number;
  changePercent24Hr: number;
  vwap24Hr?: number;
  explorer?: string;
};

const PropToType = {
  id: "string",
  rank: "number",
  symbol: "string",
  name: "string",
  supply: "number",
  maxSupply: "number",
  marketCapUsd: "number",
  volumeUsd24Hr: "number",
  priceUsd: "number",
  changePercent24Hr: "number",
  vwap24Hr: "number",
  explorer: "string",
};

export type FormData = {
  id: string;
  priceUsd: string;
  name: string;
  volumeUsd24Hr: string;
  changePercent24Hr: string;
  saveStatus: string;
};

const typeCastData = (cryptoData: FormData) => {
  const castedData: CryptoData = {} as CryptoData;
  Object.keys(cryptoData).forEach((key) => {
    castedData[key] =
      PropToType[key] === "number" ? +cryptoData[key] : cryptoData[key];
  });
  return castedData;
};

export enum SaveStatus {
  SAVE = "SAVE",
  UNSAVE = "UNSAVE",
}

// This is the Remix action which is called when the form on / route is submitted to save or unsave a crypto
export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id") as string;
  const priceUsd = formData.get("priceUsd") as string;
  const name = formData.get("name") as string;
  const volumeUsd24Hr = formData.get("volumeUsd24Hr") as string;
  const changePercent24Hr = formData.get("changePercent24Hr") as string;
  const saveStatus = formData.get("save_status") as string;
  const postData: FormData = {
    id,
    priceUsd,
    name,
    volumeUsd24Hr,
    changePercent24Hr,
    saveStatus,
  };

  let errors = null;

  // Check if all the required fields are present
  Object.keys(postData).forEach((key) => {
    if (
      !postData[key as keyof typeof postData] ||
      typeof postData[key as keyof typeof postData] !== "string" ||
      postData[key as keyof typeof postData]?.length === 0
    ) {
      errors = { body: `${key} is required`, title: null };
    }
  });

  if (errors) return json({ errors }, { status: 400 });

  // If the saveStatus is SAVE then we save the crypto
  // If the saveStatus is UNSAVE then we unsave the crypto

  if (saveStatus === SaveStatus.SAVE) {
    await saveCrypto({ ...typeCastData(postData), userId });
    return redirect("/");
  } else if (saveStatus === SaveStatus.UNSAVE) {
    await unSaveCrypto({ id: postData.id, userId });
  }

  return redirect("/");
};
