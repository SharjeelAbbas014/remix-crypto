import type { LoaderArgs, ActionArgs } from "@remix-run/node";
import { json, type V2_MetaFunction, redirect } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import Fuse from "fuse.js";
import { useState } from "react";
import { getUserSavedCrypto } from "~/models/save_crypto.server";
import { requireUserId, getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { saveCrypto, unSaveCrypto } from "~/models/save_crypto.server";
import React from "react";

export const meta: V2_MetaFunction = () => [{ title: "Remix Crypto App" }];

enum SaveStatus {
  SAVE = "SAVE",
  UNSAVE = "UNSAVE",
}

type CryptoData = {
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

type FuseResponse = {
  item: CryptoData;
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

const getCryptoData = async () => {
  const apiResponse = await fetch("https://api.coincap.io/v2/assets");
  const apiData = await apiResponse.json();
  return apiData.data;
};

const typeCastData = (cryptoData: CryptoData) => {
  const castedData: CryptoData = {} as CryptoData;
  Object.keys(cryptoData).forEach((key) => {
    castedData[key] =
      PropToType[key] === "number" ? +cryptoData[key] : cryptoData[key];
  });
  return castedData;
};

export const loader = async ({ request }: LoaderArgs) => {
  const userId = await getUserId(request);

  let userSavedCrypto: CryptoData[] = [];
  if (userId) {
    userSavedCrypto = await getUserSavedCrypto({ userId });
  }
  const data: CryptoData[] = await getCryptoData();
  return json({ crypto_data: data, savedCrypto: userSavedCrypto });
};

export default function Index() {
  const user = useOptionalUser();
  const { crypto_data, savedCrypto } = useLoaderData<typeof loader>();
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedModal, setSelectedModal] = useState<CryptoData | null>(null);

  const savedCryptoIds = React.useMemo(
    () => savedCrypto.map((crypto) => crypto.id),
    [savedCrypto]
  );

  const fuse = new Fuse(crypto_data, {
    keys: ["id", "symbol", "name"],
  });

  const nomalizeFuseResponse = (fuseResponse: FuseResponse[]) => {
    return fuseResponse.map((crypto) => crypto.item);
  };

  return (
    <main className="flex h-full items-center justify-center">
      <div className="h-[75vh] w-10/12 overflow-scroll rounded-lg bg-slate-800 shadow-xl">
        <input
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search here"
          className="input sticky top-0 z-10 w-full bg-cyan-950"
        />

        <table className="table w-full">
          <thead>
            <th>rank</th>
            <th>id</th>
            <th>symbol</th>
            <th>name</th>
            <th>priceUsd</th>
            {savedCryptoIds.length ? <th>saveStatus</th> : null}
          </thead>
          <tbody>
            {(searchQuery
              ? nomalizeFuseResponse(fuse.search(searchQuery))
              : crypto_data
            ).map((crypto) => (
              <tr
                onClick={() => {
                  window.my_modal_1.showModal();
                  setSelectedModal(crypto);
                }}
                className="cursor-pointer"
                key={crypto.id}
              >
                <td>{crypto.rank}</td>
                <td>{crypto.id}</td>
                <td>{crypto.symbol}</td>
                <td>{crypto.name}</td>
                <td>{crypto.priceUsd}</td>
                {savedCryptoIds.length ? (
                  <td
                    onClick={() => {
                      window.my_modal_1.showModal();
                      setSelectedModal(
                        () =>
                          savedCrypto.find(
                            (savedCrypto) => savedCrypto.id === crypto.id
                          ) ?? null
                      );
                    }}
                  >
                    {savedCryptoIds.includes(crypto.id) ? "⭐️" : ""}
                  </td>
                ) : null}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <dialog id="my_modal_1" className="modal">
        <Form className="modal-box" method="post">
          <div className="stats stats-vertical w-full shadow">
            {Object.keys(selectedModal || {}).map(
              (key: string) =>
                selectedModal[key] && (
                  <>
                    <div className="stat">
                      <div className="stat-title">{key.toUpperCase()}</div>
                      <div className="stat-value text-sm text-secondary">
                        {selectedModal[key]}
                      </div>
                    </div>
                    <input
                      type="hidden"
                      name={key}
                      value={selectedModal[key]}
                    />
                  </>
                )
            )}
          </div>
          <div className="modal-action">
            <button
              className="btn-ghost btn-sm btn-circle btn absolute right-2 top-2"
              onClick={(e) => {
                e.preventDefault();
                window.my_modal_1.close();
              }}
            >
              ✕
            </button>

            {user ? (
              selectedModal && savedCryptoIds.includes(selectedModal?.id) ? (
                <>
                  <button
                    className="btn"
                    onClick={() => window.my_modal_1.close()}
                  >
                    Unsave
                  </button>
                  <input
                    type="hidden"
                    name="save_status"
                    value={SaveStatus.UNSAVE}
                  />
                </>
              ) : (
                <>
                  <button
                    className="btn"
                    onClick={() => window.my_modal_1.close()}
                  >
                    Save
                  </button>
                  <input
                    type="hidden"
                    name="save_status"
                    value={SaveStatus.SAVE}
                  />
                </>
              )
            ) : (
              <Link className="btn" to="/login">
                Login to Save
              </Link>
            )}
          </div>
        </Form>
      </dialog>
    </main>
  );
}
