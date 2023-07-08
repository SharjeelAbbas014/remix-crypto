import type { ActionArgs } from "@remix-run/node";
import { json, redirect } from "@remix-run/node";
import { saveCrypto, unSaveCrypto } from "~/models/save_crypto.server";
import { requireUserId } from "~/session.server";

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

const typeCastData = (cryptoData: CryptoData) => {
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
export const action = async ({ request }: ActionArgs) => {
  const userId = await requireUserId(request);

  const formData = await request.formData();
  const id = formData.get("id");
  const priceUsd = formData.get("priceUsd");
  const name = formData.get("name");
  const volumeUsd24Hr = formData.get("volumeUsd24Hr");
  const changePercent24Hr = formData.get("changePercent24Hr");
  const saveStatus = formData.get("save_status");
  const postData = {
    id,
    priceUsd,
    name,
    volumeUsd24Hr,
    changePercent24Hr,
    saveStatus,
  };

  let errors = null;
  Object.keys(postData).forEach((key) => {
    if (
      !postData[key] ||
      typeof postData[key] !== "string" ||
      postData[key].length === 0
    ) {
      errors = { body: `${key} is required`, title: null };
    }
  });
  if (errors) return json({ errors }, { status: 400 });

  if (saveStatus === SaveStatus.SAVE) {
    await saveCrypto({ ...typeCastData(postData), userId });
    return redirect("/");
  } else if (saveStatus === SaveStatus.UNSAVE) {
    await unSaveCrypto({ id: postData.id, userId });
  }
  return redirect("/");
};
