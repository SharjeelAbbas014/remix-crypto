import type { LoaderArgs, V2_MetaFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Form, Link, useLoaderData } from "@remix-run/react";
import Fuse from "fuse.js";
import React, { useState } from "react";
import { getUserSavedCrypto } from "~/models/save_crypto.server";
import { getUserId } from "~/session.server";
import { useOptionalUser } from "~/utils";
import { SaveStatus, type CryptoData } from "./save-crypto";

export const meta: V2_MetaFunction = () => [{ title: "Remix Crypto App" }];
const CRYPTO_API = "https://api.coincap.io/v2/assets";

type FuseResponse = {
  item: CryptoData;
};

const getCryptoData = async () => {
  const apiResponse = await fetch(CRYPTO_API);
  const apiData = await apiResponse.json();
  return apiData.data;
};

// Remix loader which is most magical thing ever
// We fetch user saved crypto and crypto data from the api
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

  // Fuse for fuzzy search on the keys id, symbol, and name
  const fuse = new Fuse(crypto_data, {
    keys: ["id", "symbol", "name"],
  });

  // Fuse returns an array of objects with the key item
  const nomalizeFuseResponse = (fuseResponse: FuseResponse[]) => {
    return fuseResponse.map((crypto) => crypto.item);
  };

  return (
    <main className="flex h-full items-center justify-center">
      <div className="relative h-[75vh] w-10/12 overflow-scroll rounded-lg bg-slate-800 shadow-xl">
        <input
          type="text"
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search here"
          className="input sticky left-0 top-0 z-10 w-full bg-cyan-950"
          id="search"
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
                    id="save-status"
                    onClick={(e) => {
                      e.stopPropagation();
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
        <Form className="modal-box" method="post" action="/save-crypto">
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
                    id="unsave_button"
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
                    id="save-button"
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
